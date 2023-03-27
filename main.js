const puppeteer = require('puppeteer');

async function scrapeWebsites(websites, keywords) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const results = [];

  for (const website of websites) {
    await page.goto(website);
    const content = await page.content();
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        results.push({
          website: website,
          keyword: keyword,
          found: true
        });
      } else {
        results.push({
          website: website,
          keyword: keyword,
          found: false
        });
      }
    }
  }

  await browser.close();
  return results;
}

const websites = ['https://www.example.com', 'https://www.example.org'];
const keywords = ['example', 'test'];

scrapeWebsites(websites, keywords).then((results) => {
  console.log(results);
});
