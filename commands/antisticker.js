// Antisticker → Supprime automatiquement tous les stickers envoyés par des non-admins
const fs = require('fs');
const path = require('path');
const isAdmin = require('../lib/isAdmin');

const configPath = path.join(__dirname, '../data/antisticker.json');
const channelInfo = {
    forwardingScore: 1, isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363427860148318@newsletter',
        newsletterName: 'IBSACKO™', serverMessageId: -1
    }
};

if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, JSON.stringify({}));
function getConfig() { try { return JSON.parse(fs.readFileSync(configPath)); } catch { return {}; } }
function saveConfig(d) { fs.writeFileSync(configPath, JSON.stringify(d, null, 2)); }

async function antistickerCommand(sock, chatId, senderId, args, message) {
    if (!chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, { text: '❌ *Uniquement dans les groupes !*', contextInfo: channelInfo }, { quoted: message });
    }

    const config = getConfig();
    const action = args[0]?.toLowerCase();
    const current = config[chatId]?.enabled ? '🟢 Activé' : '🔴 Désactivé';

    if (!action) {
        return await sock.sendMessage(chatId, {
            image: { url: 'https://i.ibb.co/xSScX4bP/file-0000000060a471fd918d46d4c7c69a21.png' },
            caption: `╔═══════════════════════╗\n║  🥷 *𝗜𝗧𝗔𝗖𝗛𝗜-𝗫𝗠𝗗 v2.0* 🥷  ║\n╠═══════════════════════╣\n║   🚫 *ANTI-STICKER*       ║\n╚═══════════════════════╝\n\n📊 *Statut :* ${current}\n\n📌 *Commandes :*\n┌──────────────────────\n│ ⬡ .antisticker on\n│ ⬡ .antisticker off\n└──────────────────────\n\n🛡️ *Fonctionnement :*\n┌──────────────────────\n│ Tout sticker envoyé par\n│ un non-admin sera\n│ supprimé automatiquement.\n│ Les admins ne sont pas affectés.\n└──────────────────────\n\n> _Propulsé par 🥷 IBSACKO™_`,
            contextInfo: channelInfo
        }, { quoted: message });
    }

    if (action === 'on') {
        if (!config[chatId]) config[chatId] = {};
        config[chatId].enabled = true;
        saveConfig(config);
        return await sock.sendMessage(chatId, {
            text: `╔═══════════════════════╗\n║  🥷 *𝗜𝗧𝗔𝗖𝗛𝗜-𝗫𝗠𝗗 v2.0* 🥷  ║\n╚═══════════════════════╝\n\n🚫 *Anti-Sticker :* 🟢 Activé\n\n> _Les stickers des non-admins seront supprimés._`,
            contextInfo: channelInfo
        }, { quoted: message });
    }
    if (action === 'off') {
        if (!config[chatId]) config[chatId] = {};
        config[chatId].enabled = false;
        saveConfig(config);
        return await sock.sendMessage(chatId, {
            text: `╔═══════════════════════╗\n║  🥷 *𝗜𝗧𝗔𝗖𝗛𝗜-𝗫𝗠𝗗 v2.0* 🥷  ║\n╚═══════════════════════╝\n\n🚫 *Anti-Sticker :* 🔴 Désactivé`,
            contextInfo: channelInfo
        }, { quoted: message });
    }
}

async function handleAntisticker(sock, chatId, senderId, message) {
    const config = getConfig();
    if (!config[chatId]?.enabled) return false;
    const { isSenderAdmin } = await isAdmin(sock, chatId, senderId);
    if (isSenderAdmin) return false;
    try {
        await sock.sendMessage(chatId, { delete: message.key });
        await sock.sendMessage(chatId, {
            text: `🚫 @${senderId.split('@')[0]} les stickers sont interdits dans ce groupe !`,
            mentions: [senderId], contextInfo: channelInfo
        });
        return true;
    } catch { return false; }
}

module.exports = antistickerCommand;
module.exports.handleAntisticker = handleAntisticker;
