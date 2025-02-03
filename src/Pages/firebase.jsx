// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import{getAuth}from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOmw67wwJMEKsN5j6YwoaD9fC4taraVSo",
  authDomain: "smartviz-e39cc.firebaseapp.com",
  projectId: "smartviz-e39cc",
  storageBucket: "smartviz-e39cc.firebasestorage.app",
  messagingSenderId: "454497127722",
  appId: "1:454497127722:web:f7d13066d2704379586253"
};

// Initialize Firebase
 const app = initializeApp(firebaseConfig);
 const auth =getAuth(app)

 export{auth}