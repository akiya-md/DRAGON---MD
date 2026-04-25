const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

// උඹේ Firebase විස්තර සම්බන්ධ කිරීම
const serviceAccount = require("./akiya-md-firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://akiya-md-default-rtdb.firebaseio.com"
});

const db = admin.database();

// අලුත් යූසර් කෙනෙක් බොට්ව කනෙක්ට් කළ විට
async function welcomeNewUser(userNumber, userName) {
    const userRef = db.ref('users/' + userNumber);
    const snapshot = await userRef.once('value');

    if (!snapshot.exists()) {
        // අලුත් යූසර් කෙනෙක් නම්: රහස් මුරපදයක් සහ කොයින් 500ක් ලබාදීම
        const secretKey = uuidv4().split('-')[0].toUpperCase(); // Unique Key
        
        await userRef.set({
            name: userName,
            number: userNumber,
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
📱 අංකය: ${userNumber}
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
