import fs from 'fs';

export default {
    name: "منشن",
    category: "الإدارة",
    async execute(sock, m, args, ownerName, isAdmin, isOwner) {
        const from = m.key.remoteJid;

        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { 
                text: "❌ هذا الأمر مخصص للمجموعات فقط." 
            }, { quoted: m });
        }

        const groupMetadata = await sock.groupMetadata(from);
        const participants = groupMetadata.participants;
        const allParticipants = participants.map(p => p.id);

        const imagePath = './bot_img.jpg';
        const customMessage = args.length > 0 
            ? args.join(" ") 
            : "نداء رسمي صادر من عرش مملكة يونيفرس 👑";

        // ✨ التصميم الملكي
        let mentionText = `╭━━━〔 👑  مملكة يونيفرس  〕━━━╮\n`;
        mentionText += `┃         *UNIVERSE KINGDOM CALL* ┃\n`;
        mentionText += `╰━━━━━━━━━━━━━━━━━━━━╯\n\n`;

        mentionText += `📜 *الرسالة الرسمية:*\n`;
        mentionText += `「 ${customMessage} 」\n\n`;

        mentionText += `┏━━━〔 📊 إحصائيات النداء 〕━━━┓\n`;
        mentionText += `┃ 👥 الأعضاء المستهدفون : ${allParticipants.length}\n`;
        mentionText += `┃ 🗣️ المنادي : ${m.pushName || 'Admin'}\n`;
        mentionText += `┗━━━━━━━━━━━━━━━━━━━┛\n\n`;

        mentionText += `✦ *قائمة الحضور الملكي:*\n\n`;
        
        for (let mem of participants) {
            mentionText += `| @${mem.id.split('@')[0]}\n`;
        }

        mentionText += `\n╭━━━〔 🛡️ حقوق النشر 〕━━━╮\n`;
        mentionText += `┃   Powered By 👑 مملكة يونيفرس\n`;
        mentionText += `┃   Founder : ${ownerName}\n`;
        mentionText += `╰━━━━━━━━━━━━━━━━━━━━╯`;

        // الإرسال مع ضمان تفعيل خاصية المنشن عبر contextInfo
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(from, {
                image: fs.readFileSync(imagePath),
                caption: mentionText,
                mentions: allParticipants,
                contextInfo: { 
                    mentionedJid: allParticipants, // تكرار المنشن هنا يضمن التنبيه في بعض النسخ
                    forwardingScore: 999,
                    isForwarded: true 
                }
            }, { quoted: m });
        } else {
            await sock.sendMessage(from, {
                text: mentionText,
                mentions: allParticipants,
                contextInfo: { mentionedJid: allParticipants }
            }, { quoted: m });
        }
    }
};
