const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

/**
 * 🛠️ Firebase Direct Configuration
 * Render Environment Variables වල දත්ත කියවීමේ දෝෂ මග හැරීමට 
 * දත්ත කෙලින්ම කෝඩ් එකට ඇතුළත් කර ඇත.
 */
const serviceAccount = {
  "type": "service_account",
  "project_id": "akiya-dragon-v2",
  "private_key_id": "22e4865af193a351cbd4706844d7c59d75354d53",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDH3F0peNHemtz2\nubVN7imWJrHKr3Ca/RyGTnsUgyTfzbDfR/nB4sR6mgg4H1Z7cbLMwTpeHnoDWcES\nfm9lGTAkKn7EefgCvUBVcK5NMvuMiFD5UgTRzCS+CIQE0Exr1j1bm2gUvdcm7mrP\nQZWojZ3/q0sibyOPBNZRbh9lnYkNhxp1/RApzWS7OVZE09PotlUxsRemk3lL6rN1\nCkCxXfhmuK902ddqbb0BX+3xJU3AvkJ1jp9jwu0qTR5KOrUeIeZyYmC0JMVioXfD\nb1lENPsO4rx8EhuaMBOVlPh3KV7XtT9sg+EQyvT+e9AkIbFXoihsQfsBbjx1Fmye\nMcZRwiqRAgMBAAECggEACfcQqVekCbgRpEbpTYTea5VbdCxkFkNAbckqGYFKOHM/\nYluqriZYFveZCTDVUV9/e3Z3OkAFZAdAsWMO23TqfcQlaNcexMayR2xQUYq1KIo3\ntN24PixySMwghoOrCs2uZqPYmD+os5ELz/CQhWxlvEyqePGfDZOPetUNgVXd8nfT\nbQ82Hz4pOjWSiTyMJomqKEOA2fmtRyrKA1Agrl83Lj6Me8iYKYWbff7e3KHaqiP5\nPHmPPPk+8op/wp9cYwwxVNP8nq8MOcQuAQmCuxLF3+yrX4z2EO/A5A7ckDyJxAQd\nuk7h+993EPG3PmdqvhWM0oQNUbh/x0SEOy35eD1kIQKBgQDkA+H6Nql0QBWBP7u7\nmjwaZyHzqdH8wpsD+XipNF/rRi6XVrV2jNWOfX4mhgPnbi/I1w81VwEHyoY37mJH\n1jPwO/pp32ufCHLrMUa3U9hI1Z5NuMZNXR71LKlyGicq+s+Oe3p9sF/Q/Oc0Ka//\nlK5qFQY+TdZj2s8ud/CkeAUHoQKBgQDgY+K2sDzmGJcteqQbfgqJX+/FulQhHhlE\nY8kZHwm648vDD3Ea0qeAY9w6UV9+FxVfHmnQaXe3ZM4MrHDhoJZ8m6sw+3XgBRRb\nRDiac1ngASkbWsPzL2pB0iYj6bWWhs2DWhh4hhw+jovTNx9tg9f2rwbAR2964jkQ\nFAiMFNR88QKBgFvJrFhbVM+1VHLZQyt8JSHDzokWHbAQbvKkpIwIx2wgrnTBtP7q\nJrXbksLTRBMP6jCBUl/4jDOktW8iiXG9qt7UZjPkeqBkeE5xYbQ/DlwTkkxbS4it\nKd8sgXGrUYUdvhvvXRnnvEqW5EO9XFoYcjXGDONb1igQV0KvibHLlsrBAoGBALT1\nWLxj3Hjjk+eFZBsXxn+K8t7OqVIb59yTbHXp5frmAklIhrpO7+5GmjAdt5kEHKQc\n7tC4fWdU0CbAWjhbPYE4ORLDeAg1kHkZx1wncm+IABKjXCseLd7vDvsfWuYNyGcJ\nnXp1DQoWAwVPCvVSwjOaayNdeLXtAn/I6CuwELzBAoGAVkizUho+fAD8NanTH9QP\nuWSQ0vx2q9Srn9lLTzSDpLOfDuTGjimwFHU5Tz2OxKCuNnV8Jqu7wHaue5lPmVBy\nHfZt1ZiuCofZ9uIiY06qi/NjWNndh8o4vtkHPRz1R3GaH2WjzrEgJwIVEgpN22KB\nJKIpnhWPrFBgFOiQal9BC78=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@akiya-dragon-v2.iam.gserviceaccount.com"
};

// 🛡️ Firebase Initialization
try {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://akiya-dragon-v2-default-rtdb.asia-southeast1.firebasedatabase.app/"
        });
        console.log("✅ Firebase Connected Successfully via Direct Hardcoded Config!");
    }
} catch (error) {
    console.error("❌ Firebase Initialization Failed:", error.message);
}

const db = admin.apps.length ? admin.database() : null;

// 🪙 getUserCoins Function
async function getUserCoins(userId) {
    if (!db) return 0; 
    const cleanId = userId.replace(/[^0-9]/g, '');
    try {
        const snapshot = await db.ref('users/' + cleanId + '/coins').once('value');
        return snapshot.val() || 0;
    } catch (e) { return 0; }
}

// ✨ welcomeNewUser Function (Original Message Logic)
async function welcomeNewUser(userNumber, userName) {
    if (!db) return "Welcome Chief! (Database Syncing In Progress...)";
    const cleanNumber = userNumber.replace(/[^0-9]/g, '');
    const userRef = db.ref('users/' + cleanNumber);
    try {
        const snapshot = await userRef.once('value');
        if (!snapshot.exists()) {
            const secretKey = uuidv4().split('-')[0].toUpperCase(); 
            await userRef.set({
                name: userName, number: cleanNumber, password: secretKey,
                coins: 500, joinedDate: new Date().toISOString(), status: "Active"
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
    } catch (e) { return "Welcome Back, Chief! බොට් සක්‍රියයි."; }
}

module.exports = { welcomeNewUser, getUserCoins, db };
