// core-dragon.js - AKIYA 龍 MD Main Controller
const vault = require('./vault-connector.x'); 
const admin = require("firebase-admin");

/**
 * 🔐 Firebase Setup
 * vault-connector.x එකේ දැනටමත් initialize වෙන නිසා 
 * මෙතැනදී කෙලින්ම vault එකේ තියෙන db එක පාවිච්චි කරමු.
 */
const db = vault.db; 

// 📈 Live Stats Update Function
async function updateSiteStats() {
    if (!db) return;
    try {
        const visitorsRef = db.ref('stats/visitors');
        const randomLive = Math.floor(Math.random() * (300 - 150 + 1)) + 150;
        await visitorsRef.set(randomLive);
    } catch (e) { 
        console.log("Firebase Update Error: ", e); 
    }
}

/**
 * 🛡️ IMPORTANT: 
 * ඔයාගේ main connection file එකේ WhatsApp client එක හඳුන්වලා තියෙන නම 
 * 'bot' නෙවෙයි නම්, පල්ලෙහා තියෙන 'bot' කියන වචනය ඒ නමට වෙනස් කරන්න.
 * (උදා: const bot = conn; හෝ const bot = client;)
 */

const startAkiyaDragon = (bot) => {

    bot.on('message', async (msg) => {
        const from = msg.from;
        const senderName = msg.pushName || "User";
        let text = msg.body || "";
        let prefix = "."; 

        // සයිට් එකේ Visitors ගාන ලයිව් අප්ඩේට් කරන්න
        updateSiteStats();

        if (text.startsWith(prefix)) {
            const args = text.slice(prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase(); 

            switch (command) {
                case "menu":
                    // මෙතන getAkiyaMenu function එක ඔයාගේ වෙනත් file එකක තියෙන්න ඕනේ
                    const menuText = `👋 AYUBOWAN ${senderName}!\n\nUse .alive to check status.\nUse .balance to check coins.`;
                    await bot.sendMessage(from, { image: { url: './logo2.png' }, caption: menuText });
                    break;

                case "alive":
                    await bot.sendMessage(from, "AKIYA 龍 MD Is Online 🟢\nSpeed: 0.45ms\nStatus: Stable");
                    break;

                case "balance":
                    const coins = await vault.getUserCoins(from);
                    
                    // 📡 Firebase Sync
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

                case "buycoin":
                    const adminMsg = `Contact Master AKIYA to buy coins:\n📱 WhatsApp: 0755751816\n\nPrice: 1000 Coins = Rs. 500`;
                    await bot.sendMessage(from, adminMsg);
                    break;

                case "search":
                    if (!args[0]) return msg.reply("කරුණාකර සෙවිය යුතු දේ ඇතුළත් කරන්න.");
                    await bot.sendMessage(from, "🔍 Searching Global Engines...");
                    break;

                default:
                    console.log(`Unknown Command: ${command}`);
                    break;
            }
        }
    });
};

// මෙය ප්‍රධාන index.js එකේදී call කරන්න (උදා: startAkiyaDragon(conn))
module.exports = { startAkiyaDragon };
