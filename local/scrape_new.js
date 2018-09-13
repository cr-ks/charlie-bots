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
  target : 'timmysneaks',
  username : 'davidsdoom',
  cookie : `[{"name":"urlgen","value":"\"{\\\"18.216.219.79\\\": 16509}:1fsoBQ:UFzVTYjn99ntUBMsXMXmoCcD6OA\"","domain":".instagram.com","path":"/","expires":-1,"size":69,"httpOnly":false,"secure":false,"session":true},{"name":"sessionid","value":"IGSC49c6686e763cf7cc9cc4184ab385f0f8bda37a5a1b62ccf0b1639427f1efd070%3AWcO7G4XX5Tzyy8Euo0wVX8cIFysMn9BQ%3A%7B%22_auth_user_id%22%3A6191888397%2C%22_auth_user_backend%22%3A%22accounts.backends.CaseInsensitiveModelBackend%22%2C%22_auth_user_hash%22%3A%22%22%2C%22_platform%22%3A4%2C%22_token_ver%22%3A2%2C%22_token%22%3A%226191888397%3Ac1j0s7raS9wbirUOVP1dEXQ4KUwBhUx1%3Ac5ad77a43adfc7a1925127fc357caab3d4c5752004cfc08c9c4244cb18887713%22%2C%22last_refreshed%22%3A1535025226.2940578461%7D","domain":".instagram.com","path":"/","expires":1542801226.326095,"size":495,"httpOnly":true,"secure":true,"session":false},{"name":"csrftoken","value":"AQNE19kb6EffPTqkxkVueiF0Bg5ITQGm","domain":"www.instagram.com","path":"/","expires":1566474828.4635,"size":41,"httpOnly":false,"secure":true,"session":false},{"name":"rur","value":"FTW","domain":".instagram.com","path":"/","expires":-1,"size":6,"httpOnly":false,"secure":false,"session":true},{"name":"mcd","value":"3","domain":".instagram.com","path":"/","expires":1850385220.952176,"size":4,"httpOnly":false,"secure":false,"session":false},{"name":"ds_user_id","value":"6191888397","domain":".instagram.com","path":"/","expires":1542801228.463479,"size":20,"httpOnly":false,"secure":false,"session":false},{"name":"shbts","value":"1535025228.4278255","domain":".instagram.com","path":"/","expires":1535630028.463461,"size":23,"httpOnly":false,"secure":false,"session":false},{"name":"csrftoken","value":"AQNE19kb6EffPTqkxkVueiF0Bg5ITQGm","domain":".instagram.com","path":"/","expires":1566474826.655388,"size":41,"httpOnly":false,"secure":true,"session":false},{"name":"shbid","value":"4097","domain":".instagram.com","path":"/","expires":1535630028.46344,"size":9,"httpOnly":false,"secure":false,"session":false},{"name":"mid","value":"W36gRQAAAAERTODV135ofXK7Cvqm","domain":".instagram.com","path":"/","expires":1850385221.196479,"size":31,"httpOnly":false,"secure":false,"session":false}]`
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
    const userAgent = 'Mozilla/5.0 (iPhone CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML like Gecko) CriOS/30.0.1599.16 Mobile/11A465 Safari/8536.25'
    page.setUserAgent(userAgent)
    await page.setCookie(...cookies)

    // BEGIN SCRAPE SCRIPT ------------------------------------------------------------------------------------------------------------- //

    await page.goto('https://instagram.com/' + target)
    await page.waitFor(rand(200,1000))

    let pageContent = JSON.stringify(await page.content())
    pageContent = pageContent.substring(pageContent.indexOf('profilePage_') + 12)
    let targetId = pageContent.substring(0, pageContent.indexOf('"') - 1)
    let followersHash = '56066f031e6239f35a904ac20c9f37d9'

    // const firstQuery = `graphql/query/?query_hash=${followersHash}&variables=%7B%22id%22%3A%${targetId}%22%2C%22include_reel%22%3Afalse%2C%22fetch_mutual%22%3Afalse%2C%22first%22%3A24%7D`
    // const firstQuery = 'graphql/query/?query_hash=' + followersHash + '&variables=%7B%22id%22%3A%' + targetId + '%22%2C%22include_reel%22%3Afalse%2C%22fetch_mutual%22%3Afalse%2C%22first%22%3A24%7D'
    const firstQuery = `https://www.instagram.com/graphql/query/?query_hash=${followersHash}&variables=%7B%22id%22%3A%22${targetId}%22%2C%22include_reel%22%3Afalse%2C%22fetch_mutual%22%3Afalse%2C%22first%22%3A24%7D`
    await page.goto(firstQuery)
    await page.waitFor(rand(20,100))
    pageContent = await page.content()
    pageContent = pageContent.substring(pageContent.indexOf('">') + 2, pageContent.indexOf('</pre>'))
    pageContent = JSON.parse(pageContent)
    // let accounts = pageContent.data.user.edge_followed_by.edges.map(account => account.node.username)
    let accounts = []

    // loop to get all users
    let nextPageHash, secondQuery
    for ( let i = 0; i < 120; i++ ) {
      if (pageContent.hasOwnProperty('data')) {
        pageContent.data.user.edge_followed_by.edges.map(account => {
          accounts.push(account.node.username)
        })
        nextPageHash = pageContent.data.user.edge_followed_by.page_info.end_cursor
        secondQuery = `https://www.instagram.com/graphql/query/?query_hash=${followersHash}&variables=%7B%22id%22%3A%22${targetId}%22%2C%22include_reel%22%3Afalse%2C%22fetch_mutual%22%3Afalse%2C%22first%22%3A12%2C%22after%22%3A%22${nextPageHash}%22%7D`
        await page.goto(secondQuery)
        await page.waitFor(rand(20,100))
        pageContent = await page.content()
        pageContent = pageContent.substring(pageContent.indexOf('">') + 2, pageContent.indexOf('</pre>'))
        pageContent = JSON.parse(pageContent)
      }
    }
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
    const files = glob.sync('/tmp/core.headless-chromi.*')
    await Promise.all(files.map(file => fs.unlinkSync(file)))
    fs.readdirSync('/tmp').forEach(file => {
    // console.log(file);
    })
  }
  catch (err) {
    console.log(err)
    console.log('FAILED - THERE IS SOMETHING WRONG WITH THE SCRIPT!') // change to notification API
    await browser.close();
    setTimeout(() => chrome.instance.kill(), 0);
  }

  //respond to browser request
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin" : "*" // Required for CORS support to work
    },
    body: JSON.stringify({
      message: message
    }),
  }
  callback(null, response)
}

module.exports.handler()
