const { Client } = require('./Client.js');

class TwitterClient extends Client{}

exports.TwitterClient = TwitterClient.getClient(TwitterClient, 'cryptosecondary.com', 3011, 3013);