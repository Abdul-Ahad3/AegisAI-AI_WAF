const wgService = require("./wgService");
const ipAlloc = require("./ipAlloc");
const QRCode = require("qrcode");

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