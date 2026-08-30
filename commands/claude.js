// claude.js — ITACHI-XMD-V2
const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';

const channelInfo = {
    forwardingScore: 1, isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363427860148318@newsletter',
        newsletterName: 'IBSACKO™', serverMessageId: -1
    }
};

async function claudeCommand(sock, chatId, message, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(chatId, {
        text: '❌ Usage: .claude <question>\nEx: .claude explique javascript',
        contextInfo: channelInfo
    }, { quoted: message });

    try {
        await sock.sendMessage(chatId, { react: { text: '🤖', key: message.key } });
        await sock.sendMessage(chatId, { text: '🤖 Claude AI réfléchit...' }, { quoted: message });

        const sysPrompt = "Tu es Claude, l'assistant IA d'Anthropic. Réponds en français, sois précis et utile.";
        let answer = null;

        try {
            const r = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: 'openai/gpt-oss-120b',
                    messages: [
                        { role: 'system', content: sysPrompt },
                        { role: 'user', content: query }
                    ],
                    temperature: 0.7,
                    max_tokens: 800
                },
                { headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 20000 }
            );
            answer = r.data?.choices?.[0]?.message?.content?.trim() || null;
        } catch (e) {
            console.error('❌ [claude] Groq:', e.response?.data?.error?.message || e.message);
        }

        if (!answer) {
            return await sock.sendMessage(chatId, {
                text: `❌ *Claude AI est temporairement indisponible.*\n_Réessaie dans quelques instants._`,
                contextInfo: channelInfo
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            image: { url: 'https://i.ibb.co/xSScX4bP/file-0000000060a471fd918d46d4c7c69a21.png' },
            caption: `🤖 *CLAUDE AI — ITACHI-XMD*\n\n❓ *Question :* ${query}\n\n💬 *Réponse :*\n${answer}\n\n> 🥷 IBSACKO™ · CENTRAL-HEX`,
            contextInfo: channelInfo
        }, { quoted: message });
        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

    } catch (e) {
        await sock.sendMessage(chatId, { text: `❌ Erreur Claude AI: ${e.message}`, contextInfo: channelInfo }, { quoted: message });
    }
}
module.exports = claudeCommand;
