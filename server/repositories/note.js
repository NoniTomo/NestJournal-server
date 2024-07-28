import pool from "../db.js";

class NoteRepository {
  static async getNote({ user_id, note_id }) {
    async function returnTags(note) {
      const tags = await pool.query(
        "SELECT tag_fk FROM note_tag WHERE note_fk=$1",
        [note.note_id]
      );
      return { ...note, tags: tags.rows };
    }
    const response = await pool.query(
      "SELECT * FROM note WHERE person_fk=$1 AND note_id=$2",
      [user_id, note_id]
    );
    let result = [];
    for (let note of response.rows) result.push(await returnTags(note));
    return result[0];
  }

  static async getNotes({
    query = null,
    user_id,
    journal_id = null,
    tag_id_array = null,
  }) {
    async function returnTags(note) {
      const tags = await pool.query(
        "SELECT tag_fk FROM note_tag WHERE note_fk=$1",
        [note.note_id]
      );
      return { ...note, tags: tags.rows };
    }
    let num = 1;
    let req = `SELECT DISTINCT note.* FROM note LEFT JOIN note_tag ON note.note_id = note_tag.note_fk WHERE person_fk = \$${num++} `;
    if (journal_id !== null) req += ` AND note.journal_fk = \$${num++}`;
    if (tag_id_array !== null)
      for (let i = 0; i < tag_id_array.length; i++) {
        i === 0
          ? (req += ` AND (note_tag.tag_fk = \$${num++}`)
          : (req += ` OR note_tag.tag_fk = \$${num++}`);
        if (i === tag_id_array.length - 1) req += ")";
      }
    if (query)
      req += ` AND (note.title ILIKE '%' || \$${num++} || '%' OR note.content LIKE '%' || \$${num++} || '%')`;
    req += " ORDER BY create_date DESC";
    let req_prop = [user_id];
    if (journal_id) req_prop.push(+journal_id);
    if (tag_id_array && tag_id_array.length > 0) req_prop.push(...tag_id_array);
    if (query) req_prop.push(query, query);

    const response = await pool.query(req, req_prop);
    let result = [];
    for (let note of response.rows) result.push(await returnTags(note));
    return result;
  }

  static async noteCreate({
    user_id,
    title,
    content,
    journal,
    tags,
    create_date,
    update_date,
  }) {
    const response = await pool.query(
      "INSERT INTO note (person_fk, title, content, journal_fk, create_date, update_date) VALUES ($1, $2, $3, $4, to_timestamp($5 / 1000.0), to_timestamp($6 / 1000.0)) RETURNING note_id, create_date",
      [user_id, title, content, journal.journal_id, create_date, update_date]
    );
    for (let tag of tags) {
      await pool.query(
        "INSERT INTO note_tag (tag_fk, note_fk) VALUES ($1, $2)",
        [tag.tag_id, response.rows[0].note_id]
      );
    }
    return response.rows[0];
  }

  static async noteUpdate({
    user_id,
    note_id,
    title,
    content,
    journal,
    tags,
    update_date,
  }) {
    const response = await pool.query(
      "UPDATE note SET title=$1, content=$2, journal_fk=$3, update_date=to_timestamp($4 / 1000.0) WHERE person_fk=$5 AND note_id=$6 RETURNING update_date",
      [title, content, journal.journal_id, update_date, user_id, note_id]
    );
    const tagsInBase = await pool.query(
      "SELECT * FROM note_tag WHERE note_fk=$1",
      [note_id]
    );
    const tagsInBaseOnDelete = tagsInBase.rows.filter(
      (tagInBase) =>
        tags.findIndex((tag_) => tag_.tag_id === tagInBase.tag_fk) === -1
    );
    const tagsInBaseOnInsert = tags.filter(
      (tagInBase) =>
        tagsInBase.rows.findIndex(
          (tag_) => tag_.tag_fk === tagInBase.tag_id
        ) === -1
    );
    for (let tag of tagsInBaseOnDelete) {
      await pool.query("DELETE FROM note_tag WHERE tag_fk=$1 AND note_fk=$2", [
        tag.tag_fk,
        note_id,
      ]);
    }
    for (let tag of tagsInBaseOnInsert) {
      await pool.query(
        "INSERT INTO note_tag (tag_fk, note_fk) VALUES ($1, $2)",
        [tag.tag_id, note_id]
      );
    }
    return response.rows[0].update_date;
  }

  static async noteDelete({ user_id, note_id }) {
    await pool.query("DELETE FROM note WHERE note_id=$1 AND person_fk=$2", [
      note_id,
      user_id,
    ]);
  }

  static async getNotesCount({ user_id }) {
    const response = await pool.query(
      "SELECT count(note_id) FROM note WHERE person_fk=$1",
      [user_id]
    );
    return response.rows[0];
  }
}

export default NoteRepository;
