/**
 * AI Security Assistant Module
 * Provides interactive security assistance through a fixed-width sidebar
 */

const AISecurityAssistant = (() => {
    // Private variables
    const state = {
        sidebarVisible: false,
        currentVulnerability: null,
        chatHistory: [],
        vulnerabilities: [],
        isProcessing: false
    };

    // Cache DOM elements
    const DOM = {
        sidebar: document.getElementById('ai-security-sidebar'),
        toggleButton: document.getElementById('ai-sidebar-toggle'),
        closeButton: document.getElementById('ai-sidebar-close'),
        vulnerabilitiesList: document.getElementById('ai-vulnerability-summary'),
        codeCorrection: document.getElementById('ai-code-correction'),
        resolutionPathways: document.getElementById('ai-resolution-pathways'),
        resourceLinks: document.getElementById('ai-security-resources'),
        chatPrompt: document.getElementById('ai-chat-prompt'),
        chatInput: document.getElementById('ai-chat-input'),
        sendButton: document.getElementById('ai-chat-send'),
        statusIndicator: document.getElementById('ai-status-indicator'),
        vulnerabilityDetailView: document.getElementById('vulnerability-detail-view'),
        vulnerabilityDetailBack: document.getElementById('vulnerability-detail-back'),
        vulnerabilityDetailContent: document.getElementById('vulnerability-detail-content'),
        vulnerabilityDetailCode: document.getElementById('vulnerability-detail-code'),
        applyFixButton: document.getElementById('apply-fix-button'),
        customizeFixButton: document.getElementById('customize-fix-button'),
        applyAllFixesButton: document.getElementById('apply-all-fixes'),
        customizeFixesButton: document.getElementById('customize-fixes')
    };

    // Toggle sidebar visibility
    const toggleSidebar = () => {
        state.sidebarVisible = !state.sidebarVisible;
        DOM.sidebar.classList.toggle('visible', state.sidebarVisible);
        DOM.toggleButton.classList.toggle('active', state.sidebarVisible);
        
        // Update button text based on visibility
        DOM.toggleButton.innerHTML = state.sidebarVisible ? 
            '<i class="fas fa-times"></i> Close Assistant' : 
            '<i class="fas fa-robot"></i> AI Assistant';
            
        // If opening the sidebar, update the content
        if (state.sidebarVisible) {
            updateSidebarContent();
        }
    };

    // Update sidebar content based on scan results
    const updateSidebarContent = () => {
        // Get vulnerabilities from security scan results
        fetchVulnerabilities();
        
        // Update vulnerability summary
        updateVulnerabilitySummary();
        
        // Update code correction suggestions
        updateCodeCorrection();
        
        // Update resolution pathways
        updateResolutionPathways();
        
        // Update resource links
        updateResourceLinks();
    };

    // Fetch vulnerabilities from security scan results
    const fetchVulnerabilities = () => {
        // This would normally fetch from an API or security scan results
        // For demo purposes, we'll use sample data
        state.vulnerabilities = [
            {
                id: 'vuln-1',
                name: 'SQL Injection',
                severity: 'critical',
                category: 'Input Validation',
                component: 'User Authentication',
                description: 'Unsanitized user input is directly concatenated into SQL queries, allowing potential SQL injection attacks.',
                code: 'const query = "SELECT * FROM users WHERE username = \'' + username + '\' AND password = \'' + password + '\'";\
db.execute(query);',
                lineNumber: 42,
                fileName: 'auth.js',
                fix: 'const query = "SELECT * FROM users WHERE username = ? AND password = ?"\ndb.execute(query, [username, password]);',
                alternativeFixes: [
                    {
                        name: 'Use ORM',
                        code: 'const user = await User.findOne({ username, password });'
                    },
                    {
                        name: 'Use prepared statements',
                        code: 'const query = "SELECT * FROM users WHERE username = ? AND password = ?";\
db.execute(query, [username, password]);'
                    }
                ],
                resources: [
                    { name: 'OWASP SQL Injection', url: 'https://owasp.org/www-community/attacks/SQL_Injection' },
                    { name: 'SQL Injection Prevention', url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html' }
                ]
            },
            {
                id: 'vuln-2',
                name: 'Cross-Site Scripting (XSS)',
                severity: 'high',
                category: 'Output Encoding',
                component: 'User Profile',
                description: 'User-provided content is rendered directly in the DOM without proper sanitization, allowing potential XSS attacks.',
                code: 'document.getElementById("profile").innerHTML = userData.bio;',
                lineNumber: 78,
                fileName: 'profile.js',
                fix: 'const sanitizedBio = DOMPurify.sanitize(userData.bio);\ndocument.getElementById("profile").innerHTML = sanitizedBio;',
                alternativeFixes: [
                    {
                        name: 'Use textContent instead of innerHTML',
                        code: 'document.getElementById("profile").textContent = userData.bio;'
                    },
                    {
                        name: 'Use DOMPurify library',
                        code: 'const sanitizedBio = DOMPurify.sanitize(userData.bio);\ndocument.getElementById("profile").innerHTML = sanitizedBio;'
                    }
                ],
                resources: [
                    { name: 'OWASP XSS', url: 'https://owasp.org/www-community/attacks/xss/' },
                    { name: 'XSS Prevention', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html' }
                ]
            },
            {
                id: 'vuln-3',
                name: 'Insecure Direct Object Reference',
                severity: 'medium',
                category: 'Access Control',
                component: 'Document Management',
                description: 'The application does not verify if the user has permission to access the requested document, allowing potential unauthorized access.',
                code: 'app.get("/documents/:id", (req, res) => {\n  const doc = db.getDocument(req.params.id);\n  res.send(doc);\n});',
                lineNumber: 105,
                fileName: 'routes.js',
                fix: 'app.get("/documents/:id", (req, res) => {\n  const userId = req.session.userId;\n  const doc = db.getDocument(req.params.id);\n  \n  if (!doc || doc.ownerId !== userId) {\n    return res.status(403).send("Access denied");\n  }\n  \n  res.send(doc);\n});',
                alternativeFixes: [
                    {
                        name: 'Use middleware for authorization',
                        code: 'const checkDocAccess = async (req, res, next) => {\n  const userId = req.session.userId;\n  const doc = await db.getDocument(req.params.id);\n  \n  if (!doc || doc.ownerId !== userId) {\n    return res.status(403).send("Access denied");\n  }\n  \n  req.document = doc;\n  next();\n};\n\napp.get("/documents/:id", checkDocAccess, (req, res) => {\n  res.send(req.document);\n});'
                    }
                ],
                resources: [
                    { name: 'OWASP IDOR', url: 'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/04-Testing_for_Insecure_Direct_Object_References' }
                ]
            }
        ];
    };

    // Update vulnerability summary in sidebar
    const updateVulnerabilitySummary = () => {
        if (!DOM.vulnerabilitiesList) return;
        
        if (state.vulnerabilities.length === 0) {
            DOM.vulnerabilitiesList.innerHTML = '<div class="ai-empty-state">No vulnerabilities detected</div>';
            return;
        }
        
        let html = '';
        state.vulnerabilities.forEach(vuln => {
            html += `
                <div class="ai-vulnerability-item" data-id="${vuln.id}">
                    <div class="ai-vulnerability-severity ${vuln.severity}"></div>
                    <div class="ai-vulnerability-info">
                        <div class="ai-vulnerability-name">${vuln.name}</div>
                        <div class="ai-vulnerability-location">${vuln.fileName}:${vuln.lineNumber}</div>
                    </div>
                    <button class="ai-view-details-btn">View</button>
                </div>
            `;
        });
        
        DOM.vulnerabilitiesList.innerHTML = html;
        
        // Add event listeners to view details buttons
        document.querySelectorAll('.ai-view-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const vulnId = e.target.closest('.ai-vulnerability-item').getAttribute('data-id');
                showVulnerabilityDetails(vulnId);
            });
        });
    };

    // Update code correction suggestions
    const updateCodeCorrection = () => {
        if (!DOM.codeCorrection) return;
        
        if (state.vulnerabilities.length === 0) {
            DOM.codeCorrection.innerHTML = '<div class="ai-empty-state">No code corrections available</div>';
            return;
        }
        
        // Get the most critical vulnerability
        const criticalVuln = state.vulnerabilities.find(v => v.severity === 'critical') || 
                            state.vulnerabilities.find(v => v.severity === 'high') || 
                            state.vulnerabilities[0];
        
        DOM.codeCorrection.innerHTML = `
            <div class="ai-code-correction-header">
                <div class="ai-code-correction-title">Suggested Fix for ${criticalVuln.name}</div>
                <div class="ai-code-correction-file">${criticalVuln.fileName}:${criticalVuln.lineNumber}</div>
            </div>
            <div class="ai-code-block">
                <pre><code class="language-javascript">${criticalVuln.fix}</code></pre>
            </div>
            <button class="ai-apply-fix-btn" data-id="${criticalVuln.id}">Apply Fix</button>
        `;
        
        // Add event listener to apply fix button
        document.querySelector('.ai-apply-fix-btn').addEventListener('click', (e) => {
            const vulnId = e.target.getAttribute('data-id');
            applyFix(vulnId);
        });
        
        // Apply syntax highlighting
        if (window.Prism) {
            Prism.highlightAll();
        }
    };

    // Update resolution pathways
    const updateResolutionPathways = () => {
        if (!DOM.resolutionPathways) return;
        
        if (state.vulnerabilities.length === 0) {
            DOM.resolutionPathways.innerHTML = '<div class="ai-empty-state">No resolution pathways available</div>';
            return;
        }
        
        let html = '<ul class="ai-resolution-list">';
        
        // Group vulnerabilities by category
        const categories = {};
        state.vulnerabilities.forEach(vuln => {
            if (!categories[vuln.category]) {
                categories[vuln.category] = [];
            }
            categories[vuln.category].push(vuln);
        });
        
        // Create resolution pathways for each category
        Object.keys(categories).forEach(category => {
            const vulns = categories[category];
            html += `
                <li class="ai-resolution-category">
                    <div class="ai-resolution-category-name">${category}</div>
                    <ul class="ai-resolution-steps">
            `;
            
            vulns.forEach(vuln => {
                html += `<li class="ai-resolution-step">${vuln.name} in ${vuln.component}</li>`;
            });
            
            html += `
                    </ul>
                </li>
            `;
        });
        
        html += '</ul>';
        DOM.resolutionPathways.innerHTML = html;
    };

    // Update resource links
    const updateResourceLinks = () => {
        if (!DOM.resourceLinks) return;
        
        if (state.vulnerabilities.length === 0) {
            DOM.resourceLinks.innerHTML = '<div class="ai-empty-state">No resources available</div>';
            return;
        }
        
        let html = '<ul class="ai-resource-list">';
        
        // Collect unique resources
        const resources = new Map();
        state.vulnerabilities.forEach(vuln => {
            vuln.resources.forEach(resource => {
                resources.set(resource.url, resource);
            });
        });
        
        resources.forEach(resource => {
            html += `
                <li class="ai-resource-item">
                    <a href="${resource.url}" target="_blank" rel="noopener noreferrer">
                        <i class="fas fa-external-link-alt"></i> ${resource.name}
                    </a>
                </li>
            `;
        });
        
        html += '</ul>';
        DOM.resourceLinks.innerHTML = html;
    };

    // Show vulnerability details
    const showVulnerabilityDetails = (vulnId) => {
        const vulnerability = state.vulnerabilities.find(v => v.id === vulnId);
        if (!vulnerability) return;
        
        state.currentVulnerability = vulnerability;
        
        // Update detail view content
        DOM.vulnerabilityDetailContent.innerHTML = `
            <div class="ai-vulnerability-detail-header">
                <div class="ai-vulnerability-detail-severity ${vulnerability.severity}">${vulnerability.severity}</div>
                <div class="ai-vulnerability-detail-name">${vulnerability.name}</div>
            </div>
            <div class="ai-vulnerability-detail-info">
                <div class="ai-vulnerability-detail-category"><strong>Category:</strong> ${vulnerability.category}</div>
                <div class="ai-vulnerability-detail-component"><strong>Component:</strong> ${vulnerability.component}</div>
                <div class="ai-vulnerability-detail-location"><strong>Location:</strong> ${vulnerability.fileName}:${vulnerability.lineNumber}</div>
            </div>
            <div class="ai-vulnerability-detail-description">
                <h4>Description</h4>
                <p>${vulnerability.description}</p>
            </div>
        `;
        
        // Update code display
        DOM.vulnerabilityDetailCode.innerHTML = `
            <div class="ai-code-section">
                <h4>Vulnerable Code</h4>
                <pre><code class="language-javascript">${vulnerability.code}</code></pre>
            </div>
            <div class="ai-code-section">
                <h4>Recommended Fix</h4>
                <pre><code class="language-javascript">${vulnerability.fix}</code></pre>
            </div>
        `;
        
        // Show alternative fixes if available
        if (vulnerability.alternativeFixes && vulnerability.alternativeFixes.length > 0) {
            let alternativesHtml = '<div class="ai-alternative-fixes"><h4>Alternative Approaches</h4>';
            
            vulnerability.alternativeFixes.forEach((alt, index) => {
                alternativesHtml += `
                    <div class="ai-alternative-fix">
                        <div class="ai-alternative-fix-name">${alt.name}</div>
                        <pre><code class="language-javascript">${alt.code}</code></pre>
                        <button class="ai-apply-alternative-btn" data-vuln-id="${vulnerability.id}" data-alt-index="${index}">Apply This Fix</button>
                    </div>
                `;
            });
            
            alternativesHtml += '</div>';
            DOM.vulnerabilityDetailCode.innerHTML += alternativesHtml;
        }
        
        // Show the detail view
        DOM.vulnerabilityDetailView.classList.add('visible');
        
        // Apply syntax highlighting
        if (window.Prism) {
            Prism.highlightAll();
        }
        
        // Add event listeners to fix buttons
        document.querySelectorAll('.ai-apply-alternative-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const vulnId = e.target.getAttribute('data-vuln-id');
                const altIndex = e.target.getAttribute('data-alt-index');
                applyAlternativeFix(vulnId, parseInt(altIndex));
            });
        });
    };

    // Hide vulnerability details
    const hideVulnerabilityDetails = () => {
        DOM.vulnerabilityDetailView.classList.remove('visible');
        state.currentVulnerability = null;
    };

    // Apply fix for vulnerability
    const applyFix = (vulnId) => {
        const vulnerability = state.vulnerabilities.find(v => v.id === vulnId);
        if (!vulnerability) return;
        
        // This would normally update the actual code file
        // For demo purposes, we'll just show a success message
        showNotification(`Applied fix for ${vulnerability.name} in ${vulnerability.fileName}`);
        
        // Remove the vulnerability from the list
        state.vulnerabilities = state.vulnerabilities.filter(v => v.id !== vulnId);
        
        // Update sidebar content
        updateSidebarContent();
        
        // Hide vulnerability details if it's the current one
        if (state.currentVulnerability && state.currentVulnerability.id === vulnId) {
            hideVulnerabilityDetails();
        }
    };

    // Apply alternative fix
    const applyAlternativeFix = (vulnId, altIndex) => {
        const vulnerability = state.vulnerabilities.find(v => v.id === vulnId);
        if (!vulnerability || !vulnerability.alternativeFixes || altIndex >= vulnerability.alternativeFixes.length) return;
        
        const alternative = vulnerability.alternativeFixes[altIndex];
        
        // This would normally update the actual code file
        // For demo purposes, we'll just show a success message
        showNotification(`Applied ${alternative.name} fix for ${vulnerability.name} in ${vulnerability.fileName}`);
        
        // Remove the vulnerability from the list
        state.vulnerabilities = state.vulnerabilities.filter(v => v.id !== vulnId);
        
        // Update sidebar content
        updateSidebarContent();
        
        // Hide vulnerability details
        hideVulnerabilityDetails();
    };

    // Apply all fixes
    const applyAllFixes = () => {
        if (state.vulnerabilities.length === 0) return;
        
        // This would normally update all code files
        // For demo purposes, we'll just show a success message
        showNotification(`Applied fixes for ${state.vulnerabilities.length} vulnerabilities`);
        
        // Clear vulnerabilities
        state.vulnerabilities = [];
        
        // Update sidebar content
        updateSidebarContent();
        
        // Hide vulnerability details if visible
        hideVulnerabilityDetails();
    };

    // Show notification
    const showNotification = (message) => {
        const notification = document.createElement('div');
        notification.className = 'ai-notification';
        notification.innerHTML = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('visible');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('visible');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    };

    // Handle chat input
    const handleChatInput = () => {
        const message = DOM.chatInput.value.trim();
        if (!message || state.isProcessing) return;
        
        // Clear input
        DOM.chatInput.value = '';
        
        // Show processing state
        state.isProcessing = true;
        DOM.statusIndicator.classList.add('processing');
        
        // Add user message to chat history
        state.chatHistory.push({
            role: 'user',
            content: message
        });
        
        // This would normally call an AI API
        // For demo purposes, we'll generate a response after a delay
        setTimeout(() => {
            // Generate response based on message
            let response = '';
            
            if (message.toLowerCase().includes('sql injection')) {
                response = 'SQL Injection vulnerabilities occur when untrusted data is sent to an interpreter as part of a command or query. To fix this, use parameterized queries or prepared statements instead of concatenating user input directly into SQL queries.';
            } else if (message.toLowerCase().includes('xss') || message.toLowerCase().includes('cross-site')) {
                response = 'Cross-Site Scripting (XSS) vulnerabilities allow attackers to inject client-side scripts into web pages viewed by other users. To prevent XSS, always sanitize user input and use context-appropriate output encoding.';
            } else if (message.toLowerCase().includes('fix') || message.toLowerCase().includes('solve')) {
                response = 'I recommend applying the suggested fixes for the detected vulnerabilities. These fixes follow security best practices and will significantly improve your application\'s security posture.';
            } else {
                response = 'I\'m your AI security assistant. I can help you understand and fix security vulnerabilities in your code. You can ask me about specific vulnerabilities, security best practices, or how to implement the suggested fixes.';
            }
            
            // Add AI response to chat history
            state.chatHistory.push({
                role: 'assistant',
                content: response
            });
            
            // Update chat display
            updateChatDisplay();
            
            // Hide processing state
            state.isProcessing = false;
            DOM.statusIndicator.classList.remove('processing');
        }, 1000);
    };

    // Update chat display
    const updateChatDisplay = () => {
        if (!DOM.chatPrompt) return;
        
        let html = '';
        state.chatHistory.forEach(message => {
            const isUser = message.role === 'user';
            html += `
                <div class="ai-chat-message ${isUser ? 'user' : 'assistant'}">
                    <div class="ai-chat-avatar">
                        <i class="fas ${isUser ? 'fa-user' : 'fa-robot'}"></i>
                    </div>
                    <div class="ai-chat-content">${message.content}</div>
                </div>
            `;
        });
        
        DOM.chatPrompt.innerHTML = html;
        
        // Scroll to bottom
        DOM.chatPrompt.scrollTop = DOM.chatPrompt.scrollHeight;
    };

    // Initialize event listeners
    const initEventListeners = () => {
        // Toggle sidebar
        if (DOM.toggleButton) {
            DOM.toggleButton.addEventListener('click', toggleSidebar);
        }
        
        // Close sidebar
        if (DOM.closeButton) {
            DOM.closeButton.addEventListener('click', toggleSidebar);
        }
        
        // Back button in vulnerability details
        if (DOM.vulnerabilityDetailBack) {
            DOM.vulnerabilityDetailBack.addEventListener('click', hideVulnerabilityDetails);
        }
        
        // Apply fix button in vulnerability details
        if (DOM.applyFixButton) {
            DOM.applyFixButton.addEventListener('click', () => {
                if (state.currentVulnerability) {
                    applyFix(state.currentVulnerability.id);
                }
            });
        }
        
        // Apply all fixes button
        if (DOM.applyAllFixesButton) {
            DOM.applyAllFixesButton.addEventListener('click', applyAllFixes);
        }
        
        // Chat input
        if (DOM.chatInput && DOM.sendButton) {
            DOM.sendButton.addEventListener('click', handleChatInput);
            
            DOM.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleChatInput();
                }
            });
        }
    };

    // Initialize the module
    const init = () => {
        initEventListeners();
        
        // Add AI sidebar toggle button if it doesn't exist
        if (!DOM.toggleButton) {
            const toggleButton = document.createElement('button');
            toggleButton.id = 'ai-sidebar-toggle';
            toggleButton.className = 'ai-sidebar-toggle';
            toggleButton.innerHTML = '<i class="fas fa-robot"></i> AI Assistant';
            document.body.appendChild(toggleButton);
            
            // Update DOM cache
            DOM.toggleButton = toggleButton;
            
            // Add event listener
            toggleButton.addEventListener('click', toggleSidebar);
        }
    };

    // Return public methods
    return {
        init,
        toggleSidebar,
        showVulnerabilityDetails,
        applyFix,
        applyAllFixes
    };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    AISecurityAssistant.init();
});