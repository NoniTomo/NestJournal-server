import TagRepository from "../repositories/tag.js";
import JournalRepository from "../repositories/journal.js";
import { Forbidden } from "../utils/errors.js";
import AuthService from "./auth.js";

class TagService {
  static async tagUpdate({ user_id, tag_id, title, journal_id }) {
    const check = await TagRepository.checkOwnerTag({ user_id, tag_id });
    if (check) {
      const data = await TagRepository.tagUpdate({
        user_id,
        tag_id,
        title,
        journal_id,
      });
      return data;
    } else throw new Forbidden();
  }
  static async getTags({ user_id }) {
    const data = await TagRepository.getTags(user_id);
    const dataForClient = data.map((tag) => {
      const { person_fk, ...other } = tag;
      return other;
    });
    return dataForClient;
  }
  static async tagDelete({ user_id, tag_id }) {
    const check = await TagRepository.checkOwnerTag({ user_id, tag_id });
    if (check) {
      await TagRepository.tagDelete(tag_id);
    } else throw new Forbidden();
  }
  static async tagCreate({ user_id, title, journal_id }) {
    if (journal_id !== null) {
      const check = await JournalRepository.checkOwnerJournal({
        user_id,
        journal_id,
      });
      if (check) {
        const tag_id = await TagRepository.tagCreate({
          user_id,
          title,
          journal_id,
        });
        return tag_id;
      } else throw new Forbidden();
    } else {
      const tag_id = await TagRepository.tagCreate({ user_id, title });
      return tag_id;
    }
  }
}

export default TagService;
