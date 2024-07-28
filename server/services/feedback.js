import FeedbackRepository from "../repositories/feedback.js";

class FeedbackService {
  static async feedbackMessage({ user_id, title, content, fingerprint }) {
    const application_date = Date.now();
    const data = await FeedbackRepository.feedbackMessage({
      user_id,
      title,
      content,
      application_date,
      application_status: "Принято",
      user_agent: JSON.stringify(fingerprint.components.useragent),
    });
    return data;
  }
}

export default FeedbackService;
