// motmelange.js — ITACHI-XMD-V2
// Jeu du mot mélangé : le bot mélange les lettres d'un mot, les membres
// du groupe répondent avec ".trouve <mot>". Le premier qui trouve gagne.

const channelInfo = {
    forwardingScore: 1, isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363427860148318@newsletter',
        newsletterName: 'IBSACKO™', serverMessageId: -1
    }
};

const WORDS = [
    'voiture', 'ordinateur', 'telephone', 'musique', 'chocolat',
    'football', 'montagne', 'ocean', 'guitare', 'lumiere',
    'jardin', 'voyage', 'cuisine', 'famille', 'bibliotheque',
    'aeroport', 'ordinateur', 'papillon', 'fenetre', 'chateau',
    'dauphin', 'crocodile', 'elephant', 'tortue', 'perroquet',
    'diamant', 'aventure', 'liberte', 'victoire', 'sourire',
    'tambour', 'trompette', 'planete', 'univers', 'satellite',
    'bracelet', 'parapluie', 'chaussure', 'lunettes', 'horloge'
];

const games = {}; // { [chatId]: { word, scrambled, timeout } }

function normalize(str) {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // retire les accents
        .replace(/[^a-z0-9]/g, ''); // retire espaces/ponctuation
}

function scrambleWord(word) {
    let letters = word.split('');
    let scrambled;
    let attempts = 0;
    do {
        scrambled = [...letters].sort(() => Math.random() - 0.5).join('');
        attempts++;
    } while (scrambled === word && attempts < 10);
    return scrambled.toUpperCase();
}

async function startMotMelange(sock, chatId, message) {
    if (games[chatId]) {
        return sock.sendMessage(chatId, {
            text: `⚠️ Une partie est déjà en cours dans ce groupe !\nMot actuel : *${games[chatId].scrambled}*\nRéponds avec \`.trouve <mot>\``,
            contextInfo: channelInfo
        }, { quoted: message });
    }

    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    const scrambled = scrambleWord(word);

    const timeout = setTimeout(async () => {
        if (games[chatId] && games[chatId].word === word) {
            delete games[chatId];
            try {
                await sock.sendMessage(chatId, {
                    text: `⏰ *Temps écoulé !*\n\nPersonne n'a trouvé le mot. C'était : *${word.toUpperCase()}*\n\n_Tape .motmelange pour relancer une partie._`,
                    contextInfo: channelInfo
                });
            } catch { /* chat peut-être fermé, on ignore */ }
        }
    }, 60_000);

    games[chatId] = { word, scrambled, timeout };

    await sock.sendMessage(chatId, {
        image: { url: 'https://i.ibb.co/xSScX4bP/file-0000000060a471fd918d46d4c7c69a21.png' },
        caption: `╔═══════════════════════╗\n║  🥷 *𝗜𝗧𝗔𝗖𝗛𝗜-𝗫𝗠𝗗 v2.0* 🥷  ║\n╠═══════════════════════╣\n║   🔤 *MOT MÉLANGÉ* 🔤    ║\n╚═══════════════════════╝\n\n🧩 *Devine le mot :*\n\n➡️ *${scrambled}* ⬅️\n\n💡 *Réponds avec :*\n\`.trouve <ta réponse>\`\n\n⏱️ _60 secondes pour trouver !_\n\n> _Propulsé par 🥷 IBSACKO™_`,
        contextInfo: channelInfo
    }, { quoted: message });
}

async function checkMotMelange(sock, chatId, senderId, guess, message) {
    const game = games[chatId];

    if (!game) {
        return sock.sendMessage(chatId, {
            text: `❌ Aucune partie en cours. Tape \`.motmelange\` pour commencer !`,
            contextInfo: channelInfo
        }, { quoted: message });
    }

    if (!guess) {
        return sock.sendMessage(chatId, {
            text: `❌ Usage : \`.trouve <ton mot>\``,
            contextInfo: channelInfo
        }, { quoted: message });
    }

    if (normalize(guess) === normalize(game.word)) {
        clearTimeout(game.timeout);
        delete games[chatId];
        return sock.sendMessage(chatId, {
            text: `🎉 *BRAVO !* @${senderId.split('@')[0]} a trouvé le mot !\n\n✅ *Réponse :* ${game.word.toUpperCase()}\n\n_Tape .motmelange pour rejouer !_`,
            mentions: [senderId],
            contextInfo: channelInfo
        }, { quoted: message });
    }

    return sock.sendMessage(chatId, {
        text: `❌ Mauvaise réponse, réessaie !`,
        contextInfo: channelInfo
    }, { quoted: message });
}

module.exports = { startMotMelange, checkMotMelange };
