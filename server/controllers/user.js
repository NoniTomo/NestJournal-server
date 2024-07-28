import UserService from "../services/user.js";
import ErrorUtils from "../utils/errors.js";
import PDFgeneratorService from "../services/download.js";
import DirectoryService from "../services/directory.js";

class UserController {
  static async getUsername(req, res) {
    try {
      const user_id = req.user.id;
      const data = await UserService.getUsername({ user_id });
      return res.status(200).json(data);
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
  static async getEmail(req, res) {
    try {
      const user_id = req.user.id;
      const data = await UserService.getUserEmail({ user_id });
      return res.status(200).json(data);
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
  static async deleteAccount(req, res) {
    try {
      const user_id = req.user.id;
      const data = await UserService.deleteUser({ user_id });
      return res.status(200).json(data);
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
  static async updateEmail(req, res) {
    try {
      const newEmail = req.body.title;
      const user_id = req.user.id;
      await UserService.updateEmail({ user_id, newEmail });
      return res.status(200).json({});
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
  static async updateUsername(req, res) {
    try {
      const newUsername = req.body.title;
      const user_id = req.user.id;
      await UserService.updateUsername({ user_id, newUsername });
      return res.status(200).json({});
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
  static async updatePassword(req, res) {
    try {
      const user_id = req.user.id;
      const newPassword = req.body.newPassword;
      const oldPassword = req.body.oldPassword;
      await UserService.updatePassword({ user_id, oldPassword, newPassword });
      res.status(200).json({});
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
  static async downloadAllData(req, res) {
    try {
      const user_id = req.user.id;
      const journal_id = req.body.journal_id;
      const PDFgenerator = new PDFgeneratorService();

      res.setHeader("Content-Disposition", 'attachment; filename="files.zip"');

      await PDFgenerator.initialize({ user_id, journal_id });
      await res.attachment("download.zip");
      await PDFgenerator.archiver.pipe(res);
      await PDFgenerator.newDocument();

      PDFgenerator.archiver.on("end", () => {
        res.end();
      });

      PDFgenerator.archiver.on("error", (err) => {
        throw err;
      });

      await PDFgenerator.finalize();
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
  static async updateAvatar(req, res) {
    try {
      const user_id = req.user.id;
      if (!req.files) {
        res.send({
          status: "failed",
          message: "No file uploaded",
        });
      } else {
        let file = req.files.file;
        const avatar = await DirectoryService.uploadAvatar({ user_id, file });

        res.status(200).json({ avatar: avatar });
      }
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
  static async getAvatar(req, res) {
    try {
      const user_id = req.user.id;
      const avatar = await DirectoryService.getAvatarHash(user_id);
      res.status(200).json({ avatar: avatar });
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
  static async getNewActivationLink(req, res) {
    try {
      const user_id = req.user.id;
      await UserService.getNewActivationLink(user_id);
      res.status(200).json({});
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
}

export default UserController;
