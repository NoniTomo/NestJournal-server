import ErrorUtils from "../utils/errors.js";
import AuthService from "../services/auth.js";
import { COOKIE_SETTINGS } from "../constants.js";

class AuthController {
  static async signIn(req, res) {
    const { email, password } = req.body;
    const { fingerprint } = req;

    try {
      const { accessToken, refreshToken, accessTokenExpiration } =
        await AuthService.signIn({ email, password, fingerprint });

      res.cookie("refreshToken", refreshToken, COOKIE_SETTINGS.REFRESH_TOKEN);

      return res.status(200).json({ accessToken, accessTokenExpiration });
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
  static async signUp(req, res) {
    const { username, email, password } = req.body;
    const { fingerprint } = req;

    try {
      await AuthService.signUp({ username, email, password, fingerprint });
      return res.status(200);
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
  static async logOut(req, res) {
    const refreshToken = req.cookies.refreshToken;
    try {
      await AuthService.logOut(refreshToken);
      res.clearCookie("refreshToken");
      return res.sendStatus(200);
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
  static async refresh(req, res) {
    const { fingerprint } = req;
    const currentRefreshToken = req.cookies.refreshToken;

    try {
      const { accessToken, refreshToken, accessTokenExpiration } =
        await AuthService.refresh({
          currentRefreshToken,
          fingerprint,
        });

      res.cookie("refreshToken", refreshToken, COOKIE_SETTINGS.REFRESH_TOKEN);

      return res.status(200).json({ accessToken, accessTokenExpiration });
    } catch (err) {
      return ErrorUtils.catchError(res, err);
    }
  }
  static async activate(req, res) {
    const activationLink = req.params.link;
    try {
      await AuthService.activate(activationLink);
      return res.redirect(process.env.CLIENT_URL);
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
  static async resetPassword(req, res) {
    try {
      const { email } = req.body;
      await AuthService.resetPassword({ email });

      return res.status(200);
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
  static async resetLink(req, res) {
    try {
      const resetPasswordLink = req.params.link;
      const { password } = req.body;
      await AuthService.resetLink({ resetPasswordLink, password });

      return res.status(200);
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
}

export default AuthController;
