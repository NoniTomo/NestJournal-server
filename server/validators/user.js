import validateRequest from "../utils/validateRequest.js";
import * as Yup from "yup";

export const usernameSchema = Yup.object({
  body: Yup.object({
    title: Yup.string()
      .required("Поле обязательно!")
      .min(3, "Минимальная длина - 3 символа")
      .max(100, "Максимальная длина - 100 символов"),
  }),
});

export const emailSchema = Yup.object({
  body: Yup.object({
    title: Yup.string()
      .required("Поле обязательно!")
      .min(1, "Минимальная длина - 1 символа")
      .max(100, "Максимальная длина - 100 символов"),
  }),
});

export const passwordSchema = Yup.object({
  body: Yup.object({
    newPassword: Yup.string()
      .required("Поле обязательно!")
      .min(8, "Пароль слишком короткий - минимум 8 символа")
      .max(50, "Максимальная длина - 100 символов")
      .test(
        "valid-password",
        "Пароль должен содержать заглавные и строчные буквы, цифры, пробелы и специальные символы",
        (value) => {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*-?&])/.test(value);
        }
      ),
    oldPassword: Yup.string()
      .required("Поле обязательно!")
      .min(8, "Пароль слишком короткий - минимум 8 символа")
      .max(50, "Максимальная длина - 100 символов"),
  }),
});

class UserValidator {
  static async password(req, res, next) {
    return validateRequest(req, res, next, passwordSchema);
  }
  static async email(req, res, next) {
    return validateRequest(req, res, next, emailSchema);
  }
  static async username(req, res, next) {
    return validateRequest(req, res, next, usernameSchema);
  }
}

export default UserValidator;
