// Find all images under 'div.agent-turn' with src starting with 'https://files.oaiusercontent.com'
document
  .querySelectorAll(
    'div.agent-turn img[src^="https://files.oaiusercontent.com"]'
  )
  .forEach((img, index) => {
    chrome.runtime.sendMessage({
      action: "download",
      url: img.src,
      index: index,
      chatId: window.location.pathname.split("/").pop(),
    });
  });
