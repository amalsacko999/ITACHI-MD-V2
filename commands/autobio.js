// autobio.js — ITACHI-XMD-V2
const settings = require('../settings');
let autobioInterval = null;

async function autobioCommand(sock, chatId, message, args) {
    const arg = args[0]?.toLowerCase();
    if (!arg || !['on', 'off'].includes(arg)) {
        return sock.sendMessage(chatId, { text: '❌ Usage: .autobio on | .autobio off' }, { quoted: message });
    }

    if (arg === 'off') {
        if (autobioInterval) { clearInterval(autobioInterval); autobioInterval = null; }
        return sock.sendMessage(chatId, { text: '❌ AutoBio désactivé.' }, { quoted: message });
    }

    await sock.sendMessage(chatId, { text: '✅ AutoBio activé ! La bio sera mise à jour chaque minute.' }, { quoted: message });

    const updateBio = async () => {
        const now = new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Conakry' });
        const uptime = (() => {
            const s = Math.floor(process.uptime());
            return `${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m`;
        })();
        const bio = `🥷 ${settings.botName || 'ITACHI-XMD'} | En ligne ✅ | Uptime: ${uptime} | ${now} | CENTRAL-HEX 💎`;
        try { await sock.updateProfileStatus(bio); } catch (e) { console.error('AutoBio error:', e.message); }
    };

    await updateBio();
    autobioInterval = setInterval(updateBio, 60 * 1000);
}

module.exports = autobioCommand;
