import pool from "../db.js";

class TagRepository {
  static async tagUpdate({ user_id, tag_id, title, journal_id }) {
    await pool.query(
      "UPDATE tag SET title=$1, journal_fk=$2, person_fk=$3 WHERE tag_id=$4",
      [title, journal_id, user_id, tag_id]
    );
  }
  static async getTags(user_id) {
    let result = [];
    const response = await pool.query(
      `SELECT tag.tag_id, tag.title, tag.journal_fk, journal.title AS journal_title
            FROM tag
            LEFT JOIN journal ON tag.journal_fk = journal.journal_id
            WHERE journal.person_fk = $1`,
      [user_id]
    );
    result.push(...response.rows);
    const response_another = await pool.query(
      `SELECT tag_id, title, journal_fk
            FROM tag
            WHERE person_fk = $1 AND tag.journal_fk IS NULL;`,
      [user_id]
    );
    result.push(
      ...response_another.rows.map((el) => {
        return { ...el, journal_title: null };
      })
    );
    return result;
  }
  static async getTagsWithFilter({ user_id, journal_id }) {
    const response = await pool.query(
      "SELECT * FROM tag WHERE person_fk=$1 AND journal_fk=$2 OR journal_fk IS NULL ",
      [user_id, journal_id]
    );
    return response.rows;
  }
  static async tagDelete(tag_id) {
    await pool.query("DELETE FROM tag WHERE tag_id=$1", [tag_id]);
  }
  static async tagCreate({ user_id, title, journal_id }) {
    const response = await pool.query(
      "INSERT INTO tag (title, journal_fk, person_fk) VALUES ($1, $2, $3) RETURNING tag_id",
      [title, journal_id, user_id]
    );
    return response.rows[0].tag_id;
  }
  static async checkOwnerTag({ user_id, tag_id }) {
    const owner = await pool.query(
      "SELECT person_fk FROM tag WHERE tag_id=$1",
      [tag_id]
    );
    return owner.rows[0]?.person_fk === user_id;
  }
}

export default TagRepository;
