const admin = require("firebase-admin");
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay } = require("@whiskeysockets/baileys");
const P = require("pino");
const express = require('express');
const path = require('path');

// 🛡️ Express Server - මෙතන තමයි මැජික් එක තියෙන්නේ
const app = express();
const port = process.env.PORT || 3000;

// සාමාන්‍ය කෙනෙක් ආවම පේන පණිවිඩය
app.get('/', (req, res) => {
    res.send('<h1>Dragon Bot is Running!</h1><p>Public Access Denied.</p>');
});

// 🐉 රහස් ඇඩ්මින් පැනල් එක (මෙන්න මේ ලින්ක් එකෙන් විතරයි යන්න පුළුවන්)
app.get('/dragon-master-panel', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>AKIYA 龍 MD | MASTER PANEL</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
            <style>
                body { background: #050505; color: red; font-family: sans-serif; text-align: center; }
                .glow { text-shadow: 0 0 20px red; font-size: 30px; margin-top: 20px; }
                #globe { height: 400px; width: 100%; }
                .card { border: 1px solid red; padding: 20px; margin: 20px; border-radius: 15px; background: rgba(20,0,0,0.5); }
            </style>
        </head>
        <body>
            <div class="glow">AKIYA 龍 MD MASTER SYSTEM</div>
            <div id="globe"></div>
            <div class="card">
                <h3>🚀 LIVE SYSTEM MONITOR</h3>
                <p>Firebase Status: Connected ✅</p>
                <p>Bot Status: Online 🐉</p>
                <button onclick="alert('System Boost Activated!')" style="background:red; color:white; padding:10px; border:none; cursor:pointer;">ACTIVATE BOOST</button>
            </div>
            <script>
                const scene = new THREE.Scene();
                const camera = new THREE.PerspectiveCamera(75, window.innerWidth/400, 0.1, 1000);
                const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
                renderer.setSize(window.innerWidth, 400);
                document.getElementById('globe').appendChild(renderer.domElement);
                const globe = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 32), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }));
                scene.add(globe); camera.position.z = 10;
                function anim() { requestAnimationFrame(anim); globe.rotation.y += 0.005; renderer.render(scene, camera); }
                anim();
            </script>
        </body>
        </html>
    `);
});

app.listen(port, () => console.log(`✅ Server Active on: ${port}`));

// 🛡️ Firebase Credentials (ඔයා දීපු ටික එහෙම්ම තියෙනවා)
const serviceAccount = {
  "project_id": "akiya-dragon-v2",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD2oHbgPQlk0zQm\nsFyitl4hnwEM1bDewY9UIyPP/w82ZiMOi8rNolxwiXKp69UXAVKWO0ucrTp6qPJA\nhxvl4wV4lNKZGlQbmf1cu176JhVtaga5jtaXF+cktfURRkzYB6q/HaD/MnMxzEmM\nW5PueUl4HdeOxawchQbGvDUw7n1YEdpvuZjzz4EDJzdk9mKkSWnogAN/Wnwbm/xB\nYOrYJdpk4+PYtcU3OccahaymO/aINX6B4SlR2BhinICO4G/gtuPmobD5qxIytcCE\n5mqpUy9a+yU8PPlJZoBYwyM5VfRvZKa/MvBozvqLa3j7KpwGCaE02hZHW36S0W31\nGZ135rwvAgMBAAECggEACktNWvPBQh+ctCa1XydMi4u3AAGlZc7ffCwRURu811Dx\nEqjcGLQ3tozOJ/CLju/DsjicYdhLMhZ+MhpRnElbD5rqpXBXZWWKkUXS448WYuBD\nkpg3NcxOHhaoOYXdLEE5q8uBTlWdQE1eHokuBgyy99wLBM8UbYZR75aog7fYrIXR\nRZPIZm+PZ3kZ+LbcyIDtVnN2aMCPtcLVaRAQXFllCQ11dM25oxItkjd/wBT4ZNPK\n5w3QPGTdPmDm1/ZVI7kGTy/NbZ2qgtIlnNtRi2QEVMo+S1Le9yjRnMh2JHyOhvU9\nGLrBqWZ1ZLzR3mAtNFO1f0gJUyEPCQcbCfyrv6WYbQKBgQD9+2Zpv10CrvmLuQQF\nzVemX9Zcq3fkNHEZpuHriJevzxiv4U80ZCP9QgkW+yx1c1moa03KZe6BlkmzszL5\n2ONhtEgSg3H//Dttz8lq/DUCrB/HRNzaSKIGRR9udGZKQEZP2mk8Cog3tVofTWHJ\nshnX2WEGeucnGgf1ZSQWGDUwdQKBgQD4lhqRZrSsLpqPqQ+noEV9Z12IrGUxocVI\nhsyKAsrR30IN5lnv+N0cHbuF8D7cNG0OxJNX+hTD7gwHmFPAPN+H+qgsG/+xKsPW\n/RYJM8eujKUUiwk/bVh0f7j07RytdUgqoZur1mFzsTjtMj+2iHISiortKC2Tl3gv\nyrXekI8lkwKBgQDIa45RfFTlPTZm78Ug3v1/qLj7v8OILWnimDJHLy6j6YTNpbpe\n2Xcc7vNFU0euFyx1HtfwE6e2UuYuDAb56hDklOMa2Oco3d33tbR33DXoufMJyGmP\nRym0UO+QtgHSLg5ODUhlvNnpPA62DNZR111VW5CZEHs/++az2vAzDz9J0QKBgGEr\nu8LulN1hckWJ3na17bPxfdx5Fy1pgQayuq2QHdwgG1/3lVx6uWPOM4lNuiS10ZOe\nP8J6HTfhi45EeyiAIxiyYJ6tayvD/b3CPKToOrv+emEnYDwM8DDJ5HDJZxZe7BDO\nD14CdSGWOxxtMf6WI5Ef2uKNfBNfeDmmUaVoeKxFAoGAJF0yhtsaZzZWlcINSx60\ne6E5GIGpbSXXYpZVqwICADcfVJKeXriqVa69kdNarRqm8zDh8KDjaWTeLOKlnwit\nYC+XnNgdmmPrYLtKa0aDV8e8WVB6RaS76J5vR+2vHqs9wKw/wFPbR+LdI9L7HKSJ\nKzEP6oPkxfNSD+3n8is0pVc=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@akiya-dragon-v2.iam.gserviceaccount.com"
};

// 🛡️ Firebase Initialization (ඔයාගේ ඉතිරි කෝඩ් එක එහෙම්ම පල්ලෙහාට තියෙනවා...)
const initFirebase = () => {
    try {
        if (admin.apps.length === 0) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: "https://akiya-dragon-v2-default-rtdb.asia-southeast1.firebasedatabase.app"
            });
            console.log("✅ Firebase Connected Successfully!");
        }
    } catch (error) {
        console.error("❌ Firebase Init Error:", error.message);
    }
};

// ... (ඉතිරි startBot function එක එහෙම්ම තියන්න)
async function startBot() {
    initFirebase();
    // ... ඉතිරි ටික ඔයා දීපු විදිහටම තියෙනවා
}
startBot();
