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
    document.getElementById("add").style.display = "block";
    load("Submitting...");
})

//closequetoindiv

document.getElementById("closequetiondiv1").addEventListener("click", () => {
    document.getElementById("questionprint1").style.display = "none";
    document.getElementById("questiontext").value = "";
    document.getElementById("option1").value = "";
    document.getElementById("option2").value = "";
    document.getElementById("option3").value = "";
    document.getElementById("option4").value = "";
    document.getElementById("correctanswer").value = "select";
    setTimeout(() => {
        document.getElementById("questiondiv1").style.display = "none";
    });
})
document.getElementById("closequetiondiv2").addEventListener("click", () => {
    document.getElementById("tf_questiontext").value = "";
    document.getElementById("tf_correctanswer").value = "select";
    document.getElementById("questionprint2").style.display = "none";
    setTimeout(() => {
        document.getElementById("questiondiv2").style.display = "none";
    });
})

//openaddquetiondiv
let a = 0;

document.getElementById("add").addEventListener("click", () => {
    if (a == 0) {
        document.getElementById("inputoption").classList.add("showinputoption");
        a = 1;
    }
    else {
        document.getElementById("inputoption").classList.remove("showinputoption");
        a = 0;
    }
});

//taking choise

document.getElementById("Multiplechoise").addEventListener("click", () => {
    document.getElementById("questiondiv1").style.display = "block";
    document.getElementById("questionprint1").style.display = "flex";
    document.getElementById("questiondiv2").style.display = "none";
    document.getElementById("questionprint2").style.display = "none";
})
document.getElementById("truefalse").addEventListener("click", () => {
    document.getElementById("questiondiv2").style.display = "block";
    document.getElementById("questionprint2").style.display = "flex";
    document.getElementById("questiondiv1").style.display = "none";
    document.getElementById("questionprint1").style.display = "none";
});

//addingquetion1

document.getElementById("submitquetion1").addEventListener("click", async () => {
    load();
    let q = document.getElementById("questiontext").value;
    q = q.trim();
    let op1 = document.getElementById("option1").value;
    let op2 = document.getElementById("option2").value;
    let op3 = document.getElementById("option3").value;
    let op4 = document.getElementById("option4").value;
    let co = document.getElementById("correctanswer").value;
    if (!q || !op1 || !op2 || !op3 || !op4 || co == "select") {
        note("enter all information");
        load();
        return;
    }

    let newdiv = document.createElement("div");
    newdiv.innerHTML = `<div class="result">

            <h4><i class="fa-solid fa-list-check"></i> Multiple Choice</h4>
            <br>
            <h1>${q}</h1>
                <h5>${op1}</h5>
                <h5>${op2}</h5>
                <h5>${op3}</h5>
                <h5>${op4}</h5>
                <select class="ansinput">
                    <option value="select">select</option>
                    <option value="1">Option 1</option>
                    <option value="2">Option 2</option>
                    <option value="3">Option 3</option>
                    <option value="4">Option 4</option>
                </select>

                <br><br>
        </div>`;
    document.getElementById("result").appendChild(newdiv);
    const infopush = collection(db, "testgenerator", "users", "testinfo", currentuser.uid, "tests", testref, "questions");
    await addDoc(infopush, {
        content: newdiv.innerHTML,
        co: co
    });
    document.getElementById("questiontext").value = "";
    document.getElementById("option1").value = "";
    document.getElementById("option2").value = "";
    document.getElementById("option3").value = "";
    document.getElementById("option4").value = "";
    document.getElementById("correctanswer").value = "select";
    document.getElementById("questionprint1").style.display = "none";
    setTimeout(() => {
        document.getElementById("questiondiv1").style.display = "none";
    });
    document.getElementById("submitpaper").style.display = "block";
    load();
});

//addingquetion2

document.getElementById("submitquetion2").addEventListener("click", async () => {
    load();
    let q = document.getElementById("tf_questiontext").value;
    q = q.trim();
    let co = document.getElementById("tf_correctanswer").value;
    if (co == "select") {
        note("please choose option");
        load();
        return;
    }
    let newdiv = document.createElement("div");
    newdiv.innerHTML = `<div class="result">

            <h4><i class="fa-solid fa-check"></i><i class="fa-solid fa-xmark"></i> True/False</h4>
            <br>

            <h1>${q}</h1>
            <select class="ansinput">
                <option value="select">select</option>
                <option value="true">True</option>
                <option value="false">False</option>
            </select>

            <br><br>
        </div>`;
    document.getElementById("result").appendChild(newdiv);
    const infopush = collection(db, "testgenerator", "users", "testinfo", currentuser.uid, "tests", testref, "questions");
    await addDoc(infopush, {
        content: newdiv.innerHTML,
        co: co
    });
    document.getElementById("tf_questiontext").value = "";
    document.getElementById("tf_correctanswer").value = "select";
    document.getElementById("questionprint2").style.display = "none";
    setTimeout(() => {
        document.getElementById("questiondiv2").style.display = "none";
    });
    document.getElementById("submitpaper").style.display = "block";
    load();
});

//publishpaper

document.getElementById("confsubno").addEventListener("click",()=>{
    document.getElementById("confsub").style.display="none";
})

document.getElementById("submitpaper").addEventListener("click",()=>{
    document.getElementById("confsub").style.display="flex";
})

document.getElementById("confsubyes").addEventListener("click", async () => {
    document.getElementById("confsub").style.display="none";
    load("publishing paper....");
    const pusref = doc(db, "testgenerator", "users", "testinfo", currentuser.uid, "tests", testref);
    const pusrefdata = await getDoc(pusref);
    const pushpaperref = collection(db, "testgenerator", "users", "testinfo", currentuser.uid, "tests", testref, "questions");
    const pushpaperrefdata = await getDocs(pushpaperref);
    const publictestid = await addDoc(collection(db, "testgenerator", "public", "tests"), pusrefdata.data());
    publictestidforuser = publictestid.id;
    pushpaperrefdata.forEach(async (snap) => {
        await addDoc(
            collection(db, "testgenerator", "public", "tests", publictestid.id, "questions"),
            snap.data()
        );
    });
    const infopush = doc(db, "testgenerator", "users", "testinfo", currentuser.uid, "tests", testref);
    let urllink = "https://testspark.vercel.app/attempt.html?data=" + encodeURIComponent(publictestidforuser);
    const docref = await updateDoc(infopush, {
        name: testname,
        info: testinfo,
        time: testtime,
        code: publictestidforuser,
        link: urllink,
        createdAt: new Date()
    });
    document.getElementById("submitpaper").style.display = "none";
    document.getElementById("inputoption").style.display = "none";
    document.getElementById("result").style.display = "none";
    document.getElementById("submitedform").style.display = "block";
    document.getElementById("add").style.display = "none";
    document.getElementById("testlink").textContent = "https://testspark.vercel.app/attempt.html?data=" + encodeURIComponent(publictestidforuser);
    load("publishing paper....");
});



onAuthStateChanged(auth, (user) => {
    load("loading...");
    if (user) {
        currentuser = user;
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