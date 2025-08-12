// ChatGPT Image Saver - Enhanced UI Content Script

class ChatGPTImageSaver {
  constructor() {
    this.isDropdownOpen = false;
    this.downloadProgress = { total: 0, success: 0, failed: 0 };
    this.customFolderName = '';
    this.init();
  }

  init() {
    this.createFloatingUI();
    this.setupMessageListener();
  }

  createFloatingUI() {
    // Remove existing UI if present
    const existingUI = document.getElementById('chatgpt-image-saver-ui');
    if (existingUI) {
      existingUI.remove();
    }

    // Get current chat ID for prefilling
    const currentChatId = this.getCurrentChatId();

    // Create main container
    const container = document.createElement('div');
    container.id = 'chatgpt-image-saver-ui';
    container.innerHTML = `
      <div class="cgis-floating-container">
        <div class="cgis-main-button" id="cgis-save-btn">
          <svg class="cgis-save-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </div>
        <div class="cgis-dropdown-btn" id="cgis-dropdown-btn">
          <svg class="cgis-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6,9 12,15 18,9"/>
          </svg>
        </div>
        <div class="cgis-dropdown-panel" id="cgis-dropdown-panel">
          <div class="cgis-option">
            <label>Custom folder name:</label>
            <input type="text" id="cgis-folder-input" value="${currentChatId}" placeholder="Enter folder name">
          </div>
          <div class="cgis-progress" id="cgis-progress">
            <div class="cgis-progress-text">Ready to download</div>
            <div class="cgis-progress-bar">
              <div class="cgis-progress-fill"></div>
            </div>
            <div class="cgis-progress-stats">
              <span class="cgis-success">✓ 0</span>
              <span class="cgis-failed">✗ 0</span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    this.setupEventListeners();
  }

  setupEventListeners() {
    const saveBtn = document.getElementById('cgis-save-btn');
    const dropdownBtn = document.getElementById('cgis-dropdown-btn');
    const dropdownPanel = document.getElementById('cgis-dropdown-panel');
    const folderInput = document.getElementById('cgis-folder-input');

    // Initialize with current value
    this.customFolderName = folderInput.value;

    saveBtn.addEventListener('click', () => this.startDownload());
    dropdownBtn.addEventListener('click', () => this.toggleDropdown());
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#chatgpt-image-saver-ui')) {
        this.closeDropdown();
      }
    });

    folderInput.addEventListener('input', (e) => {
      this.customFolderName = e.target.value.trim();
    });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    const dropdownPanel = document.getElementById('cgis-dropdown-panel');
    const chevron = document.querySelector('.cgis-chevron');
    
    if (this.isDropdownOpen) {
      dropdownPanel.classList.add('open');
      chevron.classList.add('open');
    } else {
      dropdownPanel.classList.remove('open');
      chevron.classList.remove('open');
    }
  }

  closeDropdown() {
    this.isDropdownOpen = false;
    const dropdownPanel = document.getElementById('cgis-dropdown-panel');
    const chevron = document.querySelector('.cgis-chevron');
    dropdownPanel.classList.remove('open');
    chevron.classList.remove('open');
  }

  startDownload() {
    const images = this.findImages();
    
    if (images.length === 0) {
      this.updateProgressText('No images found');
      return;
    }

    // Reset and initialize progress
    this.downloadProgress = { total: images.length, success: 0, failed: 0 };
    this.updateProgressText(`Downloading ${images.length} images...`);
    this.updateProgressBar();

    const folderName = this.customFolderName || this.getCurrentChatId();

    images.forEach((img, index) => {
      chrome.runtime.sendMessage({
        action: "download",
        url: img.src,
        index: index,
        chatId: this.getCurrentChatId(),
        customFolder: this.customFolderName,
        folderName: folderName
      });
    });
  }

  getCurrentChatId() {
    return window.location.pathname.split("/").pop() || 'unknown-chat';
  }

  findImages() {
    return Array.from(document.querySelectorAll(".agent-turn"))
      .map((el) => el.querySelector("img"))
      .filter(Boolean);
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "downloadComplete") {
        this.downloadProgress.success++;
        this.updateProgress();
      } else if (message.action === "downloadFailed") {
        this.downloadProgress.failed++;
        this.updateProgress();
      }
    });
  }

  updateProgress() {
    this.updateProgressBar();
    
    const completed = this.downloadProgress.success + this.downloadProgress.failed;
    if (completed === this.downloadProgress.total) {
      this.updateProgressText(`Complete! ${this.downloadProgress.success} successful, ${this.downloadProgress.failed} failed`);
    } else {
      this.updateProgressText(`Downloading... ${completed}/${this.downloadProgress.total}`);
    }
  }

  updateProgressBar() {
    const completed = this.downloadProgress.success + this.downloadProgress.failed;
    const percentage = this.downloadProgress.total > 0 ? (completed / this.downloadProgress.total) * 100 : 0;
    
    const progressFill = document.querySelector('.cgis-progress-fill');
    const successSpan = document.querySelector('.cgis-success');
    const failedSpan = document.querySelector('.cgis-failed');
    
    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (successSpan) successSpan.textContent = `✓ ${this.downloadProgress.success}`;
    if (failedSpan) failedSpan.textContent = `✗ ${this.downloadProgress.failed}`;
  }

  updateProgressText(text) {
    const progressText = document.querySelector('.cgis-progress-text');
    if (progressText) progressText.textContent = text;
  }
}

// Initialize the image saver when content script loads
const chatGPTImageSaver = new ChatGPTImageSaver();
