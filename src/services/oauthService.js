const axios = require('axios');
const fs = require('fs');
const path = require('path');
const usersFilePath = path.join(__dirname, '../../users.json');

const TOKEN_ENDPOINT = 'https://id.kick.com/oauth/token';
const env = require('../config/env');

function formEncode(obj) {
    return Object.entries(obj).map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
}

const oauthService = {
    exchangeAuthorizationCode: async ({ code, codeVerifier }) => {
        const response = await axios.post(
            TOKEN_ENDPOINT,
                    formEncode({
                        grant_type: 'authorization_code',
                        code,
                        redirect_uri: env.KICK_REDIRECT_URI,
                        client_id: env.KICK_CLIENT_ID,
                        client_secret: env.KICK_CLIENT_SECRET,
                        code_verifier: codeVerifier
                    }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        return response.data;
    },
    fetchChannelInfo: async (accessToken) => {
        try {
            const resp = await axios.get('https://api.kick.com/public/v1/channels', {
                headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
                timeout: 7000
            });
            if (!resp?.data?.data || !Array.isArray(resp.data.data) || resp.data.data.length === 0) {
                console.warn('[WARN] Réponse channels inattendue', resp.data);
            }
            return resp.data;
        } catch (e) {
            console.warn('[WARN] Echec récupération channels:', e.response?.status, e.response?.data || e.message);
            return null;
        }
    },
    refreshTokens: async (refreshToken) => {
        const response = await axios.post(
            TOKEN_ENDPOINT,
                    formEncode({
                        grant_type: 'refresh_token',
                        refresh_token: refreshToken,
                        client_id: env.KICK_CLIENT_ID,
                        client_secret: env.KICK_CLIENT_SECRET
                    }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        return response.data;
    },
    saveTokens: (userId, tokens) => {
        let users = {};
        if (fs.existsSync(usersFilePath)) {
            users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8') || '{}');
        }
        users[userId] = tokens;
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    },
    getUserTokens: (userId) => {
        if (!fs.existsSync(usersFilePath)) return null;
        const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8') || '{}');
        return users[userId] || null;
    }
};

module.exports = oauthService;