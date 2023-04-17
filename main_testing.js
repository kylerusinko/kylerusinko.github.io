async function scrapeWebsites(websites, keywords) {
  const results = [];

  for (const website of websites) {
    const response = await fetch(website);
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    const content = doc.body.textContent;
    const sentences = content.split('. ');

    for (const keyword of keywords) {
      let found = false;
      const sentenceIndices = [];

      for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i];
        if (sentence.toLowerCase().includes(keyword.toLowerCase())) {
          found = true;
          const sentenceWithTag = sentence.replace(new RegExp(`(${keyword})`, 'gi'), '<strong>$1</strong>');
          const sentenceWithoutTag = sentenceWithTag.replace(/(<[^>]+>|&nbsp;)/gi, '');
          sentenceIndices.push({
            index: i,
            sentence: sentenceWithoutTag.trim(),
          });
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
const websitesInput = document.getElementById('websitesInput');
const keywordsInput = document.getElementById('keywordsInput');

scrapeButton.addEventListener('click', () => {
  const websites = websitesInput.value.split(',');
  const keywords = keywordsInput.value.split(',');

  scrapeWebsites(websites, keywords).then((results) => {
    let html = '';

    for (const result of results) {
      const sentenceCount = result.sentenceIndices.length;
      html += `<h3>${result.website} - ${result.keyword} (${sentenceCount} instances found)</h3>`;
      if (result.found) {
        html += '<ul>';

        for (const sentenceIndex of result.sentenceIndices) {
          const sentence = sentenceIndex.sentence.replace(new RegExp(`(${result.keyword})`, 'gi'), '<strong>$1</strong>');
          html += '<li>';
          html += `<p>${sentence}</p>`;
          html += '</li>';
        }

        html += '</ul>';
      } else {
        html += '<p>Keyword not found.</p>';
      }
    }

    output.innerHTML = html;
    websitesInput.value = '';
    keywordsInput.value = '';
  });
});
