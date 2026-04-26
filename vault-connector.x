const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

// 🛠️ Render එකේ Variables වලින් Firebase සම්බන්ධ කිරීම (Error එක එන්නේ නැති වෙන්න)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID || "akiya-dragon-v2",
            // මෙතනදී JSON එක නැතුව කෙලින්ම Variables වලින් වැඩේ කරනවා
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL || "https://akiya-dragon-v2-default-rtdb.asia-southeast1.firebasedatabase.app/"
    });
}

const db = admin.database();

// 🪙 කොයින් ප්‍රමාණය ලබාගැනීමේ පරණ Function එක (මෙකත් ඕනේ)
async function getUserCoins(userId) {
    const cleanId = userId.replace(/[^0-9]/g, '');
    const snapshot = await db.ref('users/' + cleanId + '/coins').once('value');
    return snapshot.val() || 0;
}

// ✨ අලුත් යූසර් කෙනෙක් බොට්ව කනෙක්ට් කළ විට (උඹේ පරණ ලොජික් එක)
async function welcomeNewUser(userNumber, userName) {
    const cleanNumber = userNumber.replace(/[^0-9]/g, '');
    const userRef = db.ref('users/' + cleanNumber);
    const snapshot = await userRef.once('value');

    if (!snapshot.exists()) {
        const secretKey = uuidv4().split('-')[0].toUpperCase(); // Unique Key
        
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
---------------------------------------
ආදරයෙන් පිළිගන්නවා 𝐀𝐊𝐈𝐘𝐀 龍 ⚙️ - 𝙼𝙳 ◈||| ⚜️🏷️ වෙත!

👋 සාදරයෙන් පිළිගන්නවා ${userName}!
📱 අංකය: ${cleanNumber}
🔑 Secret Key: ${secretKey}

⚙️ ප්‍රධාන විධාන:
---------------------------------------
📜 මෙනුව: .MENU
⚡ තත්ත්වය: .ALIVE

🌐 Web Panel: https://dragon-md.vercel.app/
📢 Channel: https://whatsapp.com/channel/0029VbCTA6DCBtxARMA46r3j

---------------------------------------
𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐀𝐊𝐈𝐘𝐀 龍 ⚙️ - 𝙼𝙳 ◈| ⚜️🏷️`;

        return welcomeMsg;
    } else {
        return "Welcome Back, Chief! බොට් සක්‍රියයි. .MENU TYPE කර වැඩ පටන් ගන්න.";
    }
}

// ඔක්කොම ටික Export කිරීම
module.exports = { welcomeNewUser, getUserCoins, db };
