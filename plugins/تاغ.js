export default {
    name: "مخفي",
    category: "أمن_سيبراني",
    async execute(sock, m) {
        const jid = m.key.remoteJid;
        if (!jid.endsWith('@g.us')) return;

        // جلب قائمة الأعضاء للمنشن المخفي
        const group = await sock.groupMetadata(jid);
        const participants = group.participants.map(p => p.id);

        // نص الرسالة باستخدام تنسيقات واتساب (Markdown)
        // *نص* = عريض | ~نص~ = مشطوب | _نص_ = مائل
        const simpleText = `👑 *يونيفرس* 👑\n\n` +
                           `~_________________~\n\n` +
                           `⚡ _${m.pushName || 'الآدمن'} يستدعي الجميع!_`;

        // إرسال المنشن المخفي
        await sock.sendMessage(jid, {
            text: simpleText,
            mentions: participants 
        }, { quoted: m });
    }
};