let maxtoken = 5;
let tokennum = document.getElementById("tokennum");


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

async function getusertoken() {
  load("getting token..");
  const tokenref = window.doc(window.db, "testgenerator", "users", "testinfo", window.currentuseruid, "uses", "token");
  const snap = await window.getDoc(tokenref);
  const today = new Date().toDateString();
  if (!window.exists(snap)) {
    await window.setDoc(tokenref, {
      tokens: maxtoken,
      lastupdated: today
    })
    load("getting token..");
    return maxtoken;
  }
  let data = snap.data();
  if (data.lastupdated !== today) {
    await window.updateDoc(tokenref, {
      tokens: maxtoken,
      lastupdated: today
    })
    load("getting token..");
    return maxtoken;
  }
  load("getting token..");
  return data.tokens;
}

async function usetoken() {
  const tokenref = window.doc(window.db, "testgenerator", "users", "testinfo", window.currentuseruid, "uses", "token");
  let snap = await window.getDoc(tokenref);

  if (!window.exists(snap)) {
    return false;
  }

  let data = snap.data();

  if (data.tokens <= 0) {
    return false;
  }

  await window.updateDoc(tokenref, {
    tokens: data.tokens - 1
  })
  return true;
}

document.getElementById("generateBtn").addEventListener("click", async () => {
  let tokens = await getusertoken();
  if (tokens <= 0) {
    alert("❌ You have no tokens left for today. Try again tomorrow!");
    return;
  }
  load("using token..");
  let ok = await usetoken();

  if (!ok) {
    alert("❌ You have no tokens left. Try again tomorrow!");
    load("using token..");
    return;
  }
  load("getting token..");

  const question = document.getElementById("question").innerText;
  const answerBox = document.getElementById("answer");
  if (!question.trim()) {
    answerBox.textContent = "⚠️ Please enter a topic or subject!";
    return;
  }
  load("Generating for you...");

  try {
    // ✅ Send both the instruction and the user's topic to the API
    const response = await axios.post("/api/server", {
      contents: [
        {
          parts: [
            {
              text: `
You are an expert question paper generator AI.
Generate exactly the number of questions the user requests. but less that 50 not more.
If user asks for 5 questions → generate exactly 5.
If user asks for 20 questions → generate exactly 20.
(Always keep the limit: maximum 50 questions.)
Generate multiple choice and true false question based on this topic: "${question}". One option must be correct, and in multiple choice select option just put 1 to 4 not
actual question option and in true false kept as true and false in select options and that correct option must be preselected using the HTML attribute 'selected' inside the <select> element.
.Questions must be a mix of:
- Multiple Choice Questions (MCQ)
- True/False questions  
Choose randomly between them for each question.
Respond ONLY in the following HTML format (no extra text, no markdown, no explanation):

<div class="result">

            <h4><i class="fa-solid fa-list-check"></i> Multiple Choice</h4>
            <br>
            <h1>here is the question</h1>
                <h5>option</h5>
                <h5>option</h5>
                <h5>option</h5>
                <h5>option</h5>
                <select class="ansinput">
                    <option value="select">select</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                </select>

                <br><br>
        </div>
        and true false format is :
        <div class="result">

            <h4><i class="fa-solid fa-check"></i><i class="fa-solid fa-xmark"></i> True/False</h4>
            <br>

            <h1>here is the question</h1>
            <select class="ansinput">
                <option value="select">select</option>
                <option value="true">True</option>
                <option value="false">False</option>
            </select>

            <br><br>
        </div>
                `,
            },
          ],
        },
      ],
    });

    // ✅ Get the pure HTML response
    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";

    // ✅ Render as HTML (not plain text)
    answerBox.innerHTML = text;

    document.getElementById("submitpaper").style.display = "block";
    document.getElementById("token").style.display = "flex";
    tokennum.innerHTML = tokens-1;

    load("Generating for you...");

  } catch (error) {
    load("Generating for you...");
    console.error(error);
    answerBox.textContent = "❌ Error generating question.";
  }
});