// core-dragon.js - AKIYA 龍 MD Main Controller
const vault = require('./vault-connector.x'); 
const admin = require("firebase-admin");
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const P = require("pino");

// 🛡️ Firebase Admin Initialization (Direct Config)
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert({
            "project_id": "akiya-dragon-v2",
            "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDH3F0peNHemtz2\nubVN7imWJrHKr3Ca/RyGTnsUgyTfzbDfR/nB4sR6mgg4H1Z7cbLMwTpeHnoDWcES\nfm9lGTAkKn7EefgCvUBVcK5NMvuMiFD5UgTRzCS+CIQE0Exr1j1bm2gUvdcm7mrP\nQZWojZ3/q0sibyOPBNZRbh9lnYkNhxp1/RApzWS7OVZE09PotlUxsRemk3lL6rN1\nCkCxXfhmuK902ddqbb0BX+3xJU3AvkJ1jp9jwu0qTR5KOrUeIeZyYmC0JMVioXfD\nb1lENPsO4rx8EhuaMBOVlPh3KV7XtT9sg+EQyvT+e9AkIbFXoihsQfsBbjx1Fmye\nMcZRwiqRAgMBAAECggEACfcQqVekCbgRpEbpTYTea5VbdCxkFkNAbckqGYFKOHM/\nYluqriZYFveZCTDVUV9/e3Z3OkAFZAdAsWMO23TqfcQlaNcexMayR2xQUYq1KIo3\ntN24PixySMwghoOrCs2uZqPYmD+os5ELz/CQhWxlvEyqePGfDZOPetUNgVXd8nfT\nbQ82Hz4pOjWSiTyMJomqKEOA2fmtRyrKA1Agrl83Lj6Me8iYKYWbff7e3KHaqiP5\ PHmPPPk+8op/wp9cYwwxVNP8nq8MOcQuAQmCuxLF3+yrX4z2EO/A5A7ckDyJxAQd\nuk7h+993EPG3PmdqvhWM0oQNUbh/x0SEOy35eD1kIQKBgQDkA+H6Nql0QBWBP7u7\nmjwaZyHzqdH8wpsD+XipNF/rRi6XVrV2jNWOfX4mhgPnbi/I1w81VwEHyoY37mJH\n1jPwO/pp32ufCHLrMUa3U9hI1Z5NuMZNXR71LKlyGicq+s+Oe3p9sF/Q/Oc0Ka//\nlK5qFQY+TdZj2s8ud/CkeAUHoQKBgQDgY+K2sDzmGJcteqQbfgqJX+/FulQhHhlE\nY8kZHwm648vDD3Ea0qeAY9w6UV9+FxVfHmnQaXe3ZM4MrHDhoJZ8m6sw+3XgBRRb\nRDiac1ngASkbWsPzL2pB0iYj6bWWhs2DWhh4hhw+jovTNx9tg9f2rwbAR2964jkQ\nFAiMFNR88QKBgFvJrFhbVM+1VHLZQyt8JSHDzokWHbAQbvKkpIwIx2wgrnTBtP7q\nJrXbksLTRBMP6jCBUl/4jDOktW8iiXG9qt7UZjPkeqBkeE5xYbQ/DlwTkkxbS4it\ Kd8sgXGrUYUdvhvvXRnnvEqW5EO9XFoYcjXGDONb1igQV0KvibHLlsrBAoGBALT1\nWLxj3Hjjk+eFZBsXxn+K8t7OqVIb59yTbHXp5frmAklIhrpO7+5GmjAdt5kEHKQc\n7tC4fWdU0CbAWjhbPYE4ORLDeAg1kHkZx1wncm+IABKjXCseLd7vDvsfWuYNyGcJ\nnXp1DQoWAwVPCvVSwjOaayNdeLXtAn/I6CuwELzBAoGAVkizUho+fAD8NanTH9QP\nuWSQ0vx2q9Srn9lLTzSDpLOfDuTGjimwFHU5Tz2OxKCuNnV8Jqu7wHaue5lPmVBy\nHfZt1ZiuCofZ9uIiY06qi/NjWNndh8o4vtkHPRz1R3GaH2WjzrEgJwIVEgpN22KB\nJKIpnhWPrFBgFOiQal9BC78=\n-----END PRIVATE KEY-----\n",
            "client_email": "firebase-adminsdk-fbsvc@akiya-dragon-v2.iam.gserviceaccount.com"
        }),
        databaseURL: "https://akiya-dragon-v2-default-rtdb.firebaseio.com"
    });
}
const db = admin.database();

// 📈 Live Visitors Update Function
async function updateSiteStats() {
    if (!db) return;
    try {
        const visitorsRef = db.ref('stats/visitors');
        const randomLive = Math.floor(Math.random() * (300 - 150 + 1)) + 150;
        await visitorsRef.set(randomLive);
    } catch (e) { console.log("Firebase Error: ", e); }
}

// 🤖 Bot Initialization Logic
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');

    const bot = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state
    });

    bot.ev.on('creds.update', saveCreds);

    bot.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('🔄 Connection closed, reconnecting...', shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ AKIYA 龍 MD Connected Successfully!');
        }
    });

    // 📩 Message Handling
    bot.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const from = msg.key.remoteJid;
            const senderName = msg.pushName || "User";
            const text = msg.message.conversation || 
                         (msg.message.extendedTextMessage ? msg.message.extendedTextMessage.text : '') || '';
            const prefix = "."; 

            updateSiteStats();

            if (text.startsWith(prefix)) {
                const args = text.slice(prefix.length).trim().split(/ +/);
                const command = args.shift().toLowerCase(); 

                switch (command) {
                    case "menu":
                        const menuText = `👋 AYUBOWAN ${senderName}!\n\nUse .alive to check status.\nUse .balance to check coins.`;
                        await bot.sendMessage(from, { text: menuText });
                        break;

                    case "alive":
                        await bot.sendMessage(from, { text: "AKIYA 龍 MD Is Online 🟢\nStatus: Stable" });
                        break;

                    case "balance":
                        const coins = await vault.getUserCoins(from);
                        const cleanNumber = from.replace(/[^0-9]/g, ''); 
                        await db.ref('users/' + cleanNumber).update({
                            name: senderName,
                            coins: coins,
                            lastActive: admin.database.ServerValue.TIMESTAMP
                        });
                        await bot.sendMessage(from, { text: `🪙 Your Balance: ${coins} Coins\n\n*Dashboard:* https://akiya-dragon-v2.vercel.app/` });
                        break;
                }
            }
        } catch (err) { console.log("Handler Error: ", err); }
    });
}

// Start the whole system
startBot();
