import ErrorUtils from "../utils/errors.js";
import TagService from "../services/tag.js";

class TagController {
  static async tagCreate(req, res) {
    const { title, journal_id } = req.body;
    const user_id = req.user.id;
    try {
      const tag_id = await TagService.tagCreate({ user_id, title, journal_id });
      return res.status(200).json({ tag_id });
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
  static async tagDelete(req, res) {
    const tag_id = req.params.tag_id;
    const user_id = req.user.id;
    try {
      await TagService.tagDelete({ user_id, tag_id });
      return res.status(204).json({});
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
  static async getTags(req, res) {
    const user_id = req.user.id;
    try {
      const result = await TagService.getTags({ user_id });
      return res.status(200).json(result);
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
  static async tagUpdate(req, res) {
    const tag_id = req.params.tag_id;
    const { title, journal_id } = req.body;
    const user_id = req.user.id;
    try {
      await TagService.tagUpdate({ user_id, tag_id, title, journal_id });
      return res.status(200).json({});
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
}

export default TagController;
