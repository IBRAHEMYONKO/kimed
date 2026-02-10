export default {
    name: "مخفي",
    category: "الإدارة",
    async execute(sock, m) {
        const jid = m.key.remoteJid;
        if (!jid.endsWith('@g.us')) return;

        // 1. استخراج الرسالة المقتبسة (التي رددت عليها)
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        let textToEcho = "";
        if (quoted) {
            textToEcho = quoted.conversation || 
                         quoted.extendedTextMessage?.text || 
                         quoted.imageMessage?.caption || 
                         "";
        }

        // 2. التحقق من وجود نص للارسال
        if (!quoted || textToEcho === "") {
            return sock.sendMessage(jid, { 
                text: "❌ يرجى الرد على رسالة نصية لتنفيذ المنشن المخفي." 
            }, { quoted: m });
        }

        // 3. جلب قائمة الأرقام (IDs) لجميع الأعضاء
        const group = await sock.groupMetadata(jid);
        const participants = group.participants.map(p => p.id);

        // 4. إرسال الرسالة كنص صافي مع المنشن الحقيقي
        await sock.sendMessage(jid, {
            text: textToEcho, // يرسل النص المقتبس فقط بدون أي زيادة
            mentions: participants, // هذا هو الجزء المسؤول عن المنشن الحقيقي (التنبيه)
            contextInfo: {
                mentionedJid: participants // تأكيد المنشن في بيانات الرسالة لضمان وصول التنبيه
            }
        });
    }
};
