const express = require('express');
const fp = require('find-free-port');
const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');
const util = require('util');

const app = express();

fp(3000, '127.0.0.1', function(err, freePort) {
  app.listen(freePort, 'localhost', function () {
    console.log('AE ScreenShot listening on ' + freePort);
  });
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

async function takeScreenShot({ fileName, outputPath, url, viewPortHeight = 768, viewPortWidth = 1024, delay = 2000 }) {
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
