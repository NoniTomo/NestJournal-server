import UserController from "../controllers/user.js";
import UserValidator from "../validators/user.js";
import TokenService from "../services/token.js";

import { Router } from "express";
const router = Router();

router.get(
  "/get-username",
  TokenService.checkAccess,
  UserController.getUsername
);
router.get("/get-email", TokenService.checkAccess, UserController.getEmail);
router.patch(
  "/update-username",
  TokenService.checkAccess,
  UserValidator.username,
  UserController.updateUsername
);
router.patch(
  "/update-email",
  TokenService.checkAccess,
  UserValidator.email,
  UserController.updateEmail
);
router.patch(
  "/update-password",
  TokenService.checkAccess,
  UserValidator.password,
  UserController.updatePassword
);
router.delete(
  "/delete-account",
  TokenService.checkAccess,
  UserController.deleteAccount
);
router.post(
  "/download",
  TokenService.checkAccess,
  UserController.downloadAllData
);
router.post(
  "/update-avatar",
  TokenService.checkAccess,
  UserController.updateAvatar
);
router.get("/get-avatar", TokenService.checkAccess, UserController.getAvatar);
router.get(
  "/get-new-activation-link",
  TokenService.checkAccess,
  UserController.getNewActivationLink
);

export default router;
