/* eslint-disable no-undef */
chrome.runtime.onInstalled.addListener(() => {});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.selectedText) {
    chrome.storage.sync.set({ selectedText: request.selectedText }, () => {});
    sendResponse({
      confirm: `Received text: ${request.selectedText}`
    });
  }
});
