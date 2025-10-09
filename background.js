chrome.runtime.onInstalled.addListener(() => {
  // Show the side panel toggle in the toolbar by default
  chrome.sidePanel.setOptions({ path: 'panel.html', enabled: true });
});

chrome.tabs.onActivated.addListener(async () => {
  // Keep the same panel UI across tabs
  await chrome.sidePanel.setOptions({ path: 'panel.html', enabled: true });
});
