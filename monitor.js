import chalk from 'chalk';

export const monitor = {
    // مراقبة الدردشات
    chat: (m, text, type) => {
        const sender = m.pushName || "مجهول";
        const jid = m.key.remoteJid;
        const time = new Date().toLocaleTimeString();
        
        console.log(chalk.gray(`[${time}]`) + chalk.bold.cyan(` [${type}] `) + chalk.white(`${sender}: `) + chalk.yellow(text));
    },

    // مراقبة الأخطاء
    error: (msg, err) => {
        console.log(chalk.red.bold(`\n❌ [ خطأ في النظام ]`));
        console.log(chalk.red(`- الرسالة: ${msg}`));
        if (err) console.log(chalk.red(`- التفاصيل: ${err.message || err}`));
        console.log(chalk.red(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`));
    },

    // مراقبة الاتصال
    status: (msg, color = 'blue') => {
        console.log(chalk[color].bold(`\n✨ [ دوكجا ] : ${msg}`));
    }
};