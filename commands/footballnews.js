// footballnews.js — ITACHI-XMD-V2
// Utilise TheSportsDB (100% gratuit). Clé de test officielle actuelle : "123"
// (l'ancienne clé "3" est périmée et ne fonctionne plus).
// Récupère TOUS les matchs de football du jour, toutes ligues confondues.
const axios = require('axios');

const NEW_IMG = 'https://i.ibb.co/xSScX4bP/file-0000000060a471fd918d46d4c7c69a21.png';
const TSDB_KEY = '123';

async function footballnewsCommand(sock, chatId, message) {
    try {
        await sock.sendMessage(chatId, { text: '⚽ Chargement de tous les matchs du jour...' }, { quoted: message });

        const today = new Date();
        const dateISO = today.toISOString().split('T')[0];
        const dateFR = today.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        // Une seule requête : tous les matchs de foot du jour, toutes ligues/pays confondus
        const r = await axios.get(
            `https://www.thesportsdb.com/api/v1/json/${TSDB_KEY}/eventsday.php`,
            { params: { d: dateISO, s: 'Soccer' }, timeout: 20000 }
        );
        const events = r.data?.events || [];

        const parLigue = {}; // { "Nom de la ligue": { enCours: [], aVenir: [], termines: [] } }

        events.forEach(e => {
            const home = e.strHomeTeam || 'Équipe A';
            const away = e.strAwayTeam || 'Équipe B';
            const scoreH = e.intHomeScore;
            const scoreA = e.intAwayScore;
            const status = e.strStatus || '';
            const time = e.strTime ? e.strTime.slice(0, 5) : '--:--';
            const ligue = e.strLeague || 'Autre compétition';

            const enDirect = ['1H', '2H', 'HT', 'LIVE', 'ET'].includes(status);
            const termine = status === 'Match Finished' || status === 'FT' || (scoreH !== null && scoreA !== null && scoreH !== '' && !enDirect);

            if (!parLigue[ligue]) parLigue[ligue] = { enCours: [], aVenir: [], termines: [] };

            if (enDirect) {
                parLigue[ligue].enCours.push(`🔴 *${home}* ${scoreH ?? 0} - ${scoreA ?? 0} *${away}* (EN DIRECT)`);
            } else if (termine) {
                parLigue[ligue].termines.push(`✅ *${home}* ${scoreH} - ${scoreA} *${away}*`);
            } else {
                parLigue[ligue].aVenir.push(`⚽ *${home}* VS *${away}*  ⏰ ${time}`);
            }
        });

        const ligueNames = Object.keys(parLigue).sort();
        let caption = `⚽ *FOOTBALL NEWS — ITACHI-XMD*\n📅 ${dateFR}\n🌐 Source : TheSportsDB\n🏆 *${ligueNames.length}* compétition(s) · *${events.length}* match(s) au total\n`;
        caption += `\n━━━━━━━━━━━━━━━━━━\n`;

        if (ligueNames.length === 0) {
            caption += `❌ Aucun match trouvé aujourd'hui.\n`;
        } else {
            for (const name of ligueNames) {
                const b = parLigue[name];
                caption += `\n🏆 *${name.toUpperCase()}*\n━━━━━━━━━━━━━━━━━━\n`;
                if (b.enCours.length) caption += b.enCours.join('\n') + '\n';
                if (b.aVenir.length) caption += b.aVenir.join('\n') + '\n';
                if (b.termines.length) caption += b.termines.join('\n') + '\n';
            }
        }

        caption += `\n━━━━━━━━━━━━━━━━━━\n> 🥷 IBSACKO™ · CENTRAL-HEX`;

        // WhatsApp limite les légendes très longues : si trop volumineux, on envoie en texte simple découpé
        if (caption.length > 60000) {
            const chunks = caption.match(/[\s\S]{1,4000}/g) || [caption];
            for (const chunk of chunks) {
                await sock.sendMessage(chatId, { text: chunk }, { quoted: message });
            }
        } else {
            await sock.sendMessage(chatId, {
                image: { url: NEW_IMG },
                caption
            }, { quoted: message });
        }

    } catch (e) {
        await sock.sendMessage(chatId, { text: `❌ Erreur footballnews: ${e.message}` }, { quoted: message });
    }
}

module.exports = footballnewsCommand;
