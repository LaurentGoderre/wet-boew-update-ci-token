var request = require('request');

var ghUser = process.env.WET_BOT_USER,
  ghPass = process.env.WET_BOT_PASS,
  authUri = 'https://api.github.com/authorizations'
  ghAuthOptions = {
    url: authUri,
    headers: {
      'User-Agent': 'request'
    },
    auth: {
      user: ghUser,
      pass: ghPass
    }
  },
  tokenMessage = "Test Token"//""Token for Pushing from Travis CI",
  checkToken = function(tokens) {
    var t, token;

    for (var t = 0; t < tokens.length; t++) {
      token = tokens[t];
      if (token.note === tokenMessage) {
        return deleteToken(token.id, createToken);
      }
    }

    createToken();
  },
  deleteToken = function(tokenId, cb) {
    request(Object.assign({}, ghAuthOptions, {
      method: "DELETE",
      url: ghAuthOptions.url + "/" + tokenId
    }), function(error, response, body) {
      cb();
    })
  },
  createToken = function() {
    request(Object.assign({}, ghAuthOptions, {
      method: "POST",
      json: true,
      body: {
        scopes: [
          "repo"
        ],
        note: tokenMessage
      }
    }), function(error, response, token) {
      updateCITokens(token.token);
    });
  },
  updateCITokens = function(token) {
    console.log("Updating CI with token " + token)
  };

request(ghAuthOptions, function(error, response, body) {
    checkToken(JSON.parse(body))
  });
