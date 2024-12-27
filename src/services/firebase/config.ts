import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA-j1rd6rlc_RiAxR8lZsvW4wu5eCdvi9o",
  authDomain: "leftwrite-11351.firebaseapp.com",
  projectId: "leftwrite-11351",
  storageBucket: "leftwrite-11351.firebasestorage.app",
  messagingSenderId: "506574075181",
  appId: "1:506574075181:web:564f028f16fe86d2478fa4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
