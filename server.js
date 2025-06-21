require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
let chatLogs = {};

// Optional symptom tip advice
const symptomSuggestions = {
  fever: "Drink fluids, rest, and check temperature every 6 hours.",
  cough: "Warm water and honey helps. If dry cough persists, consult a doctor.",
  headache: "Try lying in a dark room. Caffeine or paracetamol can help.",
  cold: "Steam inhalation and warm fluids recommended.",
  stomachache: "Try ginger or mint tea. If sharp pain, seek medical help.",
  tiredness: "Hydrate, sleep well, and eat iron-rich food.",
};

app.post('/ask', async (req, res) => {
  const { message, user, lang } = req.body;

  // Store chat log for user
  if (!chatLogs[user]) chatLogs[user] = [];
  chatLogs[user].push({ from: 'user', text: message });
  if (chatLogs[user].length > 20) chatLogs[user].shift();

  // Map lang code to name
  const languageMap = {
    'en-IN': 'English',
    'hi-IN': 'Hindi',
    'bn-IN': 'Bengali',
    'ta-IN': 'Tamil',
  };
  const languageName = languageMap[lang] || 'English';

  // System prompt and optional symptom advice
  const systemPrompt = `You are CHIKITSALAYA, a compassionate AI healthcare assistant. Answer in ${languageName}. Be empathetic and medically helpful.`;

  const symptomKey = Object.keys(symptomSuggestions).find(symptom =>
    message.toLowerCase().includes(symptom)
  );
  const advice = symptomKey ? `\n💡 Advice: ${symptomSuggestions[symptomKey]}` : '';

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ]
    });

    const reply = chatCompletion.choices[0].message.content + advice;
    chatLogs[user].push({ from: 'bot', text: reply });

    res.json({ reply });
  } catch (err) {
    console.error("❌ OpenAI Error:", err.message);
    res.status(500).json({ reply: "❌ Server error occurred. Please try again later." });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
