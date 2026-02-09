export default {
    name: "مشرف",
    category: "الخطر",
    description: "تجريد جميع المشرفين من رتبهم فوراً",
    async execute(sock, m, args, ownerName, isAdmin, isOwner) {
        const from = m.key.remoteJid;

        // 1. التحقق من الصلاحية (كيم دوكجا فقط)
        if (!isOwner) return await sock.sendMessage(from, { text: "⚠️ هذا الأمر يتطلب صلاحيات الحاكم (كيم دوكجا)." }, { quoted: m });

        try {
            // 2. جلب بيانات المجموعة والمشاركين
            const groupMeta = await sock.groupMetadata(from);
            const participants = groupMeta.participants;
            const myId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            const senderId = m.key.participant || m.participant;

            // 3. فلترة الذكية:
            // - استبعاد البوت نفسه (myId)
            // - استبعادك أنت (senderId) لضمان بقائك مشرفاً
            // - استبعاد "Superadmin" (منشئ المجموعة) لأن محاولة إزالته تعطل الكود
            const adminsToDemote = participants
                .filter(p => (p.admin === 'admin') && p.id !== myId && p.id !== senderId)
                .map(p => p.id);

            if (adminsToDemote.length === 0) {
                return await sock.sendMessage(from, { text: "ℹ️ لا يوجد مشرفين قابلين للإزالة حالياً." }, { quoted: m });
            }

            // 4. التنفيذ الفوري (تنزيل الرتبة وليس الطرد)
            // ملاحظة: "demote" تقوم بتنزيل الرتبة لعضو عادي، "remove" تقوم بالطرد النهائي
            // بما أن اسم الأمر "مشرف"، سأستخدم demote لتجريدهم من الرتبة بسرعة.
            await sock.groupParticipantsUpdate(from, adminsToDemote, "demote");

            await sock.sendMessage(from, { 
                text: `⚡ تم تجريد ${adminsToDemote.length} مشرف من رتبهم بنجاح.` 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { text: `❌ فشل البروتوكول: تأكد من رتبة البوت.` }, { quoted: m });
        }
    }
};