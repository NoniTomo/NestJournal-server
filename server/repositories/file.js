import pool from "../db.js";

class FileRepository {
  static async createImage({ hash, note_id, name, type = null }) {
    let response = null;
    if (type) {
      response = await pool.query(
        "INSERT INTO file (hash, note_fk, type, name) VALUES ($1, $2, $3, $4) RETURNING file_id",
        [hash, note_id, type, name]
      );
    } else {
      response = await pool.query(
        "INSERT INTO file (hash, note_fk) VALUES ($1, $2) RETURNING file_id",
        [hash, note_id]
      );
    }
    return response.rows[0];
  }
  static async updateImage({ file_id, hash, create_date, note_id }) {
    const response = await pool.query(
      "UPDATE file SET hash=$1, create_date=$2, note_fk=$3 WHERE file_id=$4",
      [hash, create_date, note_id, file_id]
    );
    return response.rows[0];
  }
  static async deleteAllImages({ note_fk }) {
    await pool.query("DELETE FROM file WHERE note_fk = $1", [note_fk]);
  }
  static async deleteOneImage({ note_id, file_id }) {
    await pool.query("DELETE FROM file WHERE note_fk = $1 AND file_id = $2", [
      note_id,
      file_id,
    ]);
  }
  static async getImagesForNotes({ note_id }) {
    const response = await pool.query(
      "SELECT hash, type, file_id FROM file WHERE note_fk = $1",
      [note_id]
    );
    return response.rows;
  }
  static async getFilesCount({ user_id }) {
    const response = await pool.query(
      "SELECT count(file.file_id) FROM file INNER JOIN note ON file.note_fk = note.note_id WHERE note.person_fk = $1",
      [user_id]
    );
    return response.rows[0];
  }
}

export default FileRepository;
