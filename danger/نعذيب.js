import { delay } from '@whiskeysockets/baileys';

export default {
    name: "تعذيب",
    description: "إرسال سلسلة منشنات مزعجة للمخرب - للمالك فقط",
    async execute(sock, m, args, ownerName, isAdmin, isOwner) {
        const from = m.key.remoteJid;
        const target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

        if (!isOwner) {
            return sock.sendMessage(from, { text: "⚠️ هذا السلاح مخصص لـ كيم دوكجا فقط." });
        }

        if (!target) {
            return sock.sendMessage(from, { text: "⚠️ حدد الهدف بعمل منشن." });
        }

        await sock.sendMessage(from, { text: "⛓️ جاري بدء بروتوكول التعذيب الرقمي..." });

        for (let i = 0; i < 20; i++) {
            try {
                await sock.sendMessage(from, { 
                    text: `🛑 انتباه أيها المخرب @${target.split('@')[0]} 🛑\nسحـقـك مستمر... ` + "☣️".repeat(10),
                    mentions: [target]
                });
                await delay(500); // تأخير نصف ثانية بين كل ضربة
            } catch (err) {
                console.log("⚠️ خطأ في التعذيب:", err.message);
            }
        }
    }
};