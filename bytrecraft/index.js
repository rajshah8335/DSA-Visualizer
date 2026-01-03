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

let singinbtn = document.getElementById("singinbtn");
let profilebtn = document.getElementById("profilebtn");
let authcon = document.getElementById("auth");
let closeauth = document.getElementById("closeauth");
let profile = document.getElementById("profile");
let closeprofile = document.getElementById("closeprofile");
let signout = document.getElementById("signout");
let noteh1 = document.getElementById("noteh1");
let notecon = document.getElementById("note");
let colsenote = document.getElementById("colsenote");
let loadcon = document.getElementById("loadcon");
let enterprifilecon = document.getElementById("enterprifilecon");
let saveprofile = document.getElementById("saveprofile");
let main = document.getElementById("main");
let mainstatecon = document.getElementById("mainstatecon");
let backmainstate = document.getElementById("backmainstate");
let filterdiv = document.getElementById("filter");

const app = initializeApp(firebaseConfig);
const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider("6LdRBSEsAAAAAGN7N84E9XvyNcSpJpmMgaEkOe7t"),
    isTokenAutoRefreshEnabled: true
});
let currentuser = null;
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
let problempath = collection(db, "bytecraft", "public", "problems");
let userprofilepath = null;
let username = null;
let userphonenumber = null;
let userdob = null;
let useraddress = null;
let userprofession = null;
let userprofilesubmitted = null;
let statepath = null;
let totalquestion = 0;
let filter = "all";



function showload() {
    loadcon.style.display = "flex";
}

function hideload() {
    loadcon.style.display = "none";
}

document.getElementById("signin").addEventListener("click", () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            authcon.style.display = "none";
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
    loadstate();
    userprofilesubmitted = plainDate;
    enterprifilecon.style.display = "none";
    hideload();
})

onAuthStateChanged(auth, (user) => {
    if (user) {
        singinbtn.style.opacity = 0;
        singinbtn.style.pointerEvents = "none";
        profilebtn.style.display = "block";
        profilebtn.innerText = user.email[0].toUpperCase();
        currentuser = user;
        userprofilepath = doc(db, "bytecraft", "private", "users", currentuser.uid, "userinfo", "profile");
        statepath = doc(db, "bytecraft", "private", "users", currentuser.uid, "userinfo", "userstate");
        document.getElementById("statecon").style.opacity = 1;
        checkprofile();
    }
    else {
        note("Please sign in to track the progress");
        singinbtn.style.opacity = 1;
        singinbtn.style.pointerEvents = "auto";
        profilebtn.style.display = "none";
        document.getElementById("statecon").style.opacity = 0;
    }
    loadproblems(filter);
})

singinbtn.addEventListener("click", async () => {
    authcon.style.display = "flex";
})
closeauth.addEventListener("click", () => {
    authcon.style.display = "none";
})
profilebtn.addEventListener("click", () => {
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

signout.addEventListener("click", async () => {
    await signOut(auth);
    currentuser = null;
    profile.style.display = "none";
    totalquestion = 0;
    window.location.reload();
})
function note(a) {
    noteh1.innerText = a;
    notecon.style.display = "block";
}
colsenote.addEventListener("click", () => {
    notecon.style.display = "none";
})

function changecolor(snap) {
    allfilters.forEach(item => {
        if (item.innerText.trim() == snap) {
            item.style.border = "thin solid white";
        }
        else {
            item.style.border = "thin solid rgba(255, 255, 255, 0)";
        }
    });
}

let allfilters = document.querySelectorAll(".filter>button");
allfilters.forEach(item => {
    item.addEventListener("click", () => {
        filter = item.innerText;
        changecolor(filter);
        loadproblems(filter);
    })
});


async function loadproblems(type) {
    showload();
    totalquestion = 0;
    const container = document.getElementById("problemcont");
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
    let num = 0;

    for (const item of allproblems.docs) {
        num++;

        const data = item.data();
        const status = solvedMap[item.id]; // undefined if not solved

        let newdiv = document.createElement("div");
        newdiv.classList.add("problemdiv");

        newdiv.innerHTML = `
            <h3>${num}</h3>
            <h1>${data.title}</h1>
            <h4><i class="fa-solid fa-square-check"></i></h4>
            <h2>${data.difficulty}</h2>
        `;
        let h3 = newdiv.querySelector("h2");
        if (data.difficulty == "easy") {
            h3.style.color = "gold";
        }
        else
            if (data.difficulty == "med") {
                h3.style.color = "rgba(255, 152, 152, 1)";
            }
            else {
                h3.style.color = "rgba(255, 0, 0, 1)";
            }

        // 🎨 Status border
        if (currentuser) {
            if (status === 0) {
                newdiv.style.borderLeft = "thick solid rgba(255, 0, 0, 1)";
            } else if (status === 1) {
                newdiv.querySelector("h4").style.opacity = 1;
            } else {
                newdiv.style.border = "thin solid rgba(255, 217, 0, 0)";
            }
        }

        // 🔗 Navigation
        newdiv.addEventListener("click", () => {
            window.open(`editor.html?data=${item.id}`, "_blank");
        });
        totalquestion++;
        if (type == "all") {
            container.appendChild(newdiv);
            if (currentuser) {
                loadstate();
            }
        }
        else {
            if (type == item.data().type) {
                container.appendChild(newdiv);
            }
        }

    }
    hideload();
}

async function loadstate() {
    let statedata = await getDoc(statepath);
    let solvednum = 0;
    let Unsolvednum = totalquestion - solvednum;
    let easy = 0;
    let med = 0;
    let hard = 0;
    let firstname = username.split(" ")[0];
    document.getElementById("stateusername").innerHTML = `Welcome <span>${firstname}</span>`;
    if (statedata.exists()) {
        solvednum = statedata.data().successfulattempt;
        Unsolvednum = totalquestion - solvednum;
        easy = statedata.data().solvedeasy;
        med = statedata.data().solvedmed;
        hard = statedata.data().solvedhard;
    }
    //for chart1

    const xValues1 = ["Solved", "Unsolved"];
    const yValues1 = [solvednum, Unsolvednum];
    const barColors = [
        "#b91d47",
        "#00aba9",
        "#2b5797",
        "#e8c3b9",
        "#1e7145"
    ];

    const chartConfig = {
        type: "doughnut",
        data: {
            labels: xValues1,
            datasets: [{
                data: yValues1,
                backgroundColor: barColors,
                borderColor: "#ffffff",
                borderWidth: 2
            }]
        },
        options: {
            title: {
                display: true,
                text: "State of solved problem",
                fontColor: "#b0b0b0ff",
                fontSize: 15
            },
            legend: {
                position: "bottom",
                labels: {
                    fontColor: "#b0b0b0ff",
                    fontSize: 14
                }
            }
        }
    };

    const xValues2 = ["Easy", "Medium", "Hard"];
    const yValues2 = [easy, med, hard];
    const barColors1 = ["red", "green", "blue"];

    const chartConfig1 = {
        type: "bar",
        data: {
            labels: xValues2,
            datasets: [{
                backgroundColor: barColors1,
                borderColor: "#ffffff",
                borderWidth: 2,
                data: yValues2
            }]
        },
        options: {
            legend: { display: false },
            title: {
                display: true,
                text: "Varieties of Solved Problems",
                fontColor: "#b0b0b0ff",
                fontSize: 15
            },
            scales: {
                xAxes: [{
                    ticks: {
                        fontColor: "#b0b0b0",
                        fontSize: 12
                    },
                    gridLines: {
                        color: "rgba(255,255,255,0.1)"
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        fontColor: "#b0b0b0",
                        fontSize: 12,
                        max: solvednum,
                    },
                    gridLines: {
                        color: "rgba(255,255,255,0.1)"
                    }
                }]
            }

        }
    };



    new Chart(document.getElementById("mychart1"), chartConfig);
    new Chart(document.getElementById("unsolvedsolvedchart"), chartConfig);
    new Chart(document.getElementById("mychart2"), chartConfig1);
    new Chart(document.getElementById("varieyofquestoin"), chartConfig1);

    //for succesratechart

    let succesnum = statedata.data().successfulattempt;
    let failnum = statedata.data().failattempt;
    let successrate = (100 * succesnum) / (failnum + succesnum);
    const xValues3 = ["Success%", "Fail%"];
    const yValues3 = [Number(successrate.toFixed(3)), Number(100 - successrate.toFixed(3))];


    const chartConfig2 = {
        type: "doughnut",
        data: {
            labels: xValues3,
            datasets: [{
                data: yValues3,
                backgroundColor: barColors,
                borderColor: "#ffffff",
                borderWidth: 2
            }]
        },
        options: {
            title: {
                display: true,
                text: `Success rate is ${Number(successrate.toFixed(3))}%`,
                fontColor: "#b0b0b0ff",
                fontSize: 15
            },
            legend: {
                position: "bottom",
                labels: {
                    fontColor: "#b0b0b0ff",
                    fontSize: 14
                }
            }
        }

    };


    new Chart(document.getElementById("successrate"), chartConfig2);

    const xValues4 = ["Totalsuccess", "Totalfail"];
    const yValues4 = [succesnum, failnum];


    const chartConfig3 = {
        type: "doughnut",
        data: {
            labels: xValues4,
            datasets: [{
                data: yValues4,
                backgroundColor: barColors,
                borderColor: "#ffffff",
                borderWidth: 2
            }]
        },
        options: {
            title: {
                display: true,
                text: `Success rate is ${succesnum}`,
                fontColor: "#b0b0b0ff",
                fontSize: 15
            },
            legend: {
                position: "bottom",
                labels: {
                    fontColor: "#b0b0b0ff",
                    fontSize: 14
                }
            }
        }
    };


    new Chart(document.getElementById("successandfail"), chartConfig3);


}

document.getElementById("opananalatics").addEventListener("click", () => {
    profile.style.display = "none";
    main.style.display = "none";
    mainstatecon.style.display = "flex";
    backmainstate.style.display = "flex";
    filterdiv.style.display = "none";

})
backmainstate.addEventListener("click", () => {
    main.style.display = "flex";
    mainstatecon.style.display = "none";
    backmainstate.style.display = "none";
    filterdiv.style.display = "flex";
})

