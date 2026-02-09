export default {
    name: "طرد",
    category: "الحماية",
    async execute(sock, m, args, ownerName, isAdmin, isOwner) {
        const from = m.key.remoteJid;
        if (!from.endsWith('@g.us')) return;

        // التحقق من منشن الشخص أو الرد على رسالته
        let victim = m.message.extendedTextMessage?.contextInfo?.participant || 
                     (m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) || 
                     (args[0]?.replace('@', '') + '@s.whatsapp.net');

        if (!victim || victim.length < 15) {
            return sock.sendMessage(from, { 
                text: "⚠️ قم بالرد على الشخص أو منشن له لطرده." 
            }, { quoted: m });
        }

        // منع طرد المطور أو البوت نفسه
        if (victim.includes("9647771851925") || victim === sock.user.id.split(':')[0] + '@s.whatsapp.net') {
            return sock.sendMessage(from, { 
                text: "❌ لا يمكنك طرد أسياد النظام." 
            }, { quoted: m });
        }

        // تصميم ملكي للرسالة
        let kickText = `╭━━━〔 👑  مملكة يونيفرس  〕━━━╮\n`;
        kickText += `┃        *UNIVERSE KINGDOM EXECUTION*        ┃\n`;
        kickText += `╰━━━━━━━━━━━━━━━━━━━━╯\n\n`;
        kickText += `🛡️ تم رصد مخالفة من: @${victim.split('@')[0]}\n`;
        kickText += `⛓️ الإجراء: طرد فوري من النظام\n\n`;
        kickText += `╭━━━〔 🛡️ حقوق النشر 〕━━━╮\n`;
        kickText += `┃   Powered By 👑 مملكة يونيفرس\n`;
        kickText += `┃   Founder : ${ownerName}\n`;
        kickText += `╰━━━━━━━━━━━━━━━━━━━━╯`;

        try {
            // تنفيذ الطرد
            await sock.groupParticipantsUpdate(from, [victim], "remove");

            // إرسال رسالة الطرد + المنشن (مخفي)
            await sock.sendMessage(from, { 
                text: kickText, 
                mentions: [victim] 
            }, { quoted: m });

        } catch (e) {
            await sock.sendMessage(from, { 
                text: "⚠️ فشل الطرد، تأكد أن البوت مسؤول (Admin) في المجموعة." 
            }, { quoted: m });
        }
    }
};