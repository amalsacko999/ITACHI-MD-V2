const isOwnerOrSudo = require('../lib/isOwner');
const { getSudoList } = require('../lib/index');

const channelInfo = {
    forwardingScore: 1, isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363427860148318@newsletter',
        newsletterName: 'IBSACKO™', serverMessageId: -1
    }
};

async function listsudoCommand(sock, chatId, senderId, message) {
    const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
    if (!isOwner) {
        return await sock.sendMessage(chatId, {
            text: `❌ *Réservé au propriétaire !*`, contextInfo: channelInfo
        }, { quoted: message });
    }

    try {
        const list = await getSudoList();
        if (!list || list.length === 0) {
            return await sock.sendMessage(chatId, {
                text: `╔══════════════════════╗\n║   🥷 *𝗜𝗧𝗔𝗖𝗛𝗜-𝗫𝗠𝗗* 🥷   ║\n╠══════════════════════╣\n║   👑 *LISTE SUDO*      ║\n╚══════════════════════╝\n\n📋 *Aucun sudo enregistré.*\n\n💡 Ajoute avec : *.setsudo <numéro>*`,
                contextInfo: channelInfo
            }, { quoted: message });
        }

        let sudoList = '';
        list.forEach((jid, i) => {
            sudoList += `│ ${i + 1}. +${jid.split('@')[0]}\n`;
        });

        return await sock.sendMessage(chatId, {
            image: { url: 'https://i.ibb.co/xSScX4bP/file-0000000060a471fd918d46d4c7c69a21.png' },
            caption: `╔══════════════════════╗\n║   🥷 *𝗜𝗧𝗔𝗖𝗛𝗜-𝗫𝗠𝗗* 🥷   ║\n╠══════════════════════╣\n║   👑 *LISTE SUDO*      ║\n╚══════════════════════╝\n\n👥 *${list.length} sudo(s) :*\n┌──────────────────────\n${sudoList}└──────────────────────\n\n> _Propulsé par 🥷 IBSACKO™_`,
            contextInfo: channelInfo
        }, { quoted: message });
    } catch (e) {
        return await sock.sendMessage(chatId, { text: `❌ *Erreur :* ${e.message}`, contextInfo: channelInfo }, { quoted: message });
    }
}

module.exports = listsudoCommand;
