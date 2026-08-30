const settings = require('../settings');
const fs = require('fs');
const path = require('path');
const os = require('os');

const channelInfo = {
    forwardingScore: 1, isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363427860148318@newsletter',
        newsletterName: 'IBSACKO™', serverMessageId: -1
    }
};

const MENU_IMAGE = 'https://i.ibb.co/xSScX4bP/file-0000000060a471fd918d46d4c7c69a21.png';

function getCommandDescriptions() {
    try {
        const p = path.join(__dirname, '../data/commandDescriptions.json');
        return JSON.parse(fs.readFileSync(p));
    } catch { return {}; }
}

async function helpDetailCommand(sock, chatId, message, cmdName) {
    const p = settings.prefix || '.';
    const descriptions = getCommandDescriptions();
    const clean = cmdName.toLowerCase().replace(/^\./, '');
    const desc = descriptions[clean];

    if (!desc) {
        return await sock.sendMessage(chatId, {
            text: `❌ *Commande "${clean}" introuvable ou pas encore documentée.*\n\nTape *${p}help* pour voir le menu, ou *${p}allmenu* pour la liste complète.`,
            contextInfo: channelInfo
        }, { quoted: message });
    }

    const text = `╔══✦ *𝗔𝗜𝗗𝗘 · ${clean.toUpperCase()}* ✦═══>
║»🥷 *Commande :* ${p}${clean}
║»🥷 *Rôle :* ${desc}
╚══════════════════>

💡 _Tape ${p}${clean} pour l'utiliser directement._
📋 _Tape ${p}allmenu pour voir toutes les commandes._

> 🥷 _by IBSACKO™ · CENTRAL-HEX_`;

    await sock.sendMessage(chatId, { text, contextInfo: channelInfo }, { quoted: message });
}

function getMenuImage() {
    try {
        const p = path.join(__dirname, '../data/menuimage.json');
        const url = JSON.parse(fs.readFileSync(p)).url;
        return url && url.startsWith('http') ? url : MENU_IMAGE;
    } catch { return MENU_IMAGE; }
}

function getRamBar() {
    const used = process.memoryUsage().rss;
    const total = os.totalmem();
    const pct = Math.round((used / total) * 100);
    const bars = Math.round(pct / 20);
    return '█'.repeat(bars) + '□'.repeat(5 - bars) + ' ' + pct + '%';
}

function getUptime() {
    const s = Math.floor(process.uptime());
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h + 'h ' + m + 'm';
}

async function helpCommand(sock, chatId, message) {
    const p = settings.prefix || '.';

    // ── help <commande> → explication détaillée de cette commande ──
    const rawText = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    const argAfterHelp = rawText.trim().split(/\s+/).slice(1).join(' ').trim();
    if (argAfterHelp) {
        return await helpDetailCommand(sock, chatId, message, argAfterHelp);
    }

    const imageUrl = getMenuImage();

    const helpMessage =
`╔═〔 🥷𝗜𝗧𝗔𝗖𝗛𝗜-𝗫𝗠𝗗-𝗩2 〕═❒
║╭─────────────◆
║│      🇬🇳*❍ 𝗠𝗘𝗡𝗨 ❍*🇬🇳 
║╰─────────────◆
╚══════════════════❒
 👤 𝐈𝐁𝐑𝐀𝐇𝐈𝐌𝐀 𝐒𝐎𝐑𝐘 𝐒𝐀𝐂𝐊𝐎
╔══════════════════🥷
║ ⿻ *ᴘʀᴇғɪx:* [ ${p} ]
║ ⿻ *ᴏᴡɴᴇʀ:* ${settings.botOwner || 'IBSACKO'}
║ ⿻ *ᴍᴏᴅᴇ:* ${settings.commandMode || 'public'}
║ ⿻ *sᴘᴇᴇᴅ:* rapide ⚡
║ ⿻ *ᴜᴘᴛɪᴍᴇ:* ${getUptime()}
║ ⿻ *ʀᴀᴍ:* ${getRamBar()}
║ ⿻ *ᴜsᴀɢᴇ:* v${settings.version || '2.0.0'}
╚══════════════════🥷
 🥷 𝗟𝗜𝗦𝗧𝗘 𝗗𝗘𝗦 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗘𝗦
╔══════════════════🥷
║ ❍ 𝗚𝗘𝗡𝗘𝗥𝗔𝗟-𝗜𝗧𝗔𝗖𝗛𝗜 ❍
║ ⿻ ${p}help → aide du bot
║ ⿻ ${p}menu → afficher le menu
║ ⿻ ${p}allmenu → toutes les cmds
║ ⿻ ${p}ping → vitesse du bot
║ ⿻ ${p}alive → état du bot
║ ⿻ ${p}uptime → temps en ligne
║ ⿻ ${p}tts → texte en audio
║ ⿻ ${p}owner → propriétaire
║ ⿻ ${p}joke → blague
║ ⿻ ${p}quote → citation
║ ⿻ ${p}fact → fait intéressant
║ ⿻ ${p}weather → météo
║ ⿻ ${p}news → actualités
║ ⿻ ${p}journal → journal
║ ⿻ ${p}attp → texte en sticker
║ ⿻ ${p}lyrics → paroles musique
║ ⿻ ${p}8ball → boule magique
║ ⿻ ${p}groupinfo → infos groupe
║ ⿻ ${p}staff → staff du groupe
║ ⿻ ${p}humm → coup d'oeil
║ ⿻ ${p}trt → traduction
║ ⿻ ${p}ss → capture ecran
║ ⿻ ${p}gjid → identifiant groupe
║ ⿻ ${p}url → lien raccourci
║ ⿻ ${p}theme → changer theme
║ ⿻ ${p}test → verifier bot actif
║ ⿻ ${p}info → infos du bot
║ ⿻ ${p}contact → contact proprio
║ ⿻ ${p}loi → regles du groupe
║ ⿻ ${p}restore → restaurer config
║ ⿻ ${p}clan → gerer un clan
╚══════════════════❒

╔══════════════════🥷
║ ❍𝗔𝗗𝗠𝗜𝗡-𝗜𝗧𝗔𝗖𝗛𝗜❍
║ ⿻ ${p}open → ouvrir le groupe
║ ⿻ ${p}close → fermer le groupe
║ ⿻ ${p}ban → bannir membre
║ ⿻ ${p}kick → expulser membre
║ ⿻ ${p}warn → avertir membre
║ ⿻ ${p}signal → signaler un user
║ ⿻ ${p}promote → rendre admin
║ ⿻ ${p}demote → retirer admin
║ ⿻ ${p}mute → muter groupe
║ ⿻ ${p}unmute → demuter groupe
║ ⿻ ${p}delete → supprimer mssg
║ ⿻ ${p}clear → nettoyer chat
║ ⿻ ${p}tagall → mentionner tous
║ ⿻ ${p}tag → tag avec message
║ ⿻ ${p}hidetag → tag cache
║ ⿻ ${p}link → bloquer les liens
║ ⿻ ${p}gjid → id du groupe
║ ⿻ ${p}gstatus → statut groupe
║ ⿻ ${p}welcome → msg bienvenue
║ ⿻ ${p}goodbye → msg au revoir
║ ⿻ ${p}setgname → changer nom
║ ⿻ ${p}setgpp → photo du groupe
║ ⿻ ${p}kickall → expulser tous
║ ⿻ ${p}purge → nettoyer chat
║ ⿻ ${p}approve → approuver mmb
║ ⿻ ${p}totalmembers → total mmb
║ ⿻ ${p}sanction → sanctionner mmb
║ ⿻ ${p}autorecording → simulation 
╚══════════════════❒

╔══════════════════🥷
║ ❍ 𝗣𝗥𝗢𝗧𝗘𝗖𝗧𝗜𝗢𝗡-𝗜𝗧𝗔𝗖𝗛𝗜 ❍
║ ⿻ ${p}antilink → anti-lien
║ ⿻ ${p}antibadword → anti-insultes
║ ⿻ ${p}antibot → bloquer bots
║ ⿻ ${p}antileave → anti-depart
║ ⿻ ${p}antimention → anti-spam
║ ⿻ ${p}antisticker → anti-sticker
║ ⿻ ${p}antitag → anti-tag abusif
║ ⿻ ${p}antimentions → antimention
║ ⿻ ${p}anticall → bloquer appels
║ ⿻ ${p}antidelete → anti-suppression
║ ⿻ ${p}antipurge → anti-purge abusive
║ ⿻ ${p}antimarabout → anti-arnaques
╚══════════════════❒

╔══════════════════🥷
║ ❍ 𝗢𝗪𝗡𝗘𝗥-𝗜𝗧𝗔𝗖𝗛𝗜 ❍
║ ⿻ ${p}self → mode solo
║ ⿻ ${p}mode → public / prive
║ ⿻ ${p}setsudo → ajouter sudo
║ ⿻ ${p}listsudo → lister sudo
║ ⿻ ${p}delsudo → retirer sudo
║ ⿻ ${p}pair → code connexion
║ ⿻ ${p}prompt → comportement IA
║ ⿻ ${p}autoviewstatus → vue statuts
║ ⿻ ${p}autoreactstatus → reagir
║ ⿻ ${p}autostatus → statut auto
║ ⿻ ${p}autoread → lecture auto
║ ⿻ ${p}autotyping → frappe auto
║ ⿻ ${p}clearsession → session
║ ⿻ ${p}cleartmp → vider tmp
║ ⿻ ${p}update → mettre a jour
║ ⿻ ${p}settings → parametres
║ ⿻ ${p}anticall → bloquer appels
║ ⿻ ${p}pmblocker → bloquer mp
║ ⿻ ${p}setpp → photo profil bot
║ ⿻ ${p}setmenuimage → image menu
║ ⿻ ${p}menustyle → style menu
║ ⿻ ${p}autobio → bio automatique
║ ⿻ ${p}maintenance → mode mtc
╚══════════════════❒

╔══════════════════🥷
║ ❍ 𝗘𝗗𝗜𝗧𝗜𝗡𝗚-𝗜𝗧𝗔𝗖𝗛𝗜 ❍
║ ⿻ ${p}sticker → creer sticker
║ ⿻ ${p}stickersearch → chrch stickers
║ ⿻ ${p}toimage → sticker image
║ ⿻ ${p}simage → sticker image
║ ⿻ ${p}take → modifier sticker
║ ⿻ ${p}waouh → capturer media discret
║ ⿻ ${p}image → generer image
║ ⿻ ${p}remini → ameliorer qualite
║ ⿻ ${p}removebg → enlever fond
║ ⿻ ${p}blur → flouter image
║ ⿻ ${p}crop → recadrer image
║ ⿻ ${p}meme → creer meme
║ ⿻ ${p}emojimix → mixer emojis
║ ⿻ ${p}igs → story instagram
║ ⿻ ${p}igsc → commentaires IG
╚══════════════════❒

╔══════════════════🥷
║ ❍ 𝗔𝗜 & 𝗚𝗔𝗠𝗘𝗦-𝗜𝗧𝗔𝗖𝗛𝗜 ❍
║ ⿻ ${p}ai → intelligence IA
║ ⿻ ${p}gpt → ChatGPT
║ ⿻ ${p}gemini → IA Gemini
║ ⿻ ${p}claude → Claude AI
║ ⿻ ${p}deepseek → DeepSeek AI
║ ⿻ ${p}lovable → assistant UI/UX
║ ⿻ ${p}copilot → assistant code
║ ⿻ ${p}codeai → generer code IA
║ ⿻ ${p}imagine → image IA
║ ⿻ ${p}flux → image flux
║ ⿻ ${p}sora → video IA
║ ⿻ ${p}tictactoe → jeu morpion
║ ⿻ ${p}hangman → jeu pendu
║ ⿻ ${p}trivia → quiz culture
║ ⿻ ${p}truth → verite
║ ⿻ ${p}dare → action
║ ⿻ ${p}drague → phrases de drague
╚══════════════════❒

╔══════════════════🥷
║ ❍ 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥-𝗜𝗧𝗔𝗖𝗛𝗜 ❍
║ ⿻ ${p}play → jouer musique
║ ⿻ ${p}song → telecharger musique
║ ⿻ ${p}video → telecharger video
║ ⿻ ${p}spotify → musique spotify
║ ⿻ ${p}instagram → telecharger IG
║ ⿻ ${p}facebook → telecharger FB
║ ⿻ ${p}tiktok → telecharger TikTok
║ ⿻ ${p}lyrics → paroles musique
╚══════════════════❒

╔══════════════════🥷
║ ❍ 𝗧𝗘𝗫𝗧𝗠𝗔𝗞𝗘𝗥-𝗜𝗧𝗔𝗖𝗛𝗜 ❍
║ ⿻ ${p}neon → texte neon
║ ⿻ ${p}glitch → texte glitch
║ ⿻ ${p}fire → texte feu
║ ⿻ ${p}ice → texte glace
║ ⿻ ${p}snow → texte neige
║ ⿻ ${p}matrix → texte matrix
║ ⿻ ${p}hacker → style hacker
║ ⿻ ${p}devil → style demon
║ ⿻ ${p}sand → texte sable
╚══════════════════❒

╔══════════════════🥷
║ ❍ 𝗦𝗬𝗦𝗧𝗘𝗠-𝗜𝗧𝗔𝗖𝗛𝗜 ❍
║ ⿻ ${p}git → info git
║ ⿻ ${p}github → lien github
║ ⿻ ${p}sc → code source
║ ⿻ ${p}repo → depot bot
║ ⿻ ${p}script → script bot
║ ⿻ ${p}meta → infos Meta/WhatsApp
║ ⿻ ${p}footballnews → actus football
║ ⿻ ${p}itachi-info → histoire Itachi
╚═══════════════════❒

🥷══════════════════🥷
    propulsé par *𝗜𝗕𝗦𝗔𝗖𝗞𝗢™*
🥷══════════════════🥷

`;

    try {
        await sock.sendMessage(chatId, {
            image: { url: imageUrl },
            caption: helpMessage,
            contextInfo: channelInfo
        }, { quoted: message });
    } catch (e) {
        console.error('❌ [help]', e.message);
        await sock.sendMessage(chatId, { text: helpMessage }, { quoted: message });
    }
}

module.exports = helpCommand;
