/**
 * 👤 Dev: Kim Dokja ⊰↥✦
 * 📡 Module: Network Radar (Global Member Cross-Check)
 * 🛠️ Function: كشف جميع الأعضاء المكررين في كافة مجموعات البوت
 */

export default {
    name: 'رادار',
   
    description: 'يحلل جميع المجموعات ويكشف الأعضاء الموجودين في أكثر من مكان',
    
    async execute(sock, m) {
        const jid = m.key.remoteJid;

        try {
            await sock.sendMessage(jid, { text: '📡 جاري بدء المسح الشامل لكافة المجموعات.. قد يستغرق هذا لحظات.' });

            // 1. جلب كافة المجموعات التي يشارك فيها البوت
            const allGroups = await sock.groupFetchAllParticipating();
            const groupList = Object.values(allGroups);
            
            let memberMap = {}; // خريطة لتخزين الأعضاء وأماكن تواجدهم

            // 2. تحليل كل مجموعة وسحب أعضائها
            for (let group of groupList) {
                const groupName = group.subject;
                for (let participant of group.participants) {
                    const userId = participant.id;
                    
                    // تحديد الرتبة
                    let rank = 'عضو';
                    if (participant.admin === 'admin') rank = 'مشرف';
                    if (participant.admin === 'superadmin' || group.owner === userId) rank = 'المؤسس';

                    if (!memberMap[userId]) {
                        memberMap[userId] = {
                            id: userId,
                            count: 0,
                            locations: []
                        };
                    }
                    
                    memberMap[userId].count++;
                    memberMap[userId].locations.push({ name: groupName, rank: rank });
                }
            }

            // 3. تصفية الأعضاء المكررين فقط (الذين ظهروا في أكثر من مجموعة واحدة)
            const duplicates = Object.values(memberMap)
                .filter(member => member.count > 1)
                .sort((a, b) => b.count - a.count); // ترتيبهم من الأكثر تكراراً للأقل

            if (duplicates.length === 0) {
                return sock.sendMessage(jid, { text: '🛡️ المسح اكتمل: لا يوجد أعضاء مشتركين بين المجموعات.' });
            }

            // 4. بناء تقرير الهاكر الاحترافي
            let report = `〆 ┏━━━━━━━ ⊰ 📡 ⊱ ━━━━━━━┓ 〆\n`;
            report += `         *『 رادار الشبكة الشامل 』*\n`;
            report += `〆 ┗━━━━━━━ ⊰ 📡 ⊱ ━━━━━━━┛ 〆\n\n`;
            report += `📊 *إجمالي المجموعات المفحوصة:* ${groupList.length}\n`;
            report += `👥 *الأعضاء المشتركون المكتشفون:* ${duplicates.length}\n`;
            report += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

            // عرض أول 15 عضواً مكرراً (لتجنب طول الرسالة الزائد)
            const topDuplicates = duplicates.slice(0, 15);

            topDuplicates.forEach((member, i) => {
                report += `👤 *العضو:* @${member.id.split('@')[0]}\n`;
                report += `🔄 *موجود في:* ${member.count} مجموعات\n`;
                member.locations.forEach(loc => {
                    report += `   📍 ${loc.name} (${loc.rank})\n`;
                });
                report += `--------------------------\n`;
            });

            report += `\n*تم الاستخراج بواسطة نظام 𝟓𝟏-𝟒𝟗*\n`;
            report += `*Dev: Kim Dokja ⊰↥✦*`;

            await sock.sendMessage(jid, { 
                text: report, 
                mentions: duplicates.map(d => d.id) 
            });

        } catch (err) {
            console.error('Network Radar Error:', err);
            await sock.sendMessage(jid, { text: '❌ حدث خطأ تقني أثناء تحليل الشبكة.' });
        }
    }
};