// ----------------------------------------------------------------------------------//
// Scrape Bot Lambda Function
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
  let data = {
  target : 'davidsdoom',
  username : 'davidsdoom',
  cookie : '[{"name":"urlgen","value":"\"{\\\"52.14.199.165\\\": 16509}:1fsggt:UWEZPN1Zq1-0T-SHiWkWs4GAxpA\"","domain":".instagram.com","path":"/","expires":-1,"size":69,"httpOnly":false,"secure":false,"session":true},{"name":"sessionid","value":"IGSC260b3a0ef99640cc358ece320de93f2a0c61b07b1c954735989e3630da1c9e35%3A19Vp1jGPcVite2ubTpkK2Vh2ld57voxh%3A%7B%22_auth_user_id%22%3A1758605%2C%22_auth_user_backend%22%3A%22accounts.backends.CaseInsensitiveModelBackend%22%2C%22_auth_user_hash%22%3A%22%22%2C%22_platform%22%3A4%2C%22_token_ver%22%3A2%2C%22_token%22%3A%221758605%3AvT8elmkDDDdxEjfFzXCqeLFIJ17VEU20%3A8f8866b04bd91eefbade49523c9854fc4d2b467ea5d6bfc251bffb2655a53083%22%2C%22last_refreshed%22%3A1534996425.4855508804%7D","domain":".instagram.com","path":"/","expires":1542772425.513602,"size":489,"httpOnly":true,"secure":true,"session":false},{"name":"csrftoken","value":"bePUDdUTtUssTGzIe1GRTanWOsrlY9qD","domain":"www.instagram.com","path":"/","expires":1566446027.480184,"size":41,"httpOnly":false,"secure":true,"session":false},{"name":"rur","value":"FRC","domain":".instagram.com","path":"/","expires":-1,"size":6,"httpOnly":false,"secure":false,"session":true},{"name":"mcd","value":"3","domain":".instagram.com","path":"/","expires":1850356420.825186,"size":4,"httpOnly":false,"secure":false,"session":false},{"name":"ds_user_id","value":"1758605","domain":".instagram.com","path":"/","expires":1542772427.48016,"size":17,"httpOnly":false,"secure":false,"session":false},{"name":"shbts","value":"1534996427.4575455","domain":".instagram.com","path":"/","expires":1535601227.480142,"size":23,"httpOnly":false,"secure":false,"session":false},{"name":"csrftoken","value":"bePUDdUTtUssTGzIe1GRTanWOsrlY9qD","domain":".instagram.com","path":"/","expires":1566446025.661174,"size":41,"httpOnly":false,"secure":true,"session":false},{"name":"shbid","value":"10665","domain":".instagram.com","path":"/","expires":1535601227.480116,"size":10,"httpOnly":false,"secure":false,"session":false},{"name":"mid","value":"W34vxAAAAAHa4K9Liqne7sZDVkLq","domain":".instagram.com","path":"/","expires":1850356420.970172,"size":31,"httpOnly":false,"secure":false,"session":false}]'
}

  // let data = {}
  // data = JSON.parse(event.body)

  // Global Variables
  const SCROLLCOUNT = 300 // (300) ---------------------------------------------------------- LOWER FOR TESTING PURPOSES ----------------------------- !!
  const target = data.target
  const username = data.username
  const cookies = JSON.parse('[' + data.cookie.substring(data.cookie.indexOf('},') + 2))
  let success = false
  let message = 'No response set!'

  const URI = meta.api.accounts
  const STAGE = meta.stage

  const API = {
    addfollows:    `${URI}${STAGE}/addfollows`,
    update:        `${URI}${STAGE}/update`
  }

  try {
    // local testing...
    const browser = await puppeteer.launch({
      headless: false
    })

    // const chrome = await getChrome();
    // const browser = await puppeteer.connect({
    //   browserWSEndpoint: chrome.endpoint
    // });
    const page = await browser.newPage(); // and we go...

    // const userAgent = 'Mozilla/5.0 (iPhone CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML like Gecko) CriOS/30.0.1599.16 Mobile/11A465 Safari/8536.25'
    // page.setUserAgent(userAgent)

    await page.setCookie(...cookies)
    await page.goto('https://instagram.com/')
    await page.waitFor(rand(200,1000))

    // BEGIN SCRAPE SCRIPT ------------------------------------------------------------------------------------------------------------- //

    // click followers link
    // for (let i = 0; i < 6; i++) {
    //   await page.keyboard.press('Tab')
    //   await page.waitFor(rand(200,500))
    // }
    // page.keyboard.press('Enter')
    // await page.waitFor(rand(500,100))

    // start scrolling
    // let list = []
    // for (let i = 0; i < SCROLLCOUNT; i++) {
    //   try {
    //     list = await page.$$('li')
    //     console.log('Scrolling... [' + list.length + ']')
    //     await list[list.length - 1].hover()
    //     await page.waitFor(rand(20,300))
    //   }
    //   catch (err) {
    //     console.log('.... ....')
    //     console.log(err)
    //   }
    // }

    // tab scroll
    // for (let i = 0; i < 16650; i++) {
    //   await page.keyboard.press('Tab')
    //   await page.waitFor(rand(1,5))
    // }

    await page.waitFor(300000)

    let accounts = await page.$$eval('a[href]', aTags => aTags.map(a => a.href.slice(26, a.href.length - 1)));
    accounts = accounts.slice(accounts.indexOf(username) + 1)

    // remove duplicates
    accounts = accounts.filter((item, pos, ary) => { return !pos || item != ary[pos - 1] })
    console.log('Accounts found: ' + accounts.length)

    if (accounts.length > 0) {
      const send = {
        username: data.username,
        parent: data.target,
        accounts: accounts
      }

      request.post(API.addfollows, { json: send }, (err, res, body) => {
        if (!err && res.statusCode == 200) {
            console.log(body)
            message = body
        }
      })
    }

    const updateData = {
      username: username,
      send: {
        scrape: false
      }
    }

    request.post(API.update, { json: updateData }, (err, res, body) => {
      if (!err && res.statusCode == 200) {
          console.log(body)
      } else {
        console.log(err)
      }
    })

    await page.waitFor(rand(1000,2000))

    // END SCRAPE SCRIPT ------------------------------------------------------------------------------------------------------------- //

    await browser.close();
    // setTimeout(() => chrome.instance.kill(), 0);

    // clean up bull shit
    // const files = glob.sync('/tmp/core.headless-chromi.*')
    // await Promise.all(files.map(file => fs.unlinkSync(file)))
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

  //respond to browser request
  // const response = {
  //   statusCode: 200,
  //   headers: {
  //     "Access-Control-Allow-Origin" : "*" // Required for CORS support to work
  //   },
  //   body: JSON.stringify({
  //     message: message
  //   }),
  // }
  // callback(null, response)
}

module.exports.handler()
