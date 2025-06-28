import yauzl from "yauzl";
import fs from "node:fs";
import path from "node:path";

export async function extractZip(zipPath: string, outDir: string) {
  return new Promise<void>((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) {
        reject(new Error(`Failed to open zip file: ${err.message}`));
        return;
      }

      zipfile.readEntry();

      zipfile.on("entry", (entry) => {
        const dest = path.join(outDir, entry.fileName);

        if (/\/$/.test(entry.fileName)) {
          // Directory entry — create it
          fs.mkdir(dest, { recursive: true }, (err) => {
            if (err) throw err;
            zipfile.readEntry();
          });
        } else {
          // File entry — ensure parent exists, then pipe
          fs.mkdir(path.dirname(dest), { recursive: true }, (err) => {
            if (err) throw err;

            zipfile.openReadStream(entry, (err, rs) => {
              if (err) throw err;
              rs.pipe(fs.createWriteStream(dest)).on("finish", () =>
                zipfile.readEntry(),
              );
            });
          });
        }
      });

      zipfile.on("error", (err) => {
        reject(new Error(`Error during zip extraction: ${err.message}`));
      });

      zipfile.on("end", () => {
        console.log("Extraction complete");
        resolve();
      });
    });
  });
}
