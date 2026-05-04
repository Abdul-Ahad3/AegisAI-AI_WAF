// urlExtractor.js
module.exports = (req) => {
    const protocol = req.protocol;
    const host = req.headers.host;
    const path = req.originalUrl || "/";

    return `${protocol}://${host}${path}`;
};