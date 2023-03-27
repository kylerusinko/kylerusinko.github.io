async function scrapeWebsites(websites, keywords) {
  const results = [];

  for (const website of websites) {
    const response = await fetch(website);
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    const content = doc.body.textContent;
    const sentences = content.split('. '); // split content into sentences
    for (const keyword of keywords) {
      let found = false;
      const sentenceIndices = {};

      for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i];
        if (sentence.includes(keyword)) {
          found = true;
          if (sentenceIndices[i]) {
            sentenceIndices[i].push(sentence);
          } else {
            sentenceIndices[i] = [sentence];
          }
        }
      }

      results.push({
        website: website,
        keyword: keyword,
        found: found,
        sentenceIndices: sentenceIndices
      });
    }
  }

  return results;
}

const scrapeButton = document.getElementById('scrapeButton');
const output = document.getElementById('output');

scrapeButton.addEventListener('click', () => {
  scrapeWebsites(['https://www.example.com'], ['example', 'permission']).then((results) => {
    let html = '';

    for (const result of results) {
      html += `<h3>${result.keyword}</h3>`;
      html += '<ul>';

      for (const sentenceIndex in result.sentenceIndices) {
        html += '<li>';
        html += `${result.sentenceIndices[sentenceIndex].join('. ')}`;
        html += '</li>';
      }

      html += '</ul>';
    }

    output.innerHTML = html;
  });
});