// This function is for obtaining the synonyms for a word when the word is 
// not found in the website that the user is scraping through.
// It utilizes Datamuse API to obtain the synonyms for a word. 
// After doing a lot of testing with this function, it is certainly not perfect
// and I am not sure if it is because of the way I have set it up or because Datamuse API 
// may not be the strongest API for this purpose.
async function getSynonyms(word) {
  const apiEndpoint = `https://api.datamuse.com/words?rel_syn=${word}`;
  try {
    const response = await fetch(apiEndpoint); // Adapted from https://rapidapi.com/guides/fetch-api-async-await
    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }
    const json = await response.json();
    return json.map(obj => obj.word);
  }
  catch (a) {
    return "";
  }
}

// This function does most of the heavy lifting. It will take the websites,
// keywords, and whether or not to use synonyms. It then fetches the words
// in the websites, and returns an array of the words that match the keywords.
async function scrapeIt(websites, keywords, useSynonyms) {
  const resultArray = [];

  for (const website of websites) {
    const response = await fetch(website);
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const content = doc.body.textContent;
    const sentences = content.split(/[.;:]/);

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
            sentence: shortenedSentence,
            keyword: keyword
          });
        }
      }

      // This code runs only if the keyword was not found and the "Synonyms"
      // toggle button is enabled.
      if (!found && useSynonyms) {
        const synonyms = await getSynonyms(keyword);
        for (const synonym of synonyms) {
          for (let i = 0; i < sentences.length; i++) {
            const sentence = sentences[i];
            if (sentence.toLowerCase().includes(synonym.toLowerCase())) {
              found = true;
              const sentenceWithTag = sentence.replace(new RegExp(`(${synonym})`, 'gi'), '<strong class="synonym">$1</strong>');
              const sentenceWithoutTag = sentenceWithTag.replace(/(<[^>]+>|&nbsp;)/gi, '');
              const sentenceWords = sentenceWithoutTag.trim().split(' ');
              const keywordIndex = sentenceWords.findIndex(word => word.toLowerCase().includes(synonym.toLowerCase()));
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

          if (found) {
            break;
          }
        }
      }
      resultArray.push({
        website: website,
        keyword: keyword,
        found: found,
        sentenceIndices: sentenceIndices,
        html: html
      });
    }
  }

  return resultArray;
}

// This function takes an array of websites and a keyword and returns an array into an HTML format
// for the user to download. 
// Adapted from https://stackoverflow.com/questions/72490229/how-to-generate-a-download-file-in-javascript
function downloadHTML(website, resultArray) {
  const matchingResults = resultArray.filter(result => result.website === website);
  if (matchingResults.length === 0) {
    return;
  }
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style = 'display: none';

  for (const matchingResult of matchingResults) {
    const keywords = matchingResult.keyword.split(',');
    for (const keyword of keywords) {
      let html = '';
      const filename = `${website}_${keyword}.html`;
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const paragraphs = matchingResult.html.match(/<p>.*?<\/p>/gs);

      for (const paragraph of paragraphs) {
        if (paragraph.match(regex)) {
          html += paragraph.replace(regex, `<b>${keyword}</b>`);
        }
      }
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  }
}

// Main portion of the code where scrapeIt() is called and the scrape button is added.
// At the bottom, the input fields are reset to be blank after the user clicks the scrape button.
const scrapeButton = document.getElementById('scrapeButton');
const output = document.getElementById('output');
const websitesInput = document.getElementById('websitesInput');
const keywordsInput = document.getElementById('keywordsInput');
const synonymSwitch = document.getElementById('synonymSwitch');

scrapeButton.addEventListener('click', () => {
  const websites = websitesInput.value.split(',');
  const keywords = keywordsInput.value.split(',');
  const useSynonyms = synonymSwitch.checked;

  scrapeIt(websites, keywords, useSynonyms).then((resultArray) => {
    let html = '';

    for (const result of resultArray) {
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
        html += '<p>Keyword/Synonyms not found.</p>';
      }
    }

    output.innerHTML = html;
    const downloadButton = document.createElement('button');
    downloadButton.textContent = 'Download HTML';
    downloadButton.addEventListener('click', async () => {
      const resultArray = await scrapeIt(websites, keywords, useSynonyms);
      let html = '';

      for (const result of resultArray) {
        if (result.found) {
          const response = await fetch(result.website);
          const websiteHtml = await response.text();
          const websiteDoc = new DOMParser().parseFromString(websiteHtml, 'text/html');
          const websiteTitle = websiteDoc.title;
          html += `<h3>${websiteTitle} - ${result.keyword}</h3>`;
          html += result.sentenceIndices.map(sentenceIndex => {
            const sentence = sentenceIndex.sentence.replace(new RegExp(`(${result.keyword})`, 'gi'), '<strong>$1</strong>');
            return `<p>${sentence}</p>`;
          }).join('');
        }
      }

      for (let i = 0; i < websites.length; i++) {
        downloadHTML(websites[i], resultArray);
      }
    });

    output.appendChild(downloadButton);


    websitesInput.value = '';
    keywordsInput.value = '';
  });
});
