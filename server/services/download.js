import puppeteer from "puppeteer";
import NoteRepository from "../repositories/note.js";
import JournalRepository from "../repositories/journal.js";
import archiver from "archiver";
import fs from "fs";
import path from "path";
import { join } from "node:path";
import { fileURLToPath } from "url";
import { dirname } from "path";

class PDFgeneratorService {
  constructor() {
    this.journals = [];
    this.pdfFiles = [];
    this.fontFiles = [];
    this.__dirname = (() => {
      const __filename = fileURLToPath(import.meta.url);
      return dirname(__filename);
    })();
    this.throughDirectory(join(this.__dirname, "..", "/assets/fonts/Roboto"));
  }

  async initialize({ user_id, journal_id = null }) {
    this.user_id = user_id;

    if (journal_id) {
      const data = await JournalRepository.getJournalByID({
        user_id: this.user_id,
        journal_id,
      });
      this.journals.push(data);
    } else {
      const data = await JournalRepository.getJournals({
        user_id: this.user_id,
      });
      this.journals.push(...data);
    }

    this.archiver = archiver("zip", { zlib: { level: 9 } });
  }

  async newDocument() {
    this.browser = await puppeteer.launch();

    for (let journal of this.journals) {
      const page = await this.browser.newPage();
      let fonts = `
        @font-face {
          font-family: 'Roboto';
        `;
      this.content = `
      <html>
        <head>
          <style>
            * {
              font-family: Roboto;
              margin: 0;
            }
            .boxDate_time {
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              width: 100%;
              font-size: 30px;
            }
            .boxDate {
              display: flex;
              flex-direction: column;
              width: min-content;
            }
            .images {
              flex: 1;
              display: flex;
              justifyContent: center; 
              alignItems: center;
              width: 500px;
            }
            .images__image {
              width: 500px;
              display: block; 
              objectFit: contain;
            }
            ${fonts}
          </style>
        </head>
        <body>
          <h2>${journal.title}</h2>
          <p>${journal.description}</p>
          <p>

          </p>
        `;
      await this.getNotes(journal.journal_id);

      fs.writeFileSync("html.html", this.content);

      await page.setContent(this.content, { waitUntil: "domcontentloaded" });
      const pdfBuffer = await page.pdf({
        format: "A4",
        margin: {
          top: "100px",
          bottom: "100px",
          left: "100px",
          right: "100px",
        },
        printBackground: true,
      });

      fs.writeFileSync("TEST.pdf", pdfBuffer);

      this.pdfFiles.push(pdfBuffer);
      this.archiver.append(pdfBuffer, { name: `${journal.title}.pdf` });
      await page.close();
    }
    await this.browser.close();
  }

  async getNotes(journal_id) {
    const notes = await NoteRepository.getNotes({
      user_id: this.user_id,
      journal_id,
    });
    for (let note of notes) {
      let HTMLImages = "";
      this.content += `
        <div class="boxDate">
          <div class="boxDate_time">
            <h4>${
              note.create_date.getHours() / 10 >= 1
                ? note.create_date.getHours()
                : "0" + note.create_date.getHours()
            }</h4><h4> : </h4><h4>${
        note.create_date.getMinutes() / 10 >= 1
          ? note.create_date.getMinutes()
          : "0" + note.create_date.getMinutes()
      }</h4>
          </div>
          <p>${
            note.create_date.getUTCDate() / 10 >= 1
              ? note.create_date.getUTCDate()
              : "0" + note.create_date.getUTCDate()
          }.${
        (note.create_date.getUTCMonth() + 1) / 10 >= 1
          ? note.create_date.getUTCMonth() + 1
          : "0" + (note.create_date.getUTCMonth() + 1)
      }.${note.create_date.getFullYear()}</p>
        </div>
        <div>
          <h2>${note.title}</h2>
          <p>${note.content}</p>
          <div class='images'>
            ${HTMLImages}
          </div>
          <p>

          </p>
        </div>
      `;
    }
    this.content += `</body></html>`;
  }

  async finalize() {
    await this.archiver.finalize();
  }

  throughDirectory(directory) {
    fs.readdirSync(directory).forEach((file) => {
      const absolute = path.join(directory, file);
      if (fs.statSync(absolute).isDirectory())
        return throughDirectory(absolute);
      else return this.fontFiles.push(absolute);
    });
  }
}

export default PDFgeneratorService;
