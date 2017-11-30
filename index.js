const express = require('express');
const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');
const util = require('util');

const app = express();

const port = 5699;

app.listen(port, 'localhost', function () {
  console.log('AE ScreenShot listening on ' + port);
});

app.get('/', function (req, res) {
  takeScreenShot(req.query)
    .then(function() {
      res.status(200).send('OK');
    })
    .catch(function(err) {
      res.status(500).send(err);
    });
});

async function takeScreenShot({
  fileName,
  outputPath,
  url,
  viewPortHeight = 500,
  viewPortWidth = 850,
  delay = 2000
}) {
  fileName += '.png';

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport({
    width: +viewPortWidth,
    height: +viewPortHeight
  });

  // firewalls ?
  await page.goto(url, {
    waitUntil: 'networkidle',
    networkIdleTimeout: +delay
  });

  const fullPath = path.join(outputPath, fileName);

  // write access ?
  await page.screenshot({ path: fullPath });

  await browser.close();

  const stat = await util.promisify(fs.stat)(fullPath);

  return stat;
}
