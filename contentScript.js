// Find all images under 'div.agent-turn' with src starting with 'https://files.oaiusercontent.com'
Array.from(document.querySelectorAll(".agent-turn"))
  .map((el) => el.querySelector("img"))
  .filter(Boolean)
  .forEach((img, index) => {
    chrome.runtime.sendMessage({
      action: "download",
      url: img.src,
      index: index,
      chatId: window.location.pathname.split("/").pop(),
    });
  });
