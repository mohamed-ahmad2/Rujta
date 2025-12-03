// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB8DWYZ1rRPtTclKoEkw2pYrSMLeFCNhrQ",
  authDomain: "rujta-5fdf6.firebaseapp.com",
  projectId: "rujta-5fdf6",
  storageBucket: "rujta-5fdf6.firebasestorage.app",
  messagingSenderId: "380829317284",
  appId: "1:380829317284:web:2364353e2766547dd24e31",
  measurementId: "G-LW5Z1J2BYX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };