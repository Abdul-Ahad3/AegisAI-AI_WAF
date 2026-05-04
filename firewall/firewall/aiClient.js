// aiClient.js
const axios = require("axios");

module.exports = async (url) => {
    try {
        const res = await axios.post(
            "http://localhost:5000/api/check-url",
            { url }
        );

        return res.data;

    } catch (err) {
        return {
            status: "warn",
            confidence: 0,
            reason: "AI unavailable"
        };
    }
};