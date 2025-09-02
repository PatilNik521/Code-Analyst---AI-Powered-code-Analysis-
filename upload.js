/**
 * CodeGuardian - File Upload and URL Input Functionality
 * Handles file uploads and URL input for code analysis
 */

const FileHandler = (() => {
    // Private variables
    const state = {
        fileData: null,
        urlData: null,
        isUploading: false,
        uploadProgress: 0,
        supportedFileTypes: [
            '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.php', '.py', '.java', '.rb', 
            '.go', '.c', '.cpp', '.cs', '.swift', '.kt', '.rs', '.json', '.xml', '.yaml', '.yml'
        ],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        errors: []
    };

    // Cache DOM elements
    const DOM = {
        fileDropArea: document.querySelector('.file-drop-area'),
        fileInput: document.getElementById('file'),
        fileInfo: document.querySelector('.file-info'),
        urlInput: document.getElementById('url'),
        urlForm: document.getElementById('url-form'),
        fileForm: document.getElementById('file-form'),
        uploadProgress: document.querySelector('.upload-progress'),
        progressBar: document.querySelector('.progress-bar'),
        progressText: document.querySelector('.progress-text'),
        errorContainer: document.querySelector('.error-container'),
        analyzeFileBtn: document.querySelector('#file-form button[type="submit"]'),
        analyzeUrlBtn: document.querySelector('#url-form button[type="submit"]')
    };

    // Initialize file upload functionality
    const initFileUpload = () => {
        // File input change event
        DOM.fileInput.addEventListener('change', handleFileSelect);

        // Drag and drop events
        if (DOM.fileDropArea) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                DOM.fileDropArea.addEventListener(eventName, preventDefaults, false);
            });

            ['dragenter', 'dragover'].forEach(eventName => {
                DOM.fileDropArea.addEventListener(eventName, highlight, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                DOM.fileDropArea.addEventListener(eventName, unhighlight, false);
            });

            DOM.fileDropArea.addEventListener('drop', handleDrop, false);
        }

        // File form submit
        DOM.fileForm.addEventListener('submit', handleFileSubmit);
    };

    // Initialize URL input functionality
    const initUrlInput = () => {
        // URL form submit
        DOM.urlForm.addEventListener('submit', handleUrlSubmit);

        // URL input validation
        DOM.urlInput.addEventListener('input', validateUrl);
    };

    // Prevent default drag and drop behavior
    const preventDefaults = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    // Highlight drop area
    const highlight = () => {
        DOM.fileDropArea.classList.add('highlight');
    };

    // Remove highlight from drop area
    const unhighlight = () => {
        DOM.fileDropArea.classList.remove('highlight');
    };

    // Handle file drop
    const handleDrop = (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            DOM.fileInput.files = files;
            handleFileSelect({ target: DOM.fileInput });
        }
    };

    // Handle file selection
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        state.errors = [];

        if (file) {
            // Validate file type
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            if (!state.supportedFileTypes.includes(fileExtension)) {
                state.errors.push(`Unsupported file type: ${fileExtension}. Please upload a supported code file.`);
                showErrors();
                clearFileInput();
                return;
            }

            // Validate file size
            if (file.size > state.maxFileSize) {
                state.errors.push(`File size exceeds the maximum limit of ${state.maxFileSize / (1024 * 1024)}MB.`);
                showErrors();
                clearFileInput();
                return;
            }

            // Display file info
            const fileSize = (file.size / 1024).toFixed(2);
            DOM.fileInfo.innerHTML = `
                <div class="file-details">
                    <p><i class="fas fa-file-code"></i> <strong>${file.name}</strong></p>
                    <p><strong>Size:</strong> ${fileSize} KB</p>
                    <p><strong>Type:</strong> ${fileExtension} file</p>
                </div>
                <div class="file-actions">
                    <button type="button" class="btn btn-sm btn-outline clear-file"><i class="fas fa-times"></i> Clear</button>
                </div>
            `;

            // Add clear button event listener
            const clearBtn = DOM.fileInfo.querySelector('.clear-file');
            if (clearBtn) {
                clearBtn.addEventListener('click', clearFileInput);
            }

            // Read file content
            const reader = new FileReader();
            reader.onload = (event) => {
                state.fileData = {
                    name: file.name,
                    size: fileSize,
                    type: fileExtension,
                    content: event.target.result
                };
                DOM.analyzeFileBtn.disabled = false;
            };
            reader.onerror = () => {
                state.errors.push('Error reading file. Please try again.');
                showErrors();
                clearFileInput();
            };
            reader.readAsText(file);
        } else {
            clearFileInfo();
            DOM.analyzeFileBtn.disabled = true;
        }
    };

    // Clear file input
    const clearFileInput = () => {
        DOM.fileInput.value = '';
        state.fileData = null;
        clearFileInfo();
        DOM.analyzeFileBtn.disabled = true;
    };

    // Clear file info
    const clearFileInfo = () => {
        DOM.fileInfo.innerHTML = '<p>Drag & drop your code file here or click to browse</p>';
    };

    // Validate URL
    const validateUrl = () => {
        const url = DOM.urlInput.value.trim();
        state.errors = [];

        if (url) {
            try {
                new URL(url);
                DOM.urlInput.classList.remove('invalid');
                DOM.analyzeUrlBtn.disabled = false;
                hideErrors();
            } catch (e) {
                DOM.urlInput.classList.add('invalid');
                state.errors.push('Please enter a valid URL');
                showErrors();
                DOM.analyzeUrlBtn.disabled = true;
            }
        } else {
            DOM.urlInput.classList.remove('invalid');
            hideErrors();
            DOM.analyzeUrlBtn.disabled = true;
        }
    };

    // Handle file form submission
    const handleFileSubmit = (e) => {
        e.preventDefault();
        if (state.fileData) {
            simulateFileUpload();
        }
    };

    // Handle URL form submission
    const handleUrlSubmit = (e) => {
        e.preventDefault();
        const url = DOM.urlInput.value.trim();
        if (url) {
            try {
                new URL(url);
                state.urlData = { url };
                simulateUrlFetch(url);
            } catch (e) {
                state.errors.push('Please enter a valid URL');
                showErrors();
            }
        }
    };

    // Simulate file upload with progress
    const simulateFileUpload = () => {
        if (state.isUploading) return;

        state.isUploading = true;
        state.uploadProgress = 0;
        showUploadProgress();

        const interval = setInterval(() => {
            state.uploadProgress += 5;
            updateProgressBar();

            if (state.uploadProgress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    hideUploadProgress();
                    state.isUploading = false;
                    // Trigger analysis in the main app
                    if (typeof CodeGuardian !== 'undefined' && CodeGuardian.startAnalysis) {
                        CodeGuardian.startAnalysis('file', state.fileData);
                    }
                }, 500);
            }
        }, 100);
    };

    // Simulate URL fetch with progress
    const simulateUrlFetch = (url) => {
        if (state.isUploading) return;

        state.isUploading = true;
        state.uploadProgress = 0;
        showUploadProgress();

        const interval = setInterval(() => {
            state.uploadProgress += 10;
            updateProgressBar();

            if (state.uploadProgress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    hideUploadProgress();
                    state.isUploading = false;
                    // Trigger analysis in the main app
                    if (typeof CodeGuardian !== 'undefined' && CodeGuardian.startAnalysis) {
                        CodeGuardian.startAnalysis('url', url);
                    }
                }, 500);
            }
        }, 100);
    };

    // Show upload progress
    const showUploadProgress = () => {
        if (DOM.uploadProgress) {
            DOM.uploadProgress.classList.remove('hidden');
        }
    };

    // Hide upload progress
    const hideUploadProgress = () => {
        if (DOM.uploadProgress) {
            DOM.uploadProgress.classList.add('hidden');
        }
    };

    // Update progress bar
    const updateProgressBar = () => {
        if (DOM.progressBar) {
            DOM.progressBar.style.width = `${state.uploadProgress}%`;
        }
        if (DOM.progressText) {
            DOM.progressText.textContent = `${state.uploadProgress}%`;
        }
    };

    // Show errors
    const showErrors = () => {
        if (DOM.errorContainer && state.errors.length > 0) {
            DOM.errorContainer.innerHTML = state.errors.map(error => `<div class="error-message"><i class="fas fa-exclamation-circle"></i> ${error}</div>`).join('');
            DOM.errorContainer.classList.remove('hidden');
        }
    };

    // Hide errors
    const hideErrors = () => {
        if (DOM.errorContainer) {
            DOM.errorContainer.innerHTML = '';
            DOM.errorContainer.classList.add('hidden');
        }
    };

    // Get file data
    const getFileData = () => {
        return state.fileData;
    };

    // Get URL data
    const getUrlData = () => {
        return state.urlData;
    };

    // Initialize
    const init = () => {
        initFileUpload();
        initUrlInput();
    };

    // Return public methods
    return {
        init,
        getFileData,
        getUrlData
    };
})();

// Initialize the file handler when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    FileHandler.init();
});