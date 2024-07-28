import FileService from "../services/file.js";

class FileController {
  static async getFilesCount(req, res) {
    const user_id = req.user.id;
    try {
      const countFiles = await FileService.getFilesCount({ user_id });
      res.status(200).json(countFiles);
    } catch (error) {
      return ErrorUtils.catchError(res, error);
    }
  }
}

export default FileController;
