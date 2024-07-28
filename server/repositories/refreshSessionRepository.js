import pool from "../db.js";

class RefreshSessionRepository {
  static async getRefreshSessions(refreshToken) {
    const response = await pool.query(
      "SELECT * FROM refresh_sessions WHERE refresh_token=$1",
      [refreshToken]
    );
    if (!response.rows.length) {
      return null;
    }
    return response.rows[0];
  }
  static async createRefreshSession({ id, refreshToken, fingerprint }) {
    await pool.query(
      "INSERT INTO refresh_sessions (person_fk, refresh_token, finger_print) VALUES ($1, $2, $3)",
      [id, refreshToken, fingerprint.hash]
    );
  }
  static async deleteRefreshSessions(refreshToken) {
    await pool.query("DELETE FROM refresh_sessions WHERE refresh_token=$1", [
      refreshToken,
    ]);
  }
  static async findUserByToken(refreshToken) {
    const result = await pool.query(
      "SELECT person_fk FROM refresh_sessions WHERE refresh_token=$1",
      [refreshToken]
    );
    return result.rows[0].person_fk;
  }
}

export default RefreshSessionRepository;
