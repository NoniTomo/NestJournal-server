import validateRequest from "../utils/validateRequest.js";
import * as Yup from "yup";

export const feedbackSchema = Yup.object({
  body: Yup.object({
    title: Yup.string()
      .required("Поле обязательно!")
      .min(3, "Минимальная длина - 3 символа")
      .max(100, "Максимальная длина - 100 символов"),
    content: Yup.string()
      .required("Поле обязательно!")
      .min(3, "Минимальная длина - 3 символа")
      .max(5000, "Максимальная длина - 5000 символов"),
  }),
});

class FeedbackValidator {
  static async feedbackMessage(req, res, next) {
    return validateRequest(req, res, next, feedbackSchema);
  }
}

export default FeedbackValidator;
