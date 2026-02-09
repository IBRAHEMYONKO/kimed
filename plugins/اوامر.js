import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
    name: "اوامر",
    category: "النظام",
    async execute(sock, m, args, rights, isAdmin, isOwner, stats) {
        const from = m.key.remoteJid;
        const pushName = m.pushName || "User";
        const botName = "𝟓𝟏-𝟒𝟗 𝐔𝐍𝐈𝐕𝐄𝐑𝐒𝐄"; 
        const ownerName = "𝐊𝐢𝐦 𝐃𝐨𝐤𝐣𝐚";
        const imagePath = './bot_img.jpg'; 

        // حساب وقت التشغيل
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const uptimeString = `${hours}h ${minutes}m`;

        // جلب الأوامر وترتيبها حسب الأقسام
        const files = fs.readdirSync(__dirname).filter(file => file.endsWith('.js'));
        let categories = {};
        for (const file of files) {
            try {
                const plugin = await import(`./${file}?update=${Date.now()}`);
                const cmd = plugin.default;
                if (cmd.name && cmd.category) {
                    if (!categories[cmd.category]) categories[cmd.category] = [];
                    categories[cmd.category].push(cmd.name);
                }
            } catch (e) {}
        }

        // --- الهيكل الجمالي الأسطوري ---
        let menuText = `╔═〔 👑  مملكة يونيفرس  〕═╗\n`;
        menuText += `║        *${botName}*        ║\n`;
        menuText += `╚═══════════════════╝\n\n`;

        menuText += `🛡️ *لوحة المعلومات*\n`;
        menuText += `  ⌯ User: ${pushName}\n`;
        menuText += `  ⌯ Rank: ${isOwner ? '⚡ Founder' : (isAdmin ? '🛡️ Admin' : '👤 Member')}\n`;
        menuText += `  ⌯ Runtime: ${uptimeString}\n`;
        menuText += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

        for (const [category, cmds] of Object.entries(categories)) {
            menuText += `┏━━━〔 ${category.toUpperCase()} 〕━━━┓\n`;
            cmds.forEach((cmd, index) => {
                const isLast = index === cmds.length - 1;
                menuText += `${isLast ? '┗' : '┣'}── ✦ .${cmd}\n`;
            });
            menuText += `┗━━━━━━━━━━━━━━━┛\n\n`;
        }

        menuText += `╔═〔 🛡️ حقوق النشر 〕═╗\n`;
        menuText += `║ Powered By 👑 مملكة يونيفرس\n`;
        menuText += `║ Founder: ${ownerName}\n`;
        menuText += `║ © 2026 Universe Kingdom\n`;
        menuText += `╚═════════════════╝`;

        try {
            // إرسال الرسالة مع الصورة إذا موجودة
            if (fs.existsSync(imagePath)) {
                await sock.sendMessage(from, {
                    image: fs.readFileSync(imagePath),
                    caption: menuText
                }, { quoted: m });
            } else {
                await sock.sendMessage(from, { text: menuText }, { quoted: m });
            }
        } catch (err) {
            console.error("Error in Menu:", err);
        }
    }
};