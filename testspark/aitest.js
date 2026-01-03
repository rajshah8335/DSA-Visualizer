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
    collection
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
let testname = null;
let testinfo = null;
let testtime = null;
let testref = null;
let publictestidforuser = null;
let maxtoken = 5;

//firebaseinit

const app = initializeApp(firebaseConfig);
const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider("6LdRBSEsAAAAAGN7N84E9XvyNcSpJpmMgaEkOe7t"),
    isTokenAutoRefreshEnabled: true
});
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

window.db = db;
window.doc = doc;
window.getDoc = getDoc;
window.setDoc = setDoc
window.updateDoc = updateDoc;
window.collection = collection;
window.exists = (snap) => snap.exists();

//token



//documents

let notification = document.getElementById("load");
let signinbutton = document.getElementById("signin");

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

document.getElementById("closeinput").addEventListener("click",()=>{
    document.getElementById("inputbox").style.display="none";
    document.getElementById("openinput").style.display="block";
})
document.getElementById("openinput").addEventListener("click",()=>{
    document.getElementById("openinput").style.display="none";
    document.getElementById("inputbox").style.display="block";
})

//savetestinfo

document.getElementById("Submittestinfo").addEventListener("click", async () => {
    load("Submitting...");
    testname = document.getElementById("inputtestname").value;
    testinfo = document.getElementById("inputtestinfo").value;
    testtime = document.getElementById("inputtesttime").value;
    if (!testname || !testinfo || !testtime) {
        note("fill all the information");
        load("Submitting...");
        return;
    }
    const infopush = collection(db, "testgenerator", "users", "testinfo", currentuser.uid, "tests");
    const docref = await addDoc(infopush, {
        name: testname,
        info: testinfo,
        time: testtime,
        createdAt: new Date()
    });

    testref = docref.id;
    document.getElementById("testinfodiv").style.display = "none";
    document.getElementById("inputbox").style.display = "block";
    load("Submitting...");
})

document.getElementById("submitpaper").addEventListener("click", () => {
    document.getElementById("confsub").style.display = "flex";
})

document.getElementById("confsubno").addEventListener("click", () => {
    document.getElementById("confsub").style.display = "none";
})

//push all question

document.getElementById("confsubyes").addEventListener("click", async () => {
    load("Submitting...");
    document.getElementById("confsub").style.display = "none";
    document.getElementById("openinput").style.display = "none";
    const infopush = collection(db, "testgenerator", "users", "testinfo", currentuser.uid, "tests", testref, "questions");
    const result = document.querySelectorAll(".result");
    for (let div of result) {

        const selectElement = div.querySelector(".ansinput");
        const selectvalue = selectElement.value;
        selectElement.querySelectorAll("option").forEach(opt => {
            opt.removeAttribute("selected");
        });
        const fulldivhtml = div.outerHTML;
        await addDoc(infopush, {
            content: fulldivhtml,
            co: selectvalue
        });
    }

    const testpath = doc(db, "testgenerator", "users", "testinfo", currentuser.uid, "tests", testref);
    const testdata = await getDoc(testpath);
    const paperpath = collection(db, "testgenerator", "users", "testinfo", currentuser.uid, "tests", testref, "questions");
    const paperdata = await getDocs(paperpath);
    const publictestid = await addDoc(collection(db, "testgenerator", "public", "tests"), testdata.data());
    publictestidforuser = publictestid.id;
    paperdata.forEach(async (snap) => {
        await addDoc(
            collection(db, "testgenerator", "public", "tests", publictestid.id, "questions"),
            snap.data()
        );
    })
    const uptest = doc(db, "testgenerator", "users", "testinfo", currentuser.uid, "tests", testref);
    let urllink = "https://testspark.vercel.app/attempt.html?data=" + encodeURIComponent(publictestidforuser);
    const docref = await updateDoc(uptest, {
        name: testname,
        info: testinfo,
        time: testtime,
        code: publictestidforuser,
        link: urllink,
        createdAt: new Date()
    });
    document.getElementById("answer").style.display = "none";
    document.getElementById("inputbox").style.display = "none";
    document.getElementById("submitpaper").style.display = "none";
    document.getElementById("testlink").innerText = urllink;

    document.getElementById("submitedform").style.display = "block";
    load("Submitting...");
})


//save all question



onAuthStateChanged(auth, (user) => {
    load("loading...");
    if (user) {
        currentuser = user;
        window.currentuseruid = currentuser.uid;
        document.getElementById("testinfodiv").style.display = "flex";
    }
    else {
        document.getElementById("testinfodiv").style.display = "none";
        signinbutton.style.display = "block";
        note("log in first");
        signinbutton.style.display = "block";
    }
    setTimeout(() => {
        load("loading...");
    }, 500);
});