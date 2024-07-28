import ErrorUtils from "../utils/errors.js";
import FeedbackService from "../services/feedback.js";

class FeedbackController {
  static async feedbackMessage(req, res) {
    const { title, content } = req.body;
    const { fingerprint } = req;
    try {
      const user_id = req.user.id;
      await FeedbackService.feedbackMessage({
        user_id,
        title,
        content,
        fingerprint,
      });
      return res.status(200).json({});
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
}

export default FeedbackController;
