const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  await new Promise(r => setTimeout(r, 3000)); // Wait for data to load
  
  const data = await page.evaluate(() => {
    return window.dashboardDataDebug ? Object.keys(window.dashboardDataDebug.allClientsList[0]) : null;
  });
  
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
