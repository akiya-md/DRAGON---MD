const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

/**
 * 🛠️ Firebase Config පිරිසිදු කිරීම
 * Render එකේ Environment Variables වලින් එන Private Key එකේ 
 * තිබිය හැකි දෝෂ (Quotes, Spaces, New Lines) මෙතැනින් නිවැරදි කරයි.
 */
let pKey = process.env.FIREBASE_PRIVATE_KEY;
if (pKey) {
    // String එකක් බව තහවුරු කර, Quotes අයින් කර, \n ටික නියමිත පේළි බවට පත් කරයි
    pKey = pKey.replace(/"/g, '').replace(/\\n/g, '\n').trim();
}

const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID || "akiya-dragon-v2",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: pKey,
};

// 🛡️ Firebase Initialization
try {
    if (!admin.apps.length) {
        if (firebaseConfig.privateKey && firebaseConfig.clientEmail) {
            admin.initializeApp({
                credential: admin.credential.cert(firebaseConfig),
                databaseURL: process.env.FIREBASE_DATABASE_URL || "https://akiya-dragon-v2-default-rtdb.asia-southeast1.firebasedatabase.app/"
            });
            console.log("✅ Firebase Initialized Successfully!");
        } else {
            console.error("❌ CRITICAL: Firebase Credentials missing in Environment Variables!");
        }
    }
} catch (error) {
    console.error("❌ CRITICAL ERROR: Firebase Initialization Failed:", error.message);
}

// ⚠️ Database එක Initialize කරන්නේ App එක තිබුණොත් විතරයි
const db = admin.apps.length ? admin.database() : null;

// 🪙 කොයින් ප්‍රමාණය ලබාගැනීමේ Function එක
async function getUserCoins(userId) {
    if (!db) return 0; 
    const cleanId = userId.replace(/[^0-9]/g, '');
    try {
        const snapshot = await db.ref('users/' + cleanId + '/coins').once('value');
        return snapshot.val() || 0;
    } catch (e) {
        return 0;
    }
}

// ✨ අලුත් යූසර් කෙනෙක් බොට්ව කනෙක්ට් කළ විට (Original Logic Undamaged)
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
