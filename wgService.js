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

exports.createPeer = async (id, publicKey, ip) => {

    const peerConfig = `

# ${id}
[Peer]
PublicKey = ${publicKey}
AllowedIPs = ${ip}/32
`;

    fs.appendFileSync(WG_CONFIG, peerConfig);

    execSync("wg syncconf wg0 <(wg-quick strip wg0)");

    const serverPublicKey = execSync("wg show wg0 public-key")
        .toString()
        .trim();

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

    return clientConfig;
};

exports.removePeer = async (id) => {

    let config = fs.readFileSync(WG_CONFIG).toString();

    const regex = new RegExp(`# ${id}[\\s\\S]*?AllowedIPs.*`, "g");

    config = config.replace(regex, "");

    fs.writeFileSync(WG_CONFIG, config);

    execSync("wg syncconf wg0 <(wg-quick strip wg0)");
};