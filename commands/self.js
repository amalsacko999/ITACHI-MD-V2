// Self → Active le mode privé (bot réservé au propriétaire uniquement)
const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const selfPath = path.join(__dirname, '../data/selfmode.json');
const channelInfo = {
    forwardingScore: 1, isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363427860148318@newsletter',
        newsletterName: 'IBSACKO™', serverMessageId: -1
    }
};

if (!fs.existsSync(selfPath)) fs.writeFileSync(selfPath, JSON.stringify({ enabled: false }));
function getConfig() { try { return JSON.parse(fs.readFileSync(selfPath)); } catch { return { enabled: false }; } }
function saveConfig(d) { fs.writeFileSync(selfPath, JSON.stringify(d, null, 2)); }

async function selfCommand(sock, chatId, senderId, args, message) {
    const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
    if (!isOwner) {
        return await sock.sendMessage(chatId, {
            text: `╔══════════════════════╗\n║   🥷 *𝗜𝗧𝗔𝗖𝗛𝗜-𝗫𝗠𝗗* 🥷   ║\n╚══════════════════════╝\n\n❌ *Réservé au propriétaire !*`,
            contextInfo: channelInfo
        }, { quoted: message });
    }

    const config = getConfig();
    const action = args[0]?.toLowerCase();
    const current = config.enabled ? '🟢 Activé' : '🔴 Désactivé';

    if (!action) {
        return await sock.sendMessage(chatId, {
            image: { url: 'https://i.ibb.co/xSScX4bP/file-0000000060a471fd918d46d4c7c69a21.png' },
            caption: `╔═══════════════════════╗\n║  🥷 *𝗜𝗧𝗔𝗖𝗛𝗜-𝗫𝗠𝗗 v2.0* 🥷  ║\n╠═══════════════════════╣\n║   🔐 *MODE SELF*          ║\n╚═══════════════════════╝\n\n📊 *Statut :* ${current}\n\n📌 *Commandes :*\n┌──────────────────────\n│ ⬡ .self on  → Mode privé\n│ ⬡ .self off → Mode public\n└──────────────────────\n\n🔐 *Fonctionnement :*\n┌──────────────────────\n│ Mode *ON* : Seul le propriétaire\n│ et les sudos peuvent utiliser\n│ les commandes du bot.\n│\n│ Mode *OFF* : Tout le monde\n│ peut utiliser le bot.\n└──────────────────────\n\n> _Propulsé par 🥷 IBSACKO™_`,
            contextInfo: channelInfo
        }, { quoted: message });
    }

    config.enabled = action === 'on';
    saveConfig(config);

    if (action === 'on') {
        return await sock.sendMessage(chatId, {
            image: { url: 'https://i.ibb.co/xSScX4bP/file-0000000060a471fd918d46d4c7c69a21.png' },
            caption: `╔═══════════════════════╗\n║  🥷 *𝗜𝗧𝗔𝗖𝗛𝗜-𝗫𝗠𝗗 v2.0* 🥷  ║\n╠═══════════════════════╣\n║   🔐 *MODE SELF ACTIVÉ*   ║\n╚═══════════════════════╝\n\n🔐 *Self Mode :* 🟢 Activé\n\n┌──────────────────────\n│ ✅ Bot réservé au propriétaire\n│ 🚫 Commandes publiques bloquées\n│ 👑 Seul le proprio & sudos\n│    peuvent utiliser le bot\n└──────────────────────\n\n> _Tape .self off pour désactiver._\n> _Propulsé par 🥷 IBSACKO™_`,
            contextInfo: channelInfo
        }, { quoted: message });
    }

    return await sock.sendMessage(chatId, {
        image: { url: 'https://i.ibb.co/xSScX4bP/file-0000000060a471fd918d46d4c7c69a21.png' },
        caption: `╔═══════════════════════╗\n║  🥷 *𝗜𝗧𝗔𝗖𝗛𝗜-𝗫𝗠𝗗 v2.0* 🥷  ║\n╠═══════════════════════╣\n║   🔓 *MODE PUBLIC*        ║\n╚═══════════════════════╝\n\n🔓 *Self Mode :* 🔴 Désactivé\n\n┌──────────────────────\n│ ✅ Bot accessible à tous\n│ 🌍 Mode public activé\n└──────────────────────\n\n> _Propulsé par 🥷 IBSACKO™_`,
        contextInfo: channelInfo
    }, { quoted: message });
}

module.exports = selfCommand;
module.exports.isSelfMode = () => getConfig().enabled;
