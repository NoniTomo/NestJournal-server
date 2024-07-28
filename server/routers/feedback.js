import FeedbackController from "../controllers/feedback.js";
import FeedbackValidator from "../validators/feedback.js";
import TokenService from "../services/token.js";
import { Router } from "express";
const router = Router();

router.post(
  "/send",
  TokenService.checkAccess,
  FeedbackValidator.feedbackMessage,
  FeedbackController.feedbackMessage
);

export default router;
