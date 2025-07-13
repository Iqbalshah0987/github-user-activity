#!/usr/bin/env node
const args = process.argv.slice(2);
// console.log(args);
const [username] = args;

if (!username) {
    console.error('Usage: github-activity <username>');
    process.exit(1);
}

const https = require('https');
const options = {
    hostname: 'api.github.com',
    path: `/users/${username}/events`,
    method: 'GET',
    headers: {
        'User-Agent': 'nodejs-cli-tool',
        'Accept': 'application/vnd.github.v3+json'
    }
};
const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        const events = JSON.parse(data);

        if (events.length === 0) {
            console.log(`No recent activity found for user: ${username}`);
        }
        events.forEach(event => {
            if (event.type === 'PushEvent') {
                console.log(`- Pushed ${event.payload.size} commits to ${event.repo.name}`);
            } else if (event.type === 'IssuesEvent' && event.payload.action === 'opened') {
                console.log(`- Opened a new issue in ${event.repo.name}`);
            } else if (event.type === 'WatchEvent') {
                console.log(`- Starred ${event.repo.name}`);
            } else {
                console.log(`- ${event.type} in ${event.repo.name}`);
            }
        });


    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});
req.end();