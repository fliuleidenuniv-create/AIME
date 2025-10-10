// content.js

// Listen for messages from the popup script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getSelectedText') {
    // Retrieve the selected text
    var selectedText = window.getSelection().toString();
    // Send the selected text to the popup script
    chrome.runtime.sendMessage({ action: 'selectedText', selectedText: selectedText });
  }

  if (request.action === 'getSelectedTextAndURL') {
    // Retrieve the selected text and URL
    var selectedText = window.getSelection().toString();
    var url = window.location.href;
    // Send the selected text and URL to the popup script
    chrome.runtime.sendMessage({ action: 'selectedTextAndURL', selectedText: selectedText, url: url });
  }
});

