export default {
    name: "اغتصب",
    execute: async (sock, m, args) => {
        const from = m.key.remoteJid;
        const target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || args[0];

        if (!target) return await sock.sendMessage(from, { text: "⚠️ حدد الضحية (منشن أو رقم) لبدء عملية الإبادة." });

        const targetId = target.includes('@') ? target : target + '@s.whatsapp.net';
        
        // هنا تضع قائمة الردود التي تريدها (يمكنك تعديلها كما تشاء)
        const insults = [
            "تم رصد شخص يريد ان ينكح ",
            "تشغيل امر الاغتصاب واغتصابه عدة مرات.",
            "  ماهو شعور قضيب عمك دوكا يا كلب؟؟؟؟؟؟  ...",
            "هل ظننت أنك تستطيع تخريب هذا الشات والإفلات؟",
            "وداعاً أيها القحبة.. عملية المسح بدأت."
        ];

        for (const text of insults) {
            await sock.sendMessage(from, { 
                text: `${text} @${targetId.split('@')[0]}`, 
                mentions: [targetId] 
            });
            // تأخير بسيط لمنع الحظر من واتساب
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // محاولة طرده إذا كان البوت أدمن
        try {
            await sock.groupParticipantsUpdate(from, [targetId], "remove");
            await sock.sendMessage(from, { text: "✅ تم تطهير المجموعة من المخرب بنجاح." });
        } catch (e) {
            await sock.sendMessage(from, { text: "⚠️ تمت الإبادة اللفظية، لكن لم أستطع طرده (لست أدمن)." });
        }
    }
};