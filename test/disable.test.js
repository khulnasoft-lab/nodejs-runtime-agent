const test = require('tap').test;
const needle = require('needle');
const nock = require('nock');
const sleep = require('sleep-promise');

test('agent can be disabled', async (t) => {
  // intercept potential beacons
  nock('http://localhost:7000')
    .post('/api/v1/beacon')
    .reply(200);

  const BEACON_INTERVAL_MS = 1000; // 1 sec agent beacon interval
  // configure agent in demo server via env vars
  process.env.VULNMAP_HOMEBASE_URL = 'http://localhost:7000/api/v1/beacon';
  process.env.VULNMAP_BEACON_INTERVAL_MS = BEACON_INTERVAL_MS;
  process.env.VULNMAP_RUNTIME_AGENT_DISABLE = 'yes please';
  // 0: let the OS pick a free port
  process.env.PORT = 0;

  // bring up the demo server
  const demoApp = require('../demo');
  const port = demoApp.address().port;

  // wait to let the agent go through a cycle
  await sleep(BEACON_INTERVAL_MS);

  // trigger the vuln method
  await needle.get(`http://localhost:${port}/hello.txt`);

  // wait to let the agent go through a cycle
  await sleep(BEACON_INTERVAL_MS);

  // make sure no beacon calls were made
  t.ok(!nock.isDone(), 'no beacon calls were made');

  delete process.env.VULNMAP_HOMEBASE_URL;
  delete process.env.VULNMAP_BEACON_INTERVAL_MS;
  delete process.env.VULNMAP_RUNTIME_AGENT_DISABLE;
  delete process.env.PORT;

  await new Promise((resolve) => demoApp.close(resolve));
});
