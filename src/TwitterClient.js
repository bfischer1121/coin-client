const { Client } = require('./Client.js');

class TwitterClient extends Client{}

exports.TwitterClient = TwitterClient.getClient(TwitterClient, '206.189.186.85', 3011, 3013);