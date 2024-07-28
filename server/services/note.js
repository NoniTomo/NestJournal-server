import TagRepository from "../repositories/tag.js";
import NoteRepository from "../repositories/note.js";

class NoteService {
  static async getDataWithOutFilter({ user_id }) {
    const data = await NoteRepository.getNotes({ user_id });
    return {
      data_notes: data.map((note) => {
        const { person_fk, ...data } = note;
        return data;
      }),
    };
  }
  static async getNote({ user_id, note_id }) {
    const { person_fk, ...note } = await NoteRepository.getNote({
      user_id,
      note_id,
    });
    return note;
  }
  static async getDataWithFilter({
    user_id,
    query,
    journal_id = null,
    tag_id_array = null,
  }) {
    if (journal_id === null) {
      const data_notes = await NoteRepository.getNotes({
        query,
        user_id,
        journal_id,
        tag_id_array,
      });
      return {
        data_tags: null,
        data_notes: data_notes.map((note) => {
          const { person_fk, ...data } = note;
          return data;
        }),
      };
    } else {
      const data_tags = await TagRepository.getTagsWithFilter({
        user_id,
        journal_id,
      });
      const data_notes = await NoteRepository.getNotes({
        query,
        user_id,
        journal_id,
        tag_id_array,
      });

      return {
        data_tags,
        data_notes: data_notes.map((note) => {
          const { person_fk, ...data } = note;
          return data;
        }),
      };
    }
  }
  static async noteCreate({ user_id, title, content, journal, tags }) {
    const create_date = Date.now();
    const update_date = null;
    const data = await NoteRepository.noteCreate({
      user_id,
      title,
      content,
      journal,
      tags,
      create_date,
      update_date,
    });
    return data;
  }
  static async noteUpdate({ user_id, note_id, title, content, journal, tags }) {
    const update_date = Date.now();
    return await NoteRepository.noteUpdate({
      user_id,
      note_id,
      title,
      content,
      journal,
      tags,
      update_date,
    });
  }
  static async noteDelete({ user_id, note_id }) {
    await NoteRepository.noteDelete({ user_id, note_id });
  }
  static async getNotesCount({ user_id }) {
    return await NoteRepository.getNotesCount({ user_id });
  }
}

export default NoteService;
