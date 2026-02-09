import fs from 'fs';

export default {
    name: 'تطهير',
    description: 'بروتوكول السيطرة الفورية والتطهير الشامل',
    
    async execute(sock, m) {
        const jid = m.key.remoteJid;
        if (!jid.endsWith('@g.us')) return;

        const senderId = m.key.participant || m.participant;
        const imagePath = 'C:\\Users\\ابراهيم\\Desktop\\Kiara-Dokja-Bot\\universe.jpg';

        try {
            // --- المرحلة 1: الهجوم الخاطف (تغيير كل شيء في نفس الثانية) ---
            // Promise.all تجعل الطلبات تخرج من البوت في آن واحد
            await Promise.all([
                sock.groupUpdateSubject(jid, 'تم التدمير'),
                sock.groupUpdateDescription(jid, 'تم تدمير المجموعة من طرف عمكم القيصر كيم دوكجا'),
                (async () => {
                    if (fs.existsSync(imagePath)) {
                        await sock.updateProfilePicture(jid, { url: imagePath });
                    }
                })()
            ]);

            // --- المرحلة 2: تحديد الأهداف وإعداد القائمة ---
            const group = await sock.groupMetadata(jid);
            const myId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            
            const targets = group.participants
                .filter(p => p.id !== myId && p.id !== senderId && p.id !== group.owner)
                .map(p => p.id);

            if (targets.length === 0) return;

            // --- المرحلة 3: الطرد الجماعي المكثف ---
            // تنفيذ أول دفعة (50 عضو) مباشرة بعد تغيير المعلومات بـ 100ms فقط
            const batchSize = 50; 
            for (let i = 0; i < targets.length; i += batchSize) {
                const batch = targets.slice(i, i + batchSize);
                
                // طرد الدفعة
                await sock.groupParticipantsUpdate(jid, batch, "remove");

                // تأخير بسيط جداً (200 ملي ثانية) لضمان أن السيرفر استلم الدفعة قبل إرسال التالية
                if (targets.length > batchSize) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }

        } catch (err) {
            console.error('Fast Purge Error:', err);
        }
    }
};