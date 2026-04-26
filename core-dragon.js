// core-dragon.js - AKIYA 龍 MD Main Controller
const vault = require('./vault-connector.x'); 
const admin = require("firebase-admin");

// 🛡️ Get Firebase DB from vault
const db = vault.db; 

// 📈 Live Stats Update Function
async function updateSiteStats() {
    if (!db) return;
    try {
        const visitorsRef = db.ref('stats/visitors');
        const randomLive = Math.floor(Math.random() * (300 - 150 + 1)) + 150;
        await visitorsRef.set(randomLive);
    } catch (e) { console.log("Firebase Update Error: ", e); }
}

/**
 * ⚠️ වැදගත්: ඔයාගේ Bot එකේ ප්‍රධාන variable එක 'bot' නෙවෙයි නම් 
 * (උදාහරණයක් විදිහට 'conn' හෝ 'client' නම්), 
 * පල්ලෙහා තියෙන 'const bot = ...' පේළියට ඒ නම ලබා දෙන්න.
 */
const bot = global.conn || global.client; 

if (bot) {
    bot.on('message', async (msg) => {
        const from = msg.from;
        const senderName = msg.pushName || "User";
        let text = msg.body || "";
        let prefix = "."; 

        updateSiteStats();

        if (text.startsWith(prefix)) {
            const args = text.slice(prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase(); 

            switch (command) {
                case "menu":
                    const menuText = `👋 AYUBOWAN ${senderName}!\n\nUse .alive to check status.\nUse .balance to check coins.`;
                    await bot.sendMessage(from, { image: { url: './logo2.png' }, caption: menuText });
                    break;

                case "alive":
                    await bot.sendMessage(from, "AKIYA 龍 MD Is Online 🟢\nSpeed: 0.45ms\nStatus: Stable");
                    break;

                case "balance":
                    const coins = await vault.getUserCoins(from);
                    if (db) {
                        const cleanNumber = from.replace(/[^0-9]/g, ''); 
                        await db.ref('users/' + cleanNumber).update({
                            name: senderName,
                            coins: coins,
                            lastActive: admin.database.ServerValue.TIMESTAMP
                        });
                    }
                    await bot.sendMessage(from, `🪙 Your Balance: ${coins} Coins\n\n*Dashboard:* https://akiya-dragon-v2.vercel.app/`);
                    break;

                default:
                    break;
            }
        }
    });
} else {
    console.log("⚠️ Bot connection not found. Waiting for initialization...");
}
