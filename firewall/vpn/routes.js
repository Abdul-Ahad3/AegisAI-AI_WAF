const express = require("express");
const router = express.Router();
const vpnController = require("./controller");

//VPN Peer control
router.post("/vpn/create-peer", vpnController.createPeer);
router.get("/vpn/config/:id", vpnController.getConfig);
router.delete("/vpn/remove-peer/:id", vpnController.removePeer);

// VPN control
router.post("/vpn/start", vpnController.startVPN);
router.post("/vpn/stop", vpnController.stopVPN);

// Firewall control
router.post("/firewall/start", vpnController.startFirewall);
router.post("/firewall/stop", vpnController.stopFirewall);

// Combined security toggle (MAIN FEATURE)
router.post("/security/enable", vpnController.enableSecurity);
router.post("/security/disable", vpnController.disableSecurity);

module.exports = router;