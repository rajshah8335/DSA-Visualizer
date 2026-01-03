import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
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
    deleteDoc
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

let currentuser = null;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
let signinbutton = document.getElementById("signin");
let signoutbutton = document.getElementById("signout");
let notification = document.getElementById("load");
let createtestbutton = document.getElementById("createtest");
let loadh2 = document.getElementById("loadh2");

//loading

function load(text) {
    const loadbar = document.getElementById("loading");
    if (loadbar.style.display == "none") {
        loadbar.style.display = "flex";
        loadh2.innerHTML = text;
    }
    else {
        loadh2.innerHTML = "";
        loadbar.style.display = "none";
    }
}

//shownotification
function note(text) {
    notification.textContent = text;
    document.getElementById("notification").classList.add("shownotification");
    setTimeout(() => {
        document.getElementById("notification").classList.remove("shownotification");
    }, 4000);
}

//signin

document.getElementById("signin").addEventListener("click", () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            currentuser = result.user;
            signinbutton.style.display = "none";
        })
        .catch((error) => {
            alert("error:" + error);
        })
});

//signout

signoutbutton.addEventListener("click", async () => {
    await signOut(auth);
    document.getElementById("profilebtn").textContent = "N";
    document.getElementById("profilebtn").style.display = "none";
    document.getElementById("profile").style.display = "none";
})

//showprofile

document.getElementById("profilebtn").addEventListener("click", () => {
    document.getElementById("profileemail").textContent = currentuser.email;
    document.getElementById("profile").style.display = "block";
});

//closeshowprofile

document.getElementById("closeprofile").addEventListener("click", () => {
    document.getElementById("profile").style.display = "none";
})

//authstatechange

onAuthStateChanged(auth, (user) => {
    load("openining...");
    if (user) {
        currentuser = user;
        signoutbutton.style.display = "block";
        document.getElementById("profilebtn").textContent = user.email[0].toUpperCase();
        document.getElementById("profilebtn").style.display = "block";
    }
    else {
        signinbutton.style.display = "block";
        signoutbutton.style.display = "none";
    }
    load("openining...");
})




