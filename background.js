chrome.runtime.onInstalled.addListener(function() {});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("Sent from: " + sender.tab ? "content script" : "the extension");
  if (request.selectedText) {
    chrome.storage.sync.set({ selectedText: request.selectedText }, function() {
      console.log("Set new selection " + request.selectedText);
    });
    sendResponse({ confirm: `Received text: ${request.selectedText}` });
  }
});
