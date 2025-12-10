// ChatGPT Bulk Image Downloader - Enhanced UI Content Script

class ChatGPTImageSaver {
  constructor() {
    this.isDropdownOpen = false;
    this.downloadProgress = { total: 0, success: 0, failed: 0 };
    this.customFolderName = '';
    this.failedDownloads = []; // Store failed download info for retry
    this.retryAttempts = 0;
    this.maxRetryAttempts = 3;
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
        <div class="cgis-main-button" id="cgis-save-btn" 
             role="button" 
             tabindex="0"
             aria-label="Save all images from ChatGPT conversation" 
             title="Click to download all images from this ChatGPT conversation">
          <svg class="cgis-save-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <div class="cgis-button-text">
            <div class="cgis-text-line1">Save</div>
            <div class="cgis-text-line2">Images</div>
          </div>
        </div>
        <div class="cgis-dropdown-btn" id="cgis-dropdown-btn" 
             role="button" 
             tabindex="0"
             aria-label="Open download options" 
             aria-expanded="false"
             title="Click to access download options and progress tracking">
          <svg class="cgis-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <polyline points="6,9 12,15 18,9"/>
          </svg>
        </div>
        <div class="cgis-dropdown-panel" id="cgis-dropdown-panel" role="dialog" aria-label="Download options">
          <div class="cgis-option">
            <label for="cgis-folder-input">Custom folder name:</label>
            <input type="text" 
                   id="cgis-folder-input" 
                   value="${currentChatId}" 
                   placeholder="Enter folder name"
                   aria-describedby="cgis-folder-help"
                   title="Specify a custom name for the download folder">
            <div id="cgis-folder-help" class="cgis-help-text">Images will be saved to Downloads/{folder-name}/</div>
          </div>
          <div class="cgis-progress" id="cgis-progress" role="status" aria-live="polite">
            <div class="cgis-progress-text">Ready to download</div>
            <div class="cgis-progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Download progress">
              <div class="cgis-progress-fill"></div>
            </div>
            <div class="cgis-progress-stats" aria-label="Download statistics">
              <span class="cgis-success" aria-label="Successful downloads">✓ 0</span>
              <span class="cgis-failed" aria-label="Failed downloads">✗ 0</span>
            </div>
          </div>
          <div class="cgis-retry-section" id="cgis-retry-section" style="display: none;">
            <button class="cgis-retry-btn" id="cgis-retry-btn" 
                    role="button" 
                    tabindex="0"
                    aria-label="Retry downloading failed images" 
                    title="Click to retry downloading the failed images">
              🔄 Retry Failed Images
            </button>
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

    // Save button events
    saveBtn.addEventListener('click', () => this.startDownload());
    saveBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.startDownload();
      }
    });

    // Dropdown button events
    dropdownBtn.addEventListener('click', () => this.toggleDropdown());
    dropdownBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleDropdown();
      } else if (e.key === 'Escape') {
        this.closeDropdown();
      }
    });
    
    // Close dropdown when clicking outside or pressing Escape
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#chatgpt-image-saver-ui')) {
        this.closeDropdown();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isDropdownOpen) {
        this.closeDropdown();
        dropdownBtn.focus();
      }
    });

    folderInput.addEventListener('input', (e) => {
      this.customFolderName = e.target.value.trim();
    });

    // Retry button events
    const retryBtn = document.getElementById('cgis-retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.retryFailedDownloads());
      retryBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.retryFailedDownloads();
        }
      });
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    const dropdownPanel = document.getElementById('cgis-dropdown-panel');
    const dropdownBtn = document.getElementById('cgis-dropdown-btn');
    const chevron = document.querySelector('.cgis-chevron');
    
    if (this.isDropdownOpen) {
      dropdownPanel.classList.add('open');
      chevron.classList.add('open');
      dropdownBtn.setAttribute('aria-expanded', 'true');
      // Focus the first input in the dropdown for accessibility
      setTimeout(() => {
        const folderInput = document.getElementById('cgis-folder-input');
        if (folderInput) folderInput.focus();
      }, 100);
    } else {
      dropdownPanel.classList.remove('open');
      chevron.classList.remove('open');
      dropdownBtn.setAttribute('aria-expanded', 'false');
    }
  }

  closeDropdown() {
    this.isDropdownOpen = false;
    const dropdownPanel = document.getElementById('cgis-dropdown-panel');
    const dropdownBtn = document.getElementById('cgis-dropdown-btn');
    const chevron = document.querySelector('.cgis-chevron');
    dropdownPanel.classList.remove('open');
    chevron.classList.remove('open');
    if (dropdownBtn) dropdownBtn.setAttribute('aria-expanded', 'false');
  }

  startDownload() {
    const images = this.findImages();
    
    if (images.length === 0) {
      this.updateProgressText('No images found');
      // Open dropdown to show the "no images" message
      if (!this.isDropdownOpen) {
        this.toggleDropdown();
      }
      return;
    }

    // Auto-open dropdown to show progress
    if (!this.isDropdownOpen) {
      this.toggleDropdown();
    }

    // Reset and initialize progress
    this.downloadProgress = { total: images.length, success: 0, failed: 0 };
    this.failedDownloads = []; // Reset failed downloads
    this.retryAttempts = 0; // Reset retry counter
    this.hideRetryButton(); // Hide retry button
    this.updateProgressText(`Downloading ${images.length} images...`);
    this.updateProgressBar();

    const folderName = this.customFolderName || this.getCurrentChatId();

    images.forEach((img, index) => {
      const downloadInfo = {
        action: "download",
        url: img.src,
        index: index,
        chatId: this.getCurrentChatId(),
        customFolder: this.customFolderName,
        folderName: folderName
      };
      
      chrome.runtime.sendMessage(downloadInfo);
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
        // Remove from failed downloads if it was previously failed and now succeeded
        this.failedDownloads = this.failedDownloads.filter(failed => 
          !(failed.url === message.url && failed.index === message.index)
        );
        this.updateProgress();
      } else if (message.action === "downloadFailed") {
        this.downloadProgress.failed++;
        
        // Store failed download info for retry
        const failedDownload = {
          url: message.url,
          index: message.index,
          error: message.error,
          chatId: this.getCurrentChatId(),
          customFolder: this.customFolderName,
          folderName: this.customFolderName || this.getCurrentChatId()
        };
        
        // Add to failed downloads if not already present
        const existingIndex = this.failedDownloads.findIndex(failed => 
          failed.url === message.url && failed.index === message.index
        );
        if (existingIndex === -1) {
          this.failedDownloads.push(failedDownload);
        }
        
        this.updateProgress();
      }
    });
  }

  updateProgress() {
    this.updateProgressBar();
    
    const completed = this.downloadProgress.success + this.downloadProgress.failed;
    if (completed === this.downloadProgress.total) {
      if (this.downloadProgress.failed > 0) {
        this.updateProgressText(`Complete! ${this.downloadProgress.success} successful, ${this.downloadProgress.failed} failed`);
        this.showRetryButton();
      } else {
        this.updateProgressText(`Complete! All ${this.downloadProgress.success} images downloaded successfully`);
        this.hideRetryButton();
      }
    } else {
      this.updateProgressText(`Downloading... ${completed}/${this.downloadProgress.total}`);
      this.hideRetryButton();
    }
  }

  updateProgressBar() {
    const completed = this.downloadProgress.success + this.downloadProgress.failed;
    const percentage = this.downloadProgress.total > 0 ? (completed / this.downloadProgress.total) * 100 : 0;
    
    const progressBar = document.querySelector('.cgis-progress-bar');
    const progressFill = document.querySelector('.cgis-progress-fill');
    const successSpan = document.querySelector('.cgis-success');
    const failedSpan = document.querySelector('.cgis-failed');
    
    if (progressBar) progressBar.setAttribute('aria-valuenow', percentage.toString());
    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (successSpan) successSpan.textContent = `✓ ${this.downloadProgress.success}`;
    if (failedSpan) failedSpan.textContent = `✗ ${this.downloadProgress.failed}`;
  }

  updateProgressText(text) {
    const progressText = document.querySelector('.cgis-progress-text');
    if (progressText) progressText.textContent = text;
  }

  showRetryButton() {
    const retrySection = document.getElementById('cgis-retry-section');
    if (retrySection) {
      retrySection.style.display = 'block';
    }
  }

  hideRetryButton() {
    const retrySection = document.getElementById('cgis-retry-section');
    if (retrySection) {
      retrySection.style.display = 'none';
    }
  }

  retryFailedDownloads() {
    if (this.failedDownloads.length === 0) {
      this.updateProgressText('No failed downloads to retry');
      return;
    }

    // Check if we've exceeded max retry attempts
    if (this.retryAttempts >= this.maxRetryAttempts) {
      this.updateProgressText(`Max retry attempts (${this.maxRetryAttempts}) reached. ${this.failedDownloads.length} images still failed.`);
      return;
    }

    this.retryAttempts++;
    this.hideRetryButton();
    
    // Reset only the failed count for the retry
    const failedCount = this.failedDownloads.length;
    this.downloadProgress.failed = 0;
    
    this.updateProgressText(`Retry attempt ${this.retryAttempts}/${this.maxRetryAttempts}: Retrying ${failedCount} failed images...`);
    this.updateProgressBar();

    // Make a copy of failed downloads since the array may be modified during retry
    const failedToRetry = [...this.failedDownloads];
    this.failedDownloads = []; // Clear the array, it will be repopulated if downloads fail again

    // Retry each failed download
    failedToRetry.forEach((failedDownload) => {
      const downloadInfo = {
        action: "download",
        url: failedDownload.url,
        index: failedDownload.index,
        chatId: failedDownload.chatId,
        customFolder: failedDownload.customFolder,
        folderName: failedDownload.folderName
      };
      
      chrome.runtime.sendMessage(downloadInfo);
    });
  }
}

// Initialize the image saver when content script loads
const chatGPTImageSaver = new ChatGPTImageSaver();
