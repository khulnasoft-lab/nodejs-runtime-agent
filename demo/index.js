// load the agent from the local project and start it
// env vars provide the configuration with default values as a fallback
require('../lib')({
  baseUrl: process.env.VULNMAP_HOMEBASE_ORIGIN || 'http://localhost:8000',
  projectId: process.env.VULNMAP_PROJECT_ID || 'A3B8ADA9-B726-41E9-BC6B-5169F7F89A0C',
  beaconIntervalMs: process.env.VULNMAP_BEACON_INTERVAL_MS || 10000,
  snapshotIntervalMs: process.env.VULNMAP_SNAPSHOT_INTERVAL_MS || 60 * 60 * 1000,
  enable: !process.env.VULNMAP_RUNTIME_AGENT_DISABLE,
});

// start running some non-vulnerable function in the background
// tests may hook into it to make it look vulnerable
if (process.env.VULNMAP_TRIGGER_EXTRA_VULN) {
  setInterval(() => {
    try {
      st.Mount.prototype.getUrl('whatever');
    } catch (err) {}
  }, 250).unref();
}

// create a server with a known vulnerability
const http = require('http');
const st = require('st');
const ENV_PORT = process.env.PORT;
const PORT = ENV_PORT !== undefined ? ENV_PORT : 3000;

const server = http.createServer(
  st({
    path: __dirname + '/static',
    url: '/',
    cors: true
  })
);

server.listen(PORT, () => console.log(
  `Demo server started, hit http://localhost:${server.address().port}/hello.txt to try it`));

module.exports = server;
