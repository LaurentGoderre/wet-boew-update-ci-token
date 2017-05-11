var request = require('request');

var ghUser = 'wet-boew-bot',
  ghPass = process.env.WET_BOT_PASS,
  travisRootUrl = "https://api.travis-ci.org",
  ghAuthOptions = {
    url: 'https://api.github.com/authorizations',
    auth: {
      user: ghUser,
      pass: ghPass
    },
    headers: {
      'User-Agent': 'npm request'
    },
  },
  travisOptions = {
    headers: {
      'User-Agent': 'Travis; npm request',
      'Accept': 'application/vnd.travis-ci.2+json'
    },
  }
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
      console.log("Deleted token");
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
      console.log("Created new token");
      authenticateTravis(token.token);
    });
  },
  authenticateTravis = function(token) {
    request(Object.assign({}, travisOptions, {
      url: travisRootUrl + "/auth/github",
      method: "POST",
      json: true,
      body: {
        github_token: token
      }
    }), function(error, response, body) {
      var travisAuth = body.access_token;
      console.log("Authenticated with Travis CI");
      updateCITokens(token, travisAuth);
    });
  }
  updateCITokens = function(token, travisAUth) {
    console.log("Updating CI with token " + token + "Travis Auth " + travisAUth)
  };

request(ghAuthOptions, function(error, response, body) {
    checkToken(JSON.parse(body))
  });
