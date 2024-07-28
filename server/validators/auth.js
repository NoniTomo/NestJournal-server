import validateRequest from "../utils/validateRequest.js";
import * as Yup from "yup";

export const signInSchema = Yup.object({
  body: Yup.object({
    email: Yup.string()
      .email("Неверный формат адреса электронной почты")
      .required("Поле обязательно к заполнению")
      .min(3, "Почтовый адрес слишком короткий - минимум 3 символа")
      .max(50, "Максимальная длина - 100 символов"),
    password: Yup.string()
      .required("Поле обязательно!")
      .min(8, "Пароль слишком короткий - минимум 8 символа")
      .max(100, "Максимальная длина - 100 символов"),
  }),
});

export const signUpSchema = Yup.object({
  body: Yup.object({
    username: Yup.string()
      .required("Поле обязательно!")
      .min(3, "Минимальная длина - 3 символа")
      .max(100, "Максимальная длина - 100 символов"),
    password: Yup.string()
      .required("Поле обязательно!")
      .min(8, "Пароль слишком короткий - минимум 8 символа")
      .max(100, "Максимальная длина - 100 символов"),
    email: Yup.string()
      .email("Неверный формат адреса электронной почты")
      .required("Поле обязательно к заполнению")
      .min(3, "Почтовый адрес слишком короткий - минимум 3 символа")
      .max(50, "Максимальная длина - 100 символов"),
  }),
});

export const ResetPassword = Yup.object({
  body: Yup.object({
    email: Yup.string()
      .email("Неверный формат адреса электронной почты")
      .required("Поле обязательно к заполнению")
      .min(3, "Почтовый адрес слишком короткий - минимум 3 символа")
      .max(50, "Максимальная длина - 100 символов"),
  }),
});

export const logoutSchema = Yup.object({
  cookies: Yup.object({
    refreshToken: Yup.string().required("Поле обязательно!"),
  }),
});

class AuthValidator {
  static async signIn(req, res, next) {
    return validateRequest(req, res, next, signInSchema);
  }

  static async resetPassword(req, res, next) {
    return validateRequest(req, res, next, ResetPassword);
  }

  static async signUp(req, res, next) {
    return validateRequest(req, res, next, signUpSchema);
  }

  static async logOut(req, res, next) {
    return validateRequest(req, res, next, logoutSchema);
  }

  static async refresh(req, res, next) {
    return validateRequest(req, res, next);
  }
}

export default AuthValidator;
