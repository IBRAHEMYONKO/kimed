export default {
    name: "مخفي",
    category: "أمن_سيبراني",
    async execute(sock, m) {
        const jid = m.key.remoteJid;
        if (!jid.endsWith('@g.us')) return;

        // التحقق مما إذا كان المستخدم قد قام بالرد على رسالة أم لا
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        // الحصول على نص الرسالة (سواء كانت رسالة عادية أو رد على رسالة)
        let textToEcho = "";
        if (quoted) {
            // استخراج النص من الرسالة المقتبسة (التي رددت عليها)
            textToEcho = quoted.conversation || 
                         quoted.extendedTextMessage?.text || 
                         quoted.imageMessage?.caption || 
                         "";
        }

        // إذا لم يرد على رسالة أو كانت الرسالة المردود عليها فارغة
        if (!quoted || textToEcho === "") {
            return sock.sendMessage(jid, { 
                text: "❌ يرجى الرد على الرسالة التي تريد نشرها بمنشن مخفي." 
            }, { quoted: m });
        }

        // جلب قائمة الأعضاء للمنشن المخفي
        const group = await sock.groupMetadata(jid);
        const participants = group.participants.map(p => p.id);

        // تنسيق الرسالة النهائية: نص الشخص + توقيع البوت
        const finalMessage = `${textToEcho}\n\n` +


        // إرسال المنشن المخفي
        await sock.sendMessage(jid, {
            text: finalMessage,
            mentions: participants 
        }); // حذفنا { quoted: m } هنا لكي تظهر كرسالة جديدة تماماً، يمكنك إضافتها إذا أردت
    }
};
