// core-dragon.js - AKIYA 龍 MD Main Controller
const vault = require('./vault-connector.x'); // අපේ ඩේටාබේස් පාලම සම්බන්ධ කිරීම

// මැසේජ් එකක් ආපු ගමන් ක්‍රියාත්මක වන කොටස
bot.on('message', async (msg) => {
    const from = msg.from;
    const senderName = msg.pushName || "User";
    let text = msg.body || "";
    let prefix = "."; 

    // මැසේජ් එක පටන් ගන්නේ තිතකින් (prefix) නම් පමණක් පරීක්ෂා කරයි
    if (text.startsWith(prefix)) {
        
        // අකුරු වල කැපිටල්/සිම්පල් වෙනස අයින් කර සරලව හඳුනාගැනීම
        const args = text.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase(); 

        switch (command) {
            
            // 📜 මෙනු පද්ධතිය
            case "menu":
                const menuText = await getAkiyaMenu(senderName);
                await bot.sendMessage(from, { image: { url: './logo2.jpg' }, caption: menuText });
                break;

            // ⚡ බොට් සජීවී බව බැලීම
            case "alive":
                await bot.sendMessage(from, "AKIYA 龍 MD Is Online 🟢\nSpeed: 0.45ms\nStatus: Stable");
                break;

            // 🪙 කොයින් ප්‍රමාණය බැලීම
            case "balance":
                const coins = await vault.getUserCoins(from);
                await bot.sendMessage(from, `🪙 Your Balance: ${coins} Coins`);
                break;

            // 💰 කොයින් මිලදී ගැනීම
            case "buycoin":
                const adminMsg = `Contact Master AKIYA to buy coins:\n📱 WhatsApp: 0755751816\n\nPrice: 1000 Coins = Rs. 500`;
                await bot.sendMessage(from, adminMsg);
                break;

            // 🔍 සර්ච් එන්ජිම (Omni-Search)
            case "search":
                if (!args[0]) return msg.reply("කරුණාකර සෙවිය යුතු දේ ඇතුළත් කරන්න. (Ex: .search Cyber Security)");
                await bot.sendMessage(from, "🔍 Searching Global Engines...");
                // සර්ච් එන්ජින් ලොජික් එක මෙතනට ඇඩ් වේ
                break;

            default:
                // හඳුනාගත නොහැකි විධානයක් නම්
                console.log(`Unknown Command: ${command}`);
                break;
        }
    }
});
