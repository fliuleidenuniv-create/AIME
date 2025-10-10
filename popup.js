// popup.js

// create a event listner for read aloud button
document.addEventListener('DOMContentLoaded', function() {
  var button = document.getElementById('readAloudButton');
  if(button) {
      button.addEventListener('click', function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'getSelectedText' });
        });
      });
  } else {
      console.error('Read Aloud Button not found!');
  }
});

// create a event listner for summary button
document.addEventListener('DOMContentLoaded', function() {
  var summaryButton = document.getElementById('summaryButton');
  if(summaryButton) {
    summaryButton.addEventListener('click', function() {
      // Send message to content script to get selected text and URL
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getSelectedTextAndURL' });
      });
    });
  } else {
    console.error('Summary Button not found!');
  } 
});

// Listen for response from content script with selected text and call Google Cloud Text-to-Speech API
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'selectedText') {
    var textToSynthesize = request.selectedText;
    const apiKey = CONFIG.GOOGLE_API_KEY;

    fetch('https://texttospeech.googleapis.com/v1/text:synthesize?key=' + apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: { text: textToSynthesize },
        voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3' }
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to synthesize speech');
      }
      return response.json();
    })
    .then(data => {
      // Play the synthesized audio
      var audio = new Audio('data:audio/mp3;base64,' + data.audioContent);
      audio.play();
    })
    .catch(error => console.error('Error:', error));
  }
});


// Listen for response from content script with selected text and URL and call ChatGPT API
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'selectedTextAndURL') {


    // window.prompt to get user input into a variable
    const openAIKey = CONFIG.OPENAI_API_KEY;
    const apiEndpoint = 'https://api.openai.com/v1/chat/completions';
    var textToSummarize = request.selectedText;
    var pageURL = request.url;

    // Show loader and hide initial text
    document.getElementById('loader').style.display = 'block';
    document.getElementById('summaryText').style.display = 'none';

    const requestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          "role": "system",
          "content": `You are a helpful assistant that summerizes a given text to 30-80% of its length. 
                      You will not use the same exact sentences as mentioned in the text. 
                      You will only provide a gist of what is mentioned in the text. 
                      You will not use any additional information. 
                      You will use the text to summerize. 
                      If they have a list of things then use bullet points to summerize. 
                      You will keep the context of the page used to grab the text from.`
        },
        {
          "role": "user",
          "content": `Given the following text from a webpage and the URL of the page, 
                      summarize the text in a way that includes relevant context from the content available at the URL. 
                      Text: '${textToSummarize}'. URL: '${pageURL}'. Please provide a concise summary that integrates 
                      the key points from both the text and any relevant information from the URL.`
        }
      ],
      temperature: 0.1,
      max_tokens: 150,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0
    };
  
    fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIKey}`,
      },
      body: JSON.stringify(requestBody),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to summerize selected Text', response.status, response.body);
      }
      return response.json();
    })
    .then(data => {
      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        const summaryText = data.choices[0].message.content.trim();

        document.getElementById('loader').style.display = 'none';
        document.getElementById('summaryText').style.display = 'block';
        document.getElementById('summaryText').textContent = summaryText;
      }
    })
    .catch(error => console.error('Error:', error));
  }
});
