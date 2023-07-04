import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {getAuth, GoogleAuthProvider} from 'firebase/auth'
import {getFirestore} from 'firebase/firestore'
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCVXtums5mxAKetu15sBgiXAfK1qdcu5mk",
  authDomain: "socail-d4427.firebaseapp.com",
  projectId: "socail-d4427",
  storageBucket: "socail-d4427.appspot.com",
  messagingSenderId: "47689209652",
  appId: "1:47689209652:web:613fb20340564acf6b3761"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth =  getAuth(app);
export const googleProvider = new GoogleAuthProvider();

//Database initialization
export const db  = getFirestore(app)

//Storage initialization
export const storage = getStorage(app);
