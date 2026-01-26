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

let opanprofile = document.getElementById("opanprofile");
let loadcon = document.getElementById("loadcon");
let enterprifilecon = document.getElementById("enterprifilecon");
let profile = document.getElementById("profile");
let closeprofile = document.getElementById("closeprofile");
let saveprofile = document.getElementById("saveprofile");
let noteh1 = document.getElementById("noteh1");
let notecon = document.getElementById("note");
let colsenote = document.getElementById("colsenote");
let opananalatics = document.getElementById("opananalatics");
let analyticscon = document.getElementById("analyticscon");



const app = initializeApp(firebaseConfig);
const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider("6LdRBSEsAAAAAGN7N84E9XvyNcSpJpmMgaEkOe7t"),
    isTokenAutoRefreshEnabled: true
});
let currentuser = null;
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

let userprofilepath = null;
let statepath = null;
let username;
let userphonenumber;
let userdob;
let useraddress;
let userprofession;
let userprofilesubmitted;

function note(a) {
    noteh1.innerText = a;
    notecon.style.display = "block";
}
colsenote.addEventListener("click", () => {
    notecon.style.display = "none";
})

function showload() {
    loadcon.style.display = "flex";
}

function hideload() {
    loadcon.style.display = "none";
}


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

async function checkprofile() {
    let profiledata = await getDoc(userprofilepath);
    if (!profiledata.exists()) {
        enterprifilecon.style.display = "flex";
    }
    else {
        username = profiledata.data().name;
        userphonenumber = profiledata.data().phonenumber;
        userdob = profiledata.data().dob;
        useraddress = profiledata.data().address;
        userprofession = profiledata.data().professtion;
        userprofilesubmitted = profiledata.data().submitted;
    }
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentuser = user;
        userprofilepath = doc(db, "bytecraft", "private", "users", currentuser.uid, "userinfo", "profile");
        statepath = doc(db, "bytecraft", "private", "users", currentuser.uid, "userinfo", "userstate");
        opanprofile.style.display = "block";
        opanprofile.innerText = user.email[0].toUpperCase();
        document.getElementById("signin").style.display = "none";
        checkprofile();
    }
    else {
        document.getElementById("signin").style.display = "block";
        opanprofile.style.display = "none";
    }

})

opanprofile.addEventListener("click", () => {
    profile.style.display = "block";
    document.getElementById("profileemail").innerHTML = `<i class="fa-solid fa-envelope"></i> ${currentuser.email}`;
    document.getElementById("profilename").innerHTML = `<i class="fa-solid fa-user"></i> ${username}`;
    document.getElementById("profilenumber").innerHTML = `<i class="fa-solid fa-phone"></i> ${userphonenumber}`;
    document.getElementById("profiledob").innerHTML = `<i class="fa-solid fa-cake-candles"></i> ${userdob}`;
    document.getElementById("profileaddress").innerHTML = `<i class="fa-solid fa-location-dot"></i> ${useraddress}`;
    document.getElementById("profileprofesstion").innerHTML = `<i class="fa-solid fa-user-tie"></i> ${userprofession}`;
    document.getElementById("profilesubmitted").innerHTML = `<i class="fa-solid fa-flag-checkered"></i> ${userprofilesubmitted}`;
    document.getElementById("opananalatics").innerHTML = `<i class="fa-solid fa-chart-line"></i> Analatics`;
})

closeprofile.addEventListener("click", () => {
    profile.style.display = "none";
})


document.getElementById("signout").addEventListener("click", async () => {
    await signOut(auth);
    profile.style.display = "none";
    analyticscon.style.display = "none";
    document.querySelector(".app-container").style.display = "block";
})

saveprofile.addEventListener("click", async (e) => {
    e.preventDefault();
    showload();
    username = document.getElementById("username").value;
    userphonenumber = document.getElementById("userphonenumber").value;
    userdob = document.getElementById("userdob").value;
    useraddress = document.getElementById("useraddress").value;
    userprofession = document.getElementById("userprofession").value;
    if (!username || !userphonenumber || !userdob || !useraddress || !userprofession) {
        note("Please fill all the information!");
        hideload();
        return;

    }
    let submitdata = new Date();
    let plainDate = submitdata.toISOString().split("T")[0];
    await setDoc(userprofilepath, {
        name: username.trim(),
        phonenumber: userphonenumber,
        dob: userdob,
        address: useraddress.trim(),
        professtion: userprofession,
        submitted: plainDate
    })
    await setDoc(statepath, {
        failattempt: 0,
        solvedeasy: 0,
        solvedhard: 0,
        solvedmed: 0,
        successfulattempt: 0,
        successrate: 0
    })
    userprofilesubmitted = plainDate;
    enterprifilecon.style.display = "none";
    hideload();
})

document.getElementById("opananalatics").addEventListener("click", () => {
    document.querySelector(".app-container").style.display = "none";
    document.getElementById("profile").style.display = "none";
    document.getElementById("analyticscon").style.display = "grid"; // Start as grid as per css
    loadstate();
})



async function loadstate() {
    let statedata = await getDoc(statepath);
    let solvednum = 0;
    let Unsolvednum = 61 - solvednum;
    let easy = 0;
    let med = 0;
    let hard = 0;
    if (statedata.exists()) {
        solvednum = statedata.data().successfulattempt;
        Unsolvednum = 61 - solvednum;
        easy = statedata.data().solvedeasy;
        med = statedata.data().solvedmed;
        hard = statedata.data().solvedhard;
    }

    // Common Chart Options
    const commonOptions = {
        title: {
            display: true,
            fontColor: "#f8fafc",
            fontSize: 20, // Increased from 16
            fontFamily: "'Outfit', sans-serif",
            padding: 24
        },
        legend: {
            position: "bottom",
            labels: {
                fontColor: "#94a3b8",
                fontSize: 14, // Increased from 12
                fontFamily: "'Outfit', sans-serif",
                boxWidth: 14,
                padding: 24
            }
        },
        maintainAspectRatio: false,
        responsive: true
    };

    // Auto-hide profile when analytics is opened
    // Note: The event listener is likely in the main body or setup function. 
    // Since this is loadstate(), we'll check if we can add it here or if it should be separate.
    // However, looking at the code structure, the click handler for 'opananalatics' is not in this function.
    // I will add a separate block below to handle the click if the element exists.

    // Event listener handled globally above

    // Chart 1: Solved vs Unsolved
    const xValues1 = ["Solved", "Unsolved"];
    const yValues1 = [solvednum, Unsolvednum];
    const themeColors = [
        "#10b981", // Emerald (Solved)
        "#334155", // Slate-700 (Unsolved)
        "#3b82f6", // Blue
        "#f59e0b", // Amber
        "#ef4444"  // Red
    ];

    const chartConfig = {
        type: "doughnut",
        data: {
            labels: xValues1,
            datasets: [{
                data: yValues1,
                backgroundColor: ["#10b981", "rgba(255, 255, 255, 0.05)"],
                borderColor: ["#10b981", "rgba(255, 255, 255, 0.1)"],
                borderWidth: 1
            }]
        },
        options: {
            ...commonOptions,
            title: { ...commonOptions.title, text: "State of Solved Problems" },
            cutoutPercentage: 70
        }
    };

    new Chart(document.getElementById("unsolvedsolvedchart"), chartConfig);

    // Chart 2: Varieties (Bar Chart)
    const xValues2 = ["Easy", "Medium", "Hard"];
    const yValues2 = [easy, med, hard];
    const difficultyColors = ["#22d3ee", "#facc15", "#f43f5e"]; // Cyan, Yellow, Rose

    const chartConfig1 = {
        type: "bar",
        data: {
            labels: xValues2,
            datasets: [{
                backgroundColor: difficultyColors,
                borderColor: difficultyColors,
                borderWidth: 1,
                data: yValues2
            }]
        },
        options: {
            ...commonOptions,
            legend: { display: false },
            title: { ...commonOptions.title, text: "Varieties of Solved Problems" },
            scales: {
                xAxes: [{
                    ticks: {
                        fontColor: "#94a3b8",
                        fontSize: 12
                    },
                    gridLines: {
                        color: "rgba(255, 255, 255, 0.05)",
                        zeroLineColor: "rgba(255, 255, 255, 0.1)"
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        fontColor: "#94a3b8",
                        fontSize: 12,
                        stepSize: 1,
                        suggestedMax: solvednum + 2
                    },
                    gridLines: {
                        color: "rgba(255, 255, 255, 0.05)",
                        zeroLineColor: "rgba(255, 255, 255, 0.1)"
                    }
                }]
            }
        }
    };

    new Chart(document.getElementById("varieyofquestoin"), chartConfig1);

    // Chart 3: Success Rate
    let succesnum = statedata.data()?.successfulattempt || 0;
    let failnum = statedata.data()?.failattempt || 0;
    let totalAttempts = failnum + succesnum;
    let successrate = totalAttempts > 0 ? (100 * succesnum) / totalAttempts : 0;

    const xValues3 = ["Success", "Fail"];
    const yValues3 = [Number(successrate.toFixed(1)), Number((100 - successrate).toFixed(1))];

    const chartConfig2 = {
        type: "doughnut",
        data: {
            labels: xValues3,
            datasets: [{
                data: yValues3,
                backgroundColor: ["#10b981", "#ef4444"],
                borderColor: ["#10b981", "#ef4444"],
                borderWidth: 1
            }]
        },
        options: {
            ...commonOptions,
            title: { ...commonOptions.title, text: `Success Rate: ${Number(successrate.toFixed(1))}%` },
            cutoutPercentage: 70
        }
    };

    new Chart(document.getElementById("successrate"), chartConfig2);

    // Chart 4: Total Success vs Fail
    const xValues4 = ["Total Success", "Total Fail"];
    const yValues4 = [succesnum, failnum];

    const chartConfig3 = {
        type: "doughnut",
        data: {
            labels: xValues4,
            datasets: [{
                data: yValues4,
                backgroundColor: ["#10b981", "#f43f5e"],
                borderColor: "transparent",
                borderWidth: 0
            }]
        },
        options: {
            ...commonOptions,
            title: { ...commonOptions.title, text: `Total Attempts: ${totalAttempts}` },
            cutoutPercentage: 70
        }
    };
    new Chart(document.getElementById("successandfail"), chartConfig3);
}
