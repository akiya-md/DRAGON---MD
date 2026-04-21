const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, delay, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys");
const pino = require("pino");

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/code', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.status(400).json({ error: "Number එක දාපන් මචං!" });

    const { state, saveCreds } = await useMultiFileAuthState(`./auth/${num}`);
    
    try {
        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: "silent" }),
        });

        if (!sock.authState.creds.registered) {
            await delay(1500);
            num = num.replace(/[^0-9]/g, '');
            const code = await sock.requestPairingCode(num);
            return res.json({ code: code });
        }
    } catch (err) {
        res.status(500).json({ error: "WhatsApp Error!" });
    }
});

app.listen(PORT, () => console.log(`Akiya API Server on port ${PORT}`));
