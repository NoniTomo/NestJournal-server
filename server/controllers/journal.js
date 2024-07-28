import ErrorUtils from "../utils/errors.js";
import JournalService from "../services/journal.js";

class JournalController {
  static async journalCreate(req, res) {
    const { title, description, icon, icon_link } = req.body;
    const user_id = req.user.id;
    try {
      const journal_id = await JournalService.journalCreate({
        user_id,
        title,
        description,
        icon,
        icon_link,
      });
      return res.status(200).json({ journal_id });
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
  static async journalDelete(req, res) {
    const journal_id = req.params.journal_id;
    const user_id = req.user.id;
    try {
      await JournalService.journalDelete({ user_id, journal_id });
      return res.status(204).json({});
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
  static async getJournals(req, res) {
    const user_id = req.user.id;
    try {
      const result = await JournalService.getJournals({ user_id });
      return res.status(200).json(
        result.map((journal) => {
          return {
            journal_id: journal.journal_id,
            title: journal.title,
            description: journal.description,
            emoji: { emojiValue: journal.icon, emojiLink: journal.icon_link },
          };
        })
      );
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
  static async journalUpdate(req, res) {
    const journal_id = req.params.journal_id;
    const { title, description, icon, icon_link } = req.body;
    const user_id = req.user.id;
    try {
      await JournalService.journalUpdate({
        user_id,
        journal_id,
        title,
        description,
        icon,
        icon_link,
      });
      return res.status(200).json();
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
}

export default JournalController;
