document.addEventListener('DOMContentLoaded', () => {
  // Retrieve the URL of the analyzed image from local storage
  chrome.storage.local.get(['lastAnalyzedImage'], async (result) => {
    if (result.lastAnalyzedImage) {
      const imgUrl = result.lastAnalyzedImage;
      const imgElement = document.getElementById('target-image');
      const urlElement = document.getElementById('image-url');
      
      imgElement.src = imgUrl;
      urlElement.innerHTML = `<a href="${imgUrl}" target="_blank" style="color: #4CAF50; text-decoration: none;">${imgUrl}</a>`;

      await analyzeExifData(imgUrl);
      setupReverseSearch(imgUrl);
      setupFactChecker();
    } else {
      document.getElementById('image-url').textContent = 'No image selected. Please right-click an image and select the extension option.';
    }
  });
});

function setupFactChecker() {
  const btn = document.getElementById('verify-btn');
  const input = document.getElementById('claim-input');
  const resultsContainer = document.getElementById('fact-check-results');

  btn.addEventListener('click', async () => {
    const query = input.value.trim();
    if (!query) return;

    btn.textContent = 'Verifying...';
    btn.disabled = true;
    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = '<p style="color: #bbb;">Querying intelligence databases...</p>';

    try {
      // In a production app, you would hit Google Fact Check API or an LLM here.
      // For this portfolio, we will query the open Wikipedia API for context matching.
      const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`);
      const data = await response.json();
      
      const searchResults = data.query.search;
      
      if (searchResults.length > 0) {
        let html = '<h4 style="color: #81C784; margin-bottom: 10px;">Context Found:</h4>';
        
        // Take the top 3 results
        searchResults.slice(0, 3).forEach(item => {
          html += `
            <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #4CAF50;">
              <h5 style="margin: 0 0 5px 0; color: #fff;">${item.title}</h5>
              <p style="margin: 0; font-size: 13px; color: #ddd; line-height: 1.4;">...${item.snippet}... <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}" target="_blank" style="color: #4CAF50;">Read more</a></p>
            </div>
          `;
        });
        
        html += `<p style="font-size: 12px; color: #888; margin-top: 15px;"><i>Note: This module currently uses Wikipedia for context aggregation. To upgrade this, replace the fetch URL in results.js with your Gemini or OpenAI API key.</i></p>`;
        resultsContainer.innerHTML = html;
      } else {
        resultsContainer.innerHTML = `
          <div style="background: rgba(244, 67, 54, 0.1); padding: 15px; border-radius: 6px; border-left: 3px solid #F44336;">
            <p style="margin: 0; color: #fff;">No verifiable context found for this claim.</p>
          </div>
        `;
      }
    } catch (error) {
      resultsContainer.innerHTML = `<p style="color: #F44336;">Error verifying claim: ${error.message}</p>`;
    } finally {
      btn.textContent = 'Verify Claim';
      btn.disabled = false;
    }
  });
}

function setupReverseSearch(url) {
  const container = document.getElementById('reverse-search-links');
  
  const engines = [
    { name: 'Google Lens', url: `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(url)}`, color: '#4285F4' },
    { name: 'Yandex', url: `https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(url)}`, color: '#FFCC00' },
    { name: 'TinEye', url: `https://tineye.com/search?url=${encodeURIComponent(url)}`, color: '#E4F4FA', textColor: '#000' },
    { name: 'Bing', url: `https://www.bing.com/images/search?view=detailv2&iss=sbi&FORM=SBIHMP&sbisrc=UrlPaste&q=imgurl:${encodeURIComponent(url)}`, color: '#00809D' }
  ];

  let html = '';
  engines.forEach(engine => {
    const textColor = engine.textColor || '#fff';
    html += `
      <a href="${engine.url}" target="_blank" style="
        background-color: ${engine.color};
        color: ${textColor};
        padding: 10px 15px;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
        font-size: 14px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        transition: transform 0.2s;
        display: inline-block;
      " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        🔍 Search on ${engine.name}
      </a>
    `;
  });

  container.innerHTML = html;
}

async function analyzeExifData(url) {
  const exifContainer = document.getElementById('exif-data');
  try {
    // Fetch the image as an ArrayBuffer
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image");
    const arrayBuffer = await response.arrayBuffer();

    // Parse EXIF data
    const tags = EXIF.readFromBinaryFile(arrayBuffer);
    
    if (tags && Object.keys(tags).length > 0) {
      let html = '';
      
      // Filter out huge buffers like MakerNote or thumbnail data for clean display
      const displayTags = {};
      for (const [key, value] of Object.entries(tags)) {
        if (key === 'MakerNote' || key === 'UserComment' || key.includes('Thumbnail')) continue;
        displayTags[key] = value;
      }

      if (Object.keys(displayTags).length === 0) {
        exifContainer.innerHTML = '<p style="color: #ff9800;">Image contains EXIF data, but no readable tags found.</p>';
        return;
      }

      // Highlight important forensic tags
      const importantTags = ['DateTimeOriginal', 'GPSLatitude', 'GPSLongitude', 'Make', 'Model', 'Software'];

      for (const tag of importantTags) {
        if (displayTags[tag]) {
          html += `
            <div class="data-row" style="background: rgba(76, 175, 80, 0.1); padding: 10px; border-radius: 4px; margin-bottom: 5px;">
              <span class="label" style="color: #81C784;">🔥 ${tag}</span>
              <span class="value">${displayTags[tag]}</span>
            </div>
          `;
          delete displayTags[tag]; // Remove from general list
        }
      }

      // Add remaining tags
      for (const [key, value] of Object.entries(displayTags)) {
        html += `
          <div class="data-row">
            <span class="label">${key}</span>
            <span class="value">${value}</span>
          </div>
        `;
      }
      
      exifContainer.innerHTML = html;
    } else {
      exifContainer.innerHTML = '<p style="color: #ff9800;">No EXIF metadata found. This is common for images downloaded from social media (which strip EXIF data).</p>';
    }
  } catch (error) {
    console.error(error);
    exifContainer.innerHTML = `<p style="color: #f44336;">Error analyzing EXIF data: ${error.message}</p>`;
  }
}
