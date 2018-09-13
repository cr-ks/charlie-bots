// ----------------------------------------------------------------------------------//
// Get Chrome Pupeteer Addon // Handler
// Charlie (( BETA v2.1 ))
// CRKS | August 7, 2018 | Updated: August 9, 2018
// ----------------------------------------------------------------------------------//

const launchChrome = require('@serverless-chrome/lambda')
const request = require('superagent')

// chrome build !!
module.exports = async () => {
  const chrome = await launchChrome();

  const response = await request
    .get(`${chrome.url}/json/version`)
    .set("Content-Type", "application/json");

  const endpoint = response.body.webSocketDebuggerUrl;

  return {
    endpoint,
    instance: chrome
  };
};
