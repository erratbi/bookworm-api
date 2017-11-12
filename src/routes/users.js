import { Router } from 'express';
import User from '../models/User';
import parseErrors from '../utils/parseErrors';

const router = Router();

router.post('/', (req, res) => {
	const { email, password } = req.body.credentials;
	const user = new User({ email });
	user.setPassword(password);
	user
		.save()
		.then(userRecord => res.json({ user: userRecord.toAuthJson() }))
		.catch(err => res.status(400).json({ errors: parseErrors(err.errors) }));
});

export default router;
