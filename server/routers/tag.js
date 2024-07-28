import TagController from "../controllers/tag.js";
import TagValidator from "../validators/tag.js";
import TokenService from "../services/token.js";
import { Router } from "express";
const router = Router();

router.patch(
  "/:tag_id/update",
  TokenService.checkAccess,
  TagValidator.tagUpdate,
  TagController.tagUpdate
);
router.delete(
  "/:tag_id/delete",
  TokenService.checkAccess,
  TagController.tagDelete
);
router.post(
  "/create",
  TokenService.checkAccess,
  TagValidator.tagCreate,
  TagController.tagCreate
);
router.get("/get-tags", TokenService.checkAccess, TagController.getTags);

export default router;
