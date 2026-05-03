module.exports = (req) => {

    const url = req.originalUrl || "";
    const host = req.headers.host || "";

    return {
        urlLength: url.length,
        hasSQLKeywords: /select|union|drop|insert/i.test(url),
        specialChars: (url.match(/[<>'";]/g) || []).length,
        pathDepth: url.split("/").length,
        suspiciousWords: /admin|login|config/i.test(url),
        method: req.method,
        userAgent: req.headers["user-agent"] || "",
        host
    };
};