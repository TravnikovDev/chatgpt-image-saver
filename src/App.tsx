import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";

function App() {
  // State to hold the status of image saving
  const [savingStatus, setSavingStatus] = useState("");

  const saveImages = async () => {
    // Set initial status
    setSavingStatus("Saving images...");

    try {
      // Send a message to the current tab to trigger the content script
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab.id !== undefined) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            // This function will be executed in the context of the webpage
            // You'll need to define the actual image saving logic in your content script
            chrome.runtime.sendMessage({ action: "saveImages" });
          },
        });

        // Update the UI to reflect the success or handle the response accordingly
        setSavingStatus("Images saved successfully!");
      }
    } catch (error) {
      console.error("Error saving images:", error);
      setSavingStatus(
        "Failed to save images. Check the console for more info."
      );
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <h1>ChatGPT Image Saver</h1>
        <p>
          Click the button below to save images from the current ChatGPT
          conversation.
        </p>
        <button
          onClick={saveImages}
          disabled={savingStatus.startsWith("Saving")}
        >
          Save Images
        </button>
        {savingStatus && <p>{savingStatus}</p>}
      </header>
    </div>
  );
}

export default App;
