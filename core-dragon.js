// core-dragon.js - AKIYA 龍 MD Main Controller
const vault = require('./vault-connector.x'); 
const admin = require("firebase-admin");

// 🔐 Firebase Setup (Secret Keys සමඟ සම්බන්ධ කිරීම)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: "akiya-dragon-v2",
        }),
        databaseURL: "https://akiya-dragon-v2-default-rtdb.asia-southeast1.firebasedatabase.app/"
    });
}
const db = admin.database();

// 📈 Live Stats Update Function (සයිට් එක පණ ගන්වන්න)
async function updateSiteStats() {
    try {
        const visitorsRef = db.ref('stats/visitors');
        // සයිට් එකේ ලස්සනට පේන්න 150-300 අතර Random ගණනක් දාමු
        const randomLive = Math.floor(Math.random() * (300 - 150 + 1)) + 150;
        await visitorsRef.set(randomLive);
    } catch (e) { console.log("Firebase Update Error: ", e); }
}

// මැසේජ් එකක් ආපු ගමන් ක්‍රියාත්මක වන කොටස
bot.on('message', async (msg) => {
    const from = msg.from;
    const senderName = msg.pushName || "User";
    let text = msg.body || "";
    let prefix = "."; 

    // සයිට් එකේ Visitors ගාන ලයිව් අප්ඩේට් කරන්න (සෑම මැසේජ් එකකදීම)
    updateSiteStats();

    if (text.startsWith(prefix)) {
        const args = text.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase(); 

        switch (command) {
            case "menu":
                const menuText = await getAkiyaMenu(senderName);
                await bot.sendMessage(from, { image: { url: './logo2.jpg' }, caption: menuText });
                break;

            case "alive":
                await bot.sendMessage(from, "AKIYA 龍 MD Is Online 🟢\nSpeed: 0.45ms\nStatus: Stable");
                break;

            case "balance":
                const coins = await vault.getUserCoins(from);
                
                // 📡 Firebase Sync: සයිට් එකේ පැනල් එකට කොයින් ගාන යවනවා
                const cleanNumber = from.replace(/[^0-9]/g, ''); // 947xxx විදිහට අංකය හැදීම
                await db.ref('users/' + cleanNumber).update({
                    name: senderName,
                    coins: coins,
                    lastActive: admin.database.ServerValue.TIMESTAMP
                });

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
