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

// Backend API URL (adjust this to your actual backend URL)
const BACKEND_URL = "http://localhost:5000/api/gemini";

function load(text) {
    const loadbar = document.getElementById("loading");
    const loadh2 = document.getElementById("loadh2");
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
    const testref = doc(db, "testgenerator", "public", "tests", testid);
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
        newdiv.className = "result";
        newdiv.innerHTML = snap.data().content;

        const selectElement = newdiv.querySelector("select");
        if (selectElement) {
            selectElement.id = `q${qIndex}`;
        }

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
    window.location.href = "../index.html";
});

//starttest

document.getElementById("startTestBtn").addEventListener("click", () => {
    document.getElementById("quetionnumber").innerText = numque;
    document.getElementById("quenumdiv").style.display = "flex";
    document.getElementById("result").style.display = "block";
    document.getElementById("teststart").style.display = "none";
    document.getElementById("submitpaper").style.display = "block";
    document.getElementById("timer").style.display = "flex";

    let testDuration = parseInt(document.getElementById("teststarttime").textContent, 10);
    let timeLeft = testDuration * 60;

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

// showscore and generate analysis

document.getElementById("yesconfirmsubmit").addEventListener("click", async () => {
    document.getElementById("quenumdiv").style.display = "none";
    isSubmitted = true;
    load("Calculating answer...");
    testscore = 0;

    // Store incorrect questions for analysis
    let incorrectQuestions = [];
    let correctQuestions = [];

    questions.forEach((q, index) => {
        let userAnswer = document.getElementById(`q${index}`);
        let questionDiv = document.querySelector("#result").children[index];

        if (userAnswer.value == q.co) {
            questionDiv.style.border = "2px solid rgba(74, 222, 128, 0.5)";
            testscore++;
            correctQuestions.push({
                questionNumber: index + 1,
                question: q.content.replace(/<[^>]*>/g, '').substring(0, 200) + "...",
                userAnswer: userAnswer.value,
                correctAnswer: q.co
            });
        }
        else {
            questionDiv.style.border = "2px solid rgba(248, 113, 113, 0.5)";
            userAnswer.disabled = true;

            let correctText = document.createElement("p");
            correctText.textContent = `✔ Correct Answer: ${q.co}`;
            correctText.style.color = "#4ade80";
            correctText.style.fontWeight = "bold";
            correctText.style.marginTop = "10px";
            questionDiv.appendChild(correctText);

            incorrectQuestions.push({
                questionNumber: index + 1,
                question: q.content.replace(/<[^>]*>/g, '').substring(0, 200) + "...",
                userAnswer: userAnswer.value,
                correctAnswer: q.co,
                reason: "Incorrect answer"
            });
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

    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
        let lenbar = 100 * testscore / (questions.length);
        document.getElementById("bar").style.width = `${lenbar}%`;
    }, 50);

    load("Calculating answer...");

    // Show analysis section and generate analysis
    setTimeout(() => {
        generatePerformanceAnalysis(testscore, questions.length, incorrectQuestions, correctQuestions);
    }, 1000);
});


function displayImprovementOnly(text) {
    document.getElementById("analysisLoading").style.display = "none";
    document.getElementById("analysisContent").style.display = "block";

    document.getElementById("analysisContent").innerHTML = `
        <div class="analysis-category">
            <h4>⚠ Areas You Need to Improve</h4>
            <div class="improvement-tip">
                <p>${text.replace(/\n/g, "<br>")}</p>
            </div>
        </div>
    `;
}


// Function to generate performance analysis using Gemini API
async function generatePerformanceAnalysis(score, total, incorrectQuestions, correctQuestions) {
    document.getElementById("analysisSection").style.display = "block";
    document.getElementById("analysisLoading").style.display = "block";
    document.getElementById("analysisContent").style.display = "none";

    // Scroll to analysis section
    setTimeout(() => {
        document.getElementById("analysisSection").scrollIntoView({ behavior: 'smooth' });
    }, 500);

    try {
        // Prepare data for analysis
        const testName = document.getElementById("teststartname").textContent;
        const testInfo = document.getElementById("teststartinfo").textContent;

        // Create analysis prompt
        const userPrompt = `Analyze quiz performance for a Data Structures and Algorithms test.
        
Test Information:
- Test Name: ${testName}
- Test Description: ${testInfo}
- Score: ${score}/${total} (${Math.round(score / total * 100)}%)
- Number of Questions: ${total}

Performance Breakdown:
${incorrectQuestions.length > 0 ?
                `Incorrect Questions (${incorrectQuestions.length}):
${incorrectQuestions.map(q => `
Question ${q.questionNumber}: ${q.question}
User's Answer: ${q.userAnswer}
Correct Answer: ${q.correctAnswer}`).join('\n')}`
                : "No incorrect questions - Excellent performance!"}

${correctQuestions.length > 0 && incorrectQuestions.length > 0 ?
                `Correct Questions (${correctQuestions.length}): 
${correctQuestions.slice(0, 3).map(q => `Question ${q.questionNumber}: Answered correctly`).join(', ')}${correctQuestions.length > 3 ? ` and ${correctQuestions.length - 3} more` : ''}`
                : ""}

Please provide a detailed analysis including:
1. Overall performance assessment
2. Analysis of incorrect questions (patterns, common mistakes)
3. Specific areas of improvement in Data Structures and Algorithms
4. Recommended study topics based on incorrect answers
5. Tips for improving performance in future quizzes
6. Estimated skill level and next steps

Format the response in HTML with appropriate styling classes:
- Use <div class="analysis-category"> for each main section
- Use <div class="analysis-item"> for individual points
- Use <div class="improvement-tip"> for improvement suggestions
- Highlight key insights with <strong> tags
- Keep it structured but conversational`;

        const systemPrompt = `You are an expert Data Structures and Algorithms tutor specializing in quiz performance analysis. 
Provide detailed, actionable feedback to help students improve their DSA skills. 
Focus on identifying patterns in mistakes, suggesting specific DSA topics to study, and providing practical improvement strategies.
Be encouraging but honest. Format your response in clean HTML with the classes specified.`;


        const response = await fetch(BACKEND_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userPrompt: userPrompt,
                systemPrompt: systemPrompt
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        

        let improvementText =
            data?.candidates?.[0]?.content?.parts
                ?.map(p => p.text)
                .join("")
                .trim();

        if (!improvementText) {
            improvementText = "No specific improvement suggestions available.";
        }

        displayImprovementOnly(improvementText);



    } catch (error) {
        console.error("Error generating analysis:", error);
        displayErrorAnalysis(score, total, incorrectQuestions.length);
    }
}

// Function to display analysis


// Function to display fallback analysis if API fails
function displayErrorAnalysis(score, total, incorrectCount) {
    document.getElementById("analysisLoading").style.display = "none";
    document.getElementById("analysisContent").style.display = "block";

    const fallbackHtml = `
        <div class="analysis-stats">
            <div class="stat-card">
                <div class="stat-value">${score}/${total}</div>
                <div class="stat-label">Score</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${Math.round(score / total * 100)}%</div>
                <div class="stat-label">Percentage</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${incorrectCount}</div>
                <div class="stat-label">Incorrect</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${total - incorrectCount}</div>
                <div class="stat-label">Correct</div>
            </div>
        </div>
        
        <div class="analysis-category">
            <h4><i class="fas fa-chart-bar"></i> Performance Summary</h4>
            <p>You scored <strong>${score} out of ${total}</strong> (${Math.round(score / total * 100)}%).</p>
            ${incorrectCount > 0 ?
            `<p>You answered <strong>${incorrectCount} questions incorrectly</strong>. Focus on reviewing these areas:</p>
                <div class="improvement-tip">
                    <h5><i class="fas fa-lightbulb"></i> Improvement Tip</h5>
                    <p>Review the questions you got wrong and understand why the correct answers are right. Practice similar problems to strengthen your understanding.</p>
                </div>`
            :
            `<p><strong>Perfect score! 🎉</strong> Excellent performance!</p>
                <div class="improvement-tip">
                    <h5><i class="fas fa-rocket"></i> Next Challenge</h5>
                    <p>You've mastered this level! Consider taking more advanced DSA tests or try implementing the algorithms in code.</p>
                </div>`
        }
        </div>
        
        ${incorrectCount > 0 ? `
        <div class="analysis-category">
            <h4><i class="fas fa-exclamation-circle"></i> Areas for Improvement</h4>
            <p>Based on your incorrect answers, you should focus on:</p>
            <div class="improvement-tip">
                <h5><i class="fas fa-book"></i> Recommended Topics</h5>
                <p>1. Review fundamental DSA concepts<br>
                   2. Practice problem-solving patterns<br>
                   3. Work on time complexity analysis<br>
                   4. Study specific algorithm implementations</p>
            </div>
        </div>
        
        <div class="analysis-category">
            <h4><i class="fas fa-graduation-cap"></i> Study Plan</h4>
            <div class="improvement-tip">
                <h5><i class="fas fa-calendar-check"></i> Next 7 Days</h5>
                <p>• Day 1-2: Review incorrect questions<br>
                   • Day 3-4: Practice similar problems<br>
                   • Day 5-6: Study related DSA topics<br>
                   • Day 7: Take another practice test</p>
            </div>
        </div>` : ''}
        
        <div class="analysis-category">
            <h4><i class="fas fa-trophy"></i> Keep Going!</h4>
            <p>Regular practice is key to mastering Data Structures and Algorithms. Take more quizzes and track your progress over time.</p>
            <button id="retryQuiz" class="btn btn-primary" style="margin-top: 15px;">
                <i class="fas fa-redo"></i> Try Another Quiz
            </button>
        </div>
    `;

    document.getElementById("analysisContent").innerHTML = fallbackHtml;
    addAnalysisEventListeners();
}

// Function to add event listeners to analysis section
function addAnalysisEventListeners() {
    // Add retry quiz button listener if it exists
    const retryButton = document.getElementById("retryQuiz");
    if (retryButton) {
        retryButton.addEventListener("click", () => {
            window.location.href = "../index.html";
        });
    }

    // Add any other analysis-specific event listeners here
}