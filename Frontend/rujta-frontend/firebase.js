// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC5VqVj66qonh1aL20zIHMGIT-_bBPDfL4",
  authDomain: "rujta-1dfa8.firebaseapp.com",
  projectId: "rujta-1dfa8",
  storageBucket: "rujta-1dfa8.firebasestorage.app",
  messagingSenderId: "239043153972",
  appId: "1:239043153972:web:876d69bcb4e65fc41dfa61"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };