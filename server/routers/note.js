import NoteController from "../controllers/note.js";
import NoteValidator from "../validators/note.js";
import TokenService from "../services/token.js";
import { Router } from "express";
const router = Router();

router.get(
  "/notes-count",
  TokenService.checkAccess,
  NoteController.getNotesCount
);
router.get("/search", TokenService.checkAccess, NoteController.search);
router.get(
  "/get-notes",
  TokenService.checkAccess,
  NoteController.filteringEntries
);
router.get(
  "/get-note/:note_id",
  TokenService.checkAccess,
  NoteController.getNote
);
router.post(
  "/note/create",
  TokenService.checkAccess,
  NoteValidator.noteValidate,
  NoteController.noteCreate
);
router.patch(
  "/note/:note_id/update",
  TokenService.checkAccess,
  NoteValidator.noteValidate,
  NoteController.noteUpdate
);
router.delete(
  "/note/:note_id/delete",
  TokenService.checkAccess,
  NoteController.noteDelete
);

export default router;
