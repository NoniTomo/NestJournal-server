import FileController from "../controllers/file.js";
import { Router } from "express";
import TokenService from "../services/token.js";
const router = Router();

router.get(
  "/files-count",
  TokenService.checkAccess,
  FileController.getFilesCount
);

export default router;
