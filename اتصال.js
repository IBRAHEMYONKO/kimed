import readline from 'readline';
import chalk from 'chalk';

// حذفنا السطر القديم من هنا ونقلناه لداخل الدالة

export async function handlePairing(sock) {
    if (sock.authState.creds.registered) return;

    // تعريف الواجهة هنا لضمان العمل في الوقت الصحيح
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const question = (text) => new Promise((resolve) => rl.question(text, resolve));

    console.log(chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
    console.log(chalk.white.bold("🚀 نظام الربط اللانهائي (Anti-Crash Pairing)"));
    
    let phoneNumber = "";
    while (!phoneNumber) {
        phoneNumber = await question(chalk.yellow('📝 أدخل رقم هاتفك مع رمز الدولة (مثال: 9647771851925): '));
        if (!phoneNumber) console.log(chalk.red("⚠️ الرقم مطلوب للبدء!"));
    }

    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');

    const requestWithRetry = async (retryCount = 0) => {
        try {
            console.log(chalk.magenta(`\n⏳ محاولة طلب الكود (محاولة رقم ${retryCount + 1})...`));
            await new Promise(resolve => setTimeout(resolve, 6000)); 

            const code = await sock.requestPairingCode(cleanNumber);
            
            console.log(chalk.cyan("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
            console.log(chalk.white.bold("🔑 كود الربط الخاص بك هو: ") + chalk.black.bgWhite.bold(` ${code} `));
            console.log(chalk.yellow("⚙️  طريقة الاستخدام:"));
            console.log(chalk.white("1- افتح واتساب في هاتفك."));
            console.log(chalk.white("2- الأجهزة المرتبطة -> ربط جهاز."));
            console.log(chalk.white("3- اختر 'الربط باستخدام رقم الهاتف' وضع الكود أعلاه."));
            console.log(chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));

            rl.close(); // إغلاق الواجهة بعد الحصول على الكود

        } catch (error) {
            console.log(chalk.red(`❌ فشلت المحاولة: ${error.message}`));
            if (retryCount < 5) {
                console.log(chalk.blue("🔄 جاري إعادة المحاولة خلال 10 ثوانٍ... لا تغلق البوت."));
                await new Promise(resolve => setTimeout(resolve, 10000));
                return requestWithRetry(retryCount + 1);
            } else {
                console.log(chalk.red.bold("‼️ تعذر الحصول على الكود."));
                rl.close();
            }
        }
    };

    await requestWithRetry();
}