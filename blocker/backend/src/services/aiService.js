// backend/src/services/aiService.js
// Calls the HuggingFace Inference API to classify a URL as phishing or safe.
// Model: ealvaradob/bert-finetuned-phishing
//
// IMPORTANT: this code lives ONLY on the backend. The HF token is never
// exposed to the Chrome extension.

const axios = require('axios');

const HF_API_TOKEN = process.env.HF_API_TOKEN;
const HF_MODEL = process.env.HF_MODEL || 'ealvaradob/bert-finetuned-phishing';
const HF_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`;
const THRESHOLD = parseFloat(process.env.PHISHING_THRESHOLD || '0.7');

// Bare domains like "https://google.com" (no path) score higher for phishing
// on this model than "https://google.com/" (with slash). Always ensure a path exists.
function normalizeUrl(url) {
  try {
    const u = new URL(url);
    if (!u.pathname || u.pathname === '') u.pathname = '/';
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * Call HuggingFace and decide phishing vs safe.
 * Returns: { status: 'safe' | 'phishing' | 'error', confidence, reason, raw }
 *
 * Fail-safe behavior: if the API fails, we return status='error' and the
 * controller decides to "allow but warn" rather than hard-blocking.
 */
async function classifyUrl(url) {
  if (!HF_API_TOKEN) {
    return {
      status: 'error',
      confidence: 0,
      reason: 'HF_API_TOKEN not configured on backend',
      raw: null
    };
  }

  try {
    const response = await axios.post(
      HF_URL,
      { inputs: normalizeUrl(url) },
      {
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    // HF text-classification responses come back as either:
    //   [[{label, score}, {label, score}]]   (nested)
    //   [{label, score}, ...]                (flat)
    let predictions = response.data;
    if (Array.isArray(predictions) && Array.isArray(predictions[0])) {
      predictions = predictions[0];
    }

    if (!Array.isArray(predictions) || predictions.length === 0) {
      return {
        status: 'error',
        confidence: 0,
        reason: 'Unexpected response shape from HuggingFace',
        raw: response.data
      };
    }

    // Find the top prediction
    const top = predictions.reduce((a, b) => (a.score > b.score ? a : b));
    const label = String(top.label || '').toLowerCase();
    const score = Number(top.score) || 0;

    // The model outputs labels like "phishing" / "safe" or "LABEL_0"/"LABEL_1".
    // We treat anything containing "phish", "malic", or LABEL_1 as phishing.
    const isPhish =
      label.includes('phish') ||
      label.includes('malic') ||
      label.includes('bad') ||
      label === 'label_1';

    if (isPhish && score >= THRESHOLD) {
      return {
        status: 'phishing',
        confidence: score,
        reason: `AI flagged as phishing (label="${top.label}", confidence=${score.toFixed(3)})`,
        raw: predictions
      };
    }

    return {
      status: 'safe',
      confidence: score,
      reason: `AI classified as safe (label="${top.label}", confidence=${score.toFixed(3)})`,
      raw: predictions
    };
  } catch (err) {
    // Common case: model is "loading" on HF (cold start) → HF returns 503
    const hfMsg = err?.response?.data?.error || err.message;
    return {
      status: 'error',
      confidence: 0,
      reason: `HuggingFace request failed: ${hfMsg}`,
      raw: null
    };
  }
}

module.exports = { classifyUrl };
