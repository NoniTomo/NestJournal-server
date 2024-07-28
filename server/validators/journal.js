import validateRequest from "../utils/validateRequest.js";
import * as Yup from "yup";

export const journalSchema = Yup.object({
  body: Yup.object({
    title: Yup.string()
      .required("Поле обязательно!")
      .min(1, "Минимальная длина - 1 символа")
      .max(100, "Максимальная длина - 100 символов"),
    description: Yup.string().max(1000, "Максимальная длина - 100 символов"),
    icon: Yup.string()
      .required("Поле обязательно!")
      .min(1, "Выберите emoji")
      .max(2, ""),
    icon_link: Yup.string()
      .required("Поле обязательно!")
      .min(1, "")
      .max(200, ""),
  }),
});

class JournalValidator {
  static async journalUpdate(req, res, next) {
    return validateRequest(req, res, next, journalSchema);
  }

  static async journalCreate(req, res, next) {
    return validateRequest(req, res, next, journalSchema);
  }
}

export default JournalValidator;
