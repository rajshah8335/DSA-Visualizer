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
    orderBy,
    query
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

//firebaseinit

const app = initializeApp(firebaseConfig);
const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider("6LdRBSEsAAAAAGN7N84E9XvyNcSpJpmMgaEkOe7t"),
    isTokenAutoRefreshEnabled: true
});
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

//documents

let notification = document.getElementById("load");
let signinbutton = document.getElementById("signin");
let loadh2 = document.getElementById("loadh2");
let currenttest = null;

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

function note(text) {
    notification.textContent = text;
    document.getElementById("notification").classList.add("shownotification");
    setTimeout(() => {
        document.getElementById("notification").classList.remove("shownotification");
    }, 4000);
}

async function opensubtest(usercode) {
    load("Loading users test...");
    document.getElementById("backtest").style.display="block";
    document.getElementById("analysis").style.display="none";
    document.getElementById("allsubque").style.display="block";
    let allsubquepath = collection(db, "testgenerator", "public", "tests", currenttest, "status",usercode,"submittedque");
    let allsubquedata = await getDocs(allsubquepath);
    allsubquedata.forEach(snap=>{
        let newdiv = document.createElement("div");
        newdiv.innerHTML = snap.data().content;
        document.getElementById("allsubque").appendChild(newdiv);
    });
    load("Loading users test...");
}

document.getElementById("backtest").addEventListener("click",()=>{
    document.getElementById("backtest").style.display="none";
    document.getElementById("analysis").style.display="block";
    document.getElementById("allsubque").innerHTML="";
    document.getElementById("allsubque").style.display="none";
})

window.opensubtest = opensubtest;

async function loadanalysis(testcode) {
    load("loading analytics...");
    currenttest = testcode;
    const testpath = collection(db, "testgenerator", "public", "tests", testcode, "status");
    const q = query(testpath, orderBy("score", "desc"));
    const testdata = await getDocs(q);

    const tableBody = document.getElementById("analysistable");

    testdata.forEach(snap => {
        const newRow = document.createElement("tr");
        const data = snap.data();

        // Convert Firestore Timestamp to readable date
        const createdAt = data.createdAt?.toDate
            ? data.createdAt.toDate().toLocaleString()
            : data.createdAt;

        newRow.innerHTML = `
            <td>${data.name}</td>
            <td>${data.score}</td>
            <td>${createdAt}</td>
            <td>
                <button onclick="opensubtest('${snap.id}')" class="btn btn-primary" style="padding: 10px;">
                    <i class="fa-solid fa-eye" style="margin: 0;"></i>
                </button>
            </td>
        `;

        tableBody.appendChild(newRow);
    });

    load("analytics loaded!");
}



async function checkforlink() {
    const urlparams = new URLSearchParams(window.location.search);
    const urldata = urlparams.get('data');
    if (urldata == null) {
        note("Something went wrong(refresh page again).");
    }
    else {
        loadanalysis(urldata);
    }
}
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentuser = user;
        checkforlink();
    }
    else {
        signinbutton.style.display = "block";
        note("log in first");
    }

});