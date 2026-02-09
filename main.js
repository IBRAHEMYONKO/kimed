import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import fs from 'fs-extra';
import path from 'path';
import pino from 'pino';
import chalk from 'chalk';
import qrcode from 'qrcode-terminal';
import { fileURLToPath } from 'url';
import readline from 'readline'; // [تعديل] لإدخال الرقم

// ==========================================
// [1] الإعدادات والمسارات
// ==========================================
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const botName = "51-49";
const ownerName = "كيم دوكجا";
const dbPath = path.join(__dirname, 'admins_list.json');
const universeImage = path.join(__dirname, 'universe.jpg');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

if (!fs.existsSync(dbPath)) fs.writeJsonSync(dbPath, { admins: [] });

let startTime = Date.now();

async function startBot() {
    console.log(chalk.cyan.bold(`\n🚀 جاري تشغيل مملكة يونفيرس ${botName}...`));
    
    const { state, saveCreds } = await useMultiFileAuthState('./الاتصال');
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false, // [تعديل] تعطيل الـ QR
        browser: ["Ubuntu", "Chrome", "20.0.04"] // [تعديل] ضروري لعمل الكود
    });

    // 📌 دمج الصورة مع أي رد نصي من البلغنات
const originalSendMessage = sock.sendMessage.bind(sock);

sock.sendMessage = async (jid, content, options = {}) => {
    if (content?.text && fs.existsSync(universeImage)) {
        content = {
            image: fs.readFileSync(universeImage),
            caption: content.text
        };
    }
    return originalSendMessage(jid, content, options);
};
    // ==========================================
    // [إضافة] منطق طلب كود الربط (Pairing Code)
    // ==========================================
    if (!sock.authState.creds.registered) {
        console.log(chalk.white.bgBlue.bold("\n[؟] أدخل رقم هاتفك (بمفتاح الدولة) للربط:"));
        const phoneNumber = await question(chalk.yellow('مثال: 96650xxxxxxx\n> '));
        
        setTimeout(async () => {
            let code = await sock.requestPairingCode(phoneNumber.replace(/[^\d]/g, ''));
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            console.log(chalk.black.bgGreen.bold(`\n كود الربط الخاص بك هو: ${code} `));
            console.log(chalk.white("\nافتح الواتساب > الأجهزة المرتبطة > ربط جهاز > الربط برقم الهاتف وأدخل الكود.\n"));
        }, 3000);
    }

    // ==========================================
    // [2] تحميل الإضافات (Plugins)
    // ==========================================
    const commands = new Map();
    const loadPlugins = async () => {
        const pluginsPath = path.join(__dirname, 'plugins');
        if (!fs.existsSync(pluginsPath)) fs.mkdirSync(pluginsPath);
        const files = fs.readdirSync(pluginsPath).filter(file => file.endsWith('.js'));
        for (const file of files) {
            try {
                const plugin = await import(`./plugins/${file}?update=${Date.now()}`);
                if (plugin.default && plugin.default.name) {
                    commands.set(plugin.default.name, plugin.default);
                }
            } catch (e) { console.log(chalk.red(`⚠️ خطأ تحميل ${file}: ${e.message}`)); }
        }
    };
    await loadPlugins();

    sock.ev.on('creds.update', saveCreds);

    // ==========================================
    // [3] معالج الرسائل الرئيسي
    // ==========================================
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.remoteJid === 'status@broadcast') return;

        const from = m.key.remoteJid;
        const text = (m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || "").trim();
        const sender = m.key.participant || from;
        const rawSender = sender.split('@')[0].split(':')[0];

        if (text) console.log(chalk.white(`📩 [${rawSender}]: ${text}`));

        const isOwner = m.key.fromMe; 
        const adminData = fs.readJsonSync(dbPath);
        const isAdmin = isOwner || adminData.admins.includes(rawSender);

        if (text.startsWith('.خطر')) {
            if (!isOwner) return await sock.sendMessage(from, { text: "⚠️ هذا القسم مخصص لـ كيم دوكجا فقط." });
            const args = text.split(' ').slice(1);
            const dangerPath = path.join(__dirname, 'danger');
            if (args.length === 0) {
                const files = fs.readdirSync(dangerPath).filter(f => f.endsWith('.js'));
                let menu = `*『 ☣️ سـجـلات الـخـطـر 』*\n\n`;
                files.forEach(f => menu += `◈ .خطر ${f.replace('.js', '')}\n`);
                return await sock.sendMessage(from, { text: menu });
            }
            const cmdName = args[0];
            try {
                const { default: dangerCmd } = await import(`./danger/${cmdName}.js?update=${Date.now()}`);
                await dangerCmd.execute(sock, m, args.slice(1), ownerName, isAdmin, isOwner);
            } catch (e) { await sock.sendMessage(from, { text: `❌ خطأ: ${e.message}` }); }
            return;
        }

        if (text.startsWith('.رفع') || text.startsWith('.خفض')) {
            if (!isOwner) return;
            const target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || text.split(' ')[1];
            if (!target) return await sock.sendMessage(from, { text: "⚠️ منشن الشخص." });
            const targetId = target.split('@')[0].split(':')[0];
            if (text.startsWith('.رفع')) {
                if (!adminData.admins.includes(targetId)) adminData.admins.push(targetId);
                fs.writeJsonSync(dbPath, adminData);
                await sock.sendMessage(from, { text: `✅ تم رفع @${targetId} أدمن.`, mentions: [target] });
            } else {
                adminData.admins = adminData.admins.filter(id => id !== targetId);
                fs.writeJsonSync(dbPath, adminData);
                await sock.sendMessage(from, { text: `❌ تم تنزيل @${targetId}.`, mentions: [target] });
            }
            return;
        }

        // 🔥 تفاعل تلقائي مع اسماء القائد
const triggerWords = ["كيم", "دوكجا", "دوكا", "مايكي", "كيم دوكجا"];

if (text && triggerWords.some(w => text.includes(w))) {
    await sock.sendMessage(from, {
        react: {
            text: "👑",
            key: m.key
        }
    });
}
//تست
        if (text.startsWith(".")) {
            const args = text.slice(1).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command = commands.get(commandName);
            if (command) {
                if (commandName === "ملف" || isAdmin) {
                    try {
                       
await command.execute(sock, m, args, ownerName, isAdmin, isOwner, { startTime });
                    } catch (err) { console.error(err); }
                }
            }
        }
    });

    // ==========================================
    // [4] إدارة الاتصال
    // ==========================================
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            console.log(chalk.green.bold(`\n✅ تم الاتصال! يا كيم دوكجا. مملكة يونفيرس تحت تصرفك.`));
        } else if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        }
    });
}

startBot();