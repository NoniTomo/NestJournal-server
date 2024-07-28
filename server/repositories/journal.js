import pool from "../db.js";

class JournalRepository {
  static async journalUpdate({
    journal_id,
    title,
    description,
    icon,
    icon_link,
    user_id,
  }) {
    await pool.query(
      "UPDATE journal SET title=$1, description=$2, icon=$3, icon_link=$4 WHERE journal_id=$5 AND person_fk=$6",
      [title, description, icon, icon_link, journal_id, user_id]
    );
  }
  static async getJournals({ user_id }) {
    const response = await pool.query(
      "SELECT * FROM journal WHERE person_fk=$1",
      [user_id]
    );
    return response.rows;
  }
  static async getJournalByID({ user_id, journal_id }) {
    const response = await pool.query(
      "SELECT * FROM journal WHERE person_fk=$1 AND journal_id=$2",
      [user_id, journal_id]
    );
    return response.rows[0];
  }
  static async journalDelete(journal_id) {
    await pool.query("DELETE FROM journal WHERE journal_id=$1", [journal_id]);
  }
  static async journalCreate({ user_id, title, description, icon, icon_link }) {
    const response = await pool.query(
      "INSERT INTO journal (person_fk, title, description, icon, icon_link) VALUES ($1, $2, $3, $4, $5) RETURNING journal_id",
      [user_id, title, description, icon, icon_link]
    );
    return response.rows[0].journal_id;
  }
  static async checkOwnerJournal({ user_id, journal_id }) {
    const owner = await pool.query(
      "SELECT person_fk FROM journal WHERE journal_id=$1",
      [journal_id]
    );
    return owner.rows[0]?.person_fk === user_id;
  }
}

export default JournalRepository;
