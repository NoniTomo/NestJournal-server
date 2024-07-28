import UserRepository from "../repositories/user.js";
import { v4 } from "uuid";
import bcrypt from "bcryptjs";
import { Conflict, Forbidden } from "../utils/errors.js";
import MailService from "./mail.js";
import { dropDirectory } from "../services/directory.js";

class UserService {
  static async getUsername({ user_id }) {
    return await UserRepository.getUsername(user_id);
  }
  static async getUserEmail({ user_id }) {
    return await UserRepository.getUserEmail(user_id);
  }
  static async updateUsername({ user_id, newUsername }) {
    await UserRepository.updateUsername(user_id, newUsername);
  }
  static async updateEmail({ user_id, newEmail }) {
    const userData = await UserRepository.getUserData(newEmail);
    if (userData) {
      throw new Conflict(
        "Пользователь с таким почтовым адресом уже существует!"
      );
    }

    const activationLink = v4();
    await UserRepository.updateEmail({ user_id, newEmail, activationLink });

    await MailService.sendVerifyMail(
      newEmail,
      `${process.env.API_URL}/auth/activate/${activationLink}`
    );
  }
  static async verifyEmail(activationLink) {
    const user_id = await UserRepository.findUserByActivationLink({
      activationLink,
    });
    if (!user_id) {
      throw new Forbidden("Некорректная ссылка активации");
    }
    await UserRepository.verifyEmail(user_id);
  }
  static async updatePassword({ user_id, oldPassword, newPassword }) {
    if (!user_id) {
      throw new NotFound("Пользователь не найден");
    }
    const userData = await UserRepository.getUserDataByID(user_id);

    const isPasswordValid = bcrypt.compareSync(oldPassword, userData.password);

    if (!isPasswordValid) {
      throw new Forbidden("Неверный пароль");
    }
    const hashNewPassword = bcrypt.hashSync(newPassword, 8);
    return await UserRepository.updatePassword({
      user_id: userData.user_id,
      hashNewPassword,
    });
  }
  static async deleteUser({ user_id, file }) {
    if (!user_id) {
      throw new NotFound("Пользователь не найден");
    }
    await dropDirectory([], user_id);
    await UserRepository.deleteUser(user_id);
  }
  static async getNewActivationLink(user_id) {
    if (!user_id) {
      throw new NotFound("Пользователь не найден");
    }
    const activationLink = v4();

    const { email } = await UserRepository.getUserEmail(user_id);
    await UserRepository.setActivationLink({ user_id, activationLink });
    await MailService.sendActivationMail(
      email,
      `${process.env.API_URL}/auth/activate/${activationLink}`
    );
  }
}

export default UserService;
