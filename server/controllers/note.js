import ErrorUtils, { Unsupported } from "../utils/errors.js";
import NoteService from "../services/note.js";
import DirectoryService from "../services/directory.js";
import formDataToObject from "../utils/formDataToObject.js";

class NoteController {
  static async search(req, res) {
    try {
      const user_id = req.user.id;
      let data;
      if (
        !Object.hasOwn(req.query, "tag") &
        !Object.hasOwn(req.query, "journal") &
        !Object.hasOwn(req.query, "query")
      ) {
        data = await NoteService.getDataWithOutFilter({ user_id });
      } else {
        let journal_id,
          query,
          tag_id_array = [];
        if (Object.hasOwn(req.query, "journal")) {
          journal_id = req.query.journal;
        }
        if (Object.hasOwn(req.query, "query")) {
          query = req.query.query;
        }
        if (Object.hasOwn(req.query, "tag")) {
          Array.isArray(req.query.tag)
            ? tag_id_array
            : tag_id_array.push(+req.query.tag);
        }
        data = await NoteService.getDataWithFilter({
          user_id,
          query,
          journal_id,
          tag_id_array,
        });
      }
      const page = parseInt(req.query.page) || 0; // Текущая страница (по умолчанию 1)
      const limit = parseInt(req.query.limit) || 5; // Лимит элементов на странице (по умолчанию 10)
      // Вычисляем индекс начала и конца элементов для данной страницы
      const startIndex = page * limit;
      const endIndex = (page + 1) * limit;

      const totalPages = Math.ceil(data.data_notes.length / limit);
      return res.status(200).json({
        data_notes: data.data_notes.slice(startIndex, endIndex),
        nbPages: totalPages,
      });
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
  static async filteringEntries(req, res) {
    const user_id = req.user.id;
    try {
      let data;
      if (
        !Object.hasOwn(req.query, "tag") & !Object.hasOwn(req.query, "journal")
      ) {
        data = await NoteService.getDataWithOutFilter({ user_id });
      } else {
        let journal_id,
          tag_id_array = [];
        if (Object.hasOwn(req.query, "journal")) {
          journal_id = req.query.journal;
        }
        if (Object.hasOwn(req.query, "tag")) {
          Array.isArray(req.query.tag)
            ? tag_id_array
            : tag_id_array.push(+req.query.tag);
        }

        data = await NoteService.getDataWithFilter({
          user_id,
          journal_id,
          tag_id_array,
        });
      }
      const page = parseInt(req.query.page) || 0; // Текущая страница (по умолчанию 1)
      const limit = parseInt(req.query.limit) || 10; // Лимит элементов на странице (по умолчанию 10)
      // Вычисляем индекс начала и конца элементов для данной страницы
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const data_notes = data.data_notes.slice(startIndex, endIndex);
      const files = await DirectoryService.getImagesForNotes({
        user_id,
        notesIDArray: data_notes.map((note) => note.note_id),
      });
      return res.status(200).json({ data_notes: data_notes, files: files });
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
  static async getNote(req, res) {
    const user_id = req.user.id;
    const note_id = req.params.note_id;
    try {
      const note = await NoteService.getNote({ user_id, note_id });
      const files = await DirectoryService.getImagesForNotes({
        user_id,
        notesIDArray: [note.note_id],
      });
      res.status(200).json({ note, files });
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
  static async noteCreate(req, res) {
    try {
      const user_id = req.user.id;
      if (req.files) NoteController.checkFiles(req.files);
      const { title, content, journal, tags } = formDataToObject(req.body);
      const { note_id, create_date } = await NoteService.noteCreate({
        user_id,
        title,
        content,
        journal,
        tags,
      });
      let files = [];
      if (req.files) {
        files = await DirectoryService.uploadImage({
          note_id,
          files: req.files,
          user_id,
        });
      }
      res.status(200).json({ note_id, create_date, files });
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
  static async noteDelete(req, res) {
    const user_id = req.user.id;
    const note_id = req.params.note_id;
    try {
      await NoteService.noteDelete({ user_id, note_id });
      await DirectoryService.dropImages({ user_id, note_id });
      res.status(200).json({});
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
  static async noteUpdate(req, res) {
    const user_id = req.user.id;
    const note_id = req.params.note_id;
    const { title, content, journal, tags, files_old } = formDataToObject(
      req.body
    );

    try {
      const update_date = await NoteService.noteUpdate({
        user_id,
        note_id,
        title,
        content,
        journal,
        tags,
      });
      if (req.files) NoteController.checkFiles(req.files);
      let files = [];
      await DirectoryService.dropImagesByID({ user_id, note_id, files_old });
      if (req.files) {
        files = await DirectoryService.updateImage({
          note_id,
          files: req.files,
          user_id,
        });
      }

      res.status(200).json({ update_date, files });
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
  static async getNotesCount(req, res) {
    const user_id = req.user.id;
    try {
      const countNotes = await NoteService.getNotesCount({ user_id });
      res.status(200).json(countNotes);
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
  static checkFiles(files) {
    let values = null;
    if (!Array.isArray(files.file)) {
      values = [files.file];
    } else {
      values = files.file;
    }
    for (let i = 0; i < values.length; i++) {
      if (values[i].mimetype.split("/")[0] !== "image")
        throw new Unsupported("К записям можно прикреплять только изображения");
      if (values[i].size >= 838860800)
        throw new Unsupported("Максимально допустимый размер файла 100 Мбайт");
      if (values[i].name.split("").length > 100)
        throw new Unsupported(
          "Максимально допустимая длина имени файла 100 символов"
        );
    }
  }
}

export default NoteController;
