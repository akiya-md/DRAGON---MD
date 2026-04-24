const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason
} = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const express = require('express');
const admin = require('firebase-admin');
const pino = require('pino');

const app = express();
const port = process.env.PORT || 3000;

// --- 1. FIREBASE SETUP (Admin Panel එකට Data යවන්න) ---
const serviceAccount = require("./firebase-key.json"); // උඹේ Firebase Key එක මෙතනට දාපන්
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://dragon-akiya-md-default-rtdb.firebaseio.com"
});
const db = admin.database();

async function startAkiyaBot() {
    const { state, saveCreds } = await useMultiFileAuthState('akiya_auth_session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        auth: state,
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false, // අපි පාවිච්චි කරන්නේ Pairing Code එක
        browser: ["AKIYA 龍", "Chrome", "1.0.0"]
    });

    sock.ev.on('creds.update', saveCreds);

    // --- 2. PAIRING CODE API (Web එකට කෝඩ් එක යවන තැන) ---
    app.get('/code', async (req, res) => {
        let num = req.query.number;
        if (!num) return res.status(400).json({ error: "නම්බර් එක දීපන් මචං!" });

        try {
            let code = await sock.requestPairingCode(num);
            // Firebase එකට කෝඩ් එක අප්ඩේට් කරනවා සයිට් එකට පේන්න
            await db.ref('pairing_codes/' + num).set({ code: code, status: 'generated' });
            res.json({ code: code });
        } catch (err) {
            res.status(500).json({ error: "Server Busy!" });
        }
    });

    // --- 3. BOT LOGIC (Main Features) ---
    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

        // Global Logging for Admin Panel
        await db.ref('logs').push({ user: from, cmd: text.substring(0, 20), time: Date.now() });

        // A. AUTO-DOWNLOADER (TikTok/Insta Detection)
        if (text.match(/tiktok.com|instagram.com/gi)) {
            await sock.sendMessage(from, { react: { text: '📥', key: msg.key } });
            // මෙතනට Downloader API එකක් ප්ලග් කරන්න පුළුවන්
        }

        // B. SETTINGS INTEGRATION (Settings.html එකේ ඒවා වැඩ කරන හැටි)
        const userSettings = (await db.ref('settings/' + from).once('value')).val() || {};
        
        if (userSettings.autoReact) {
            await sock.sendMessage(from, { react: { text: '🔥', key: msg.key } });
        }

        if (userSettings.antiLink && text.match(/https?:\/\//gi)) {
            await sock.sendMessage(from, { delete: msg.key }); // ලින්ක් එක මකනවා
            await sock.sendMessage(from, { text: "⚠️ ඇන්ටි-ලින්ක් එක දාලා තියෙන්නේ. ලින්ක් දාන්න එපා!" });
        }

        // C. COMMANDS
        if (text === '.menu') {
            await sock.sendMessage(from, { 
                image: { url: './logo2.jpg' }, 
                caption: "𝐀𝐊𝐈𝐘𝐀 龍 ⚙️ ULTIMATE\n\n- Auto Downloader ✅\n- Anti Link ✅\n- AI Chat ✅\n\nඋඹේ Settings සයිට් එකෙන් හදාගනින් මචං!" 
            });
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') {
            db.ref('system_stats').update({ total: admin.database.ServerValue.increment(1) });
            console.log("𝐀𝐊𝐈𝐘𝐀 龍 Is Online!");
        }
    });
}

// Render එක නිදි යන්නේ නැති වෙන්න පින්ග් එකක්
setInterval(() => {
    require('http').get('http://akiya-api-rhlv.onrender.com');
}, 600000); 

app.listen(port, () => console.log(`Server running on port ${port}`));
startAkiyaBot();
