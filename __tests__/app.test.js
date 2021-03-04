require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');
// const bookmarksData = require('../data/bookmarks.js');

describe('app routes', () => {
	describe('routes', () => {
		let token;

		beforeAll(async (done) => {
			execSync('npm run setup-db');

			client.connect();

			const signInData = await fakeRequest(app)
				.post('/auth/signup')
				.send({
					email: 'jon@user.com',
					password: '1234',
				});

			token = signInData.body.token; // eslint-disable-line

			return done();
		});

		afterAll((done) => {
			return client.end(done);
		});

		const newBookmark = {
			article_id: '123afsdafgs544512agsa',
			title: 'This cool new article',
			url: 'https://thiscoolnewurl.com',
			image: 'https://thiscoolnewimageurl.com',
			news_site: 'New cool News Site',
			summary: 'Summary of this new cool article',
			published: '03/02/2021',
			updated: '03/04/2021',
			bookmarked: true,
			links_event_launch: false,
		};

		const dbBookmark = {
			...newBookmark,
			id: 4,
			user_id: 2,
		};

		test('creates a new user and returns with auth token for that user', async () => {
			const newUser = {
				email: 'this@newuser.com',
				password: '123456',
			};

			const signInData = await fakeRequest(app)
				.post('/auth/signup')
				.send(newUser)
				.expect('Content-Type', /json/)
				.expect(200);

			const token = signInData.body.token;

			const dbUser = {
				id: 3,
				email: 'this@newuser.com',
				token: token,
			};

			expect(signInData.body).toEqual(dbUser);
		});

		test('signs in an existing user with given email/password and returns email, id, and token.', async () => {
			const newUser = {
				email: 'that@newuser.com',
				password: '123456',
			};

			const signInData = await fakeRequest(app)
				.post('/auth/signup')
				.send(newUser)
				.expect('Content-Type', /json/)
				.expect(200);

			const token = signInData.body.token;

			const response = await fakeRequest(app)
				.post('/auth/signin')
				.send(newUser)
				.set('Authorization', token)
				.expect('Content-Type', /json/)
				.expect(200);

			const signedInUser = {
				email: 'that@newuser.com',
				id: 4,
				token: token,
			};

			expect(response.body).toEqual(signedInUser);
		});

		test('returns positive connection request (200) from 3rd party API', async () => {
			await fakeRequest(app)
				.get('/articles')
				.expect('Content-Type', /json/)
				.expect(200);
		});

		test('adds a new bookmark for the specified user', async () => {
			const newBookmark = {
				article_id: '123afsdafgs544512agsa',
				title: 'This cool new article',
				url: 'https://thiscoolnewurl.com',
				image: 'https://thiscoolnewimageurl.com',
				news_site: 'New cool News Site',
				summary: 'Summary of this new cool article',
				published: '03/02/2021',
				updated: '03/04/2021',
				bookmarked: true,
				links_event_launch: false,
			};

			const data = await fakeRequest(app)
				.post('/api/bookmarks')
				.send(newBookmark)
				.set('Authorization', token)
				.expect('Content-Type', /json/)
				.expect(200);

			expect(data.body).toEqual(dbBookmark);
		});

		test('returns bookmarks', async () => {
			const expectation = [
				{
					id: 4,
					article_id: '123afsdafgs544512agsa',
					title: 'This cool new article',
					url: 'https://thiscoolnewurl.com',
					image: 'https://thiscoolnewimageurl.com',
					news_site: 'New cool News Site',
					summary: 'Summary of this new cool article',
					published: '03/02/2021',
					updated: '03/04/2021',
					bookmarked: true,
					links_event_launch: false,
					user_id: 2,
				},
			];

			const data = await fakeRequest(app)
				.get('/api/bookmarks')
				.set('Authorization', token)
				.expect('Content-Type', /json/)
				.expect(200);

			expect(data.body).toEqual(expectation);
		});

		test('deletes the bookmark with the associated ID for the specified user', async () => {
			const newBookmarks = '';

			const data = await fakeRequest(app)
				.delete('/api/bookmarks/4')
				.set('Authorization', token)
				.expect('Content-Type', /json/)
				.expect(200);

			expect(data.body).toEqual(newBookmarks);
		});
	});
});
