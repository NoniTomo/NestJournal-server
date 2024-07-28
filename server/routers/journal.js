import JournalController from "../controllers/journal.js";
import JournalValidator from "../validators/journal.js";
import TokenService from "../services/token.js";
import { Router } from "express";
const router = Router();

router.patch(
  "/:journal_id/update",
  TokenService.checkAccess,
  JournalValidator.journalUpdate,
  JournalController.journalUpdate
);
router.delete(
  "/:journal_id/delete",
  TokenService.checkAccess,
  JournalController.journalDelete
);
router.post(
  "/create",
  TokenService.checkAccess,
  JournalValidator.journalCreate,
  JournalController.journalCreate
);
router.get(
  "/get-journals",
  TokenService.checkAccess,
  JournalController.getJournals
);

export default router;
