const express = require("express");
const router = express.Router();
const vpnController = require("./controller");

router.post("/vpn/create-peer", vpnController.createPeer);
router.get("/vpn/config/:id", vpnController.getConfig);
router.delete("/vpn/remove-peer/:id", vpnController.removePeer);

module.exports = router;