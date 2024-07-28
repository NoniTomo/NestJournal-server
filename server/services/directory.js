import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import { unlink } from "node:fs/promises";
import UserRepository from "../repositories/user.js";
import { v4 } from "uuid";
import FileRepository from "../repositories/file.js";

const __dirname = (() => {
  const __filename = fileURLToPath(import.meta.url);
  return dirname(__filename);
})();

export async function makeDirectory(path = [], foldername) {
  let projectFolder = null;
  if (path.length) {
    projectFolder = join(
      __dirname,
      "..",
      "..",
      "usersData",
      ...path,
      `${foldername}`
    );
  } else {
    projectFolder = join(__dirname, "..", "..", "usersData", `${foldername}`);
  }
  await mkdir(projectFolder, { recursive: true });
}

export async function dropDirectory(path, foldername) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  let projectFolder = null;
  if (path.length) {
    projectFolder = join(
      __dirname,
      "..",
      "..",
      "usersData",
      ...path,
      `${foldername}`
    );
  } else {
    projectFolder = join(__dirname, "..", "..", "usersData", `${foldername}`);
  }
  fs.rmSync(projectFolder, { recursive: true, force: true });
}

class DirectoryService {
  static async uploadImage({ note_id, user_id, files }) {
    await makeDirectory([`${user_id}`], note_id);
    let values = [];
    if (!Array.isArray(files.file)) {
      values = [files.file];
    } else {
      values = files.file;
    }
    const paths = [];
    for (let i = 0; i < values.length; i++) {
      const type = values[i].mimetype.split("/")[1];
      const name = values[i].name;
      const hash = `${v4()}${v4()}`;
      const { file_id } = await FileRepository.createImage({
        hash,
        note_id,
        name,
        type,
      });
      const path = this.path({ user_id, note_id, hash, file_id, type });
      values[i].mv(`../usersData/${path}`);
      paths.push({ file_id, path });
    }
    return [{ note_id, paths }];
  }
  static async dropImages({ user_id, note_id }) {
    await dropDirectory([`${user_id}`], note_id);
  }
  static async updateImage({ note_id, user_id, files }) {
    const paths = [];
    let values = [];
    if (!Array.isArray(files.file)) {
      values = [files.file];
    } else {
      values = files.file;
    }
    for (let i = 0; i < values.length; i++) {
      const type = values[i].mimetype.split("/")[1];
      const name = values[i].name;
      const hash = `${v4()}${v4()}`;
      const { file_id } = await FileRepository.createImage({
        hash,
        note_id,
        name,
        type,
      });
      const path = this.path({ user_id, note_id, hash, file_id, type });
      values[i].mv(join(__dirname, "..", "..", `/usersData/${path}`));
      paths.push({ file_id, path });
    }
    return [{ note_id, paths }];
  }
  static async getImagesForNotes({ user_id, notesIDArray }) {
    let result = [];
    for (let note_id of notesIDArray) {
      const dataArray = await FileRepository.getImagesForNotes({ note_id });
      const paths = dataArray.map((image) => {
        return {
          file_id: image.file_id,
          path: this.path({
            user_id,
            note_id,
            hash: image.hash,
            file_id: image.file_id,
            type: image.type,
          }),
        };
      });
      result.push({ note_id, paths });
    }
    return result;
  }
  static async uploadAvatar({ user_id, file }) {
    const { avatar_hash, avatar_type } = await UserRepository.getAvatarHash({
      user_id,
    });
    if (avatar_hash) {
      try {
        const path =
          `usersData/${user_id}/` + `${avatar_hash}-avatar.${avatar_type}`;
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        await unlink(join(__dirname, "..", "..", path));
      } catch (error) {
        console.error(error, "Файл не найден");
      }
    }
    const hash = v4();
    await UserRepository.setAvatarHash({
      user_id,
      hash,
      type: file.mimetype.split("/")[1],
    });

    file.mv(
      `../usersData/${user_id}/` +
        `${hash}-avatar.${file.mimetype.split("/")[1]}`
    );
    return `${user_id}/${hash}-avatar.${file.mimetype.split("/")[1]}`;
  }
  static async getAvatarHash(user_id) {
    const { avatar_hash, avatar_type } = await UserRepository.getAvatarHash({
      user_id,
    });
    return `${user_id}/${avatar_hash}-avatar.${avatar_type}`;
  }
  static async dropImagesByID({ user_id, note_id, files_old }) {
    const deleteFiles = await FileRepository.getImagesForNotes({ note_id });

    deleteFiles
      .filter(
        (file) =>
          files_old.findIndex((el) => +file.file_id === +el.file_id) === -1
      )
      .map(async (file) => {
        await FileRepository.deleteOneImage({ note_id, file_id: file.file_id });
        const path = this.path({
          user_id,
          note_id,
          hash: file.hash,
          file_id: file.file_id,
          type: file.type,
        });
        await unlink(join(__dirname, "..", "..", `usersData/${path}`));
      });
  }
  static path({ user_id, note_id, hash, file_id, type }) {
    return `${user_id}/${note_id}/${hash}-${note_id}-${file_id}.${type}`;
  }
  static async fullPath({ user_id, note_id, hash, file_id, type, level = 2 }) {
    let levelArray = [];
    for (let i = 0; i < level; i++) levelArray.push("..");
    return join(
      __dirname,
      ...levelArray,
      `usersData/${user_id}/${note_id}/${hash}-${note_id}-${file_id}.${type}`
    );
  }
}

export default DirectoryService;
