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

// 🔗 Replace this with your actual Replit backend URL
const BACKEND_URL = "https://93a4e7e8-b82d-427b-a37d-708d5cb1645b-00-35gkct708vca1.pike.replit.dev";

// Send message to backend
async function sendMessage() {
  const input = document.getElementById("userInput");
  const msg = input.value.trim();
  if (!msg) return;

  appendMessage(username, msg);
  input.value = "";
  appendMessage("CHIKITSALAYA", "Typing...");

  try {
    const res = await fetch(`${BACKEND_URL}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: msg, user: username })
    });

    const data = await res.json();
    document.querySelector("#chatBox .message:last-child").remove();
    appendMessage("CHIKITSALAYA", data.reply, true);
    speak(data.reply); // Text-to-speech

  } catch (err) {
    document.querySelector("#chatBox .message:last-child").remove();
    appendMessage("CHIKITSALAYA", "Sorry, I couldn't connect to the server.");
    console.error("Fetch error:", err);
  }
}

// Display message in chat window
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

// Voice-to-Text (Speech Recognition)
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = false;
recognition.lang = 'en-IN';

function startListening() {
  recognition.start();
  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("userInput").value = transcript;
    sendMessage();
  };
}

// Send message on Enter key
document.getElementById("userInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter") sendMessage();
});
