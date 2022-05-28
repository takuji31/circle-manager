// Import the functions you need from the SDKs you need
import { initializeApp } from "@firebase/app";
import { getStorage } from "@firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBTZpQVRbe7xwh4Tiw6OxlKCSVeItsaCpg",
  authDomain: "shin-umamusume-336911.firebaseapp.com",
  projectId: "shin-umamusume-336911",
  storageBucket: "shin-umamusume-336911.appspot.com",
  messagingSenderId: "1042817308801",
  appId: "1:1042817308801:web:d476ea7fd857ec509fd580",
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const storage = getStorage(firebaseApp);
