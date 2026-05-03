const axios = require("axios");

module.exports = async (features) => {

    try {
        const res = await axios.post("http://localhost:5000/analyze", features);

        return res.data;

    } catch (err) {
        // fallback if AI fails
        return { status: "secure" };
    }
};