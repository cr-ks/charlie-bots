// ----------------------------------------------------------------------------------//
// Unfollow Bot Lambda Function
// Charlie (( BETA v2.1 ))
// CRKS | August 1, 2018 | Updated: August 9, 2018
// ----------------------------------------------------------------------------------//

'use strict';

const puppeteer = require('puppeteer')
const request = require('request')
const fs = require('fs')
const glob = require('glob')
const getChrome = require('../import/getChrome.js')

// meta information
const meta = require('../meta.json')

// rand function
function rand(min,max) {
  return Math.floor(Math.random()*(max-min+1)+min)
}

module.exports.handler = async (event, context, callback) => {
  // local testing...
  // let data = {
  // "target" : "insta_berny",
  // "username" : "awaken.fit",
  // "cookie" : "[{\"name\":\"urlgen\",\"value\":\"\\\"{\\\\\\\"time\\\\\\\": 1528919795\\\\054 \\\\\\\"18.188.199.193\\\\\\\": 16509}:1fTBsh:4pm10s4UEyoEHO3jVwHD6Puocbo\\\"\",\"domain\":\".instagram.com\",\"path\":\"\/\",\"expires\":-1,\"size\":95,\"httpOnly\":false,\"secure\":false,\"session\":true},{\"name\":\"sessionid\",\"value\":\"IGSC1bd378e81b680b59aa97927877cb53ae2f6a6d8145b70170beac04d300c79e11%3ADp6GGkBAI9udIUIJN2tP29yKSpcI42CH%3A%7B%22_auth_user_id%22%3A5796449285%2C%22_auth_user_backend%22%3A%22accounts.backends.CaseInsensitiveModelBackend%22%2C%22_auth_user_hash%22%3A%22%22%2C%22_platform%22%3A4%2C%22_token_ver%22%3A2%2C%22_token%22%3A%225796449285%3AJoVf9zDX6dfLMQdZXbG7adloftCXgbcx%3Af822bd304cd54b31d8276f507dba349a0a695962096bb4ceac3f1feef6328e40%22%2C%22last_refreshed%22%3A1528919795.1474869251%7D\",\"domain\":\".instagram.com\",\"path\":\"\/\",\"expires\":1536695795.176597,\"size\":495,\"httpOnly\":true,\"secure\":true,\"session\":false},{\"name\":\"rur\",\"value\":\"ATN\",\"domain\":\".instagram.com\",\"path\":\"\/\",\"expires\":-1,\"size\":6,\"httpOnly\":false,\"secure\":false,\"session\":true},{\"name\":\"mcd\",\"value\":\"3\",\"domain\":\".instagram.com\",\"path\":\"\/\",\"expires\":-1,\"size\":4,\"httpOnly\":false,\"secure\":false,\"session\":true},{\"name\":\"ds_user_id\",\"value\":\"5796449285\",\"domain\":\".instagram.com\",\"path\":\"\/\",\"expires\":1536695795.491189,\"size\":20,\"httpOnly\":false,\"secure\":false,\"session\":false},{\"name\":\"csrftoken\",\"value\":\"ZRaZY8IPQjlnwLevy1wM1Ht1Sm21oLB2\",\"domain\":\".instagram.com\",\"path\":\"\/\",\"expires\":1560369395.491147,\"size\":41,\"httpOnly\":false,\"secure\":true,\"session\":false},{\"name\":\"shbid\",\"value\":\"2882\",\"domain\":\".instagram.com\",\"path\":\"\/\",\"expires\":1529524595.491165,\"size\":9,\"httpOnly\":false,\"secure\":false,\"session\":false},{\"name\":\"mid\",\"value\":\"WyF27gAAAAGlyEY6aDn1A94rUipF\",\"domain\":\".instagram.com\",\"path\":\"\/\",\"expires\":2159639790.663275,\"size\":31,\"httpOnly\":false,\"secure\":false,\"session\":false}]"
  // }

  let data = {}
  data = JSON.parse(event.body)

  // Global Variables
  const target = data.target
  const username = data.username
  const cookies = JSON.parse('[' + data.cookie.substring(data.cookie.indexOf('},') + 2))

  try {
    // local testing...
    // const browser = await puppeteer.launch({
    //   headless: false
    // })

    const chrome = await getChrome();
    const browser = await puppeteer.connect({
      browserWSEndpoint: chrome.endpoint
    })
    const page = await browser.newPage(); // and we go...

    const userAgent = 'Mozilla/5.0 (iPhone CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML like Gecko) CriOS/30.0.1599.16 Mobile/11A465 Safari/8536.25'
    page.setUserAgent(userAgent)

    await page.setCookie(...cookies)
    await page.goto('https://instagram.com/' + target, {timeout: 0})
    await page.waitFor(rand(200,1000))

    // BEGIN UNFOLLOW SCRIPT ------------------------------------------------------------------------------------------------------------- //

    let text = ''
    while ((text !== 'Following') && (text !== 'Requested')) {
      await page.waitFor(rand(200,500))
      await page.keyboard.press('Tab')
      text = await page.evaluate(() => document.activeElement.innerText)
      if (text === 'Follow') {
        break
      }
    }

    if (text !== 'Follow') {
      page.keyboard.press('Enter')
      await page.waitFor(rand(200,1000))

      text = ''
      while (text !== 'Unfollow') {
        await page.waitFor(rand(200,500))
        await page.keyboard.press('Tab')
        text = await page.evaluate(() => document.activeElement.innerText)
      }
      page.keyboard.press('Enter')
    }
    await page.waitFor(rand(200,1000))

    // END UNFOLLOW SCRIPT ------------------------------------------------------------------------------------------------------------- //

    await browser.close();
    setTimeout(() => chrome.instance.kill(), 0);

    // clean up bull shit
    const files = glob.sync('/tmp/core.headless-chromi.*')
    await Promise.all(files.map(file => fs.unlinkSync(file)))
    // fs.readdirSync('/tmp').forEach(file => {
    // console.log(file);
    // })
  }
  catch (err) {
    console.log(err)
    console.log('FAILED - THERE IS SOMETHING WRONG WITH THE SCRIPT!') // change to notification API
    await browser.close();
    setTimeout(() => chrome.instance.kill(), 0);
  }

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin" : "*" // Required for CORS support to work
    },
    body: JSON.stringify({
      message: 'Following account...'
    }),
  }
  callback(null, response)
}

//module.exports.handler()
