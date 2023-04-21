async function scrapeWebsites(websites, keywords) {
  const results = [];

  for (const website of websites) {
    const response = await fetch(website);
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    const content = doc.body.textContent;
    const sentences = content.split(/[.;:]/); // split on more punctuation

    for (const keyword of keywords) {
      let found = false;
      const sentenceIndices = [];

      for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i];
        if (sentence.toLowerCase().includes(keyword.toLowerCase())) {
          found = true;
          const sentenceWithTag = sentence.replace(new RegExp(`(${keyword})`, 'gi'), '<strong>$1</strong>');
          const sentenceWithoutTag = sentenceWithTag.replace(/(<[^>]+>|&nbsp;)/gi, '');
          const sentenceWords = sentenceWithoutTag.trim().split(' ');
          const keywordIndex = sentenceWords.findIndex(word => word.toLowerCase().includes(keyword.toLowerCase()));
          let startIndex = Math.max(0, keywordIndex - 10);
          let endIndex = Math.min(sentenceWords.length, keywordIndex + 11);

          for (let j = keywordIndex - 1; j >= startIndex; j--) {
            const word = sentenceWords[j];
            if (/^[.;:]$/.test(word) || /^<script/.test(word)) {
              startIndex = j + 1;
              break;
            }
          }

          for (let j = keywordIndex + 1; j < endIndex; j++) {
            const word = sentenceWords[j];
            if (/^[.;:]$/.test(word) || /^<\/script/.test(word)) {
              endIndex = j;
              break;
            }
          }

          const shortenedSentence = sentenceWords.slice(startIndex, endIndex).join(' ');
          sentenceIndices.push({
            index: i,
            sentence: shortenedSentence
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

function downloadHTML(html) {
  const filename = 'scraped.html';
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(html));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
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
    const downloadButton = document.createElement('button');
    downloadButton.textContent = 'Download HTML';
    downloadButton.addEventListener('click', () => {
      downloadHTML(output.innerHTML);
    });
    output.appendChild(downloadButton);

    websitesInput.value = '';
    keywordsInput.value = '';
  });
});
