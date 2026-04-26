// core-dragon.js - AKIYA 龍 MD (World Best Final Stable Version)
const vault = require('./vault-connector.x'); 
const admin = require("firebase-admin");
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay } = require("@whiskeysockets/baileys");
const P = require("pino");

// 🛡️ Firebase Admin Setup (Using your uploaded JSON credentials)
const serviceAccount = {
  "project_id": "akiya-dragon-v2",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD2oHbgPQlk0zQm\nsFyitl4hnwEM1bDewY9UIyPP/w82ZiMOi8rNolxwiXKp69UXAVKWO0ucrTp6qPJA\nhxvl4wV4lNKZGlQbmf1cu176JhVtaga5jtaXF+cktfURRkzYB6q/HaD/MnMxzEmM\nW5PueUl4HdeOxawchQbGvDUw7n1YEdpvuZjzz4EDJzdk9mKkSWnogAN/Wnwbm/xB\nYOrYJdpk4+PYtcU3OccahaymO/aINX6B4SlR2BhinICO4G/gtuPmobD5qxIytcCE\n5mqpUy9a+yU8PPlJZoBYwyM5VfRvZKa/MvBozvqLa3j7KpwGCaE02hZHW36S0W31\nGZ135rwvAgMBAAECggEACktNWvPBQh+ctCa1XydMi4u3AAGlZc7ffCwRURu811Dx\nEqjcGLQ3tozOJ/CLju/DsjicYdhLMhZ+MhpRnElbD5rqpXBXZWWKkUXS448WYuBD\nkpg3NcxOHhaoOYXdLEE5q8uBTlWdQE1eHokuBgyy99wLBM8UbYZR75aog7fYrIXR\nRZPIZm+PZ3kZ+LbcyIDtVnN2aMCPtcLVaRAQXFllCQ11dM25oxItkjd/wBT4ZNPK\n5w3QPGTdPmDm1/ZVI7kGTy/NbZ2qgtIlnNtRi2QEVMo+S1Le9yjRnMh2JHyOhvU9\nGLrBqWZ1ZLzR3mAtNFO1f0gJUyEPCQcbCfyrv6WYbQKBgQD9+2Zpv10CrvmLuQQF\nzVemX9Zcq3fkNHEZpuHriJevzxiv4U80ZCP9QgkW+yx1c1moa03KZe6BlkmzszL5\n2ONhtEgSg3H//Dttz8lq/DUCrB/HRNzaSKIGRR9udGZKQEZP2mk8Cog3tVofTWHJ\nshnX2WEGeucnGgf1ZSQWGDUwdQKBgQD4lhqRZrSsLpqPqQ+noEV9Z12IrGUxocVI\nhsyKAsrR30IN5lnv+N0cHbuF8D7cNG0OxJNX+hTD7gwHmFPAPN+H+qgsG/+xKsPW\n/RYJM8eujKUUiwk/bVh0f7j07RytdUgqoZur1mFzsTjtMj+2iHISiortKC2Tl3gv\nyrXekI8lkwKBgQDIa45RfFTlPTZm78Ug3v1/qLj7v8OILWnimDJHLy6j6YTNpbpe\n2Xcc7vNFU0euFyx1HtfwE6e2UuYuDAb56hDklOMa2Oco3d33tbR33DXoufMJyGmP\nRym0UO+QtgHSLg5ODUhlvNnpPA62DNZR111VW5CZEHs/++az2vAzDz9J0QKBgGEr\nu8LulN1hckWJ3na17bPxfdx5Fy1pgQayuq2QHdwgG1/3lVx6uWPOM4lNuiS10ZOe\nP8J6HTfhi45EeyiAIxiyYJ6tayvD/b3CPKToOrv+emEnYDwM8DDJ5HDJZxZe7BDO\nD14CdSGWOxxtMf6WI5Ef2uKNfBNfeDmmUaVoeKxFAoGAJF0yhtsaZzZWlcINSx60\ne6E5GIGpbSXXYpZVqwICADcfVJKeXriqVa69kdNarRqm8zDh8KDjaWTeLOKlnwit\nYC+XnNgdmmPrYLtKa0aDV8e8WVB6RaS76J5vR+2vHqs9wKw/wFPbR+LdI9L7HKSJ\nKzEP6oPkxfNSD+3n8is0pVc=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@akiya-dragon-v2.iam.gserviceaccount.com"
};

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://akiya-dragon-v2-default-rtdb.firebaseio.com"
    });
}
const db = admin.database();

// 🤖 MAIN BOT START
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');

    const bot = makeWASocket({
        logger: P({ level: 'silent' }),
        auth: state,
        printQRInTerminal: false,
        browser: ["AKIYA-DRAGON-MD", "Chrome", "3.0.0"]
    });

    bot.ev.on('creds.update', saveCreds);

    // 🔥 WEB PAIRING LOGIC (For any user)
    db.ref('pairing_requests').on('child_added', async (snapshot) => {
        const request = snapshot.val();
        const phoneNumber = snapshot.key;

        if (request && request.status === "pending") {
            try {
                console.log(`🚀 Requesting code for: ${phoneNumber}`);
                // Wait for bot to be ready
                await delay(3000); 
                const code = await bot.requestPairingCode(phoneNumber);
                
                // Update Firebase so the website can show the code
                await db.ref(`pairing_requests/${phoneNumber}`).update({
                    pairingCode: code,
                    status: "waiting",
                    updatedAt: admin.database.ServerValue.TIMESTAMP
                });
                console.log(`✅ Code generated: ${code}`);
            } catch (err) {
                console.log("Pairing Error: ", err.message);
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
            const text = msg.message.conversation || (msg.message.extendedTextMessage ? msg.message.extendedTextMessage.text : '') || '';
            const prefix = "."; 

            if (text.startsWith(prefix)) {
                const command = text.slice(prefix.length).trim().split(/ +/).shift().toLowerCase();
                
                if (command === "menu") {
                    await bot.sendMessage(from, { text: "🐉 *AKIYA 龍 MD* Menu Online!" });
                }
                // Add other commands here...
            }
        } catch (err) { console.log(err); }
    });
}

startBot();
