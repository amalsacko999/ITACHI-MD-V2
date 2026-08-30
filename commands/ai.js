const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';

const channelInfo = {
    forwardingScore: 1, isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363427860148318@newsletter',
        newsletterName: 'IBSACKO™', serverMessageId: -1
    }
};

function getPrompt() {
    try {
        const fs = require('fs'), path = require('path');
        const p = path.join(__dirname, '../data/prompt.json');
        return JSON.parse(fs.readFileSync(p)).prompt || "Tu es ITACHI-XMD, assistant WhatsApp créé par IBSACKO. Réponds en français, sois utile et concis.";
    } catch {
        return "Tu es ITACHI-XMD, assistant WhatsApp créé par IBSACKO. Réponds en français, sois utile et concis.";
    }
}

async function aiCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const query = text.split(' ').slice(1).join(' ').trim();

        if (!query) {
            return await sock.sendMessage(chatId, {
                text: `╔═════════════════════╗\n║   🥷 *𝗜𝗧𝗔𝗖𝗛𝗜-𝗫𝗠𝗗-𝐕2* 🥷   ║\n╚═════════════════════╝\n\n🤖 *Usage :* .ai <question>\n💡 _Exemple : .ai C'est quoi Python ?_`,
                contextInfo: channelInfo
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { react: { text: '🤖', key: message.key } });

        const systemPrompt = getPrompt();
        let answer = null;

        try {
            const r = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: 'openai/gpt-oss-120b',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: query }
                    ],
                    temperature: 0.7,
                    max_tokens: 800
                },
                { headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 20000 }
            );
            answer = r.data?.choices?.[0]?.message?.content?.trim() || null;
        } catch (e) {
            console.error('❌ [ai] Groq:', e.response?.data?.error?.message || e.message);
        }

        if (!answer) {
            return await sock.sendMessage(chatId, {
                text: `❌ *L'IA est temporairement indisponible.*\n_Réessayez dans quelques instants._`,
                contextInfo: channelInfo
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            text: `╔═════════════════════╗\n║   🥷 *𝗜𝗧𝗔𝗖𝗛𝗜-𝗫𝗠𝗗-𝐕2* 🥷   ║\n╚═════════════════════╝\n\n❓ *Question :* ${query}\n\n💬 *Réponse :*\n${answer}\n\n> _Propulsé par 🥷 *IBSACKO™*_`,
            contextInfo: channelInfo
        }, { quoted: message });

        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

    } catch (e) {
        console.error('❌ [ai]', e.message);
        await sock.sendMessage(chatId, {
            text: `❌ *L'IA est temporairement indisponible.*\n_Réessaie dans quelques instants._`,
            contextInfo: channelInfo
        }, { quoted: message });
    }
}

module.exports = aiCommand;
