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


let backbtn = document.getElementById("backbtn");


const app = initializeApp(firebaseConfig);
const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider("6LdRBSEsAAAAAGN7N84E9XvyNcSpJpmMgaEkOe7t"),
    isTokenAutoRefreshEnabled: true
});

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

let problempath = collection(db, "bytecraft", "public", "problems");
let userprofilepath = null;
let currentuser = null;

const urlParams = new URLSearchParams(window.location.search);
const currentfilter = urlParams.get("filter");



onAuthStateChanged(auth, (user) => {
    if (user) {
        currentuser = user;
        userprofilepath = doc(db, "bytecraft", "private", "users", currentuser.uid, "userinfo", "profile");
    }
    loadproblems(currentfilter);
})

if (currentfilter == "array") {
    backbtn.href = `array.html`;
}
else
    if (currentfilter == "stack") {
        backbtn.href = `stack.html`;
    }
    else
        if (currentfilter == "linkedlist") {
            backbtn.href = `linked-list.html`;
        }
        else
            if (currentfilter == "queue") {
                backbtn.href = `queue.html`;
            }
            else
                if (currentfilter == "graph") {
                    backbtn.href = `graph.html`;
                }
                else {
                    backbtn.href = `tree.html`;
                }


async function loadproblems(type) {
    const container = document.getElementById("topics-grid");
    container.innerHTML = "";

    // 1️⃣ Load all problems (public)
    const q = query(problempath, orderBy("createdAt", "asc"));
    const allproblems = await getDocs(q);

    // 2️⃣ Load solved problems ONCE (private per user)
    let solvedMap = {};

    if (currentuser) {
        const solvedSnap = await getDocs(
            collection(
                db,
                "bytecraft",
                "private",
                "users",
                currentuser.uid,
                "solvedproblems"
            )
        );

        solvedSnap.forEach(docSnap => {
            solvedMap[docSnap.id] = docSnap.data().status;
        });
    }

    // 3️⃣ Render problems (NO async inside loop)
    let num = 1;

    for (const item of allproblems.docs) {


        const data = item.data();
        const status = solvedMap[item.id]; // undefined if not solved

        let newdiv = document.createElement("a");
        newdiv.classList.add("topic-card", "glass");

        newdiv.href = `editor.html?data=${item.id}`;

        newdiv.innerHTML = `
            <div class="topic-icon">${num}</div>
                    <h3>${data.title}</h3>
                    <p>${data.difficulty}</p>
        `;
        let p = newdiv.querySelector("p");
        if (data.difficulty == "easy") {
            p.style.color = "gold";
        }
        else
            if (data.difficulty == "med") {
                p.style.color = "rgba(255, 152, 152, 1)";
            }
            else {
                p.style.color = "rgba(255, 0, 0, 1)";
            }

        // 🎨 Status border
        if (currentuser) {
            if (status === 0) {
                newdiv.style.borderLeft = "thick solid rgba(255, 0, 0, 1)";
            } else if (status === 1) {
                newdiv.style.border = "thin solid rgba(255, 217, 0, 1)";
            } else {
                newdiv.style.border = "thin solid rgba(255, 217, 0, 0)";
            }
        }
        if (type == "all") {
            container.appendChild(newdiv);
            num++;
        }
        else {
            if (type == item.data().type) {
                container.appendChild(newdiv);
                num++;
            }
        }

    }
}

