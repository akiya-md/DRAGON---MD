const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

// 🛠️ Firebase Config එක පිළිවෙළට සකසමු
const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID || "akiya-dragon-v2",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Private Key එකේ තියෙන quotes සහ line breaks ප්‍රශ්න මෙතැනින් විසඳනවා
    privateKey: process.env.FIREBASE_PRIVATE_KEY 
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '') 
        : undefined,
};

// 🛡️ Firebase Initialization (Error එකක් ආවත් බොට් එක මැරෙන්නේ නැති වෙන්න හදලා තියෙන්නේ)
try {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(firebaseConfig),
            databaseURL: process.env.FIREBASE_DATABASE_URL || "https://akiya-dragon-v2-default-rtdb.asia-southeast1.firebasedatabase.app/"
        });
        console.log("✅ Firebase Initialized Successfully!");
    }
} catch (error) {
    console.error("❌ CRITICAL ERROR: Firebase Initialization Failed:", error.message);
}

// ⚠️ Database එක Initialize කරන්නේ App එක තිබුණොත් විතරයි (Screenshot 21:55:46 ලෙඩේට විසඳුම)
const db = admin.apps.length ? admin.database() : null;

// 🪙 කොයින් ප්‍රමාණය ලබාගැනීමේ Function එක
async function getUserCoins(userId) {
    if (!db) return 0; // DB නැත්නම් Error නොදී 0 ලබා දෙනවා
    const cleanId = userId.replace(/[^0-9]/g, '');
    try {
        const snapshot = await db.ref('users/' + cleanId + '/coins').once('value');
        return snapshot.val() || 0;
    } catch (e) {
        return 0;
    }
}

// ✨ අලුත් යූසර් කෙනෙක් බොට්ව කනෙක්ට් කළ විට (Original Logic No Damage)
async function welcomeNewUser(userNumber, userName) {
    if (!db) return "Welcome Chief! (Database Syncing In Progress...)";
    
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

            return `
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
📢 Official Channel: https://whatsapp.com/channel/0029VbCTA6DCBtxARMA46r3j

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━➤➤➤
𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐀𝐊𝐈𝐘𝐀 龍 ⚙️ - 𝙼𝙳 ◈| ⚜️🏷️`;
        } else {
            return "Welcome Back, Chief! බොට් සක්‍රියයි. .MENU TYPE කර වැඩ පටන් ගන්න.";
        }
    } catch (e) {
        return "Welcome Back, Chief! බොට් සක්‍රියයි.";
    }
}

// Export කිරීම
module.exports = { welcomeNewUser, getUserCoins, db };
