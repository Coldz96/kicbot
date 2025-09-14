const express = require('express');
const router = express.Router();
const AuthController = require('../../controllers/authController');

const controller = new AuthController();

// Démarrage du flux OAuth
router.get('/login', (req, res) => controller.redirectToKick(req, res));
// Alias historique /auth/kick
router.get('/kick', (req, res) => controller.redirectToKick(req, res));
// Callback de Kick
router.get('/callback', (req, res) => controller.handleCallback(req, res));

// (Optionnel) endpoint de debug pour voir les tokens utilisateur (non sécurisé, à retirer en prod)
router.get('/debug/:userId', (req, res) => {
	const store = require('../../utils/tokenStore');
	const data = store.getUserTokens(req.params.userId);
	if (!data) return res.status(404).json({ error: 'Not found' });
	res.json(data);
});

module.exports = router;