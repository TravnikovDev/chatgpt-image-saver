// Find all images and send their URLs to the background script, along with the chat ID
document
  .querySelectorAll('div[data-testid^="conversation-turn-"] .agent-turn img')
  .forEach((img, index) => {
    chrome.runtime.sendMessage({
      action: "download",
      url: img.src,
      index: index,
      chatId: window.location.pathname.split("/").pop(),
    });
  });
