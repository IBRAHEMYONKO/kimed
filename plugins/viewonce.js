import { downloadMediaMessage } from '@whiskeysockets/baileys';

export default {
    name: "افتح",
    category: "الاستعلام",
    async execute(sock, m, args, ownerName, isAdmin, isOwner) {
        const from = m.key.remoteJid;

        try {
            // جلب الرسالة المقتبسة (التي قمت بالرد عليها)
            const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quoted) {
                return sock.sendMessage(from, { text: "⚠️ قم بالرد على (صورة، فيديو، صوت، أو ملف) لاستخراجه." }, { quoted: m });
            }

            // التحقق من نوع الرسالة ومعالجتها سواء كانت View Once أو عادية
            let type = Object.keys(quoted)[0];
            let mediaContent = quoted;

            if (type === 'viewOnceMessageV2' || type === 'viewOnceMessage') {
                mediaContent = quoted[type].message;
                type = Object.keys(mediaContent)[0];
            }

            // التحقق من أن الرسالة تحتوي على وسائط قابلة للتحميل
            const validTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'];
            if (!validTypes.includes(type)) {
                return sock.sendMessage(from, { text: "❌ الرسالة المحددة لا تحتوي على ملفات أو وسائط." }, { quoted: m });
            }

            // إرسال إشعار بسيط بالبدء (اختياري)
            // await sock.sendMessage(from, { text: "⏳ جاري الاستخراج..." }, { quoted: m });

            // تحميل المحتوى وتحويله إلى Buffer
            const buffer = await downloadMediaMessage(
                { message: mediaContent },
                'buffer',
                {},
                { 
                    logger: console,
                    reuploadRequest: sock.updateMediaMessage 
                }
            );

            // إرسال المحتوى بناءً على النوع المستخرج
            if (type === 'imageMessage') {
                return sock.sendMessage(from, { image: buffer, caption: mediaContent[type].caption || "" }, { quoted: m });
            } 
            else if (type === 'videoMessage') {
                return sock.sendMessage(from, { video: buffer, caption: mediaContent[type].caption || "" }, { quoted: m });
            } 
            else if (type === 'audioMessage') {
                return sock.sendMessage(from, { audio: buffer, mimetype: 'audio/mp4', ptt: false }, { quoted: m });
            } 
            else if (type === 'documentMessage') {
                return sock.sendMessage(from, { 
                    document: buffer, 
                    mimetype: mediaContent[type].mimetype, 
                    fileName: mediaContent[type].fileName || 'extracted_file' 
                }, { quoted: m });
            }
            else if (type === 'stickerMessage') {
                return sock.sendMessage(from, { sticker: buffer }, { quoted: m });
            }

        } catch (error) {
            console.error("Error in Open Command:", error);
            return sock.sendMessage(from, { text: "❌ فشل استخراج الملف، قد يكون الملف محذوفاً من خوادم واتساب." }, { quoted: m });
        }
    }
};