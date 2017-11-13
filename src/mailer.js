import nodemailer from 'nodemailer';

const from = '"Bookworm" <support@bookworm.co>';

const setup = () =>
	nodemailer.createTransport({
		host: process.env.EMAIL_HOST,
		port: process.env.EMAIL_PORT,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	});

export const sendConfirmationEmail = user => {
	const transport = setup();
	const email = {
		from,
		to: user.email,
		subject: 'Welcome to bookworm',
		text: `
      Welcome to bookworm. Please confirm your email using the link below.

      ${user.generateConfirmationUrl()}
    `,
	};

	transport.sendMail(email);
};
