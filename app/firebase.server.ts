import type { App } from "firebase-admin/app";
import { cert, initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import invariant from "tiny-invariant";

declare global {
  // noinspection ES6ConvertVarToLetConst
  var _firebase: App;
}

invariant(process.env.GOOGLE_API_KEY_JSON != undefined || process.env.GOOGLE_APPLICATION_CREDENTIALS != undefined, "GOOGLE_API_KEY_JSON or GOOGLE_APPLICATION_CREDENTIALS required");

if (!global._firebase) {
  global._firebase = initializeApp({
    storageBucket: "shin-umamusume-336911.appspot.com",
    ...(process.env.GOOGLE_API_KEY_JSON != undefined ?
      { credential: cert(JSON.parse(process.env.GOOGLE_API_KEY_JSON)) } : {}),
  });
}

export const bucket = getStorage().bucket();
