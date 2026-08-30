const isOwnerOrSudo = require('../lib/isOwner');
const { removeSudo } = require('../lib/index');

const channelInfo = {
    forwardingScore: 1, isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363427860148318@newsletter',
        newsletterName: 'IBSACKO™', serverMessageId: -1
    }
};

async function delsudoCommand(sock, chatId, senderId, args, replyMessage, message) {
    const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
    if (!isOwner) {
        return await sock.sendMessage(chatId, {
            text: `❌ *Réservé au propriétaire !*`, contextInfo: channelInfo
        }, { quoted: message });
    }

    let targetJid = null;
    if (replyMessage) {
        const participant = message?.message?.extendedTextMessage?.contextInfo?.participant;
        if (participant) targetJid = participant;
    } else if (args[0]) {
        const num = args[0].replace(/[^0-9]/g, '');
        if (num) targetJid = num + '@s.whatsapp.net';
    }

    if (!targetJid) {
        return await sock.sendMessage(chatId, {
            text: `╔══════════════════════╗\n║   🥷 *𝗜𝗧𝗔𝗖𝗛𝗜-𝗫𝗠𝗗* 🥷   ║\n╚══════════════════════╝\n\n🗑️ *Retirer un Sudo*\n\n💡 *Usage :*\n┌──────────────────────\n│ ⬡ .delsudo @mention\n│ ⬡ .delsudo <numéro>\n│ ⬡ Réponds à un message\n└──────────────────────`,
            contextInfo: channelInfo
        }, { quoted: message });
    }

    try {
        await removeSudo(targetJid);
        const num = targetJid.split('@')[0];
        return await sock.sendMessage(chatId, {
            text: `╔══════════════════════╗\n║   🥷 *𝗜𝗧𝗔𝗖𝗛𝗜-𝗫𝗠𝗗* 🥷   ║\n╚══════════════════════╝\n\n🗑️ *+${num}* retiré des sudos.\n\n> _Propulsé par 🥷 IBSACKO™_`,
            contextInfo: channelInfo
        }, { quoted: message });
    } catch (e) {
        return await sock.sendMessage(chatId, { text: `❌ *Erreur :* ${e.message}`, contextInfo: channelInfo }, { quoted: message });
    }
}

module.exports = delsudoCommand;
