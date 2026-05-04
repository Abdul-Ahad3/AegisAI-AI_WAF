// logger.js
const fs = require("fs");

module.exports = (entry) => {
    fs.appendFileSync("traffic.log", JSON.stringify(entry) + "\n");
};