const axios = require('axios');

const channelInfo = {
    forwardingScore: 1, isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363427860148318@newsletter',
        newsletterName: 'IBSACKO™', serverMessageId: -1
    }
};

async function soraCommand(sock, chatId, message) {
    try {
        const rawText = message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            '';

        const used = (rawText || '').split(/\s+/)[0] || '.sora';
        const args = rawText.slice(used.length).trim();
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
        const input = args || quotedText;

        if (!input) {
            await sock.sendMessage(chatId, {
                text: `╔═════════════════════╗\n║   🥷 *𝗜𝗧𝗔𝗖𝗛𝗜-𝗫𝗠𝗗-𝐕2* 🥷   ║\n╚═════════════════════╝\n\n🎬 *Usage :* .sora <description>\n💡 _Exemple : .sora anime girl with short blue hair_`,
                contextInfo: channelInfo
            }, { quoted: message });
            return;
        }

        await sock.sendMessage(chatId, { react: { text: '🎬', key: message.key } });
        await sock.sendMessage(chatId, { text: '🎬 Génération vidéo en cours, patiente (peut prendre 1-2 min)...' }, { quoted: message });

        let videoUrl = null;

        // API 1
        try {
            const { data } = await axios.get(
                `https://okatsu-rolezapiiz.vercel.app/ai/txt2video?text=${encodeURIComponent(input)}`,
                { timeout: 60000, headers: { 'user-agent': 'Mozilla/5.0' } }
            );
            videoUrl = data?.videoUrl || data?.result || data?.data?.videoUrl;
        } catch {}

        // API 2 — GiftedTech
        if (!videoUrl) {
            try {
                const { data } = await axios.get(
                    `https://api.giftedtech.co.ke/api/ai/txt2video?apikey=gifted&text=${encodeURIComponent(input)}`,
                    { timeout: 60000 }
                );
                videoUrl = data?.result || data?.url;
            } catch {}
        }

        if (!videoUrl) {
            return await sock.sendMessage(chatId, {
                text: `❌ *La génération vidéo IA est temporairement indisponible.*\n_C'est une fonctionnalité lourde et les API gratuites sont instables._\n_Réessaie plus tard ou utilise *.imagine* pour des images._`,
                contextInfo: channelInfo
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            video: { url: videoUrl },
            mimetype: 'video/mp4',
            caption: `🎬 *SORA AI — ITACHI-XMD*\n\n📋 *Prompt :* ${input}\n\n> 🥷 IBSACKO™ · CENTRAL-HEX`,
            contextInfo: channelInfo
        }, { quoted: message });
        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

    } catch (error) {
        console.error('[SORA] error:', error?.message || error);
        await sock.sendMessage(chatId, {
            text: '❌ Échec de la génération vidéo. Réessaie avec un autre prompt plus tard.',
            contextInfo: channelInfo
        }, { quoted: message });
    }
}

module.exports = soraCommand;
