import AuthController from "../controllers/auth.js";
import AuthValidator from "../validators/auth.js";
import { Router } from "express";

const router = Router();

router.post(
  "/reset-password",
  AuthValidator.resetPassword,
  AuthController.resetPassword
);
router.post("/sign-in", AuthValidator.signIn, AuthController.signIn);
router.post("/sign-up", AuthValidator.signUp, AuthController.signUp);
router.post("/logout", AuthValidator.logOut, AuthController.logOut);
router.post("/refresh", AuthValidator.refresh, AuthController.refresh);
router.get("/activate/:link", AuthController.activate);
router.post(
  "/reset-password-link/:link/new-password",
  AuthController.resetLink
);

export default router;
