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

const symptomSuggestions = {
  fever: "Drink fluids...",
  // etc
};

app.post('/ask', async (req, res) => {
  const { message, user, lang } = req.body;
  if (!chatLogs[user]) chatLogs[user] = [];
  chatLogs[user].push({ from: 'user', text: message });
  if (chatLogs[user].length > 20) chatLogs[user].shift();

  const languageMap = { 'en-IN': 'English', 'hi-IN': 'Hindi', 'bn-IN': 'Bengali', 'ta-IN': 'Tamil' };
  const languageName = languageMap[lang] || 'English';
  const systemPrompt = `You are CHIKITSALAYA, a compassionate AI...`;
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

// index.html path
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
