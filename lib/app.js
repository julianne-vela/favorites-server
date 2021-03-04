const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');
const request = require('superagent');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route.
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
	res.json({
		message: `in this proctected route, we get the user's id like so: ${req.userId}`,
	});
});

// https://test.spaceflightnewsapi.net/api/v2/articles?_limit=25&_contains=rover
// GET ARTICLES FROM SPACEFLIGHTNEWS API - NON-PROTECTED //
app.get('/articles', async (req, res) => {
	try {
		const articles = await request.get(
			'https://test.spaceflightnewsapi.net/api/v2/articles'
		);

		res.json(articles.body);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

// GET USER FAVORITES //
app.get('/api/bookmarks', async (req, res) => {
	try {
		const data = await client.query(
			'SELECT * from bookmarks where user_id=$1',
			[req.userId]
		);

		res.json(data.rows);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

// ADD NEW USER FAVORITE //
app.post('/api/bookmarks', async (req, res) => {
	try {
		const {
			article_id,
			title,
			url,
			image,
			news_site,
			summary,
			published,
			updated,
			bookmarked,
			links_event_launch,
		} = req.body;

		const data = await client.query(
			`
            INSERT INTO bookmarks (
                article_id,
                title,
                url,
                image,
                news_site,
                summary,
                published,
                updated,
                bookmarked,
                links_event_launch,
                user_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *;
            `,
			[
				article_id,
				title,
				url,
				image,
				news_site,
				summary,
				published,
				updated,
				bookmarked,
				links_event_launch,
				req.userId,
			]
		);

		res.json(data.rows[0]);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

// DELETE USER FAVORITE //
app.delete('/api/bookmarks/:id', async (req, res) => {
	try {
		const data = await client.query(
			'DELETE FROM bookmarks where user_id=$1 AND id=$2',
			[req.userId, req.params.id]
		);

		res.json(data.rows[0]);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

app.use(require('./middleware/error'));

module.exports = app;
