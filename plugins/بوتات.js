export default {
    name: 'بوتات', // تم تغييرها من command إلى name لتظهر في القائمة
    description: 'يعرض جميع البوتات الموجودة في القروب',
    category: 'النظام', // تأكد أن الاسم يطابق الأقسام التي تريدها
    usage: '.بوتات',

    async execute(sock, msg) {
        const jid = msg.key.remoteJid;

        if (!jid.endsWith('@g.us')) {
            return sock.sendMessage(jid, { text: '❌ هذا الأمر يشتغل فقط في القروبات.' }, { quoted: msg });
        }

        try {
            const group = await sock.groupMetadata(jid);
            
            // فلترة المشاركين: البحث عن الحسابات التي تنتهي بـ s.whatsapp.net ولديها علامة البوت أو أرقام أعمال
            const bots = group.participants.filter(p => p.id.includes(':') || p.id.startsWith('0')); 

            if (!bots.length) {
                return sock.sendMessage(jid, { text: '🤖 لا يوجد بوتات واضحة في القروب.' }, { quoted: msg });
            }

            const botList = bots.map((b, i) => `${i + 1}. @${b.id.split('@')[0]}`).join('\n');

            await sock.sendMessage(jid, {
                text: `🤖 البوتات الموجودة في القروب:\n${botList}`,
                mentions: bots.map(b => b.id)
            }, { quoted: msg });

        } catch (err) {
            console.error('✗ خطأ في أمر كشف بوت:', err);
            await sock.sendMessage(jid, { text: '❌ حدث خطأ عند تنفيذ الأمر.' }, { quoted: msg });
        }
    }
};