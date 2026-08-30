// lovable.js — ITACHI-XMD-V2
const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';

const channelInfo = {
    forwardingScore: 1, isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363427860148318@newsletter',
        newsletterName: 'IBSACKO™', serverMessageId: -1
    }
};

async function lovableCommand(sock, chatId, message, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(chatId, {
        text: '❌ Usage: .lovable <description>\nEx: .lovable crée une landing page moderne',
        contextInfo: channelInfo
    }, { quoted: message });

    try {
        await sock.sendMessage(chatId, { react: { text: '🎨', key: message.key } });
        await sock.sendMessage(chatId, { text: '🎨 Lovable AI génère ton interface...' }, { quoted: message });

        const prompt = `Tu es un expert UI/UX et développeur web moderne. Génère un prompt Lovable.dev détaillé et professionnel pour créer: ${query}. Inclus le style, les couleurs, les composants, et la structure.`;
        let answer = null;

        try {
            const r = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: 'openai/gpt-oss-120b',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7,
                    max_tokens: 900
                },
                { headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 20000 }
            );
            answer = r.data?.choices?.[0]?.message?.content?.trim() || null;
        } catch (e) {
            console.error('❌ [lovable] Groq:', e.response?.data?.error?.message || e.message);
        }

        if (!answer) {
            return await sock.sendMessage(chatId, {
                text: `❌ *Lovable AI est temporairement indisponible.*\n_Réessaie dans quelques instants._`,
                contextInfo: channelInfo
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            image: { url: 'https://i.ibb.co/xSScX4bP/file-0000000060a471fd918d46d4c7c69a21.png' },
            caption: `🎨 *LOVABLE AI — ITACHI-XMD*\n\n📋 *Projet :* ${query}\n\n${answer}\n\n💡 Colle ce prompt sur lovable.dev\n\n> 🥷 IBSACKO™ · CENTRAL-HEX`,
            contextInfo: channelInfo
        }, { quoted: message });
        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

    } catch (e) {
        await sock.sendMessage(chatId, { text: `❌ Erreur Lovable: ${e.message}`, contextInfo: channelInfo }, { quoted: message });
    }
}
module.exports = lovableCommand;
