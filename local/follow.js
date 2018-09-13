// ----------------------------------------------------------------------------------//
// Follow Bot Lambda Function -- FOR LOCAL USE ONLY
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
  target : 'thebillionaires',
  username : 'davidsdoom',
  cookie : `[{"n"sessionid","value":"IGSCdb11761eb4dc4a2b654b89eac38fe9422a5dc872951045037d5d26b6f0a6aee2%3AxsisNXnPDThgEvmT4BosmsXW9cBRYRwt%3A%7B%22_auth_user_id%22%3A3930495765%2C%22_auth_user_backend%22%3A%22accounts.backends.CaseInsensitiveModelBackend%22%2C%22_auth_user_hash%22%3A%22%22%2C%22_platform%22%3A4%2C%22_token_ver%22%3A2%2C%22_token%22%3A%223930495765%3AmnBhX30woj2KAQes71UajmWwZAblhvqW%3A0df01a8d19c51b535e4132d557a9ffa9714fc2e6d2f9a7edb095604b27d88c96%22%2C%22last_refreshed%22%3A1536553760.9834535122%7D","domain":".instagram.com","path":"/","expires":1544329761.022515,"size":495,"httpOnly":true,"secure":true,"session":false},{"name":"csrftoken","value":"jaa0XTFj5DmjYZSxwmlJkq9WohclUU7M","domain":"www.instagram.com","path":"/","expires":1568003362.846756,"size":41,"httpOnly":false,"secure":true,"session":false},{"name":"rur","value":"PRN","domain":".instagram.com","path":"/","expires":-1,"size":6,"httpOnly":false,"secure":false,"session":true},{"name":"mcd","value":"3","domain":".instagram.com","path":"/","expires":1851913758.027246,"size":4,"httpOnly":false,"secure":false,"session":false},{"name":"ds_user_id","value":"3930495765","domain":".instagram.com","path":"/","expires":1544329762.846672,"size":20,"httpOnly":false,"secure":false,"session":false},{"name":"shbts","value":"1536553761.7929401","domain":".instagram.com","path":"/","expires":1537158561.831863,"size":23,"httpOnly":false,"secure":false,"session":false},{"name":"csrftoken","value":"jaa0XTFj5DmjYZSxwmlJkq9WohclUU7M","domain":".instagram.com","path":"/","expires":1568003362.477196,"size":41,"httpOnly":false,"secure":true,"session":false},{"name":"shbid","value":"8972","domain":".instagram.com","path":"/","expires":1537158561.831827,"size":9,"httpOnly":false,"secure":false,"session":false},{"name":"mid","value":"W5XzHgAAAAEuZw2bkMYsocVrUKMD","domain":".instagram.com","path":"/","expires":1851913758.18979,"size":31,"httpOnly":false,"secure":false,"session":false}]`
}

  // let data = {}
  // data = JSON.parse(event.body)

  // Global Variables
  const target = data.target
  const username = data.username
  const cookies = JSON.parse('[' + data.cookie.substring(data.cookie.indexOf('},') + 2))

  try {
    // local testing...
    const browser = await puppeteer.launch({
      headless: false
    })

    // const chrome = await getChrome();
    // const browser = await puppeteer.connect({
    //   browserWSEndpoint: chrome.endpoint
    // })
    const page = await browser.newPage(); // and we go...

    const userAgent = 'Mozilla/5.0 (iPhone CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML like Gecko) CriOS/30.0.1599.16 Mobile/11A465 Safari/8536.25'
    page.setUserAgent(userAgent)

    await page.setCookie(...cookies)
    await page.goto('https://instagram.com/' + target, {timeout: 0})
    await page.waitFor(rand(200,1000))

    // BEGIN FOLLOW SCRIPT ------------------------------------------------------------------------------------------------------------- //

    let text = ''
    while (text !== 'Follow') {
      await page.waitFor(rand(200,500))
      await page.keyboard.press('Tab')
      text = await page.evaluate(() => document.activeElement.innerText)
    }
    page.keyboard.press('Enter')
    await page.waitFor(rand(200,1000))
    const URL = page.url()

    if (URL.includes('login')) {
      console.log(`${data.username} is not logged in.`)
    } else {
      // check if private
      const isPrivate = await page.$x("//h2[contains(text(), 'Private')]")
      const noPosts = await page.$x("//h1[contains(text(), 'No Posts')]")
      if (isPrivate.length > 0 || noPosts.length > 0) {
        console.log('Account is private - not liking photos...')
      } else {
        // console.log(page.url())
        // get images to like
        let images = await page.$$eval('a[href]', aTags => aTags.map(a => a.href));
        images = images.slice(images.indexOf('https://www.instagram.com/' + target + '/tagged/') + 1)
        images = images.slice(0, images.indexOf('https://www.instagram.com/'))

        // like images
        for(let i = 0; i < 5; i++) {
          text = ''
          if (images.length > 0) {
            let index = rand(0, images.length - 1)
            await page.goto(images[index], {timeout: 0})
            await page.waitFor(rand(200,1000))
            // click like
            while (text.indexOf('coreSpriteHeartOpen') < 0) {
              await page.waitFor(rand(200,500))
              await page.keyboard.press('Tab')
              text = await page.evaluate(() => document.activeElement.outerHTML)
            }
            page.keyboard.press('Enter')
            await page.waitFor(rand(200,1000))
            // remove liked image from stack
            images.splice(index, 1)
          }
        }
      }
    }

    // END FOLLOW SCRIPT ------------------------------------------------------------------------------------------------------------- //

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

  // const response = {
  //   statusCode: 200,
  //   headers: {
  //     "Access-Control-Allow-Origin" : "*" // Required for CORS support to work
  //   },
  //   body: JSON.stringify({
  //     message: 'Following account...'
  //   }),
  // }
  // callback(null, response)
}

module.exports.handler()
