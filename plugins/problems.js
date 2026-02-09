import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
    name: "مشاكل",
    description: "فحص أخطاء الأوامر والملفات",
    async execute(sock, m, args, rights) {
        const from = m.key.remoteJid;
        const pluginsPath = path.join(__dirname); // مسار مجلد الأوامر الحالي
        const files = fs.readdirSync(pluginsPath).filter(file => file.endsWith('.js'));
        
        let errorReport = `*⚠️  دوكجا ⚠️*\n\n`;
        let brokenFiles = [];

        for (const file of files) {
            try {
                // محاولة استيراد كل ملف للتأكد من سلامته برمجياً
                await import(`./${file}?update=${Date.now()}`);
            } catch (e) {
                brokenFiles.push({ name: file, error: e.message });
            }
        }

        if (brokenFiles.length === 0) {
            errorReport += `✅ جميع الملفات في مجلد الأوامر (Plugins) تعمل بشكل سليم ولا توجد مشاكل برمجية.\n`;
        } else {
            errorReport += `❌ تم العثور على أخطاء في الملفات التالية:\n\n`;
            brokenFiles.forEach((file, i) => {
                errorReport += `*${i + 1}. الملف:* ${file.name}\n`;
                errorReport += `*⚠️ الخطأ:* ${file.error}\n`;
                errorReport += `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n`;
            });
            errorReport += `\n*نصيحة:* راجع الأسطر المذكورة في الخطأ أعلاه داخل VS Code.`;
        }

        errorReport += `\n\n*حقوق النظام:*\n${rights}`;

        await sock.sendMessage(from, { text: errorReport }, { quoted: m });
    }
};