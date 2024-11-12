chrome.action.onClicked.addListener((tab) => {
  console.log("Pressed the extension button");
  console.log(tab);
  if (tab.id) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["contentScript.js"],
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "download" && message.url) {
    console.log("Downloading image", message.url);
    // Construct a filename including the chat ID
    // Replace any characters that are not allowed in filenames as necessary
    const safeChatId = message.chatId.replace(/[^a-z0-9]/gi, "_");
    const filename = `${safeChatId}/${message.index}.png`;

    chrome.downloads.download({
      url: message.url,
      filename: filename, // This suggests a name for the file. Actual result depends on user's browser settings and extensions.
      conflictAction: "uniquify",
    });
  }
});
