import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import Promise from 'bluebird';
import auth from './routes/auth';
import users from './routes/users';
import books from './routes/books';

dotenv.config();
const app = express();

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URL, { useMongoClient: true });

app.use(bodyParser.json());
app.use(cors());

app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/books', books);

app.get('/*', (req, res) => {
	res.send('This is an api service');
});

app.listen(
	process.env.APP_PORT,
	() => console.log(`Server runing on port ${process.env.APP_PORT}`), //eslint-disable-line
);
