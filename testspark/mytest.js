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
let currenttestpublic = null;
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

//loadalltest

async function loadtest() {
    load("loading...");
    const alltestref = collection(db, "testgenerator", "users", "testinfo", currentuser.uid, "tests");
    const q = query(alltestref, orderBy("createdAt", "desc"));
    const alltestdata = await getDocs(q);
    alltestdata.forEach(snap => {
        const newdiv = document.createElement("div");
        newdiv.innerHTML = `<div class="childdiv">
            <div>
                <img src="image/questionpaper.png" style="width: 100%;" alt="">
            </div>
            <div class="child-item">
                <h4 class="child-label">${snap.data().name}</h4>
            </div>
        </div>
`;
        newdiv.addEventListener("click", async () => {
            load("Loading questions...");
            currenttest = snap.id;
            const allque = collection(db, "testgenerator", "users", "testinfo", currentuser.uid, "tests", snap.id, "questions");
            const testinfopath = doc(db, "testgenerator", "users", "testinfo", currentuser.uid, "tests", currenttest);
            const allquedata = await getDocs(allque);
            allquedata.forEach(docsnap => {
                const newquediv = document.createElement("div");
                newquediv.innerHTML = docsnap.data().content;
                document.getElementById("allquetion").appendChild(newquediv);
            });
            const testinfo = await getDoc(testinfopath);
            let testname = testinfo.data().name;
            let info = testinfo.data().info;
            let testcode = testinfo.data().code;
            let testlink = testinfo.data().link;
            let testtime = testinfo.data().time;
            document.getElementById("testname").innerText = testname;
            document.getElementById("testinfo").innerText = info;
            document.getElementById("testcode").innerText = testcode;
            document.getElementById("testtime").innerText = testtime;
            document.getElementById("testlink").innerHTML = `<a href="${testlink}">${testlink}</a>`;

            document.getElementById("alltestdiv").style.display = "none";
            document.getElementById("allquetion").style.display = "block";
            document.getElementById("backtest").style.display = "block";
            document.getElementById("analytics").style.display = "block";
            document.getElementById("info").style.display = "block";
            document.getElementById("deletetest").style.display = "block";
            currenttestpublic = testcode;
            load("Loading questions...");
        })
        document.getElementById("alltestdiv").appendChild(newdiv);
    })
    document.getElementById("info").addEventListener("click", async () => {

        document.getElementById("testinfo1").style.display = "flex";
    })
    document.getElementById("analytics").addEventListener("click", async () => {
        window.location.href = "analysis.html?data=" + encodeURIComponent(currenttestpublic);
    })
    load("loading...");

};

// opentestinfo1

// closetestinfo1

document.getElementById("closetestinfo1").addEventListener("click", async () => {
    document.getElementById("testinfo1").style.display = "none";
})

// backtest

document.getElementById("backtest").addEventListener("click", () => {
    document.getElementById("allquetion").innerHTML = "";
    document.getElementById("allquetion").style.display = "none";
    document.getElementById("alltestdiv").style.display = "flex";
    document.getElementById("backtest").style.display = "none";
    document.getElementById("analytics").style.display = "none";
    document.getElementById("info").style.display = "none";
    document.getElementById("deletetest").style.display = "none";
})

document.getElementById("deletetest").addEventListener("click", async () => {
    let check = prompt("If you want to delete this test then enter (yes) : ");
    if (!check) {
        note("Cancel delete..");
        return;
    }
    check = check.trim();
    if (check != "yes") {
        note("Wrong input..");
        return;
    }
    load("Deleting...");
    if(currenttestpublic==null){
        const usertestpath = doc(db, "testgenerator", "users", "testinfo", currentuser.uid, "tests", currenttest);
        await deleteDoc(usertestpath);
        load("Deleting...");
        window.location.href = "mytest.html";
        return;
    }
    const testpath = doc(db, "testgenerator", "public", "tests", currenttestpublic);
    const statuspath = collection(testpath, "status");
    const statusdata = await getDocs(statuspath);
    for (let userdoc of statusdata.docs) {
        const subquepath = collection(userdoc.ref, "submittedque");
        const subquedata = await getDocs(subquepath);
        for (let quedoc of subquedata.docs) {
            await deleteDoc(quedoc.ref);
        }
        await deleteDoc(userdoc.ref);
    }
    const questionspath = collection(testpath, "questions");
    const questionsdata = await getDocs(questionspath);
    for (let doc of questionsdata.docs) {
        await deleteDoc(doc.ref);
    }
    await deleteDoc(testpath);
    const usertestpath = doc(db, "testgenerator", "users", "testinfo", currentuser.uid, "tests", currenttest);
    const usertestquepath = collection(usertestpath, "questions");
    const usertestquedata = await getDocs(usertestquepath);
    for (let doc of usertestquedata.docs) {
        await deleteDoc(doc.ref);
    }
    await deleteDoc(usertestpath);
    load("Deleting...");
    window.location.href = "mytest.html";
})

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentuser = user;
        loadtest();
    }
    else {
        signinbutton.style.display = "block";
        note("log in first");
    }

});