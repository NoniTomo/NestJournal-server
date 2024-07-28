import pool from "../db.js";

class FeedbackRepository {
  static async feedbackMessage({
    user_id,
    title,
    content,
    application_date,
    application_status,
    user_agent,
  }) {
    const data = await pool.query(
      "INSERT INTO feedback (title, content, application_date, application_status, user_agent, person_fk ) VALUES ($1, $2, to_timestamp($3 / 1000.0), $4, $5, $6) RETURNING *",
      [
        title,
        content,
        application_date,
        application_status,
        user_agent,
        user_id,
      ]
    );
  }
}

export default FeedbackRepository;
