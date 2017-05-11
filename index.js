var request = require('request');

var ghUser = 'wet-boew-bot',
  ghPass = process.env.WET_BOT_PASS,
  travisRootUrl = 'https://api.travis-ci.org',
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
    json: true
  }
  tokenId = 'GH_TOKEN'
  tokenMessage = 'Token for Pushing from Travis CI',
  repos = [
    'wet-boew/wet-boew',
    'wet-boew/theme-base',
    'wet-boew/theme-gc-intranet',
    'wet-boew/theme-gcwu-fegc',
    'wet-boew/GCWeb',
    'wet-boew/wet-boew-styleguide'

  ]
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
      method: 'DELETE',
      url: ghAuthOptions.url + '/' + tokenId
    }), function(error, response, body) {
      console.log('Deleted token');
      cb();
    })
  },
  createToken = function() {
    request(Object.assign({}, ghAuthOptions, {
      method: 'POST',
      json: true,
      body: {
        scopes: [
          'repo'
        ],
        note: tokenMessage
      }
    }), function(error, response, token) {
      console.log('Created new token');
      authenticateTravis(token.token);
    });
  },
  authenticateTravis = function() {
    var token = process.env.GH_TOKEN;
    request(Object.assign({}, travisOptions, {
      url: travisRootUrl + '/auth/github',
      method: 'POST',
      body: {
        github_token: token
      }
    }), function(error, response, body) {
      var travisAuth = body.access_token;
      console.log('Authenticated with Travis CI');
      updateCITokens(token, travisAuth);
    });
  },
  getRepoTravisId = function(slug, cb) {
    request(Object.assign({}, travisOptions, {
      url: travisRootUrl + '/repos/' + slug
    }), function(error, response, body) {
      cb(body.repo.id);
    });
  },
  getTravisEnvVarId = function(repoId, travisAuth, cb) {
    var options = Object.assign({}, travisOptions, {
      url: travisRootUrl + '/settings/env_vars?repository_id=' + repoId
    });
    options.headers.Authorization = 'token ' + travisAuth;
    request(options, function(error, response, body) {
      var e, env_var;
      for (e = 0; e < body.env_vars.length; e++) {
        env_var = body.env_vars[e];
        if (env_var.name === "GH_TOKEN") {
          cb(env_var.id);
        }
      }
    });
  },
  updateTravisEnvVar = function(token, repoId, env_var_id, travisAuth, cb) {
    var options = Object.assign({}, travisOptions, {
      url: travisRootUrl + '/settings/env_vars/' + env_var_id + '?repository_id=' + repoId,
      method: "PATCH",
      body: {
        env_var: {
          value: token
        }
      }
    });
    options.headers.Authorization = 'token ' + travisAuth;
    request(options, function(error, response, body) {
      cb();
    });
  },
  updateTravisRepoEnvVar = function(token, repo_slug, env_var, travisAuth) {
    getRepoTravisId(repo_slug, function(repoId){
      getTravisEnvVarId(repoId, travisAuth, function(env_var_id) {
        updateTravisEnvVar(token, repoId, env_var_id, travisAuth, function() {
          console.log("Updated token for repo " + repo_slug);
        });
      });
    });
  },
  updateCITokens = function(token, travisAuth) {
    for (var r = 0; r < repos.length; r++) {
      updateTravisRepoEnvVar(token, repos[r], tokenId, travisAuth);
    }

  };

request(ghAuthOptions, function(error, response, body) {
    checkToken(JSON.parse(body))
  });
