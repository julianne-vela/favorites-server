const client = require('../lib/client');
// import our seed data:
const bookmarks = require('./bookmarks.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {
	try {
		await client.connect();

		const users = await Promise.all(
			usersData.map((user) => {
				return client.query(
					`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
					[user.email, user.hash]
				);
			})
		);

		const user = users[0].rows[0];

		await Promise.all(
			bookmarks.map(
				({
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
				}) => {
					return client.query(
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
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
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
							user.id,
						]
					);
				}
			)
		);

		console.log(
			'seed data load complete',
			getEmoji(),
			getEmoji(),
			getEmoji()
		);
	} catch (err) {
		console.log(err);
	} finally {
		client.end();
	}
}
