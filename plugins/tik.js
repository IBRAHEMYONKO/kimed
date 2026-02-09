import axios from "axios";

export default {
    name: "تيك",
    description: "تحميل فيديو تيك توك بدون حقوق",
    async execute(sock, m, args) {
        const from = m.key.remoteJid;

        if (!args[0]) {
            return await sock.sendMessage(from, { text: "❌ ارسل رابط تيك توك بعد الأمر.\nمثال:\n.تيك الرابط" });
        }

        const url = args[0];

        try {
            const api = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
            const { data } = await axios.get(api);

            if (!data.data || !data.data.play) {
                return await sock.sendMessage(from, { text: "❌ فشل جلب الفيديو." });
            }

            await sock.sendMessage(from, {
                video: { url: data.data.play },
                caption: "🔥 تم التحميل بدون علامة مائية"
            });

        } catch (e) {
            await sock.sendMessage(from, { text: "❌ حصل خطأ أثناء التحميل." });
        }
    }
};