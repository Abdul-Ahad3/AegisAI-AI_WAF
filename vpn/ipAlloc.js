let currentIP = 2;

exports.getNextIP = async () => {

    const ip = `10.0.0.${currentIP}`;

    currentIP++;

    return ip;
};