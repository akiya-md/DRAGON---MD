// core-dragon.js - AKIYA 龍 MD (World Best Multi-User Logic)
const vault = require('./vault-connector.x'); 
const admin = require("firebase-admin");
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay } = require("@whiskeysockets/baileys");
const P = require("pino");

// 🛡️ Firebase Setup
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert({
            "project_id": "akiya-dragon-v2",
            "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDH3F0peNHemtz2\nubVN7imWJrHKr3Ca/RyGTnsUgyTfzbDfR/nB4sR6mgg4H1Z7cbLMwTpeHnoDWcES\nfm9lGTAkKn7EefgCvUBVcK5NMvuMiFD5UgTRzCS+CIQE0Exr1j1bm2gUvdcm7mrP\nQZWojZ3/q0sibyOPBNZRbh9lnYkNhxp1/RApzWS7OVZE09PotlUxsRemk3lL6rN1\nCkCxXfhmuK902ddqbb0BX+3xJU3AvkJ1jp9jwu0qTR5KOrUeIeZyYmC0JMVioXfD\nb1lENPsO4rx8EhuaMBOVlPh3KV7XtT9sg+EQyvT+e9AkIbFXoihsQfsBbjx1Fmye\nMcZRwiqRAgMBAAECggEACfcQqVekCbgRpEbpTYTea5VbdCxkFkNAbckqGYFKOHM/\nYluqriZYFveZCTDVUV9/e3Z3OkAFZAdAsWMO23TqfcQlaNcexMayR2xQUYq1KIo3\ntN24PixySMwghoOrCs2uZqPYmD+os5ELz/CQhWxlvEyqePGfDZOPetUNgVXd8nfT\nbQ82Hz4pOjWSiTyMJomqKEOA2fmtRyrKA1Agrl83Lj6Me8iYKYWbff7e3KHaqiP5\nPHmPPPk+8op/wp9cYwwxVNP8nq8MOcQuAQmCuxLF3+yrX4z2EO/A5A7ckDyJxAQd\nuk7h+993EPG3PmdqvhWM0oQNUbh/x0SEOy35eD1kIQKBgQDkA+H6Nql0QBWBP7u7\nmjwaZyHzqdH8wpsD+XipNF/rRi6XVrV2jNWOfX4mhgPnbi/I1w81VwEHyoY37mJH\n1jPwO/pp32ufCHLrMUa3U9hI1Z5NuMZNXR71LKlyGicq+s+Oe3p9sF/Q/Oc0Ka//\nlK5qFQY+TdZj2s8ud/CkeAUHoQKBgQDgY+K2sDzmGJcteqQbfgqJX+/FulQhHhlE\nY8kZHwm648vDD3Ea0qeAY9w6UV9+FxVfHmnQaXe3ZM4MrHDhoJZ8m6sw+3XgBRRb\nRDiac1ngASkbWsPzL2pB0iYj6bWWhs2DWhh4hhw+jovTNx9tg9f2rwbAR2964jkQ\nFAiMFNR88QKBgFvJrFhbVM+1VHLZQyt8JSHDzokWHbAQbvKkpIwIx2wgrnTBtP7q\nJrXbksLTRBMP6jCBUl/4jDOktW8iiXG9qt7UZjPkeqBkeE5xYbQ/DlwTkkxbS4it\nKd8sgXGrUYUdvhvvXRnnvEqW5EO9XFoYcjXGDONb1igQV0KvibHLlsrBAoGBALT1\nWLxj3Hjjk+eFZBsXxn+K8t7OqVIb59yTbHXp5frmAklIhrpO7+5GmjAdt5kEHKQc\n7tC4fWdU0CbAWjhbPYE4ORLDeAg1kHkZx1wncm+IABKjXCseLd7vDvsfWuYNyGcJ\nnXp1DQoWAwVPCvVSwjOaayNdeLXtAn/I6CuwELzBAoGAVkizUho+fAD8NanTH9QP\nuWSQ0vx2q9Srn9lLTzSDpLOfDuTGjimwFHU5Tz2OxKCuNnV8Jqu7wHaue5lPmVBy\nHfZt1ZiuCofZ9uIiY06qi/NjWNndh8o4vtkHPRz1R3GaH2WjzrEgJwIVEgpN22KB\nJKIpnhWPrFBgFOiQal9BC78=\n-----END PRIVATE KEY-----\n",
            "client_email": "firebase-adminsdk-fbsvc@akiya-dragon-v2.iam.gserviceaccount.com"
        }),
        databaseURL: "https://akiya-dragon-v2-default-rtdb.firebaseio.com"
    });
}
const db = admin.database();

// 📈 Live Visitors Update
async function updateSiteStats() {
    if (!db) return;
    try {
        const visitorsRef = db.ref('stats/visitors');
        const randomLive = Math.floor(Math.random() * (300 - 150 + 1)) + 150;
        await visitorsRef.set(randomLive);
    } catch (e) { console.log("Firebase Error: ", e); }
}

// 🤖 MAIN BOT START
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');

    const bot = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: ["AKIYA-DRAGON-MD", "Chrome", "3.0.0"]
    });

    bot.ev.on('creds.update', saveCreds);

    // 🔥 MULTI-USER PAIRING LISTENER
    // සයිට් එකෙන් එන ඉල්ලීම් Firebase හරහා මෙතනින් හසුරවනවා
    db.ref('pairing_requests').on('child_added', async (snapshot) => {
        const request = snapshot.val();
        const num = snapshot.key;

        if (request.status === "pending") {
            try {
                console.log(`🚀 Generating Pairing Code for: ${num}`);
                const code = await bot.requestPairingCode(num);
                
                // කෝඩ් එක Firebase එකට යවනවා සයිට් එකේ පෙන්වන්න
                await db.ref(`pairing_requests/${num}`).update({
                    pairingCode: code,
                    status: "waiting",
                    updatedAt: admin.database.ServerValue.TIMESTAMP
                });
            } catch (err) {
                console.log("Pairing Error:", err);
            }
        }
    });

    bot.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ AKIYA 龍 MD Master System Online!');
        }
    });

    bot.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const from = msg.key.remoteJid;
            const senderName = msg.pushName || "User";
            const text = msg.message.conversation || (msg.message.extendedTextMessage ? msg.message.extendedTextMessage.text : '') || '';
            const prefix = "."; 

            updateSiteStats();

            if (text.startsWith(prefix)) {
                const args = text.slice(prefix.length).trim().split(/ +/);
                const command = args.shift().toLowerCase(); 

                switch (command) {
                    case "menu":
                        await bot.sendMessage(from, { text: `👋 AYUBOWAN ${senderName}!\n\nUse .alive\nUse .balance` });
                        break;
                    case "alive":
                        await bot.sendMessage(from, { text: "AKIYA 龍 MD Is Online 🟢" });
                        break;
                    case "balance":
                        const coins = await vault.getUserCoins(from);
                        const cleanNumber = from.replace(/[^0-9]/g, ''); 
                        await db.ref('users/' + cleanNumber).update({
                            name: senderName,
                            coins: coins,
                            lastActive: admin.database.ServerValue.TIMESTAMP
                        });
                        await bot.sendMessage(from, { text: `🪙 Coins: ${coins}\nhttps://akiya-dragon-v2.vercel.app/` });
                        break;
                }
            }
        } catch (err) { console.log(err); }
    });
}

startBot();
