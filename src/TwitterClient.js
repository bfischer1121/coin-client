import Client from './Client.js';

class TwitterClient extends Client{}

export default TwitterClient.getClient(TwitterClient, '206.189.186.85', 3011, 3013);