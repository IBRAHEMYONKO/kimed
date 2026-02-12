import axios from 'axios';
import * as cheerio from 'cheerio';

export default {
    name: "هجوم",
    
    async execute(sock, m, args) {
        const targetUrl = args[0];
        if (!targetUrl || !targetUrl.includes("facebook.com")) {
            return m.reply("❌ يرجى إدخال رابط الصفحة: .فحص [الرابط]");
        }

        try {
            // 1. مرحلة جمع المعلومات (Scouting)
            const { data } = await axios.get(targetUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' }
            });
            const $ = cheerio.load(data);

            const pageName = $('meta[property="og:title"]').attr('content') || "غير معروف";
            const pageId = $('meta[property="al:android:url"]').attr('content')?.split('fb://page/')[1] || "مخفي";
            const pageImage = $('meta[property="og:image"]').attr('content');
            const description = $('meta[property="og:description"]').attr('content') || "لا يوجد وصف";

            // 2. تجهيز التقرير الاستخباراتي
            let report = `⚠️ [ تقرير استهداف سيبراني ] ⚠️\n\n`;
            report += `📝 الاسم: ${pageName}\n`;
            report += `🆔 المعرف: ${pageId}\n`;
            report += `📜 الوصف: ${description}\n`;
            report += `🔗 الرابط: ${targetUrl}\n\n`;
            report += `💠 الحالة: مستهدف للهجوم\n`;

            // 3. إرسال البيانات مع الأزرار
            // ملاحظة: الأزرار تعتمد على نسخة البوت لديك، إليك الطريقة الأكثر توافقاً:
            const buttons = [
                { buttonId: `attack_${targetUrl}`, buttonText: { displayText: '🔥 بدء الهجوم القاتل' }, type: 1 },
                { buttonId: `visit_${targetUrl}`, buttonText: { displayText: '🌐 ذهاب للحساب' }, type: 1 }
            ];

            const buttonMessage = {
                image: { url: pageImage },
                caption: report,
                footer: "👑 مملكة يونيفرس للأمن السيبراني",
                buttons: buttons,
                headerType: 4
            };

            await sock.sendMessage(m.key.remoteJid, buttonMessage);

        } catch (error) {
            m.reply("❌ فشل الاتصال بخوادم فيسبوك، قد تكون الحماية مرتفعة.");
        }
    }
};
