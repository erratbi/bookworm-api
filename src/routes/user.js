import { Router } from 'express';
import User from '../models/User';

const router = Router();

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

router.post('/auth', async (req, res) => {
	const { credentials } = req.body;

	const user = await User.findOne({ email: credentials.email });
	if (!user || !user.isValidPassword(credentials.password))
		return res.status(400).json({ errors: { global: 'Invalid Credentials' } });
	return res.json({ user: user.toAuthJson() });
});

export default router;
