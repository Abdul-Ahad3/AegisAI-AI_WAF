const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const extractFeatures = require("./featureExtractor");
const analyze = require("./aiClient");

const app = express();

// MAIN FIREWALL LOGIC
app.use(async (req, res, next) => {
    try {
        const features = extractFeatures(req);

        const result = await analyze(features);

        if (result.status === "unsafe") {
            return res.status(403).send("Blocked by Aegis Firewall");
        }

        if (result.status === "flagged") {
            console.log("FLAGGED TRAFFIC:", features);
            // allow temporarily (or block depending on policy)
        }

        next();

    } catch (err) {
        console.error(err);
        res.status(500).send("Firewall error");
    }
});

// PROXY TRAFFIC FORWARD
app.use("/", createProxyMiddleware({
    target: "http://example.com", // dynamic later
    changeOrigin: true
}));

app.listen(4000, () => {
    console.log("Firewall running on port 4000");
});