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
    onAuthStateChanged,
    signInAnonymously
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
let username = null;
let currentuser = null;
let testname = null;
let testinfo = null;
let testtime = null;
let currtestlink = null;
let testscore = 0;
let questions = [];
let qIndex = 0;

//firebaseinit

const app = initializeApp(firebaseConfig);
const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider("6LdRBSEsAAAAAGN7N84E9XvyNcSpJpmMgaEkOe7t"),
    isTokenAutoRefreshEnabled: true
});
const auth = getAuth();
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
//documents

let notification = document.getElementById("load");
let signinbutton = document.getElementById("signin");
let numque = 0;
let isSubmitted = false;

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

const urlparams = new URLSearchParams(window.location.search);
const urldata = urlparams.get('data');
if (urldata == null) {
    document.getElementById("enterlink").style.display = "block";
    note("enter test id");
}
else {
    loadquetion(urldata);
}


// searchtest

document.getElementById("searchtest").addEventListener("click", async () => {
    let testinputcode = document.getElementById("link").value;
    if (!testinputcode) {
        note("please enter the code of that test");
        return;
    }
    testinputcode = testinputcode.trim();
    loadquetion(testinputcode);
});

async function loadquetion(testid) {
    load("searching test...");
    const testref = doc(db, "testgenerator", "public", "tests",testid);
    const testrefdata = await getDoc(testref);
    load("searching test...");
    if (!testrefdata.exists()) {
        alert("test not found");
        document.getElementById("enterlink").style.display = "block";
        return;
    }
    currtestlink = testid;
    load("Opening test...");
    const allquetionsref = collection(db, "testgenerator", "public", "tests", currtestlink, "questions");
    const allquetionsdata = await getDocs(allquetionsref);
    load("Opening test...");
    allquetionsdata.forEach(snap => {
        numque++;
        const qdata = snap.data();
        questions.push(qdata);
        const newdiv = document.createElement("div");
        newdiv.innerHTML = snap.data().content;
        newdiv.querySelector("select").id = `q${qIndex}`;
        document.getElementById("result").appendChild(newdiv);
        qIndex++;
    });
    username = prompt("Enter your name : ");
    if (!username) {
        note("Please enter your name");
        document.getElementById("enterlink").style.display = "block";
        return;
    }
    username = username.trim();
    document.getElementById("link").value = "";
    document.getElementById("enterlink").style.display = "none";
    const quetioninforef = doc(db, "testgenerator", "public", "tests", currtestlink);
    const quetioninfodata = await getDoc(quetioninforef);
    document.getElementById("teststartname").textContent = quetioninfodata.data().name;
    document.getElementById("teststartinfo").textContent = quetioninfodata.data().info;
    document.getElementById("teststarttime").textContent = quetioninfodata.data().time;
    document.getElementById("teststart").style.display = "block";
}



// showconfirmsubmtidiv

document.getElementById("submitpaper").addEventListener("click", () => {
    document.getElementById("result").style.display = "none";
    document.getElementById("confirmsubmit").style.display = "block";
})

// canceltest

document.getElementById("cancelTestBtn").addEventListener("click", () => {
    window.location.href = "index.html";
});

//starttest

document.getElementById("startTestBtn").addEventListener("click", () => {
    // Show/hide elements
    document.getElementById("quetionnumber").innerText=numque;
    document.getElementById("quenumdiv").style.display="block";
    document.getElementById("result").style.display = "block";
    document.getElementById("teststart").style.display = "none";
    document.getElementById("submitpaper").style.display = "block";
    document.getElementById("timer").style.display = "block";

    // ✅ Get test time (in minutes) from Firestore field
    let testDuration = parseInt(document.getElementById("teststarttime").textContent, 10);
    let timeLeft = testDuration * 60; // convert minutes → seconds

    const timerDisplay = document.getElementById("timeLeft");

    function updateTimer() {
        if (timeLeft <= 0) {
            if (!isSubmitted) {
                clearInterval(timerInterval);
                alert("⏰ Time is over! Submitting your test.");
                stop();
                return;
            }
            else {
                return;
            }
        }

        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
        timeLeft--;
    }

    updateTimer();
    let timerInterval = setInterval(updateTimer, 1000);
});


function stop() {
    console.log("Test stopped.");
    document.getElementById("yesconfirmsubmit").click();
    document.getElementById("result").style.display = "none";
}



//cancelsubmitconfirm

document.getElementById("cancelsubmitconfirm").addEventListener("click", () => {
    document.getElementById("confirmsubmit").style.display = "none";
    document.getElementById("result").style.display = "block";
})

// showscore

document.getElementById("yesconfirmsubmit").addEventListener("click", async () => {
    document.getElementById("quenumdiv").style.display="none";
    isSubmitted = true;
    load("Calculating answer...");
    testscore = 0;

    questions.forEach((q, index) => {
        let userAnswer = document.getElementById(`q${index}`);
        let questionDiv = document.getElementById(`q${index}`).closest(".result");
        if (userAnswer.value == q.co) {
            questionDiv.style.border = "2px solid yellow";
            testscore++;
        }
        else {
            questionDiv.style.border = "2px solid red";
            userAnswer.remove();
            let correctText = document.createElement("p");
            correctText.textContent = `✔ Correct Answer: ${q.co}`;
            correctText.style.color = "green";
            correctText.style.fontWeight = "bold";
            correctText.style.marginTop = "10px";
            questionDiv.appendChild(correctText);
        }
    });
    let testpath = collection(db, "testgenerator", "public", "tests", currtestlink, "status");
    let userstatus = await addDoc(testpath, {
        name: username,
        score: testscore,
        createdAt: new Date()
    });
    let allsubque = document.querySelectorAll(".result");
    let allsubquepath = collection(db, "testgenerator", "public", "tests", currtestlink, "status", userstatus.id, "submittedque");
    for (let snap of allsubque) {
        await addDoc(allsubquepath, {
            content: snap.outerHTML
        });
    }
    document.getElementById("result").style.display = "block";
    document.getElementById("showscore").textContent = `${testscore}/${questions.length}`;
    document.getElementById("timer").style.display = "none";
    document.getElementById("submitpaper").style.display = "none";
    document.getElementById("confirmsubmit").style.display = "none";
    document.getElementById("submitedform").style.display = "block";
    setTimeout(() => {
        let lenbar = 100 * testscore / (questions.length);
        document.getElementById("bar").style.width = `${lenbar}%`;
    },50);
    load("Calculating answer...");
});