// locate.js — ITACHI-XMD-V2
// Identifie le pays, l'indicatif, le type de ligne et le(s) fuseau(x)
// horaire(s) d'un numéro de téléphone à partir de son préfixe international.
//
// ⚠️ Important : ceci NE donne PAS une position GPS ou une adresse précise.
// Aucun numéro seul ne permet une géolocalisation en temps réel — c'est une
// identification du pays/opérateur d'attribution uniquement, comme le fait
// n'importe quel annuaire international.

const { parsePhoneNumberFromString } = require('libphonenumber-js');
const moment = require('moment-timezone');

const channelInfo = {
    forwardingScore: 1, isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363427860148318@newsletter',
        newsletterName: 'IBSACKO™', serverMessageId: -1
    }
};

function flagFromISO(iso2) {
    if (!iso2 || iso2.length !== 2) return '🌍';
    const codePoints = [...iso2.toUpperCase()].map(c => 127397 + c.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

function extractRawNumber(args, message) {
    // 1) Numéro mentionné en @tag
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentioned.length > 0) return mentioned[0].split('@')[0];

    // 2) Numéro tiré d'un message cité (reply)
    const quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant;
    if ((!args || args.length === 0) && quotedParticipant) return quotedParticipant.split('@')[0];

    // 3) Numéro écrit en argument texte
    if (args && args.length > 0) return args.join(' ');

    return null;
}

async function locateCommand(sock, chatId, args, message) {
    const raw = extractRawNumber(args, message);

    if (!raw) {
        return sock.sendMessage(chatId, {
            image: { url: 'https://i.ibb.co/xSScX4bP/file-0000000060a471fd918d46d4c7c69a21.png' },
            caption: `╔═══════════════════════╗\n║  🥷 *𝗜𝗧𝗔𝗖𝗛𝗜-𝗫𝗠𝗗 v2.0* 🥷  ║\n╠═══════════════════════╣\n║  📍 *LOCALISATION NUMÉRO*  ║\n╚═══════════════════════╝\n\n💡 *Usage :*\n\`.locate <numéro avec indicatif>\`\n\`.locate\` en citant un message\n\`.locate @numéro\` (mention)\n\n📌 *Exemples :*\n┌──────────────────────\n│ ⬡ .locate +224621963059\n│ ⬡ .locate 224621963059\n└──────────────────────\n\n> _Propulsé par 🥷 IBSACKO™_`,
            contextInfo: channelInfo
        }, { quoted: message });
    }

    let cleaned = raw.trim().replace(/[\s.\-()]/g, '');
    if (!cleaned.startsWith('+')) cleaned = '+' + cleaned;

    const phone = parsePhoneNumberFromString(cleaned);

    if (!phone || !phone.isValid()) {
        return sock.sendMessage(chatId, {
            text: `╔═══════════════════════╗\n║  🥷 *𝗜𝗧𝗔𝗖𝗛𝗜-𝗫𝗠𝗗 v2.0* 🥷  ║\n╚═══════════════════════╝\n\n❌ *Numéro invalide ou non reconnu :*\n${raw}\n\n💡 Écris le numéro avec son indicatif pays (ex: +224621963059).`,
            contextInfo: channelInfo
        }, { quoted: message });
    }

    const country = phone.country || null;
    const flag = flagFromISO(country);
    const countryName = country
        ? (new Intl.DisplayNames(['fr'], { type: 'region' })).of(country)
        : 'Inconnu';
    const type = phone.getType() || 'inconnu';
    const typeMap = {
        'MOBILE': '📱 Mobile',
        'FIXED_LINE': '☎️ Fixe',
        'FIXED_LINE_OR_MOBILE': '📱☎️ Fixe ou Mobile',
        'TOLL_FREE': '🆓 Numéro gratuit',
        'PREMIUM_RATE': '💰 Numéro surtaxé',
        'VOIP': '🌐 VoIP',
        'PERSONAL_NUMBER': '👤 Personnel',
        'PAGER': '📟 Pager',
        'UAN': '🏢 Universal Access Number'
    };

    const zones = country ? moment.tz.zonesForCountry(country) || [] : [];
    let zoneText = 'Non disponible';
    if (zones.length > 0) {
        const shown = zones.slice(0, 4).map(z => {
            const now = moment.tz(z);
            return `${z} (${now.format('HH:mm')})`;
        });
        zoneText = shown.join('\n   ') + (zones.length > 4 ? `\n   …+${zones.length - 4} autre(s)` : '');
    }

    const caption = `╔═══════════════════════╗\n║  🥷 *𝗜𝗧𝗔𝗖𝗛𝗜-𝗫𝗠𝗗 v2.0* 🥷  ║\n╠═══════════════════════╣\n║  📍 *LOCALISATION NUMÉRO*  ║\n╚═══════════════════════╝\n\n📞 *Numéro :* ${phone.formatInternational()}\n${flag} *Pays :* ${countryName} (${country || '?'})\n☎️ *Indicatif :* +${phone.countryCallingCode}\n📱 *Type :* ${typeMap[type] || type}\n✅ *Valide :* ${phone.isValid() ? 'Oui' : 'Non'}\n\n🕐 *Fuseau(x) horaire :*\n   ${zoneText}\n\n⚠️ _Identification du pays d'attribution uniquement — aucune position GPS/adresse précise n'est possible à partir d'un numéro seul._\n\n> _Propulsé par 🥷 IBSACKO™_`;

    await sock.sendMessage(chatId, {
        image: { url: 'https://i.ibb.co/xSScX4bP/file-0000000060a471fd918d46d4c7c69a21.png' },
        caption,
        contextInfo: channelInfo
    }, { quoted: message });
}

module.exports = { locateCommand };
