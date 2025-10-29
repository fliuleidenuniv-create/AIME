let recognitionActive = false;

document.addEventListener('DOMContentLoaded', function() {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        const recordButton = document.getElementById('recordSpeechButton');
        if (recordButton) {
            recordButton.addEventListener('click', function() {
                if (!recognitionActive) {
                    recognition.start();
                    recognitionActive = true;
                }
            });
        } else {
            console.error('Record Speech Button not found!');
        }

        recognition.onstart = function() {
            console.log('Speech recognition started');
        };

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            console.log('Transcript:', transcript);
            // Process the transcript as needed
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            recognitionActive = false; // Reset on error
        };

        recognition.onend = function() {
            console.log('Speech recognition ended');
            recognitionActive = false; // Reset after end
        };
    } else {
        console.error('Web Speech API is not supported in this browser');
    }
});

// Global variable to hold the current audio object
let currentAudio = null;

// popup.js

// create a event listner for read aloud button
document.addEventListener('DOMContentLoaded', function() {
  var button = document.getElementById('readAloudButton');
  if(button) {
      button.addEventListener('click', function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          sendToContent(tabs[0].id, { action: 'getSelectedText' });
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
        sendToContent(tabs[0].id, { action: 'getSelectedTextAndURL' });
      });
    });
  } else {
    console.error('Summary Button not found!');
  } 
});

// Helper: send a message to the content script, and if there's no receiver,
// inject `content.js` into the tab (once) and retry the message.
function sendToContent(tabId, message, triedInject = false) {
  chrome.tabs.sendMessage(tabId, message, function(response) {
    if (chrome.runtime.lastError) {
      console.warn(`sendMessage error: ${chrome.runtime.lastError.message}`);

      // Enhanced logging
      console.warn(`Failed to send message: "${message.action}". ${chrome.runtime.lastError.message}`);

      // Attempt an injection if the message is not received
      if (!triedInject) {
        console.log('Attempting to inject content script...');
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['content.js']
        }, function() {
          console.log('Content script injected successfully, retrying message send...');
          // Retry sending the message after injection
          sendToContent(tabId, message, true);
        });
      } else {
        console.error('No receiver for message after injection attempt.');
      }
    } else {
      // Log successful message response for tracking
      console.log('Message sent successfully, response:', response);

      // Check if response is undefined or empty for better issue tracking
      if (!response) {
        console.warn('Received empty or undefined response');
      }
    }
  });
}
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
        return response.json().then(errData => {
          console.error('API Error Details:', JSON.stringify(errData, null, 2));
          throw new Error('Failed to synthesize speech');
        });
      }
      return response.json();
    })
    .then(data => {
      if (data.audioContent) {
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }

        currentAudio = new Audio('data:audio/mp3;base64,' + data.audioContent);
        currentAudio.play();
      } else {
        console.error('Audio content not found in response', data);
      }
    })
    .catch(error => console.error('Error during Text-to-Speech request:', error));
  }
});


// Listen for response from content script with selected text and URL and call ChatGPT API
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'selectedTextAndURL') {


    // window.prompt to get user input into a variable
    var textToSummarize = request.selectedText;
    var pageURL = request.url;

    // Show loader and hide initial text
    document.getElementById('loader').style.display = 'block';
    document.getElementById('summaryText').style.display = 'none';

    fetch('https://language.googleapis.com/v1/documents:analyzeEntities?key=' + CONFIG.GOOGLE_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        document: {
          type: 'PLAIN_TEXT',
          content: textToSummarize,
        },
        encodingType: 'UTF8',
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to analyze text', response.status, response.body);
      }
      return response.json();
    })
    .then(data => {
      const entities = data.entities || [];
      const mainEntities = entities.slice(0, 10).map(entity => `#${entity.name}`).join(' ');

      const sentiment = data.documentSentiment || { score: 0 };
      const sentimentSummary = `Sentiment: ${sentiment.score > 0 ? 'Positive' : sentiment.score < 0 ? 'Negative' : 'Neutral'}`;

      let summary = `Topics: ${mainEntities}. ${sentimentSummary}. Conclusion: Highlighted key topics and overall sentiment.`;
      summary = (summary.length > 200) ? summary.slice(0, 197) + '...' : summary;

      document.getElementById('loader').style.display = 'none';
      document.getElementById('summaryText').style.display = 'block';
      document.getElementById('summaryText').innerHTML = summary;
    })
    .catch(error => console.error('Error:', error));
  }
});
