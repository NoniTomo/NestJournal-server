import JournalRepository from "../repositories/journal.js";
import { Forbidden } from "../utils/errors.js";

class JournalService {
  static async journalUpdate({
    user_id,
    journal_id,
    title,
    description,
    icon,
    icon_link,
  }) {
    const check = await JournalRepository.checkOwnerJournal({
      user_id,
      journal_id,
    });
    if (check) {
      const data = await JournalRepository.journalUpdate({
        user_id,
        journal_id,
        title,
        description,
        icon,
        icon_link,
      });
      return data;
    } else throw new Forbidden();
  }
  static async getJournals({ user_id }) {
    const data = await JournalRepository.getJournals({ user_id });
    return data;
  }
  static async journalDelete({ user_id, journal_id }) {
    const check = await JournalRepository.checkOwnerJournal({
      user_id,
      journal_id,
    });
    if (check) {
      await JournalRepository.journalDelete(journal_id);
    } else throw new Forbidden();
  }
  static async journalCreate({ user_id, title, description, icon, icon_link }) {
    const journal_id = await JournalRepository.journalCreate({
      user_id,
      title,
      description,
      icon,
      icon_link,
    });
    return journal_id;
  }
}

export default JournalService;
