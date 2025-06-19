require('dotenv').config();
const express = require('express');
const cors = require('cors');
app.use(cors());
const OpenAI = require('openai');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static('public'));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let chatLogs = {}; // session-wise chat storage

// Symptom keyword suggestions
const symptomSuggestions = {
  fever: "Drink plenty of fluids and rest. Monitor your temperature regularly.",
  cough: "Stay hydrated and avoid cold drinks. If persistent, consult a physician.",
  headache: "Take rest in a quiet, dark room. Over-the-counter painkillers may help.",
  cold: "Use a humidifier and stay warm. Try nasal saline spray if needed.",
};

app.post('/ask', async (req, res) => {
  const { message, user } = req.body;
  if (!chatLogs[user]) chatLogs[user] = [];

  try {
    const symptomTip = Object.keys(symptomSuggestions).find(symptom =>
      message.toLowerCase().includes(symptom)
    );
    const advice = symptomTip ? `\n💡 Advice: ${symptomSuggestions[symptomTip]}` : '';

    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a compassionate AI healthcare assistant named CHIKITSALAYA. Provide helpful, empathetic answers to health queries.'
        },
        { role: 'user', content: message }
      ]
    });

    const reply = chatCompletion.choices[0].message.content + advice;
    chatLogs[user].push({ from: 'user', text: message });
    chatLogs[user].push({ from: 'bot', text: reply });

    res.json({ reply, history: chatLogs[user] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: 'Sorry, something went wrong.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
