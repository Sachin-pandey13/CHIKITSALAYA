// Auto-login on page load
let username = localStorage.getItem("chikitsalayaUser");
if (username) {
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("chatContainer").classList.remove("hidden");
  document.getElementById("userDisplay").innerText = username;
}

// Language selection
let selectedLang = 'en-IN';
document.getElementById("langSelect")?.addEventListener("change", function () {
  selectedLang = this.value;
});

// Theme Toggle Logic
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  localStorage.setItem("chikitsalayaTheme", document.body.classList.contains("light-mode") ? "light" : "dark");
});
// Load saved theme on startup
window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("chikitsalayaTheme") === "light") {
    document.body.classList.add("light-mode");
  }
});

// Start Chat
function startChat() {
  const nameInput = document.getElementById("username");
  const name = nameInput.value.trim();
  if (!name) return alert("Please enter your name.");

  localStorage.setItem("chikitsalayaUser", name);
  username = name;
// ✅ Stop speech synthesis on page refresh
window.onbeforeunload = function () {
  speechSynthesis.cancel();
};

  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("chatContainer").classList.remove("hidden");
  document.getElementById("userDisplay").innerText = name;
}

// Send Message
async function sendMessage() {
  const input = document.getElementById("userInput");
  const msg = input.value.trim();
  if (!msg) return;

  appendMessage(username, msg, false);
  input.value = "";

  const typingBubble = appendMessage("CHIKITSALAYA", "Typing...", true, true);

  try {
const res = await fetch("https://b22b4642-63a3-40f9-b89a-f3845181bc4a.e1-us-east-azure.choreoapps.dev/ask", {

      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg, user: username, lang: selectedLang })
    });

    const data = await res.json();
    typingBubble.remove();
    appendMessage("CHIKITSALAYA", data.reply, true);
    speak(data.reply);
  } catch (err) {
    typingBubble.remove();
    appendMessage("CHIKITSALAYA", "❌ Error: Unable to get response. Please try again.", true);
  }
}

// Append Message
function appendMessage(sender, text, isBot = false, isTyping = false) {
  const div = document.createElement("div");
  div.className = `message-bubble ${isBot ? "bot" : "user"} ${isTyping ? "typing" : ""} animate__animated animate__fadeInUp`;

  const messageText = document.createElement("div");
  messageText.className = "message-text";
  messageText.innerHTML = `<strong>${sender}:</strong> ${text}`;

  const time = document.createElement("div");
  time.className = "timestamp";
  const now = new Date();
  time.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  div.appendChild(messageText);
  div.appendChild(time);

  document.getElementById("chatBox").appendChild(div);
  div.scrollIntoView({ behavior: "smooth" });

  return div;
}
function resetSession() {
  localStorage.removeItem("chikitsalayaUser");
  location.reload(); // Force refresh to show login screen again
}

// Text-to-speech
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = selectedLang || "en-IN";
  speechSynthesis.speak(utterance);
}

// Voice-to-text
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = false;

function startListening() {
  const micBtn = document.querySelector('button[onclick="startListening()"]');
  micBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
  recognition.lang = selectedLang;
  recognition.start();

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("userInput").value = transcript;
    micBtn.innerHTML = `<i class="fas fa-microphone"></i>`;
    sendMessage();
  };

  recognition.onerror = function (event) {
    console.error("Speech recognition error:", event.error);
    alert("🎤 Voice input error: " + event.error);
    micBtn.innerHTML = `<i class="fas fa-microphone"></i>`;
  };
}

// Structured Symptom Form
function openForm() {
  document.getElementById("formModal").classList.remove("hidden");
}
function closeForm() {
  document.getElementById("formModal").classList.add("hidden");
}
function submitForm() {
  const name = document.getElementById("symptomName").value.trim();
  const duration = document.getElementById("symptomDuration").value;
  const severity = document.getElementById("symptomSeverity").value;
  const notes = document.getElementById("symptomNotes").value.trim();

  if (!name || !duration || !severity) {
    alert("Please fill out all required fields.");
    return;
  }

  const message = `Symptom: ${name}\nDuration: ${duration}\nSeverity: ${severity}\nNotes: ${notes}`;
  document.getElementById("userInput").value = message;
  closeForm();
  sendMessage();
}

// Quick Suggestion Box Behavior
const userInput = document.getElementById("userInput");
const suggestionBox = document.getElementById("suggestionBox");

userInput.addEventListener("input", function () {
  suggestionBox.style.display = userInput.value.trim() ? "none" : "flex";
});

userInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") sendMessage();
});

function quickSuggest(text) {
  document.getElementById("userInput").value = text;
  sendMessage();
}
