import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
    initializeAppCheck,
    ReCaptchaV3Provider
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app-check.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    addDoc,
    updateDoc,
    getDocs,
    deleteDoc,
    collection,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBj72SFCM2wSHEP5IEqOCFNMP_FiL0gw28",
    authDomain: "test-489a1.firebaseapp.com",
    databaseURL: "https://test-489a1-default-rtdb.firebaseio.com",
    projectId: "test-489a1",
    storageBucket: "test-489a1.firebasestorage.app",
    messagingSenderId: "978892656529",
    appId: "1:978892656529:web:ea00af8b6e3768abba1430",
    measurementId: "G-N1382Z67VH"
};

//dom



const app = initializeApp(firebaseConfig);
const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider("6LdRBSEsAAAAAGN7N84E9XvyNcSpJpmMgaEkOe7t"),
    isTokenAutoRefreshEnabled: true
});
let currentuser = null;
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);


document.getElementById("signin").addEventListener("click", () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("signin done");
            document.getElementById("signin").style.display = "none";
        })
        .catch((error) => {
            alert("error:" + error);
        })
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById("signin").style.display = "none";
        document.getElementById("logout").style.display = "block"
    }
    else {
        document.getElementById("signin").style.display = "block";
        document.getElementById("logout").style.display = "none"
    }
    
})

document.getElementById("logout").addEventListener("click",async()=>{
    await signOut(auth);
})