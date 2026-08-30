const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';

const channelInfo = {
    forwardingScore: 1, isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363427860148318@newsletter',
        newsletterName: 'IBSACKO™', serverMessageId: -1
    }
};

async function codeaiCommand(sock, chatId, senderId, args, message) {
    const prompt = args.join(' ').trim();

    if (!prompt) {
        return await sock.sendMessage(chatId, {
            text: `╔═════════════════════╗\n║   🥷 *𝗜𝗧𝗔𝗖𝗛𝗜-𝗫𝗠𝗗-𝐕2* 🥷   ║\n╚═════════════════════╝\n\n💻 *Usage :* .codeai <demande>\n💡 _Exemple : .codeai crée une fonction Python qui trie une liste_`,
            contextInfo: channelInfo
        }, { quoted: message });
    }

    await sock.sendMessage(chatId, { react: { text: '💻', key: message.key } });

    const sysPrompt = "Tu es un expert développeur. Génère du code propre, commenté et fonctionnel. Réponds avec le code et une courte explication.";

    let result = null;
    try {
        const r = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'openai/gpt-oss-120b',
                messages: [
                    { role: 'system', content: sysPrompt },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.5,
                max_tokens: 1200
            },
            { headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 25000 }
        );
        result = r.data?.choices?.[0]?.message?.content?.trim() || null;
    } catch (e) {
        console.error('❌ [codeai] Groq:', e.response?.data?.error?.message || e.message);
    }

    if (!result) {
        return await sock.sendMessage(chatId, {
            text: `❌ *L'IA Code est temporairement indisponible.*\n_Réessaie dans quelques instants._`,
            contextInfo: channelInfo
        }, { quoted: message });
    }

    const maxLen = 3500;
    const text = result.length > maxLen ? result.substring(0, maxLen) + '\n_[Tronqué]_' : result;

    await sock.sendMessage(chatId, {
        text: `╔═════════════════════╗\n║   🥷 *𝗜𝗧𝗔𝗖𝗛𝗜-𝗫𝗠𝗗-𝐕2* 🥷   ║\n╚═════════════════════╝\n\n💻 *Code pour :* ${prompt}\n\n${text}\n\n> _Propulsé par 🥷 *IBSACKO™*_`,
        contextInfo: channelInfo
    }, { quoted: message });
    await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
}

module.exports = codeaiCommand;
