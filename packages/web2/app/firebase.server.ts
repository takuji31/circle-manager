import { initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

initializeApp({
  storageBucket: "shin-umamusume-336911.appspot.com",
});

export const bucket = getStorage().bucket();
