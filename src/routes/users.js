import { Router } from 'express';
import User from '../models/User';
import parseErrors from '../utils/parseErrors';
import { sendConfirmationEmail } from '../mailer';

const router = Router();

router.post('/', (req, res) => {
	const { email, password } = req.body.credentials;
	const user = new User({ email, password });
	user
		.save()
		.then(userRecord => {
			sendConfirmationEmail(userRecord);
			return res.json({ user: userRecord.toAuthJson() });
		})
		.catch(err => res.status(400).json({ errors: parseErrors(err.errors) }));
});

export default router;
