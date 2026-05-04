// decisionEngine.js
module.exports = (aiResult) => {

    const { status, confidence } = aiResult;

    if (status === "safe" && confidence > 0.8) {
        return "secure";
    }

    if (status === "phishing" && confidence > 0.8) {
        return "unsafe";
    }

    return "flagged";
};