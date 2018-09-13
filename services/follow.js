// ----------------------------------------------------------------------------------//
// Follow Bot Lambda Function
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

// GLOBALS
const URI = meta.api.accounts
const botsURI = meta.api.bots
const STAGE = meta.stage

const API = {
  update:    `${URI}${STAGE}/update`,
  analytics:    `${botsURI}${STAGE}/analytics`
}

// rand function
function rand(min,max) {
  return Math.floor(Math.random()*(max-min+1)+min)
}

module.exports.handler = async (event, context, callback) => {

  let data = {}
  data = JSON.parse(event.body)

  // Global Variables
  const target = data.target
  const username = data.username
  const cookies = JSON.parse('[' + data.cookie.substring(data.cookie.indexOf('},') + 2))

  console.log(`::FOLLOW:: user: ${username} || target: ${target}`)

  const chrome = await getChrome();
  const browser = await puppeteer.connect({
    browserWSEndpoint: chrome.endpoint
  })

  const page = await browser.newPage()

  const userAgent = 'Mozilla/5.0 (iPhone CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML like Gecko) CriOS/30.0.1599.16 Mobile/11A465 Safari/8536.25'
  page.setUserAgent(userAgent)

  await page.setCookie(...cookies)
  await page.goto('https://instagram.com/' + target, {timeout: 0})
  await page.waitFor(rand(200,1000))

  try {

    // BEGIN FOLLOW SCRIPT ------------------------------------------------------------------------------------------------------------- //

    // follow user
    let text = '';
    while (text !== 'Follow') {
      await page.waitFor(rand(200,500))
      await page.keyboard.press('Tab')
      text = await page.evaluate(() => document.activeElement.innerText)
    }
    page.keyboard.press('Enter')
    await page.waitFor(rand(200,1000))
    const URL = page.url()

    if (URL.includes('login')) {
      console.log(`${data.username} is not logged in. - updating account.`)
      const sendData = {
        username: data.username,
        send: {
          loggedIn: false
        }
      }

      await request.post(API.update, { json: sendData }, (err, res, body) => {
        if (!err && res.statusCode == 200) {
            console.log(body)
        } else {
          console.log(err)
        }
      })
    } else {
      // check if private
      const isPrivate = await page.$x("//h2[contains(text(), 'Private')]")
      const noPosts = await page.$x("//h1[contains(text(), 'No Posts')]")
      if (isPrivate.length > 0 || noPosts.length > 0) {
        console.log('Account is private - not liking photos...')
      } else {
        console.log('liking photos...')
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

  }

  catch (err) {
    console.log(err)
    console.log('FAILED - THERE IS SOMETHING WRONG WITH THE SCRIPT!') // change to notification API
  }

  await page.waitFor(rand(200,1000))
  await browser.close();

  setTimeout(() => chrome.instance.kill(), 1000);

  // clean up bull shit
  // const files = glob.sync('/tmp/core.headless-chromi.*')
  // await Promise.all(files.map(file => fs.unlinkSync(file)))

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
