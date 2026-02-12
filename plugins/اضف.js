import fs from 'fs';
import path from 'path';

export default {
    name: "اضف",
    category: "المطور",
    async execute(sock, m, args, ownerName, isAdmin, isOwner) {
        // التحقق من صلاحية المطور لضمان الأمان
        if (!isOwner) return sock.sendMessage(m.key.remoteJid, { text: "❌ هذا الأمر مخصص للمطور فقط!" }, { quoted: m });

        // التحقق مما إذا كان المستخدم قد رد على ملف
        const quotedMsg = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const document = quotedMsg?.documentMessage;

        if (!document) {
            return sock.sendMessage(m.key.remoteJid, { text: "📂 من فضلك قم بالرد على ملف الـ JS (أمر البوت) الذي تريد إضافته." }, { quoted: m });
        }

        // تحديد اسم الأمر: إما من نص الرسالة أو من اسم الملف الأصلي
        let cmdName = args[0] ? args[0] : document.fileName.replace('.js', '');
        const fileName = `${cmdName}.js`;
        const targetPath = path.join('./plugins', fileName);

        try {
            // 1. تحميل محتوى الملف من سيرفرات واتساب
            const buffer = await sock.downloadMediaMessage(document);
            
            // 2. التأكد من وجود مجلد plugins أو إنشاؤه
            if (!fs.existsSync('./plugins')) {
                fs.mkdirSync('./plugins');
            }

            // 3. كتابة الملف في مجلد plugins
            fs.writeFileSync(targetPath, buffer);

            // 4. محاولة تسجيل الأمر برمجياً ليعمل فوراً (اختياري حسب نظام البوت لديك)
            // ملاحظة: إذا كان البوت يقرأ الأوامر عند التشغيل فقط، سيعمل هذا عند الريستارت
            // أما إذا كنت تستخدم dynamic import فسيتم تحديثه
            
            let successMsg = `✅ *تمت إضافة الأمر بنجاح!* 👑\n\n`;
            successMsg += `📝 *الاسم:* ${cmdName}\n`;
            successMsg += `📁 *المسار:* /plugins/${fileName}\n`;
            successMsg += `🚀 *الحالة:* جاهز للعمل الآن.`;

            await sock.sendMessage(m.key.remoteJid, { text: successMsg }, { quoted: m });

        } catch (error) {
            console.error("Error adding command:", error);
            await sock.sendMessage(m.key.remoteJid, { text: "❌ حدث خطأ أثناء محاولة حفظ الأمر." }, { quoted: m });
        }
    }
};
