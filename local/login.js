// ----------------------------------------------------------------------------------//
// Login Bot Lambda Function
// Charlie (( BETA v2.1 ))
// CRKS | July 13, 2018 | Updated: August 9, 2018
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
  // local testing...
  // let data = {
  //   user: 'catherine__roy',
  //   pass: 'Kayegan'
  // }

  //data etc.
  let data = {}
  data = JSON.parse(event.body)

  const user = data.user
  const pass = data.pass
  let success = false
  let message = 'No response set!'

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
    await page.goto('https://instagram.com/accounts/login')
    await page.waitFor(rand(200,1000))

    // Type in login credentials
    await page.waitForSelector('input[name=username]')
    await page.type('input[name=username]', user)
    await page.type('input[name=password]', pass)
    await page.waitFor(rand(1200,1500))

    // press enter
    page.keyboard.press('Enter')
    await page.waitFor(rand(1500,3000))

    // recieve alerts
    let errors = [
      {
        check: await page.$x("//h2[contains(text(), 'Login')]"),
        title: 'UA'
      },
      {
        check: await page.$x("//p[contains(text(), 'Sorry')]"),
        title: 'WP'
      },
      {
        check: await page.$x("//h4[contains(text(), 'Incorrect')]"),
        title: 'WP'
      },
      {
        check: await page.$x("//h3[contains(text(), 'Incorrect')]"),
        title: 'WP'
      },
      {
        check: await page.$x("//h2[contains(text(), 'Incorrect')]"),
        title: 'WP'
      },
      {
        check: await page.$x("//h1[contains(text(), 'Incorrect')]"),
        title: 'WP'
      },
      {
        check: await page.$x("//h4[contains(text(), 'Forgot')]"),
        title: 'WP'
      },
      {
        check: await page.$x("//h3[contains(text(), 'Forgot')]"),
        title: 'WP'
      },
      {
        check: await page.$x("//h2[contains(text(), 'Forgot')]"),
        title: 'WP'
      }
    ]

    await Promise.all(errors.map((error) => {
      if (error.check.length) {
        console.log(error.title)
        message = error.title
      }
    }))

    // Check to see if login was successful
    let logins = [
      await page.$x("//button[contains(text(), 'Save Info')]"),
      await page.$x("//h1[contains(text(), 'Get')]"),
      await page.$x("//a[contains(@href, '/explore/')]"),
    ]
    await Promise.all(logins.map((login) => {
      login.length ? success = true : null
    }))
    await page.waitFor(rand(1000,2000))

    // if success, send info
    if (success) {
      console.log('Sucessful login!')
      let cookie = await page.cookies()

      const data = {
        username: user,
        send: {
          cookie: JSON.stringify(cookie),
          loggedIn: true,
          enabled: true
        }
      }

      await request.post(API.update, { json: data }, (err, res, body) => {
        if (!err && res.statusCode == 200) {
            console.log(body)
            message = body
        } else {
          console.log(err)
        }
      })

      const analyticsData = {
        username: user,
        cookie: JSON.stringify(cookie)
      }

      await request.post(API.analytics, { json: analyticsData }, (err, res, body) => {
        if (!err && res.statusCode == 200) {
            console.log(body)
        } else {
          console.log(err)
        }
      })

      await page.waitFor(rand(200,1000))
    } else {
      console.log(`::LOGIN FAILED:: - ${data.user}`)
    }

    //close browser
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

  // respond to browser request
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

//local testing...
//module.exports.handler()
