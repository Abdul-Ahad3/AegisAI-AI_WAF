const wgService = require("./wgService");
const ipAlloc = require("./ipAlloc");
const QRCode = require("qrcode");
const firewallService = require("./firewallService");

exports.createPeer = async (req, res) => {
    try {

        const ip = await ipAlloc.getNextIP();

        const keys = await wgService.generateKeys();

        const peerId = Date.now().toString();

        const clientConfig = await wgService.createPeer(
            peerId,
            keys.publicKey,
            ip
        );

        const qr = await QRCode.toDataURL(clientConfig);

        res.json({
            id: peerId,
            ip,
            config: clientConfig,
            qr
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create peer" });
    }
};


exports.getConfig = async (req, res) => {

    const id = req.params.id;

    const config = await wgService.getClientConfig(id);

    res.send(config);
};


exports.removePeer = async (req, res) => {

    const id = req.params.id;

    await wgService.removePeer(id);

    res.json({ message: "Peer removed" });
};

exports.startVPN = async (req, res) => {
    try {
        wgService.startVPN();
        res.json({ message: "VPN started" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to start VPN" });
    }
};

exports.stopVPN = async (req, res) => {
    try {
        wgService.stopVPN();
        res.json({ message: "VPN stopped" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to stop VPN" });
    }
};

exports.startFirewall = async (req, res) => {
    try {
        firewallService.startFirewall();
        res.json({ message: "Firewall started" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to start firewall" });
    }
};

exports.stopFirewall = async (req, res) => {
    try {
        firewallService.stopFirewall();
        res.json({ message: "Firewall stopped" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to stop firewall" });
    }
};

exports.enableSecurity = async (req, res) => {
    try {
        wgService.startVPN();
        firewallService.startFirewall();

        res.json({ message: "VPN + Firewall enabled" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to enable security" });
    }
};

exports.disableSecurity = async (req, res) => {
    try {
        firewallService.stopFirewall();
        wgService.stopVPN();

        res.json({ message: "VPN + Firewall disabled" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to disable security" });
    }
};