chrome.storage.sync.get('selectedText', data => {
  console.log(data.selectedText);

  currentSelected.innerHTML = data.selectedText;
});
