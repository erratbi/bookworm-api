import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sendResetPasswordEmail } from '../mailer';

const router = Router();

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
		const user = await User.findOne({ confirmationToken: token });

		if (!user) return res.status(404).json({ error: 'Oops, This token is not valid' });
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

router.post('/reset_password_request', async (req, res) => {
	const { email } = req.body;
	const user = await User.findOne({ email });
	if (user) {
		sendResetPasswordEmail(user);
		return res.json({});
	}
	return res.status(400).json({ errors: { global: 'There is no user with such email' } });
});

router.post('/verify_token', (req, res) => {
	jwt.verify(req.body.token, process.env.JWT_SECRET, err => {
		if (err) return res.status(400).json({});
		return res.json({});
	});
});

router.post('/reset_password', (req, res) => {
	const { password, token } = req.body.data;
	jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
		if (err) return res.status(400).json({ errors: { global: 'Oops, this token seems to be invalid' } });
		try {
			const user = await User.findById(decoded._id); // eslint-disable-line
			if (user) {
				user.setPassword(password);
				await user.save();
				return res.json({});
			}
			return res.status(404).json({ errors: { global: 'User not found' } });
		} catch (error) {
			return res.status(500).json({ errors: { global: 'Something went wrong ' } });
		}
	});
});

export default router;
