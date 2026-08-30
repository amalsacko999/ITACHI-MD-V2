// mostlikely.js — ITACHI-XMD-V2
// ".plussusceptible" : jeu de groupe "Qui est le plus susceptible de..."
// Choisit au hasard un membre du groupe + une question, et le tague.

const channelInfo = {
    forwardingScore: 1, isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363427860148318@newsletter',
        newsletterName: 'IBSACKO™', serverMessageId: -1
    }
};

const QUESTIONS = [
    "devenir riche du jour au lendemain",
    "disparaître sans prévenir personne",
    "devenir célèbre sur les réseaux",
    "oublier l'anniversaire de son/sa crush",
    "dormir en pleine réunion importante",
    "gagner à la loterie et tout claquer en une semaine",
    "devenir président(e) du pays",
    "survivre seul(e) sur une île déserte",
    "être en retard à son propre mariage",
    "envoyer un message au mauvais destinataire",
    "devenir influenceur/influenceuse",
    "manger un plat piquant sans rien dire",
    "s'endormir en pleine conversation",
    "casser son téléphone en une semaine",
    "devenir un(e) génie de la technologie",
    "partir en voyage sans prévenir",
    "être choisi(e) comme témoin de mariage",
    "gagner un concours de danse",
    "faire le tour du monde en solo",
    "devenir chef cuisinier(ère) professionnel(le)",
    "prendre une décision sur un coup de tête",
    "rester éveillé(e) toute la nuit à discuter",
    "être le/la premier(ère) à trouver l'amour",
    "changer de métier du jour au lendemain",
    "gagner un débat sans aucun argument"
];

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function mostLikelyCommand(sock, chatId, message, isGroup) {
    if (!isGroup) {
        return sock.sendMessage(chatId, {
            text: `❌ Cette commande fonctionne uniquement dans les groupes.`
        }, { quoted: message });
    }

    let groupMetadata;
    try {
        groupMetadata = await sock.groupMetadata(chatId);
    } catch (e) {
        return sock.sendMessage(chatId, {
            text: `❌ Impossible de récupérer les membres du groupe.`
        }, { quoted: message });
    }

    const botId = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
    const candidates = (groupMetadata.participants || [])
        .map(p => p.id)
        .filter(id => id !== botId);

    if (candidates.length === 0) {
        return sock.sendMessage(chatId, {
            text: `❌ Pas assez de membres dans le groupe pour jouer.`
        }, { quoted: message });
    }

    const chosen = pickRandom(candidates);
    const question = pickRandom(QUESTIONS);
    const chosenNumber = chosen.split('@')[0];

    const caption = `╔═══════════════════════╗\n║  🥷 *𝗜𝗧𝗔𝗖𝗛𝗜-𝗫𝗠𝗗 v2.0* 🥷  ║\n╠═══════════════════════╣\n║   🎯 *PLUS SUSCEPTIBLE DE*  ║\n╚═══════════════════════╝\n\n🎯 *Qui est le plus susceptible de ${question} ?*\n\n👉 C'est *@${chosenNumber}* ! 😂\n\n_Tape à nouveau .plussusceptible pour relancer !_\n\n> _Propulsé par 🥷 IBSACKO™_`;

    await sock.sendMessage(chatId, {
        image: { url: 'https://i.ibb.co/xSScX4bP/file-0000000060a471fd918d46d4c7c69a21.png' },
        caption,
        mentions: [chosen],
        contextInfo: channelInfo
    }, { quoted: message });
}

module.exports = { mostLikelyCommand };
