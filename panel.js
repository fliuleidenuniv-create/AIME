async function getActiveTabId() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id;
}

const statusEl = document.getElementById('status');
const outEl = document.getElementById('output');

async function fetchPageText() {
  statusEl.textContent = "Getting page content…";
  const tabId = await getActiveTabId();
  const res = await chrome.tabs.sendMessage(tabId, { type: "AIME_GET_TEXT" });
  const text = (res?.text || "").trim();
  if (!text) {
    statusEl.textContent = "Couldn’t detect readable text. Try selecting text on the page.";
  } else {
    statusEl.textContent = `Got ${text.length.toLocaleString()} characters from “${res?.title || "this page"}”.`;
    outEl.value = text;
  }
}

async function summarizeText() {
  const input = outEl.value.trim();
  if (!input) return;
  statusEl.textContent = "Summarizing with built-in AI…";

  // Summarizer API (available in recent Chrome). Fallback if unavailable.
  try {
    if (!('ai' in self) || !('summarizer' in self.ai)) throw new Error('No Summarizer API');
    const caps = await ai.summarizer.capabilities(); // { available: "readily" | "after-download" | "no" }
    if (caps.available === "no") throw new Error('Summarizer not available');

    // Ensure model is ready (may download a small on-device model)
    const sum = await ai.summarizer.create({
      type: "key-points", // or "tl;dr", "teaser"
      length: "medium",   // "short" | "medium" | "long"
      format: "markdown"
    });
    const summary = await sum.summarize(input);
    outEl.value = summary;
    statusEl.textContent = "Summary ready.";
  } catch (e) {
    statusEl.textContent = "Summarizer not available; kept full text.";
  }
}

function readAloud() {
  const text = outEl.value.trim();
  if (!text) return;
  chrome.tts.stop();
  chrome.tts.speak(text, {
    rate: 1.0, pitch: 1.0,
    onEvent: (ev) => {
      if (ev.type === "end") statusEl.textContent = "Done.";
      if (ev.type === "error") statusEl.textContent = "TTS error.";
    }
  });
  statusEl.textContent = "Reading…";
}

document.getElementById('fetch').addEventListener('click', fetchPageText);
document.getElementById('summarize').addEventListener('click', summarizeText);
document.getElementById('read').addEventListener('click', readAloud);
document.getElementById('stop').addEventListener('click', () => chrome.tts.stop());
