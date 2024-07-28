import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Fingerprint from "express-fingerprint";
import { join } from "node:path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import AuthRootRouter from "./routers/auth.js";
import JournalRouter from "./routers/journal.js";
import TagRouter from "./routers/tag.js";
import TokenService from "./services/token.js";
import FeedbackRouter from "./routers/feedback.js";
import NoteRouter from "./routers/note.js";
import UserRouter from "./routers/user.js";
import cookieParser from "cookie-parser";
import fileupload from "express-fileupload";
import FileRouter from "./routers/file.js";

const PORT = process.env.PORT || 8090;
dotenv.config();

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));

const __dirname = (() => {
  const __filename = fileURLToPath(import.meta.url);
  return dirname(__filename);
})();

const staticPath = join(__dirname, "..", "usersData");

console.log(`Static files are served from: ${staticPath}`);
app.use((req, res, next) => {
  req.setTimeout(0); // Безлимитный тайм-аут
  next();
});
app.use("/static", express.static(staticPath));
app.use(
  Fingerprint({
    parameters: [Fingerprint.useragent, Fingerprint.acceptHeaders],
  })
);
app.use(
  fileupload({
    createParentPath: true,
  })
);
app.use("/auth", AuthRootRouter);
app.use("/main/journal", JournalRouter);
app.use("/main/tag", TagRouter);
app.use("/main/file", FileRouter);
app.use("/main/feedback", FeedbackRouter);

app.use("/main", NoteRouter);
app.use("/main", UserRouter);

app.get("/resource/protected", TokenService.checkAccess, (___, res) => {
  res.status(200).json("Добро пожаловать!" + Date.now());
});

app.listen(PORT, () => {
  console.log("Сервер успешно запущен на порту: ", process.env.PORT || 8090);
});
