import validateRequest from "../utils/validateRequest.js";
import * as Yup from "yup";

export const tagSchema = Yup.object({
  body: Yup.object({
    title: Yup.string()
      .required("Поле обязательно!")
      .min(1, "Минимальная длина - 1 символа")
      .max(100, "Максимальная длина - 100 символов"),
  }),
});

class TagValidator {
  static async tagUpdate(req, res, next) {
    return validateRequest(req, res, next, tagSchema);
  }

  static async tagCreate(req, res, next) {
    return validateRequest(req, res, next, tagSchema);
  }
}

export default TagValidator;
