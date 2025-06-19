function startChat() {
  const nameInput = document.getElementById("username");
  const name = nameInput.value.trim();
  if (!name) return alert("Please enter your name.");

  localStorage.setItem("chikitsalayaUser", name);
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("chatContainer").classList.remove("hidden");
  document.getElementById("userDisplay").innerText = name;
}

const username = localStorage.getItem("chikitsalayaUser");

// Send message to backend
async function sendMessage() {
  const input = document.getElementById("userInput");
  const msg = input.value.trim();
  if (!msg) return;

  appendMessage(username, msg);
  input.value = "";
  appendMessage("CHIKITSALAYA", "Typing...");

  const res = await fetch("/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: msg, user: username })
  });

  const data = await res.json();
  document.querySelector("#chatBox .message:last-child").remove();
  appendMessage("CHIKITSALAYA", data.reply, true);
  speak(data.reply); // Text-to-speech
}

// Display message
function appendMessage(sender, text, isBot = false) {
  const div = document.createElement("div");
  div.className = "message";
  div.innerHTML = `<strong>${sender}:</strong> ${text}`;
  document.getElementById("chatBox").appendChild(div);
  div.scrollIntoView({ behavior: "smooth" });
}

// Text-to-Speech
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-IN";
  speechSynthesis.speak(utterance);
}

// 🎤 Voice-to-Text
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = false;
recognition.lang = 'en-IN';

function startListening() {
  console.log("🎤 Listening...");
  const micBtn = document.querySelector('button[onclick="startListening()"]');
  micBtn.innerText = "🎙️ Listening...";
  recognition.start();

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("userInput").value = transcript;
    micBtn.innerText = "🎤"; // Reset icon
    sendMessage();
  };

  recognition.onerror = function (event) {
    console.error("Speech recognition error:", event.error);
    alert("🎤 Voice input error: " + event.error);
    micBtn.innerText = "🎤";
  };
}


// Send on Enter key
document.getElementById("userInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter") sendMessage();
});
