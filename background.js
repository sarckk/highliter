chrome.runtime.onInstalled.addListener(() => {});

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    console.log(
      `Sent from: ${sender.tab}` ? 'content script' : 'the extension',
    );
    if (request.selectedText) {
      chrome.storage.sync.set(
        { selectedText: request.selectedText },
        () => {
          console.log(`Set new selection ${request.selectedText}`);
        },
      );
      sendResponse({
        confirm: `Received text: ${request.selectedText}`,
      });
    }
  },
);
