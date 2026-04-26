const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

// 🛠️ Firebase සම්බන්ධතාවය (Render Environment Variables මගින්)
const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID || "akiya-dragon-v2",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Private Key එකේ තියෙන අමතර quotes සහ \n ප්‍රශ්න විසඳීම
    privateKey: process.env.FIREBASE_PRIVATE_KEY 
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '') 
        : undefined,
};

// 🛡️ App එක දැනටමත් පණ ගන්වලා නැත්නම් විතරක් Initialize කරනවා (Screenshot 21:55:46 ලෙඩේට විසඳුම)
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(firebaseConfig),
            databaseURL: process.env.FIREBASE_DATABASE_URL || "https://akiya-dragon-v2-default-rtdb.asia-southeast1.firebasedatabase.app/"
        });
        console.log("✅ Firebase Initialized Successfully!");
    } catch (e) {
        console.log("❌ Firebase Connection Failed: " + e.message);
    }
}

const db = admin.database();

// 🪙 කොයින් ප්‍රමාණය ලබාගැනීමේ Function එක
async function getUserCoins(userId) {
    const cleanId = userId.replace(/[^0-9]/g, '');
    try {
        const snapshot = await db.ref('users/' + cleanId + '/coins').once('value');
        return snapshot.val() || 0;
    } catch (e) {
        return 0;
    }
}

// ✨ අලුත් යූසර් කෙනෙක් බොට්ව කනෙක්ට් කළ විට
async function welcomeNewUser(userNumber, userName) {
    const cleanNumber = userNumber.replace(/[^0-9]/g, '');
    const userRef = db.ref('users/' + cleanNumber);

    try {
        const snapshot = await userRef.once('value');

        if (!snapshot.exists()) {
            const secretKey = uuidv4().split('-')[0].toUpperCase(); 
            
            await userRef.set({
                name: userName,
                number: cleanNumber,
                password: secretKey,
                coins: 500,
                joinedDate: new Date().toISOString(),
                status: "Active"
            });

            const welcomeMsg = `
📸 [logo2.jpg]
🙏 ආයුබෝවන් | வணக்கம் | AYUBOWAN!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━➤➤➤
ආදරයෙන් පිළිගන්නවා 𝐀𝐊𝐈𝐘𝐀 龍 ⚙️ - 𝙼𝙳 ◈||| ⚜️🏷️ වෙත!

👋 සාදරයෙන් පිළිගන්නවා ${userName}!
📱 අංකය: ${cleanNumber}
🔑 Secret Key: ${secretKey}

⚙️ ප්‍රධාන විධාන:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━➤➤➤
📜 මෙනුව: .MENU
⚡ තත්ත්වය: .ALIVE

🌐 Web Panel: https://dragon-md.vercel.app/
📢 Channel: https://whatsapp.com/channel/0029VbCTA6DCBtxARMA46r3j

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━➤➤➤
𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐀𝐊𝐈𝐘𝐀 龍 ⚙️ - 𝙼𝙳 ◈| ⚜️🏷️`;

            return welcomeMsg;
        } else {
            return "Welcome Back, Chief! බොට් සක්‍රියයි. .MENU TYPE කර වැඩ පටන් ගන්න.";
        }
    } catch (e) {
        return "Welcome Back! (Database Syncing...)";
    }
}

// Export කිරීම
module.exports = { welcomeNewUser, getUserCoins, db };
