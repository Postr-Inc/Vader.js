/**

 * @file watcher.js

 * @description This file is used as a polyfill for missing functionality of bun.js fs watch on windows

 */

import { watch } from "fs";

import IPC from "../binaries/IPC/index.js";

IPC.NOLISTEN = true;

const s = await IPC.newServer(IPC.typeEnums.WATCHER, { port: process.env.PORT || 3434 });

console = s.Console;

process.cwd = () => {
  return process.env.PWD;
};

let folders = process.env.FOLDERS.split(","); 

let hasSent = false;

folders.forEach((folder) => {
  watch(process.cwd() + "/" + folder, { recursive: true }, (event, filename) => {
    switch (event) {
      case "change":
        if (!hasSent) {
          console.log({ type: "change", filename });

          hasSent = true;

          setTimeout(() => {
            hasSent = false;
          }, 500);
        }

        break;

      case "add":
        if (!hasSent) {
          console.log({ type: "add", filename });

          hasSent = true;

          setTimeout(() => {
            hasSent = false;
          }, 500);
        }

        break;

      case "close":
        if (!hasSent) {
          console.log({ type: "close", filename });

          hasSent = true;

          setTimeout(() => {
            hasSent = false;
          }, 500);
        }

        break;
    }
  });
});

process.on("exit", function (code) {
  console.log("About to exit with code:", code);
});
