// backend/src/services/contentService.js
// Classifies page text for toxic content using unitary/toxic-bert.
// xenova/toxic-bert is a Transformers.js (browser-only) port of the same weights;
// for server-side inference we use the original unitary/toxic-bert via HF router.

const axios = require('axios');

const HF_API_TOKEN = process.env.HF_API_TOKEN;
const TOXIC_URL = 'https://router.huggingface.co/hf-inference/models/unitary/toxic-bert';
const THRESHOLD = 0.5;

async function classifyContent(text) {
  if (!HF_API_TOKEN) {
    return { ok: false, reason: 'HF_API_TOKEN not configured' };
  }

  const cleaned = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 512);
  if (cleaned.length < 10) {
    return { ok: false, reason: 'Not enough text to analyse' };
  }

  try {
    const response = await axios.post(
      TOXIC_URL,
      { inputs: cleaned },
      {
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    let predictions = response.data;
    if (Array.isArray(predictions) && Array.isArray(predictions[0])) {
      predictions = predictions[0];
    }

    if (!Array.isArray(predictions) || predictions.length === 0) {
      return { ok: false, reason: 'Unexpected response from content classifier' };
    }

    const scores = {};
    for (const p of predictions) {
      scores[p.label.toLowerCase()] = parseFloat(Number(p.score).toFixed(4));
    }

    const flags = Object.entries(scores)
      .filter(([, s]) => s >= THRESHOLD)
      .sort((a, b) => b[1] - a[1])
      .map(([label]) => label);

    const [topFlag, topScore] = Object.entries(scores).sort((a, b) => b[1] - a[1])[0] || ['none', 0];

    return { ok: true, flags, scores, topFlag, topScore, clean: flags.length === 0 };
  } catch (err) {
    const msg = err?.response?.data?.error || err.message;
    return { ok: false, reason: `Content classifier failed: ${msg}` };
  }
}

module.exports = { classifyContent };
