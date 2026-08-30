// aura.js — ITACHI-XMD-V2
// "Aura Points" : score d'aura du jour, déterministe (même résultat toute
// la journée pour la même personne, change chaque jour comme un horoscope).
// Aucune dépendance externe — utilise le module natif "crypto" de Node.

const crypto = require('crypto');

const channelInfo = {
    forwardingScore: 1, isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363427860148318@newsletter',
        newsletterName: 'IBSACKO™', serverMessageId: -1
    }
};

const TIERS = [
    { min: -1_000_000, max: -50_000, title: '💀 AURA EN FAILLITE', quotes: [
        "T'as literally donné ton aura à quelqu'un d'autre aujourd'hui.",
        "Même ton ombre te fuit.",
        "Reste chez toi aujourd'hui, sérieux."
    ]},
    { min: -49_999, max: -1, title: '😬 Aura négative', quotes: [
        "Journée compliquée en perspective...",
        "Un café avant de sortir, ça pourrait aider.",
        "Évite les débats aujourd'hui."
    ]},
    { min: 0, max: 9_999, title: '😐 Aura de NPC', quotes: [
        "Journée standard, rien de spécial.",
        "Tu es en mode pilote automatique aujourd'hui.",
        "Pas de quoi se plaindre, pas de quoi se vanter."
    ]},
    { min: 10_000, max: 49_999, title: '🙂 Aura correcte', quotes: [
        "Bonne énergie, continue comme ça.",
        "Petite journée tranquille et positive.",
        "Rien ne peut vraiment te déranger aujourd'hui."
    ]},
    { min: 50_000, max: 149_999, title: '😏 Bonne aura', quotes: [
        "Les gens te remarquent aujourd'hui.",
        "Tu passes une bonne journée, profites-en.",
        "Ton charisme est en hausse."
    ]},
    { min: 150_000, max: 349_999, title: '🔥 Grosse aura', quotes: [
        "Tout ce que tu touches devient stylé aujourd'hui.",
        "Les regards se tournent vers toi.",
        "Journée de boss, ne la gâche pas."
    ]},
    { min: 350_000, max: 599_999, title: '⚡ Aura électrique', quotes: [
        "Tu es sur une autre fréquence aujourd'hui.",
        "Personne ne peut te toucher.",
        "T'as le move parfait pour chaque situation aujourd'hui."
    ]},
    { min: 600_000, max: 849_999, title: '👑 Aura légendaire', quotes: [
        "Ce n'est plus une bonne journée, c'est une légende.",
        "Les autres devraient prendre des notes.",
        "T'es littéralement invincible aujourd'hui."
    ]},
    { min: 850_000, max: 999_999, title: '🐉 Aura de boss final', quotes: [
        "T'es le dernier niveau du jeu aujourd'hui.",
        "Le serveur entier ressent ta présence.",
        "Personne n'ose te défier aujourd'hui."
    ]},
    { min: 1_000_000, max: 9_999_999, title: '🌌 AURA COSMIQUE — RIZZ GOD', quotes: [
        "1% des gens voient ça une fois par an. Aujourd'hui, c'est toi.",
        "Score presque impossible. Achète un ticket de loterie.",
        "Même les autres bots respectent ton aura."
    ]}
];

function hashToInt(str) {
    const hash = crypto.createHash('md5').update(str).digest('hex');
    // Utilise les 8 premiers caractères hex comme entier 32-bit
    return parseInt(hash.slice(0, 8), 16);
}

function getDateKey(offsetDays = 0) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + offsetDays);
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

function computeAura(userId, dateKey) {
    const seed = hashToInt(`${userId}-${dateKey}-aura`);
    // Distribue sur [-100000, 9999999], avec une forte concentration
    // basse (comme un vrai système à paliers rares en haut)
    const roll = seed % 10_000_000; // 0 → 9,999,999
    let score;
    if (roll < 8_500_000) {
        // 85% des cas : entre -100000 et 350000
        score = -100_000 + (roll % 450_000);
    } else if (roll < 9_800_000) {
        // 13% : entre 350000 et 1000000
        score = 350_000 + (roll % 650_000);
    } else {
        // 2% : le jackpot cosmique
        score = 1_000_000 + (roll % 8_999_999);
    }
    return score;
}

function getTier(score) {
    return TIERS.find(t => score >= t.min && score <= t.max) || TIERS[0];
}

function pickQuote(userId, dateKey, quotes) {
    const idx = hashToInt(`${userId}-${dateKey}-quote`) % quotes.length;
    return quotes[idx];
}

function meterBar(score) {
    const min = -100_000, max = 1_500_000; // échelle d'affichage
    const clamped = Math.max(min, Math.min(max, score));
    const pct = (clamped - min) / (max - min);
    const filled = Math.round(pct * 10);
    return '▓'.repeat(filled) + '░'.repeat(10 - filled);
}

function extractTargetId(args, message, senderId) {
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentioned.length > 0) return mentioned[0];

    const quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant;
    if ((!args || args.length === 0) && quotedParticipant) return quotedParticipant;

    return senderId;
}

async function auraCommand(sock, chatId, senderId, args, message) {
    const targetId = extractTargetId(args, message, senderId);
    const targetNumber = targetId.split('@')[0];
    const isSelf = targetId === senderId;

    const today = getDateKey(0);
    const yesterday = getDateKey(-1);

    const scoreToday = computeAura(targetId, today);
    const scoreYesterday = computeAura(targetId, yesterday);

    const tier = getTier(scoreToday);
    const quote = pickQuote(targetId, today, tier.quotes);
    const bar = meterBar(scoreToday);

    let trend;
    if (scoreToday > scoreYesterday + 5000) trend = '📈 En hausse';
    else if (scoreToday < scoreYesterday - 5000) trend = '📉 En baisse';
    else trend = '➡️ Stable';

    const caption = `╔═══════════════════════╗\n║  🥷 *𝗜𝗧𝗔𝗖𝗛𝗜-𝗫𝗠𝗗 v2.0* 🥷  ║\n╠═══════════════════════╣\n║    ✨ *AURA DU JOUR* ✨    ║\n╚═══════════════════════╝\n\n👤 *Cible :* ${isSelf ? 'Toi' : '@' + targetNumber}\n\n${tier.title}\n[${bar}]\n💫 *Score :* ${scoreToday.toLocaleString('fr-FR')} points\n${trend} _(vs hier)_\n\n💬 _"${quote}"_\n\n📅 _Valable jusqu'à minuit — revient demain pour un nouveau score !_\n\n> _Propulsé par 🥷 IBSACKO™_`;

    await sock.sendMessage(chatId, {
        image: { url: 'https://i.ibb.co/xSScX4bP/file-0000000060a471fd918d46d4c7c69a21.png' },
        caption,
        mentions: isSelf ? [] : [targetId],
        contextInfo: channelInfo
    }, { quoted: message });
}

module.exports = { auraCommand };
