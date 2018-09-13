// ----------------------------------------------------------------------------------//
// Mail Lambda Function
// Charlie (( BETA v2.1 ))
// CRKS | August 10, 2018 | Updated: August 13, 2018
// ----------------------------------------------------------------------------------//

const nodemailer = require('nodemailer')

let smtpConfig = {
  name: 'mail.power10k.com',
  host: 'box795.bluehost.com',
  port: 465,
  secure: true,
  auth: {
      user: 'updates@power10k.com',
      pass: ')OK9ij8uh'
  }
}

let transporter = nodemailer.createTransport(smtpConfig)

module.exports.handler = async (event, context, callback) => {

  let data = {}
  data = JSON.parse(event.body)

  // data = {
  //   username: 'davidsdoom',
  //   address: 'davidmichaelandco@gmail.com',
  //   followers: 0,
  //   email: 'trial_1'
  // }

  //GLOBALS
  const username = data.username
  const address = data.address
  const followers = data.followers
  const email = data.email
  //const message = data.message

  console.log(`Sending a(n) ${email} email to: ${address}`)

  const emails = {
    trial_1: {
      subject: `${username}, Your Free INSTAGRAM ACCELERATOR 3-Day Trial`,
      body: `
      <p>Hi There!</p>
      <p>Thank you for signing up for your FREE 3-DAY TRIAL of <a href="https://power10k.com/">Power10K</a> our Instagram Accelerator presented by LRM. We're excited to have you on board.</p>
      <p>Here's what to expect:<br />
      You're going to see (A LOT) of new activity on your Instagram Account<br />
      We're putting together a targeted list of accounts to follow based on the &quot;similar accounts to copy followers&quot; information you provided when you signed up<br />
      We're going to follow those followers on your accounts behalf in efforts that usually 10-20% will follow you back if they like your feed &amp; images<br />
      We will then unfollow the ones that don't follow you back and repeat the process over-and-over...<br />
      Finally, you're going to see a ton of new followers start to come your way everyday. This is what we call Active Outreach<br />
      What happens next:</p>
      <p>At any time, <a href="https://power10k.com/trial-go">use this link to complete your subscription to our service full-time</a>. At the end of your trial, your subscription will be paused until the checkout form is complete and then your service will automatically be turned back on. I'll follow up with an email to check in and remind you. </p>
      <p>I hope you enjoy your service and please let me know if you have any questions.</p>
      <p>Thanks!<br />
      -Hillary</p>
      <p>Ps. The question I get asked most frequently is: will this effect any of my current followers? The answer is: No, this will NOT effect any of the accounts you currently follow. We will also NOT unfollow any accounts you previously followed before starting our service, nor any accounts you manually follow during our services. Woohoo!</p>
      <p><b>Hillary Jones | Client Success Director</b><br />
      Longest Road Media <br />
      Power10K Instagram Accelerator</p>
      (reply here: <a href="mailto:hillary@longestroadmedia.com">hillary@longestroadmedia.com</a>)
        `
    },
    trial_2: {
      subject: `Instagram Trial Completed for ${username} - Continue Your Service`,
      body: `
      <p>Hi Again! </p>
      <p>I hope that you enjoyed your 3-Day Free Trial for our Instagram Accelerator and got a taste of what we can do to help grow your account. I'm letting you know that your trial has come to an end and service has been paused.</p>
      <p><a href="http://power10k.com/trial-go">Use this link to fill out the form to automatically continue your service.</a></p>
      <p>The original price is $95 per month, but we're offering a special 50% off discount so you get to continue your services for only $47 a month. </p>
      <p>Or course let me know if you have any questions, happy to help!</p>
      <p>Thanks!<br />
      -Hillary</p>
      <p><b>Hillary Jones | Client Success Director</b><br />
      Longest Road Media <br />
      Power10K Instagram Accelerator</p>
      (reply here: <a href="mailto:hillary@longestroadmedia.com">hillary@longestroadmedia.com</a>)
      `
    },
    ua: {
      subject: `${username}, Login Issue`,
      body: `
      <p>Hi!</p>
      <p>Just wanted to quickly check in and let you know that our system was unable to login to your account.</p>
      <p>It seems as though you haven't authorized our login via instagram.</p>
      <p>If you didn't see the notification in instagram, feel free to try again by visiting this page: <a href="https://signup.power10k.com">https://signup.power10k.com</a></p>
      <p>Thanks!<br />
      -Hillary</p>
      <p><b>Hillary Jones | Client Success Director</b><br />
      Longest Road Media <br />
      Power10K Instagram Accelerator</p>
      (reply here: <a href="mailto:hillary@longestroadmedia.com">hillary@longestroadmedia.com</a>)
      `
    },
    wp: {
      subject: `${username}, Login Issue`,
      body: `
      <p>Hi!</p>
      <p>Just wanted to quickly check in and let you know that our system was unable to login to your account.</p>
      <p>It seems as though we haven't received your correct password...</p>
      <p>Please try logging in again by visiting this page: <a href="https://signup.power10k.com">https://signup.power10k.com</a></p>
      <p>Thanks!<br />
      -Hillary</p>
      <p><b>Hillary Jones | Client Success Director</b><br />
      Longest Road Media <br />
      Power10K Instagram Accelerator</p>
      (reply here: <a href="mailto:hillary@longestroadmedia.com">hillary@longestroadmedia.com</a>)
      `
    },
    monthly: {
      subject: `${username}, Your Monthly Update!`,
      body: `
      <p>Hi!</p>
      <p>Just wanted to quickly check in and share that you've gained <b>${followers}</b> new Instagram followers!</p>
      <p>Hope you are as excited as we are.</p>
      <p>Let me know if you have any questions and we always appreciate referrals - let us know if you have anyone in mind!</p>
      <p>Thanks!<br />
      -Hillary</p>
      <p><b>Hillary Jones | Client Success Director</b><br />
      Longest Road Media<br />
      Power10K Instagram Accelerator</p>
      (reply here: <a href="mailto:hillary@longestroadmedia.com">hillary@longestroadmedia.com</a>)
        `
    },
    error: {
      subject: `P10K Account Issues: ${username}`,
      body: `<b>NOTICE:</b> Follower activity has stalled for the account: ${username}`
    }
  }

  // send email
  const message = {
    from: 'Power10K <updates@power10k.com>',
    to: address,
    subject: emails[email].subject,
    html: emails[email].body
  }

  transporter.sendMail(message, (error, info) => {
    if (error) {
      console.log(error)
    } else {
      console.log('Message sent: ' + info.messageId)
      transporter.close()
    }
  })

  // Lambda shit...
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin" : "*" // Required for CORS support to work
    },
    body: JSON.stringify({
      message: 'Sending email...'
    }),
  }
  callback(null, response)
}

// module.exports.handler()
