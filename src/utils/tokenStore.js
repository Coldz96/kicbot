const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '../../users.json');

function readTokens() {
    if (!fs.existsSync(usersFilePath)) {
        return {};
    }
    const data = fs.readFileSync(usersFilePath);
    return JSON.parse(data);
}

function writeTokens(tokens) {
    fs.writeFileSync(usersFilePath, JSON.stringify(tokens, null, 2));
}

function saveUserTokens(userId, data) {
    const tokens = readTokens();
    const now = Math.floor(Date.now()/1000);
    const record = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        scope: data.scope,
        token_type: data.token_type,
        expires_in: data.expires_in,
        obtained_at: now,
        expires_at: data.expires_in ? now + data.expires_in : null,
        username: data.username || null,
        channel_slug: data.channel_slug || null,
        profile: data.profile || undefined,
        channel: data.channel || undefined
    };
    tokens[userId] = record;
    writeTokens(tokens);
    return record;
}

function getUserTokens(userId) {
    const tokens = readTokens();
    return tokens[userId] || null;
}

function isExpired(userRecord) {
    if (!userRecord || !userRecord.expires_at) return false;
    return (Math.floor(Date.now()/1000) > (userRecord.expires_at - 30));
}

module.exports = {
    saveUserTokens,
    getUserTokens,
    isExpired
};