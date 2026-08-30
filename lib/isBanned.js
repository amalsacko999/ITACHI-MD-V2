const fs = require('fs');
const path = require('path');

function isBanned(userId) {
    try {
        const bannedUsers = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'banned.json'), 'utf8'));
        return bannedUsers.includes(userId);
    } catch (error) {
        console.error('Error checking banned status:', error);
        return false;
    }
}

module.exports = { isBanned };
