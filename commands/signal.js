// commands/signal.js — ITACHI-XMD-V2
// Système de signalement : les utilisateurs peuvent signaler un numéro qui leur envoie
// du contenu pornographique (vidéos/stickers). Une fois un seuil de signalements distincts
// atteint, le bot bloque automatiquement ce numéro (en privé) et le retire des groupes
// où il est présent (si le bot y est admin).

const fs = require('fs');
const path = require('path');

const REPORTS_FILE = path.join(__dirname, '../data/reports.json');
const THRESHOLD = 3; // nombre de signalements distincts avant action automatique

function loadReports() {
    try {
        return JSON.parse(fs.readFileSync(REPORTS_FILE));
    } catch {
        return {};
    }
}

function saveReports(data) {
    const dir = path.dirname(REPORTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(REPORTS_FILE, JSON.stringify(data, null, 2));
}

async function signalCommand(sock, chatId, senderId, mentionedJids, message, args) {
    let target = null;

    const quotedInfo = message.message?.extendedTextMessage?.contextInfo;
    const quotedParticipant = quotedInfo?.participant;

    // 1. Mention prioritaire
    if (mentionedJids && mentionedJids.length > 0) {
        target = mentionedJids[0];
    }
    // 2. Réponse à un message de la personne concernée
    else if (quotedParticipant) {
        target = quotedParticipant;
    }
    // 3. Numéro donné en argument
    else if (args.length > 0) {
        const cleaned = args[args.length - 1].replace(/[^0-9]/g, '');
        if (cleaned.length < 7) {
            return sock.sendMessage(chatId, {
                text: '❌ Numéro invalide.\nExemple : `.signal 224621963059` ou réponds au message concerné avec `.signal`'
            }, { quoted: message });
        }
        target = cleaned + '@s.whatsapp.net';
    }

    if (!target) {
        return sock.sendMessage(chatId, {
            text: '❌ *Utilisation :*\n• Réponds au message concerné avec `.signal`\n• `.signal @mention`\n• `.signal <numéro>`\n\n_Sert à signaler un numéro qui envoie du contenu pornographique (vidéo/sticker) non désiré._'
        }, { quoted: message });
    }

    if (target === senderId) {
        return sock.sendMessage(chatId, { text: '❌ Tu ne peux pas te signaler toi-même.' }, { quoted: message });
    }

    const reports = loadReports();
    if (!reports[target]) reports[target] = { reporters: [], blocked: false };

    if (reports[target].blocked) {
        return sock.sendMessage(chatId, {
            text: `✅ *@${target.split('@')[0]}* a déjà été bloqué suite à des signalements précédents.`,
            mentions: [target]
        }, { quoted: message });
    }

    if (reports[target].reporters.includes(senderId)) {
        return sock.sendMessage(chatId, {
            text: `⚠️ Tu as déjà signalé *@${target.split('@')[0]}*.\nSignalements actuels : ${reports[target].reporters.length}/${THRESHOLD}`,
            mentions: [target]
        }, { quoted: message });
    }

    reports[target].reporters.push(senderId);
    const count = reports[target].reporters.length;

    if (count < THRESHOLD) {
        saveReports(reports);
        return sock.sendMessage(chatId, {
            text: `🚨 *Signalement enregistré contre @${target.split('@')[0]}*\n📊 Signalements : ${count}/${THRESHOLD}\n\n_Après ${THRESHOLD} signalements distincts, ce numéro sera automatiquement bloqué._`,
            mentions: [target]
        }, { quoted: message });
    }

    // ── Seuil atteint : action automatique ──
    reports[target].blocked = true;
    saveReports(reports);

    let actions = [];

    // Bloquer le numéro pour ce bot (effectif dans tous les chats privés)
    try {
        await sock.updateBlockStatus(target, 'block');
        actions.push('bloqué en privé');
    } catch (e) {
        console.error('❌ [signal] blocage échoué:', e.message);
    }

    // Le retirer du groupe actuel si le bot y est admin
    if (chatId.endsWith('@g.us')) {
        try {
            const isAdmin = require('../lib/isAdmin');
            const adminStatus = await isAdmin(sock, chatId, sock.user.id);
            if (adminStatus.isBotAdmin) {
                await sock.groupParticipantsUpdate(chatId, [target], 'remove');
                actions.push('retiré de ce groupe');
            }
        } catch (e) {
            console.error('❌ [signal] kick échoué:', e.message);
        }
    }

    await sock.sendMessage(chatId, {
        text: `🚫 *Numéro bloqué automatiquement*\n\n📞 *@${target.split('@')[0]}*\n📊 ${count} signalements distincts atteints\n✅ Action : ${actions.join(', ') || 'blocage tenté'}`,
        mentions: [target]
    }, { quoted: message });
}

module.exports = signalCommand;
