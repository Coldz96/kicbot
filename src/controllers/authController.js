const oauthService = require('../services/oauthService');
const tokenStore = require('../utils/tokenStore');
const { generateCodeVerifier, generateCodeChallenge, generateState } = require('../utils/pkce');
const env = require('../config/env');

class AuthController {
    redirectToKick(req, res) {
        const redirectUri = env.KICK_REDIRECT_URI || `${req.protocol}://${req.get('host')}/auth/callback`;
        const clientId = env.KICK_CLIENT_ID;
        let scopes = (env.KICK_SCOPES || 'user:read')
            .split(/\s+/)
            .map(s => s.replace(/\./g, ':')) // normaliser ancien format user.read -> user:read
            .filter(Boolean);
        // Déduplication simple
        scopes = [...new Set(scopes)];
        const scopeParam = scopes.join(' ');
        if (!clientId) {
            return res.status(500).send('Configuration OAuth incomplète: KICK_CLIENT_ID manquant');
        }
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = generateCodeChallenge(codeVerifier);
        const state = generateState();
        // Stock session
        req.session.oauth = { codeVerifier, state, createdAt: Date.now() };
        const params = new URLSearchParams({
          response_type: 'code',
          client_id: clientId,
          redirect_uri: redirectUri,
          scope: scopeParam,
          code_challenge: codeChallenge,
          code_challenge_method: 'S256',
          state
        });
        const authUrl = `https://id.kick.com/oauth/authorize?${params.toString()}`;
        res.redirect(authUrl);
    }

    async handleCallback(req, res) {
        const { code } = req.query;
        if (!code) return res.status(400).send('Code manquant');
        try {
            if (!req.session.oauth) return res.status(400).send('Session PKCE absente');
            const { state: expectedState, codeVerifier } = req.session.oauth;
            if (req.query.state !== expectedState) return res.status(400).send('State invalide');
            delete req.session.oauth;

            const tokenData = await oauthService.exchangeAuthorizationCode({ code, codeVerifier });
            const channelInfo = await oauthService.fetchChannelInfo(tokenData.access_token);
            const channelSlug = channelInfo?.data?.[0]?.slug;
            const broadcasterId = channelInfo?.data?.[0]?.broadcaster_user_id || tokenData.user_id;
            const userId = channelSlug || (broadcasterId ? String(broadcasterId) : ('user_' + (tokenData.access_token || '').slice(0,8)));
            tokenData.username = channelSlug || null;
            tokenData.channel_slug = channelSlug || null;
            if (channelInfo) tokenData.channel = channelInfo;
            tokenStore.saveUserTokens(userId, tokenData);
            res.sendFile(require('path').join(__dirname, '..', 'views', 'callback.html'));
        } catch (error) {
            console.error('Erreur durant le callback OAuth:', error.response?.data || error.message);
            res.status(500).send('Echec de l\'authentification');
        }
    }
}

module.exports = AuthController;