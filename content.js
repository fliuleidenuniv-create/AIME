chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getSelectedText') {
    // Handle the getSelectedText action
    var selectedText = window.getSelection().toString();
    chrome.runtime.sendMessage({ action: 'selectedText', selectedText: selectedText });
  }

  if (request.action === 'getSelectedTextAndURL') {
    var selectedText = window.getSelection().toString();
    var url = window.location.href;
    chrome.runtime.sendMessage({ action: 'selectedTextAndURL', selectedText: selectedText, url: url });
  }

  if (request.action === 'startSpeechToText') {
    // Handle the startSpeechToText action
    // Implement the transcription logic here
  }
});
