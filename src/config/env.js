require('dotenv').config();

function required(name) {
    return process.env[name];
}

const cfg = {
    KICK_CLIENT_ID: process.env.KICK_CLIENT_ID || process.env.CLIENT_ID || '01JSA1K027ER4RG8GST3E9PZ8M',
    KICK_CLIENT_SECRET: process.env.KICK_CLIENT_SECRET || process.env.CLIENT_SECRET || '7ae85d48259f78fef2db66fd9e9e9fac0a3f8fb7cea57fb6881e5608278cd2b7',
    KICK_REDIRECT_URI: process.env.KICK_REDIRECT_URI || process.env.REDIRECT_URI || 'https://kick.naez.ovh/auth/callback',
    // Format Kick: segments séparés par ':' => ex: user:read chat:write
    KICK_SCOPES: (process.env.KICK_SCOPES || process.env.SCOPES || 'user:read channel:read channel:write chat:write streamkey:read events:subscribe moderation:ban').trim(),
        // Endpoint profil utilisateur (modifiable si la doc évolue)
        KICK_PROFILE_ENDPOINT: process.env.KICK_PROFILE_ENDPOINT || 'https://api.kick.com/v1/users/me',
        PORT: process.env.PORT || 3000,
    //node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
    SESSION_SECRET: process.env.SESSION_SECRET || '1162e39db5cdd7603040b9066c15ec48cd1d4c75880d780bd13190c85ba590fa7f72b12ba107feff84bb51e69560b35b'
};

if (!cfg.KICK_CLIENT_ID) {
    console.warn('[WARN] KICK_CLIENT_ID absent. Définis-le dans ton .env (KICK_CLIENT_ID=...)');
}

module.exports = cfg;