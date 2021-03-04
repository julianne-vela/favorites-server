const client = require('../lib/client');
const { getEmoji } = require('../lib/emoji.js');

// async/await needs to run in a function
run();

async function run() {
	try {
		// initiate connecting to db
		await client.connect();

		// run a query to create tables
		await client.query(`
                CREATE TABLE users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(256) NOT NULL,
                    hash VARCHAR(512) NOT NULL
                );           
                CREATE TABLE bookmarks (
                    id SERIAL PRIMARY KEY NOT NULL,
                    article_id VARCHAR(512) NOT NULL,
                    title VARCHAR(512) NOT NULL,
                    url VARCHAR(512) NOT NULL,
                    image VARCHAR(512) NOT NULL,
                    news_site VARCHAR(512) NOT NULL,
                    summary VARCHAR(1000) NOT NULL,
                    published VARCHAR(512) NOT NULL,
                    updated VARCHAR(512) NOT NULL,
                    bookmarked BOOLEAN NOT NULL,
                    linksEventLaunch BOOLEAN NOT NULL,
                    user_id INTEGER NOT NULL REFERENCES users(id)
            );
        `);

		console.log(
			'create tables complete',
			getEmoji(),
			getEmoji(),
			getEmoji()
		);
	} catch (err) {
		// problem? let's see the error...
		console.log(err);
	} finally {
		// success or failure, need to close the db connection
		client.end();
	}
}
