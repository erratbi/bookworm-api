import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import uniqueValidator from 'mongoose-unique-validator';

const schema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			lowercase: true,
			index: true,
			unique: true,
		},
		password: { type: String, required: true },
		confirmed: { type: Boolean, default: false },
		confirmationToken: { type: String, default: '' },
	},
	{ timestamps: true },
);

schema.methods.isValidPassword = function isValidPassword(password) {
	return bcrypt.compareSync(password, this.password);
};

schema.methods.generateJWT = function generateJWT() {
	return jwt.sign({ email: this.email, confirmed: this.confirmed }, process.env.JWT_SECRET);
};

schema.methods.generateResetPasswordLink = function generateResetPasswordLink() {
	return `${process.env.BASE_URL}/reset_password/${this.generateResetPasswordToken()}`;
};

schema.methods.generateResetPasswordToken = function generateResetPasswordToken() {
	return jwt.sign(
		{
			_id: this._id, // eslint-disable-line
		},
		process.env.JWT_SECRET,
		{ expiresIn: '48h' },
	);
};

schema.methods.setConfirmationToken = function setConfirmationToken() {
	this.confirmationToken = this.generateJWT();
};
schema.methods.setPassword = function setPassword(password) {
	this.password = bcrypt.hashSync(password, 10);
};
schema.methods.toAuthJson = function toAuthJson() {
	return {
		email: this.email,
		confirmed: this.confirmed,
		token: this.generateJWT(),
	};
};
schema.methods.generateConfirmationUrl = function generateConfirmationUrl() {
	return `${process.env.BASE_URL}/confirmation/${this.confirmationToken}`;
};
/* eslint-disable */
schema.pre('save', function(next) {
	if (this.isNew) {
		this.setPassword(this.password);
		this.setConfirmationToken();
	}
	next();
});
/* eslint-enable */

schema.plugin(uniqueValidator, { message: 'This email is already taken' });

export default mongoose.model('User', schema);
