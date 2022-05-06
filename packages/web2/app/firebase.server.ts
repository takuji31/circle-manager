import type { App } from "firebase-admin/app";
import { initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

declare global {
  // noinspection ES6ConvertVarToLetConst
  var _firebase: App;
}

if (!global._firebase) {
  global._firebase = initializeApp({
    storageBucket: "shin-umamusume-336911.appspot.com",
  });
}

export const bucket = getStorage().bucket();
