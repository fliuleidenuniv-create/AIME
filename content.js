// Heuristics: prefer <article>, else main, else large text blocks
function getReadableText() {
  const pick = (sel) => [...document.querySelectorAll(sel)]
    .map(n => n.innerText?.trim() || "")
    .filter(t => t.split(/\s+/).length > 80)   // avoid nav/footers
    .sort((a, b) => b.length - a.length)[0];

  const fromArticle = pick("article, [role='article']");
  const fromMain = pick("main");
  const fromBody = pick("p, div");

  return fromArticle || fromMain || fromBody || document.body.innerText || "";
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "AIME_GET_TEXT") {
    sendResponse({ text: getReadableText(), title: document.title });
  }
  // Let the message channel stay open for async if needed
  return true;
});
