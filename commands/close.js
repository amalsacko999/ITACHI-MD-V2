// Close → Ferme le groupe (seuls les admins peuvent envoyer)
const isAdmin = require('../lib/isAdmin');

const channelInfo = {
    forwardingScore: 1, isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363427860148318@newsletter',
        newsletterName: 'IBSACKO™', serverMessageId: -1
    }
};

async function closeCommand(sock, chatId, senderId, message) {
    if (!chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, { text: '❌ *Uniquement dans les groupes !*', contextInfo: channelInfo }, { quoted: message });
    }


    try {
        // Verrouille le groupe : seuls les admins peuvent envoyer
        await sock.groupSettingUpdate(chatId, 'announcement');
        const meta = await sock.groupMetadata(chatId);

        await sock.sendMessage(chatId, {
            image: { url: 'https://i.ibb.co/xSScX4bP/file-0000000060a471fd918d46d4c7c69a21.png' },
            caption: `╔═══════════════════════╗\n║  🥷 *𝗜𝗧𝗔𝗖𝗛𝗜-𝗫𝗠𝗗 v2.0* 🥷  ║\n╠═══════════════════════╣\n║   🔒 *GROUPE FERMÉ*      ║\n╚═══════════════════════╝\n\n👥 *${meta.subject}*\n\n┌──────────────────────\n│ 🔒 Statut : *Fermé*\n│ 👑 Seuls les admins peuvent écrire\n│ 📅 Fermé par @${senderId.split('@')[0]}\n└──────────────────────\n\n> _Pour rouvrir : .open_\n> _Propulsé par 🥷 IBSACKO™_`,
            mentions: [senderId],
            contextInfo: channelInfo
        }, { quoted: message });
    } catch (e) {
        console.error('❌ [close]', e.message);
        await sock.sendMessage(chatId, { text: '❌ *Impossible de fermer le groupe.*\n_Vérifiez les permissions du bot._', contextInfo: channelInfo }, { quoted: message });
    }
}

module.exports = closeCommand;
