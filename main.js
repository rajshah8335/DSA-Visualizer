var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    mode: "text/x-csrc",
    lineNumbers: true,
    theme: "dracula",
    matchBrackets: true,
    autoCloseBrackets: "()[]{}''\"\"",
    extraKeys: { "Ctrl-Space": "autocomplete" }
});
const MODE_MAP = {
    c: "text/x-csrc",
    cpp: "text/x-c++src",
    java: "text/x-java",
    javascript: "javascript",
    python: "python",
    bash: "text/x-sh",
    typescript: "text/typescript"
};
document.getElementById("editor").style.opacity = 1;



import { loadTemplate } from "./codeTemplates/templateLoader.js";
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
    orderBy,
    increment
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

const app = initializeApp(firebaseConfig);
const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider("6LdRBSEsAAAAAGN7N84E9XvyNcSpJpmMgaEkOe7t"),
    isTokenAutoRefreshEnabled: true
});
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

let currentuser = null;
let myproblempath = null;
let alltestpath = collection(db, "bytecraft", "public", "problems");
let testCases;
let problem;
let currentlang = "c";
let userstate;
let templateKey = null;
let templateFn = null;


const urlParams = new URLSearchParams(window.location.search);
const currentproblemid = urlParams.get("data");

async function loadproblem() {
    let samplecode = null;
    let currunttest = doc(alltestpath, currentproblemid);
    problem = await getDoc(currunttest);
    let mycodepadata = null;
    if (currentuser) {
        mycodepadata = await getDoc(myproblempath);
        if (mycodepadata.exists()) {
            samplecode = mycodepadata.data().code;
            currentlang = mycodepadata.data().lang;
        }
        else {
            samplecode = problem.data().samplecode[currentlang];
        }
    }
    if (!currentuser) {
        samplecode = problem.data().samplecode[currentlang];
    }

    document.getElementById("problem-container").innerHTML = problem.data().problemhtml;
    editor.setValue(samplecode);
    editor.setOption("mode", MODE_MAP[currentlang] || "text/plain");
    document.getElementById("attempted").innerText = problem.data().attempted;
    document.getElementById("skeleton-wrapperh3").style.display = "none";


    let langdata = problem.data().lang;
    for (let item of langdata) {
        let newoption = document.createElement("option");
        newoption.value = item;
        newoption.textContent = item;
        document.getElementById("langtype").appendChild(newoption);
    }
    document.getElementById("langtype").value = currentlang;
    document.getElementById("langtype").addEventListener("change", (event) => {
        currentlang = event.target.value;
        editor.setValue(problem.data().samplecode[currentlang]);
        editor.setOption("mode", MODE_MAP[currentlang] || "text/plain");
    })
    document.getElementById("skeleton-wrapper").style.display = "none";
    document.getElementById("coderun").style.pointerEvents = "auto";
    document.getElementById("pagetitle").innerText = problem.data().title;
    templateKey = problem.data().templateKey;
    templateFn = await loadTemplate(templateKey);
    testCases = problem.data().testcases;
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentuser = user;
        myproblempath = doc(db, "bytecraft", "private", "users", currentuser.uid, "solvedproblems", currentproblemid);
        userstate = doc(db, "bytecraft", "private", "users", currentuser.uid, "userinfo", "userstate");
        loadproblem();
    }
    else {
        loadproblem();

    }
})








































window.runTestCases = runTestCases;
window.resetCode = resetCode;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
// Initialize CodeMirror editor


// Set default font size
let currentFontSize = 16;
editor.getWrapperElement().style.fontSize = currentFontSize + "px";

// Zoom functions
function zoomIn() {
    if (currentFontSize < 30) {
        currentFontSize += 2;
        editor.getWrapperElement().style.fontSize = currentFontSize + "px";
        editor.refresh();
    }
}

function zoomOut() {
    if (currentFontSize > 12) {
        currentFontSize -= 2;
        editor.getWrapperElement().style.fontSize = currentFontSize + "px";
        editor.refresh();
    }
}

// C keywords for autocomplete
const cKeywords = [
    "int", "float", "char", "double", "void", "return",
    "if", "else", "while", "for", "do", "switch", "case", "default", "continue",
    "printf", "scanf", "gets", "puts", "sizeof", "struct", "enum",
    "#include<math.h>", "#include<stdio.h>", "#include<stdlib.h>",
    "const", "static", "extern", "volatile", "register", "goto"
];

// Register autocomplete helper
CodeMirror.registerHelper("hint", currentlang, function (editor) {
    var cur = editor.getCursor();
    var token = editor.getTokenAt(cur);
    var start = token.start;
    var end = token.end;
    var word = token.string;
    var list = cKeywords.filter(function (item) {
        return item.startsWith(word);
    });
    return {
        list: list,
        from: CodeMirror.Pos(cur.line, start),
        to: CodeMirror.Pos(cur.line, end)
    };
});

editor.on("inputRead", function (cm, event) {
    if (!cm.state.completionActive && event.text[0].match(/\w/)) {
        cm.showHint({ hint: CodeMirror.hint.c });
    }
});

// Run test cases
async function runTestCases() {
    document.getElementById("coderun").innerHTML = `<i class="fa-solid fa-arrow-rotate-right fa-spin"></i>
                <span>Running...</span>`;

    const userCode = editor.getValue();

    // Clear output
    document.getElementById("output").innerHTML = "";
    document.getElementById("passed-count").textContent = "0 passed";

    let passed = 0;

    // Run each test case
    for (let i = 0; i < 10; i++) {
        const testCase = testCases[i];

        // Show running status
        const resultDiv = document.createElement("div");
        resultDiv.className = "test-case-result test-case-running";
        resultDiv.innerHTML = `<strong>Test Case ${i + 1}:</strong> Running...`;
        document.getElementById("output").appendChild(resultDiv);

        // Create full C program with test case


        try {

            const result = await createTestCode(userCode, testCase);


            // Update result
            resultDiv.className = `test-case-result ${result.passed ? "test-case-pass" : "test-case-fail"}`;
            resultDiv.innerHTML = `
            <strong>Test Case ${i + 1}:</strong> ${result.passed ? "PASSED" : "FAILED"}
            <small>Expected: ${testCase.expected}</small>
            <small>${result.passed ? `Output: ${result.output}` : `Got: ${result.output}`}</small>
          `;

            if (result.passed) {
                passed++;
            } else {
                break;
            }
        } catch (error) {
            resultDiv.className = "test-case-result test-case-fail";
            resultDiv.innerHTML = `
            <strong>Test Case ${i + 1}:</strong> ERROR
            <small>${error.message || "Execution failed"}</small>
          `;
            if (currentuser) {
                savetoprofile(passed);
            };
        }

        // Update counts
        document.getElementById("passed-count").textContent = `${passed} passed`;

        // Scroll to bottom
        document.getElementById("output").scrollTop = document.getElementById("output").scrollHeight;

        // Small delay between test cases
        await new Promise(resolve => setTimeout(resolve, 1));
    }
    if (currentuser) {
        await savetoprofile(passed);
    }


    if (passed === 10) {
        document.getElementById("congrats").style.display = "flex";
        const successDiv = document.createElement("div");
        successDiv.className = "success-message";
        successDiv.innerHTML = `
          <h3>All Test Cases Passed!</h3>
          <p>Your solution passed all ${passed} test cases.</p>
        `;
        document.getElementById("output").appendChild(successDiv);
        setTimeout(() => {
            document.getElementById("congrats").style.display = "none";
        }, 2000);
    }
    else {
        const successDiv = document.createElement("div");
        successDiv.className = "fail-message";
        successDiv.innerHTML = `
          <h3>Fail! try again</h3>
        `;
        document.getElementById("output").appendChild(successDiv);
    }
    document.getElementById("coderun").innerHTML = `<i class="fas fa-play"></i>
                <span>Run Tests</span>`;
    document.getElementById("output").scrollTop = document.getElementById("output").scrollHeight;
}

async function savetoprofile(passed) {
    let problemdata = await getDoc(myproblempath);
    if (!problemdata.exists()) {
        let stat = 0;
        if (passed == 10) {
            stat = 1;
        }
        if (stat == 1) {
            await updateDoc(userstate, {
                successfulattempt: increment(1)
            })
            let snap = problem.data().difficulty;
            if (snap == "easy") {
                await updateDoc(userstate, {
                    solvedeasy: increment(1)
                })
            }
            else
                if (snap == "med") {
                    await updateDoc(userstate, {
                        solvedmed: increment(1)
                    })
                }
                else {
                    await updateDoc(userstate, {
                        solvedhard: increment(1)
                    })
                }
        }
        else {
            await updateDoc(userstate, {
                failattempt: increment(1)
            })
        }
        await setDoc(myproblempath, {
            title: problem.data().title,
            status: stat,
            code: editor.getValue(),
            lang: currentlang
        })
        let snap = problem.data().attempted;
        snap++;
        await updateDoc(problem.ref, {
            attempted: snap
        })
    }
    else {
        if (passed == 10) {
            let snap = await getDoc(myproblempath);
            if (snap.data().status == 0) {
                await updateDoc(userstate, {
                    successfulattempt: increment(1)
                })
                let snap1 = problem.data().difficulty;
                if (snap1 == "easy") {
                    await updateDoc(userstate, {
                        solvedeasy: increment(1)
                    })
                }
                else
                    if (snap1 == "med") {
                        await updateDoc(userstate, {
                            solvedmed: increment(1)
                        })
                    }
                    else {
                        await updateDoc(userstate, {
                            solvedhard: increment(1)
                        })
                    }
            }
            await updateDoc(myproblempath, {
                status: 1,
                code: editor.getValue(),
                lang: currentlang
            })
        }
        else {
            await updateDoc(userstate, {
                failattempt: increment(1)
            })
            await updateDoc(myproblempath, {
                code: editor.getValue(),
                lang: currentlang
            })
        }
    }
}

// Create test code
async function createTestCode(userCode, testCase) {

    if (!templateFn) {
        throw new Error("No template found");
    }

    return await templateFn(
        userCode,
        testCase,
        currentlang
    );
}


// Parse output
function parseOutput(output, expected) {
    const clean = output.trim();

    switch (outputType) {

        case "int":
            return {
                passed: parseInt(clean) === expected,
                output: clean
            };

        case "float":
            return {
                passed: Math.abs(parseFloat(clean) - expected) < 0.001,
                output: clean
            };

        case "string":
            return {
                passed: clean === expected,
                output: clean
            };

        case "array":
            const actualArr = clean.split(/\s+/).map(Number);
            return {
                passed: JSON.stringify(actualArr) === JSON.stringify(expected),
                output: actualArr.join(" ")
            };

        case "pair":
            const parts = clean.split(/\s+/).map(Number);
            return {
                passed: parts[0] === expected.a && parts[1] === expected.b,
                output: clean
            };

        case "lines":
            const actualLines = clean.split("\n");
            return {
                passed: JSON.stringify(actualLines) === JSON.stringify(expected),
                output: clean
            };

        default:
            return {
                passed: clean === String(expected),
                output: clean
            };
    }
}


// Reset code to default
function resetCode() {
    if (confirm("Are you sure you want to reset your code to the default template?")) {
        editor.setValue(problem.data().samplecode[currentlang]);
    }
}

document.getElementById("maximize").addEventListener("click", async () => {
    document.getElementById("problem-container").style.display = "none";
    document.getElementById("maximize").style.display = "none";
    document.getElementById("minimize").style.display = "flex";
    document.getElementById("main-container").style.width = "100%";
    document.getElementById("main-container").style.height = "120vh";
    document.getElementById("editor-container").style.overflow = "visible";
})

document.getElementById("minimize").addEventListener("click", async () => {
    document.getElementById("problem-container").style.display = "block";
    document.getElementById("maximize").style.display = "flex";
    document.getElementById("minimize").style.display = "none";
    document.getElementById("main-container").style.width = "70%";
    document.getElementById("main-container").style.height = "90vh";
    document.getElementById("editor-container").style.overflow = "hidden";
})