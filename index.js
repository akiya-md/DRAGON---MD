const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const pino = require("pino");

async function startAkiyaBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    
    const bot = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: "silent" })
    });

    bot.ev.on("creds.update", saveCreds);

    // 1. 📞 CALL BLOCK LOGIC
    bot.ev.on("call", async (call) => {
        let callBlockStatus = true; // මේක Database එකෙන් ගන්න ඕනේ
        if (callBlockStatus) {
            await bot.rejectCall(call[0].id, call[0].from);
            await bot.sendMessage(call[0].from, { 
                text: "⚠️ *𝐀𝐊𝐈𝐘𝐀 龍 𝐌𝐃: CALLS NOT ALLOWED!*\n\nPlease message me instead. Calls are automatically blocked." 
            });
        }
    });

    // 2. 📝 COMMAND HANDLER
    bot.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const isCmd = body.startsWith(".");
        const command = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : "";

        // Welcome Message (Branding)
        const footer = "\n\n*𝖯𝗈𝗐𝖾𝗋𝖽 𝖡𝗒 𝐀𝐊𝐈𝐘𝐀 龍 ⚙️ - 𝙼𝙳*";

        // COMMANDS
        switch (command) {
            case "menu":
                let menuText = `⛩️ *𝐀𝐊𝐈𝐘𝐀 龍 𝐌𝐃 - 𝐌𝐄𝐍𝐔* ⛩️\n\n` +
                               `• .ai (Ask Anything)\n` +
                               `• .vsearch (Voice Search)\n` +
                               `• .callblock on/off\n` +
                               `• .phub [link] (18+)\n` +
                               `• .myinfo (Check Coins)` + footer;
                await bot.sendMessage(from, { text: menuText });
                break;

            case "ai":
                const query = body.slice(4);
                // AI Logic here (API call to Gemini/GPT)
                await bot.sendMessage(from, { text: "🤖 Processing your request..." + footer });
                break;

            case "callblock":
                const status = body.slice(11);
                // Save to Database logic
                await bot.sendMessage(from, { text: `✅ Call Block turned ${status}` + footer });
                break;

            case "phub":
            case "xham":
                // 18+ Downloader Logic
                await bot.sendMessage(from, { text: "🔞 *Adult Downloader:* Fetching content safely..." + footer });
                break;
        }

        // 3. 🤖 AUTO-REPLY SYSTEM (From Web Panel)
        // මේකේදී Database එක චෙක් කරලා මැසේජ් 20 අතරේ තියෙනවද බලනවා
    });

    // 4. 🚀 CHANNEL BOOSTER (On Connection)
    bot.ev.on("connection.update", (update) => {
        const { connection } = update;
        if (connection === "open") {
            console.log("𝐀𝐊𝐈𝐘𝐀 龍 𝐌𝐃: Successfully Connected!");
            // Auto Follow Channel Logic here
        }
    });
}

startAkiyaBot();
