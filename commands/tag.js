const isAdmin = require('../lib/isAdmin');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

const channelInfo = {
    forwardingScore: 1, isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363427860148318@newsletter',
        newsletterName: 'IBSACKO™', serverMessageId: -1
    }
};

async function downloadMedia(msg, type) {
    const stream = await downloadContentFromMessage(msg, type);
    let buf = Buffer.from([]);
    for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
    return buf;
}

async function tagCommand(sock, chatId, senderId, messageText, replyMessage, message) {
    if (!chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, {
            text: `❌ *Uniquement dans les groupes !*`, contextInfo: channelInfo
        }, { quoted: message });
    }

    const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);


    if (!isSenderAdmin) {
        return await sock.sendMessage(chatId, {
            text: `╔══════════════════════╗\n║   🥷 *𝗜𝗧𝗔𝗖𝗛𝗜-𝗫𝗠𝗗* 🥷   ║\n╚══════════════════════╝\n\n🚫 *Cette commande est réservée aux admins !*`,
            contextInfo: channelInfo
        }, { quoted: message });
    }

    const groupMeta = await sock.groupMetadata(chatId);
    const participants = groupMeta.participants;
    const mentions = participants.map(p => p.id);
    const count = participants.length;

    const tagText = messageText || `╔═══════════════════════╗\n║  🥷 *𝗜𝗧𝗔𝗖𝗛𝗜-𝗫𝗠𝗗 v2.0* 🥷  ║\n╠═══════════════════════╣\n║     📢 *ANNONCE*         ║\n╚═══════════════════════╝\n\n👥 *${groupMeta.subject}*\n🔔 *${count} membres tagués*\n\n> _Propulsé par 🥷 IBSACKO™_`;

    try {
        if (replyMessage) {
            if (replyMessage.imageMessage) {
                const buf = await downloadMedia(replyMessage.imageMessage, 'image');
                await sock.sendMessage(chatId, { image: buf, caption: tagText, mentions }, { quoted: message });
            } else if (replyMessage.videoMessage) {
                const buf = await downloadMedia(replyMessage.videoMessage, 'video');
                await sock.sendMessage(chatId, { video: buf, caption: tagText, mentions }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    image: { url: 'https://i.ibb.co/xSScX4bP/file-0000000060a471fd918d46d4c7c69a21.png' },
                    caption: tagText, mentions
                }, { quoted: message });
            }
        } else {
            await sock.sendMessage(chatId, {
                image: { url: 'https://i.ibb.co/xSScX4bP/file-0000000060a471fd918d46d4c7c69a21.png' },
                caption: tagText, mentions,
                contextInfo: channelInfo
            }, { quoted: message });
        }
    } catch (e) {
        console.error('❌ [tag]', e.message);
        await sock.sendMessage(chatId, { text: tagText, mentions }, { quoted: message });
    }
}

module.exports = tagCommand;
