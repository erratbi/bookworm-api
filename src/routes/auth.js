import { Router } from 'express';
import User from '../models/User';

const router = Router();

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

router.post('/', async (req, res) => {
	const { credentials } = req.body;

	const user = await User.findOne({ email: credentials.email });
	if (!user || !user.isValidPassword(credentials.password))
		return res.status(400).json({ errors: { global: 'Invalid Credentials' } });
	return res.json({ user: user.toAuthJson() });
});

router.post('/confirm', async (req, res) => {
	try {
		const { token } = req.body;
		const user = await User.findOne({ confirmationToken: req.body.token });

		if (!user)
			return res.status(404).json({ error: 'Oops, This token is not valid' });
		else if (user && user.confirmed)
			return res.json({
				success: 'Your email is already confirmed',
				user: user.toAuthJson(),
			});

		user.confirmed = true;
		await user.save();
		return res.json({
			success: 'Your email address has been confirmed',
			user: user.toAuthJson(),
		});
	} catch (err) {
		return res.status(500).json({
			errors: { global: 'An error occured, please try again later...' },
		});
	}
});
export default router;
