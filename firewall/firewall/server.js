const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const extractURL = require("./urlExtractor");
const analyze = require("./aiClient");
const decide = require("./decisionEngine");
const log = require("./logger");

const app = express();

// FIREWALL LAYER
app.use(async (req, res, next) => {
    try {
        const url = extractURL(req);

        const aiResult = await analyze(url);

        const decision = decide(aiResult);

        log({
            url,
            aiResult,
            decision,
            timestamp: Date.now()
        });

        if (decision === "unsafe") {
            return res.status(403).send("Blocked by Aegis Firewall");
        }

        if (decision === "flagged") {
            console.log("⚠️ FLAGGED:", url);
            // allow for now (can add admin approval later)
        }

        next();

    } catch (err) {
        console.error(err);
        res.status(500).send("Firewall error");
    }
});

// PROXY (dynamic routing)
app.use("/", createProxyMiddleware({
    target: "http://example.com", // keep for now, improve later
    changeOrigin: true,
    router: (req) => {
        return `http://${req.headers.host}`;
    }
}));

app.listen(4000, () => {
    console.log("Firewall running on port 4000");
});