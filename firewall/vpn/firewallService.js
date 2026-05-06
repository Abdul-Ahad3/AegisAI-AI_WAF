const { spawn } = require("child_process");

let firewallProcess = null;

exports.startFirewall = () => {
    if (firewallProcess) {
        console.log("Firewall already running");
        return;
    }

    firewallProcess = spawn("node", ["server.js"], {
        cwd: "../firewall",
        stdio: "inherit"
    });

    console.log("Firewall started");
};

exports.stopFirewall = () => {
    if (firewallProcess) {
        firewallProcess.kill();
        firewallProcess = null;
        console.log("Firewall stopped");
    } else {
        console.log("Firewall not running");
    }
};