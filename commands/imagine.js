const axios = require('axios');

const channelInfo = {
    forwardingScore: 1, isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363427860148318@newsletter',
        newsletterName: 'IBSACKO™', serverMessageId: -1
    }
};

async function imagineCommand(sock, chatId, message) {
    try {
        const rawText = (
            message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() || ''
        );

        // Extraire le prompt après la commande (peu importe la longueur du préfixe)
        const imagePrompt = rawText.replace(/^[.!\/?*%]?(imagine|flux|dalle)\s*/i, '').trim();

        if (!imagePrompt) {
            return sock.sendMessage(chatId, {
                text: `╔═════════════════════╗\n║   🥷 *𝗜𝗧𝗔𝗖𝗛𝗜-𝗫𝗠𝗗-𝐕2* 🥷   ║\n╚═════════════════════╝\n\n🎨 *Usage :* .imagine <description>\n💡 _Exemple : .imagine un dragon bleu dans les nuages_`,
                contextInfo: channelInfo
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { react: { text: '🎨', key: message.key } });
        await sock.sendMessage(chatId, { text: '🎨 Génération de ton image, patiente...' }, { quoted: message });

        const enhancedPrompt = enhancePrompt(imagePrompt);
        const encoded = encodeURIComponent(enhancedPrompt);

        let imageBuffer = null;

        // API 1 — Pollinations (gratuit, fiable, sans clé)
        try {
            const seed = Math.floor(Math.random() * 1000000);
            const url = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&seed=${seed}&nologo=true`;
            const r = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
            if (r.data && r.data.byteLength > 5000) imageBuffer = Buffer.from(r.data);
        } catch {}

        // API 2 — Siputzx DALL-E (fallback)
        if (!imageBuffer) {
            try {
                const r = await axios.get(`https://api.siputzx.my.id/api/ai/dalle?prompt=${encoded}`, { timeout: 25000 });
                const imgUrl = r.data?.data || r.data?.url;
                if (imgUrl) {
                    const r2 = await axios.get(imgUrl, { responseType: 'arraybuffer', timeout: 20000 });
                    if (r2.data?.byteLength > 5000) imageBuffer = Buffer.from(r2.data);
                }
            } catch {}
        }

        // API 3 — GiftedTech (fallback)
        if (!imageBuffer) {
            try {
                const r = await axios.get(`https://api.giftedtech.co.ke/api/ai/imagine?apikey=gifted&prompt=${encoded}`, { timeout: 25000 });
                const imgUrl = r.data?.result || r.data?.url;
                if (imgUrl) {
                    const r2 = await axios.get(imgUrl, { responseType: 'arraybuffer', timeout: 20000 });
                    if (r2.data?.byteLength > 5000) imageBuffer = Buffer.from(r2.data);
                }
            } catch {}
        }

        if (!imageBuffer) {
            return sock.sendMessage(chatId, {
                text: '❌ Génération échouée. Réessaie dans quelques instants.',
                contextInfo: channelInfo
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: `╔═════════════════════╗\n║   🥷 *𝗜𝗧𝗔𝗖𝗛𝗜-𝗫𝗠𝗗-𝐕2* 🥷   ║\n╚═════════════════════╝\n\n🎨 *Prompt :* ${imagePrompt}\n\n> _Propulsé par 🥷 *IBSACKO™*_`,
            contextInfo: channelInfo
        }, { quoted: message });

        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

    } catch (error) {
        console.error('❌ [imagine]', error.message);
        await sock.sendMessage(chatId, {
            text: '❌ Échec de la génération d\'image. Réessaie plus tard.',
            contextInfo: channelInfo
        }, { quoted: message });
    }
}

function enhancePrompt(prompt) {
    const qualityEnhancers = [
        'high quality', 'detailed', 'masterpiece', 'best quality',
        'ultra realistic', '4k', 'highly detailed',
        'professional photography', 'cinematic lighting', 'sharp focus'
    ];
    const numEnhancers = Math.floor(Math.random() * 2) + 3;
    const selectedEnhancers = qualityEnhancers
        .sort(() => Math.random() - 0.5)
        .slice(0, numEnhancers);
    return `${prompt}, ${selectedEnhancers.join(', ')}`;
}

module.exports = imagineCommand;
