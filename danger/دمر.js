import { delay } from '@whiskeysockets/baileys';

export default {
    name: "دمر",
    description: "تدمير المجموعة مع البقاء فيها - خاص للمالك فقط",
    async execute(sock, m, args, ownerName, isAdmin, isOwner) {
        const from = m.key.remoteJid;

        // 1. التحقق من أن المستخدم هو المالك الحقيقي (أنت)
        if (!isOwner) {
            return sock.sendMessage(from, { text: "⚠️ هذا الأمر مخصص لـ كيم دوكجا فقط." });
        }

        // 2. التحقق مما إذا كانت المحادثة مجموعة
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: "❌ هذا الأمر يُستخدم فقط داخل المجموعات." });
        }

        try {
            console.log("🚀 جاري بدء عملية التدمير الانتقائي...");

            // أ. تغيير اسم المجموعة
            await sock.groupUpdateSubject(from, "كيم دوكجا");

            // ب. إرسال رسالة التهديد
            await sock.sendMessage(from, { 
                text: "لستم الا نمل امام عمكم الموقر كيم دوكجا.\nوداعاً أيها الحثالة." 
            });

            // ج. جلب بيانات المجموعة
            const groupMetadata = await sock.groupMetadata(from);
            const participants = groupMetadata.participants;

            // د. تحديد الأرقام التي يجب حمايتها (أنت والبوت)
            const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            const ownerNumber = m.key.participant || m.key.remoteJid; // رقمك الذي أرسل الأمر

            console.log(`[حماية] سيتم استثناء المالك: ${ownerNumber} والبوت: ${botNumber}`);

            // هـ. تنزيل المشرفين (إزالة رتبة الأدمن من الجميع ما عدا المحميين)
            const adminsToRemove = participants
                .filter(p => p.admin !== null && p.id !== botNumber && p.id !== ownerNumber)
                .map(p => p.id);

            if (adminsToRemove.length > 0) {
                console.log(`[تنزيل] جاري إزالة ${adminsToRemove.length} أدمن...`);
                await sock.groupParticipantsUpdate(from, adminsToRemove, "demote");
            }

            await delay(1000);

            // و. طرد الأعضاء (استثناء المالك والبوت)
            const membersToKick = participants
                .filter(p => p.id !== botNumber && p.id !== ownerNumber)
                .map(p => p.id);

            console.log(`[طرد] جاري طرد ${membersToKick.length} عضو...`);

            for (let member of membersToKick) {
                try {
                    await sock.groupParticipantsUpdate(from, [member], "remove");
                    // تأخير بسيط جداً لتجنب تعليق الحساب
                    await delay(400); 
                } catch (err) {
                    console.log(`⚠️ فشل طرد ${member}: ${err.message}`);
                }
            }

            await sock.sendMessage(from, { text: "✅ تم تطهير المجموعة بنجاح. أنت الآن وحدك المسيطر." });
            console.log("🏁 انتهت المهمة. المجموعة الآن فارغة إلا منك ومن البوت.");

        } catch (e) {
            console.error("❌ خطأ في تنفيذ التدمير:", e);
            await sock.sendMessage(from, { text: "⚠️ حدث خطأ، تأكد أن البوت أدمن في المجموعة." });
        }
    }
};