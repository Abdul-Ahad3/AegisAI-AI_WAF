const { execSync } = require("child_process");
const fs = require("fs");
const QRCode = require("qrcode"); 

const WG_CONFIG = "/etc/wireguard/wg0.conf";

// Generate a WireGuard key pair
exports.generateKeys = async () => {
    const privateKey = execSync("wg genkey").toString().trim();
    const publicKey = execSync(`echo ${privateKey} | wg pubkey`).toString().trim();
    return { privateKey, publicKey };
};

// Create a new peer
exports.createPeer = async (id, publicKey, ip) => {

    // Append peer to server config
    const peerConfig = `
# ${id}
[Peer]
PublicKey = ${publicKey}
AllowedIPs = ${ip}/32
`;
    fs.appendFileSync(WG_CONFIG, peerConfig);

    // Sync WireGuard if in production
    if (process.env.NODE_ENV !== "production") {
        console.log("Skipping wg syncconf in development");
    } else {
        const stripPath = "/tmp/wg0.conf.strip";
        execSync(`wg-quick strip wg0 > ${stripPath}`);
        execSync(`wg syncconf wg0 ${stripPath}`);
    }

    const serverPublicKey = execSync("wg show wg0 public-key").toString().trim();

    // Prepare client config
    const clientConfig = `
[Interface]
PrivateKey = CLIENT_PRIVATE_KEY
Address = ${ip}/24
DNS = 1.1.1.1

[Peer]
PublicKey = ${serverPublicKey}
Endpoint = YOUR_PUBLIC_IP:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
`;

    // --- Generate QR code for this client config ---
    try {
        await QRCode.toFile(`./qr_${id}.png`, clientConfig); // QR saved in current folder
        console.log(`QR saved as qr_${id}.png`);
    } catch (err) {
        console.error("Error generating QR code:", err);
    }

    return clientConfig;
};

// Remove a peer
exports.removePeer = async (id) => {
    let config = fs.readFileSync(WG_CONFIG).toString();
    const regex = new RegExp(`# ${id}[\\s\\S]*?AllowedIPs.*`, "g");
    config = config.replace(regex, "");
    fs.writeFileSync(WG_CONFIG, config);

    if (process.env.NODE_ENV !== "production") {
        console.log("Skipping wg syncconf in development");
    } else {
        const stripPath = "/tmp/wg0.conf.strip";
        execSync(`wg-quick strip wg0 > ${stripPath}`);
        execSync(`wg syncconf wg0 ${stripPath}`);
    }
};