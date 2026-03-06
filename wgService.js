const { execSync } = require("child_process");
const fs = require("fs");

const WG_CONFIG = "/etc/wireguard/wg0.conf";

exports.generateKeys = async () => {

    const privateKey = execSync("wg genkey").toString().trim();

    const publicKey = execSync(`echo ${privateKey} | wg pubkey`)
        .toString()
        .trim();

    return { privateKey, publicKey };
};