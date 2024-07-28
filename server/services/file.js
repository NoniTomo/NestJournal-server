import FileRepository from "../repositories/file.js";

class FileService {
  static async getFilesCount({ user_id }) {
    return await FileRepository.getFilesCount({ user_id });
  }
}

export default FileService;
