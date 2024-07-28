import pool from "../db.js";
import { Forbidden } from "../utils/errors.js";
class UserRepository {
  static async createUser({
    username,
    hashedPassword,
    email,
    activationLink,
    dateRegistration,
  }) {
    const response = await pool.query(
      "INSERT INTO person (username, password, email, activation_link, registration_date, is_activated) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [username, hashedPassword, email, activationLink, dateRegistration, false]
    );
    return response.rows[0];
  }
  static async resetPasswordLink({ passwordResetLink, user_id }) {
    await pool.query(
      "UPDATE person SET reset_password_link = $1 WHERE person_id = $2",
      [passwordResetLink, user_id]
    );
  }
  static async setActivationLink({ activationLink, user_id }) {
    await pool.query(
      "UPDATE person SET activation_link = $1 WHERE person_id = $2",
      [activationLink, user_id]
    );
  }
  static async getUserData(email) {
    const response = await pool.query("SELECT * FROM person WHERE email = $1", [
      email,
    ]);
    if (!response.rows.length) return null;
    return response.rows[0];
  }
  static async getUserDataByID(user_id) {
    const response = await pool.query(
      "SELECT * FROM person WHERE person_id = $1",
      [user_id]
    );
    if (!response.rows.length) return null;
    return response.rows[0];
  }
  static async activateAccount(id) {
    await pool.query(
      "UPDATE person SET is_activated = $1 WHERE person_id = $2",
      [true, id]
    );
  }
  static async findUserByActivationLink({ activationLink }) {
    const response = await pool.query(
      "SELECT * FROM person WHERE activation_link = $1",
      [activationLink]
    );
    return response.rows[0].person_id;
  }
  static async findUserByResetLink({ resetPasswordLink }) {
    const response = await pool.query(
      "SELECT person_id FROM person WHERE reset_password_link = $1",
      [resetPasswordLink]
    );
    return response.rows[0].person_id;
  }
  static async findUserByEmail({ email }) {
    const response = await pool.query(
      "SELECT person_id, is_activated FROM person WHERE email = $1",
      [email]
    );
    if (!response.rows[0])
      throw new Forbidden("Пользователь с таким адресом не зарегистрирован");
    return {
      user_id: response.rows[0]?.person_id,
      is_activated: response.rows[0].is_activated,
    };
  }
  static async getUserEmail(user_id) {
    const response = await pool.query(
      "SELECT email, is_activated FROM person WHERE person_id=$1",
      [user_id]
    );
    return response.rows[0];
  }
  static async getUsername(user_id) {
    const response = await pool.query(
      "SELECT username FROM person WHERE person_id=$1",
      [user_id]
    );
    return response.rows[0];
  }
  static async updateUsername(user_id, newUsername) {
    await pool.query("UPDATE person SET username=$1 WHERE person_id=$2", [
      newUsername,
      user_id,
    ]);
  }
  static async updateEmail({ user_id, newEmail, activationLink }) {
    await pool.query(
      "UPDATE person SET email=$1, activation_link=$2, is_activated=$3 WHERE person_id=$4",
      [newEmail, activationLink, false, user_id]
    );
  }
  static async verifyEmail(user_id) {
    await pool.query(
      "UPDATE person SET is_activated = $1 WHERE person_id = $2",
      [true, user_id]
    );
  }
  static async updatePassword({ user_id, hashNewPassword }) {
    await pool.query("UPDATE person SET password = $1 WHERE person_id = $2", [
      hashNewPassword,
      user_id,
    ]);
  }
  static async deleteUser(user_id) {
    await pool.query("DELETE FROM person WHERE person_id=$1", [user_id]);
  }
  static async getAvatarHash({ user_id }) {
    const response = await pool.query(
      "SELECT avatar_hash, avatar_type FROM person WHERE person_id=$1",
      [user_id]
    );
    return response.rows[0];
  }
  static async setAvatarHash({ user_id, hash, type }) {
    const response = await pool.query(
      "UPDATE person SET avatar_hash = $1, avatar_type=$2 WHERE person_id=$3 RETURNING avatar_hash, avatar_type",
      [hash, type, user_id]
    );
    return response.rows[0];
  }
}

export default UserRepository;
