import bcrypt from "bcryptjs";
import { v4 } from "uuid";

import MailService from "./mail.js";
import UserRepository from "../repositories/user.js";
import TokenService from "../services/token.js";
import RefreshSessionRepository from "../repositories/refreshSessionRepository.js";
import { ACCESS_TOKEN_EXPIRATION } from "../constants.js";
import {
  Conflict,
  Unauthorized,
  NotFound,
  Forbidden,
} from "../utils/errors.js";
import { makeDirectory } from "./directory.js";

class AuthService {
  static async signIn({ email, password, fingerprint }) {
    const userData = await UserRepository.getUserData(email);

    if (!userData) {
      throw new NotFound("Пользователь не найден");
    }
    const isPasswordValid = bcrypt.compareSync(password, userData.password);
    if (!isPasswordValid) {
      throw new Unauthorized("Неверный адрес почты или пароль");
    }
    const payload = { id: userData.person_id, name: userData.username, email };

    const accessToken = await TokenService.generateAccessToken(payload);
    const refreshToken = await TokenService.generateRefreshToken(payload);

    await RefreshSessionRepository.createRefreshSession({
      id: userData.person_id,
      refreshToken,
      fingerprint,
    });
    return {
      accessToken,
      refreshToken,
      accessTokenExpiration: ACCESS_TOKEN_EXPIRATION,
    };
  }
  static async signUp({ username, password, email, fingerprint }) {
    const userData = await UserRepository.getUserData(email);

    if (userData) {
      throw new Conflict(
        "Пользователь с таким почтовым адресом уже существует!"
      );
    }

    const hashedPassword = bcrypt.hashSync(password, 8);
    const activationLink = v4();

    const dateRegistration = new Date();
    //Временное решение
    const avatar = "avatar";
    const { person_id } = await UserRepository.createUser({
      username,
      hashedPassword,
      email,
      activationLink,
      dateRegistration,
      avatar,
    });
    const id = person_id;
    await makeDirectory([], id).catch(console.error);

    await MailService.sendActivationMail(
      email,
      `${process.env.API_URL}/auth/activate/${activationLink}`
    );

    const payload = { id, username, email };

    const accessToken = await TokenService.generateAccessToken(payload);
    const refreshToken = await TokenService.generateRefreshToken(payload);

    await RefreshSessionRepository.createRefreshSession({
      id,
      refreshToken,
      fingerprint,
    });

    return {
      accessToken,
      refreshToken,
      accessTokenExpiration: ACCESS_TOKEN_EXPIRATION,
    };
  }
  static async resetPassword({ email }) {
    const passwordResetLink = v4();
    const { user_id, is_activated } = await UserRepository.findUserByEmail({
      email,
    });
    if (!is_activated || !user_id) {
      throw new Forbidden("Почтовый адрес не найден или не подтвержден");
    }
    await UserRepository.resetPasswordLink({ passwordResetLink, user_id });
    await MailService.resetPassword(
      email,
      `${process.env.CLIENT_URL}/auth/reset-password-link/${passwordResetLink}`
    );
    AuthService.deactivateResetPasswordLink(user_id);
  }
  static async deactivateResetPasswordLink(user_id) {
    setTimeout(
      () =>
        (async () => {
          try {
            await UserRepository.resetPasswordLink({
              passwordResetLink: null,
              user_id,
            });
          } catch (error) {
            console.error("Ошибка при отзыве ссылки восстановления пароля");
          }
        })(),
      10 * 60 * 1000
    );
  }
  static async logOut(refreshToken) {
    await RefreshSessionRepository.deleteRefreshSessions(refreshToken);
  }
  static async refresh({ fingerprint, currentRefreshToken }) {
    if (!currentRefreshToken) {
      throw new Unauthorized();
    }
    const refreshSession = await RefreshSessionRepository.getRefreshSessions(
      currentRefreshToken
    );
    if (!refreshSession) {
      throw new Unauthorized();
    }
    if (refreshSession.finger_print !== fingerprint.hash) {
      throw new Forbidden();
    }

    await RefreshSessionRepository.deleteRefreshSessions(currentRefreshToken);

    let payload;
    try {
      payload = await TokenService.verifyRefreshToken(currentRefreshToken);
    } catch (error) {
      throw new Forbidden(error);
    }
    const {
      person_id,
      email: email,
      username,
    } = await UserRepository.getUserData(payload.email);

    const actualPayload = { id: person_id, username, email };

    const accessToken = await TokenService.generateAccessToken(actualPayload);
    const refreshToken = await TokenService.generateRefreshToken(actualPayload);

    await RefreshSessionRepository.createRefreshSession({
      id: person_id,
      refreshToken,
      fingerprint,
    });

    return {
      accessToken,
      refreshToken,
      accessTokenExpiration: ACCESS_TOKEN_EXPIRATION,
    };
  }
  static async activate(activationLink) {
    const user_id = await UserRepository.findUserByActivationLink({
      activationLink,
    });
    if (!user_id) {
      throw new Forbidden("Некорректная ссылка активации");
    }
    await UserRepository.activateAccount(user_id);
    await UserRepository.verifyEmail(user_id);
  }
  static async resetLink({ resetPasswordLink, password }) {
    const user_id = await UserRepository.findUserByResetLink({
      resetPasswordLink,
    });
    if (!user_id) {
      throw new Forbidden("Некорректная ссылка для сброса пароля");
    }
    const hashNewPassword = bcrypt.hashSync(password, 8);
    await UserRepository.updatePassword({ user_id, hashNewPassword });
  }
  static async findUserByToken(refreshToken) {
    const user_id = await RefreshSessionRepository.findUserByToken(
      refreshToken
    );
    return user_id;
  }
}

export default AuthService;
