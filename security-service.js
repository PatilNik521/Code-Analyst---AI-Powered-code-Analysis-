/**
 * CodeGuardian - Security Analysis Service
 * Handles security analysis features including API security and cloud security assessments
 */

const SecurityService = (() => {
    // Private variables
    const state = {
        securityScanInProgress: false,
        lastScanResults: null,
        vulnerabilityDatabase: null,
        scanDepth: 'standard', // 'basic', 'standard', 'deep'
        scanTypes: ['code', 'api', 'cloud', 'dependency'],
        enabledScanTypes: ['code', 'api', 'cloud', 'dependency']
    };

    // Cache DOM elements
    const DOM = {
        scanBtn: document.getElementById('security-scan-btn'),
        scanDepthSelect: document.getElementById('scan-depth'),
        scanTypeCheckboxes: document.querySelectorAll('.scan-type-checkbox'),
        resultsContainer: document.querySelector('.security-results-container'),
        vulnerabilitiesList: document.querySelector('.vulnerabilities-list'),
        securityScore: document.querySelector('.security-score-value'),
        securityScoreCircle: document.querySelector('.security-score-circle .progress-circle-fill'),
        threatLevelIndicator: document.querySelector('.threat-level-indicator'),
        securityLoader: document.querySelector('.security-scan .loader'),
        apiSecurityTab: document.getElementById('api-security-tab'),
        cloudSecurityTab: document.getElementById('cloud-security-tab'),
        codeSecurityTab: document.getElementById('code-security-tab'),
        dependencySecurityTab: document.getElementById('dependency-security-tab')
    };

    // Security vulnerability database (simplified for demo)
    const initVulnerabilityDatabase = () => {
        state.vulnerabilityDatabase = {
            api: [
                {
                    id: 'API-SEC-001',
                    name: 'Missing API Authentication',
                    description: 'API endpoints are accessible without proper authentication',
                    severity: 'critical',
                    remediation: 'Implement OAuth 2.0 or JWT authentication for all API endpoints',
                    cwe: 'CWE-306',
                    detectionPatterns: ['api', 'endpoint', 'route', 'public']
                },
                {
                    id: 'API-SEC-002',
                    name: 'Insecure Direct Object References (IDOR)',
                    description: 'API allows access to resources via direct references without access control checks',
                    severity: 'high',
                    remediation: 'Implement proper authorization checks for all resource access',
                    cwe: 'CWE-639',
                    detectionPatterns: ['id', 'uuid', 'param', 'request']
                },
                {
                    id: 'API-SEC-003',
                    name: 'Excessive Data Exposure',
                    description: 'API returns excessive data in responses that may include sensitive information',
                    severity: 'medium',
                    remediation: 'Filter response data to include only necessary information',
                    cwe: 'CWE-213',
                    detectionPatterns: ['response', 'json', 'data', 'return']
                },
                {
                    id: 'API-SEC-004',
                    name: 'Missing Rate Limiting',
                    description: 'API lacks rate limiting, making it vulnerable to abuse and DoS attacks',
                    severity: 'medium',
                    remediation: 'Implement rate limiting middleware for all API endpoints',
                    cwe: 'CWE-770',
                    detectionPatterns: ['api', 'request', 'endpoint', 'route']
                },
                {
                    id: 'API-SEC-005',
                    name: 'Improper Error Handling',
                    description: 'API returns detailed error messages that may expose sensitive information',
                    severity: 'low',
                    remediation: 'Implement proper error handling with sanitized error messages',
                    cwe: 'CWE-209',
                    detectionPatterns: ['error', 'exception', 'catch', 'throw']
                }
            ],
            cloud: [
                {
                    id: 'CLOUD-SEC-001',
                    name: 'Insecure Cloud Storage Configuration',
                    description: 'Cloud storage buckets or containers with public access or overly permissive settings',
                    severity: 'critical',
                    remediation: 'Configure proper access controls and encryption for cloud storage',
                    cwe: 'CWE-668',
                    detectionPatterns: ['s3', 'bucket', 'blob', 'storage', 'public']
                },
                {
                    id: 'CLOUD-SEC-002',
                    name: 'Hardcoded Cloud Credentials',
                    description: 'Cloud service credentials hardcoded in application code',
                    severity: 'critical',
                    remediation: 'Use environment variables or secure secret management services',
                    cwe: 'CWE-798',
                    detectionPatterns: ['key', 'secret', 'password', 'token', 'credential']
                },
                {
                    id: 'CLOUD-SEC-003',
                    name: 'Insecure Serverless Function Configuration',
                    description: 'Serverless functions with excessive permissions or insecure triggers',
                    severity: 'high',
                    remediation: 'Apply least privilege principle to serverless function permissions',
                    cwe: 'CWE-250',
                    detectionPatterns: ['lambda', 'function', 'serverless', 'cloud function']
                },
                {
                    id: 'CLOUD-SEC-004',
                    name: 'Missing Cloud Resource Encryption',
                    description: 'Cloud resources without proper encryption at rest or in transit',
                    severity: 'high',
                    remediation: 'Enable encryption for all cloud resources and communications',
                    cwe: 'CWE-311',
                    detectionPatterns: ['data', 'storage', 'database', 'encrypt']
                },
                {
                    id: 'CLOUD-SEC-005',
                    name: 'Inadequate Cloud Logging and Monitoring',
                    description: 'Insufficient logging and monitoring of cloud resource access and changes',
                    severity: 'medium',
                    remediation: 'Configure comprehensive logging and monitoring for all cloud resources',
                    cwe: 'CWE-778',
                    detectionPatterns: ['log', 'monitor', 'audit', 'trace']
                }
            ],
            code: [
                {
                    id: 'CODE-SEC-001',
                    name: 'SQL Injection Vulnerability',
                    description: 'Code contains potential SQL injection vulnerabilities',
                    severity: 'critical',
                    remediation: 'Use parameterized queries or ORM libraries',
                    cwe: 'CWE-89',
                    detectionPatterns: ['sql', 'query', 'database', 'db']
                },
                {
                    id: 'CODE-SEC-002',
                    name: 'Cross-Site Scripting (XSS)',
                    description: 'Code vulnerable to Cross-Site Scripting attacks',
                    severity: 'high',
                    remediation: 'Implement proper output encoding and Content Security Policy',
                    cwe: 'CWE-79',
                    detectionPatterns: ['innerHTML', 'document.write', 'eval', 'html']
                },
                {
                    id: 'CODE-SEC-003',
                    name: 'Insecure Cryptographic Implementation',
                    description: 'Weak or improper use of cryptographic functions',
                    severity: 'high',
                    remediation: 'Use strong, standard cryptographic libraries and algorithms',
                    cwe: 'CWE-327',
                    detectionPatterns: ['md5', 'sha1', 'crypto', 'hash']
                },
                {
                    id: 'CODE-SEC-004',
                    name: 'Insecure File Operations',
                    description: 'Insecure file operations that may lead to path traversal or unauthorized access',
                    severity: 'medium',
                    remediation: 'Validate and sanitize file paths and implement proper access controls',
                    cwe: 'CWE-22',
                    detectionPatterns: ['file', 'path', 'read', 'write']
                },
                {
                    id: 'CODE-SEC-005',
                    name: 'Insecure Random Number Generation',
                    description: 'Use of weak random number generators for security-sensitive operations',
                    severity: 'medium',
                    remediation: 'Use cryptographically secure random number generators',
                    cwe: 'CWE-338',
                    detectionPatterns: ['random', 'math.random', 'rand']
                }
            ],
            dependency: [
                {
                    id: 'DEP-SEC-001',
                    name: 'Outdated Dependencies with Known Vulnerabilities',
                    description: 'Project uses dependencies with known security vulnerabilities',
                    severity: 'high',
                    remediation: 'Update dependencies to latest secure versions',
                    cwe: 'CWE-1104',
                    detectionPatterns: ['package.json', 'requirements.txt', 'gemfile', 'pom.xml']
                },
                {
                    id: 'DEP-SEC-002',
                    name: 'Insecure Dependency Configuration',
                    description: 'Dependencies configured with insecure options or defaults',
                    severity: 'medium',
                    remediation: 'Review and secure dependency configurations',
                    cwe: 'CWE-1108',
                    detectionPatterns: ['config', 'configuration', 'setup']
                },
                {
                    id: 'DEP-SEC-003',
                    name: 'Transitive Dependency Vulnerabilities',
                    description: 'Vulnerabilities in transitive dependencies',
                    severity: 'medium',
                    remediation: 'Use dependency lockfiles and regular security audits',
                    cwe: 'CWE-1104',
                    detectionPatterns: ['package-lock.json', 'yarn.lock', 'Pipfile.lock']
                }
            ]
        };
    };

    // Initialize event listeners
    const initEventListeners = () => {
        // Security scan button
        if (DOM.scanBtn) {
            DOM.scanBtn.addEventListener('click', () => {
                if (!state.securityScanInProgress) {
                    startSecurityScan();
                }
            });
        }

        // Scan depth selection
        if (DOM.scanDepthSelect) {
            DOM.scanDepthSelect.addEventListener('change', () => {
                state.scanDepth = DOM.scanDepthSelect.value;
            });
        }

        // Scan type checkboxes
        if (DOM.scanTypeCheckboxes) {
            DOM.scanTypeCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    updateEnabledScanTypes();
                });
            });
        }

        // Security tab navigation
        const securityTabs = [DOM.apiSecurityTab, DOM.cloudSecurityTab, DOM.codeSecurityTab, DOM.dependencySecurityTab];
        securityTabs.forEach(tab => {
            if (tab) {
                tab.addEventListener('click', () => {
                    showSecurityTabContent(tab.id);
                });
            }
        });
    };

    // Update enabled scan types based on checkboxes
    const updateEnabledScanTypes = () => {
        state.enabledScanTypes = [];
        DOM.scanTypeCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                state.enabledScanTypes.push(checkbox.value);
            }
        });
    };

    // Show security tab content
    const showSecurityTabContent = (tabId) => {
        // Hide all tab content
        const tabContents = document.querySelectorAll('.security-tab-content');
        tabContents.forEach(content => {
            content.classList.add('hidden');
        });

        // Remove active class from all tabs
        const tabs = document.querySelectorAll('.security-tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });

        // Show selected tab content and mark tab as active
        const selectedTab = document.getElementById(tabId);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }

        const contentId = tabId.replace('-tab', '-content');
        const selectedContent = document.getElementById(contentId);
        if (selectedContent) {
            selectedContent.classList.remove('hidden');
        }
    };

    // Start security scan
    const startSecurityScan = () => {
        state.securityScanInProgress = true;
        showLoader();
        clearResults();

        // Get code from CodeGuardian main module
        const code = window.CodeGuardian ? window.CodeGuardian.getCurrentCode() : '';
        const language = window.CodeGuardian ? window.CodeGuardian.getCurrentLanguage() : 'unknown';

        // Simulate scan delay
        setTimeout(() => {
            performSecurityAnalysis(code, language);
        }, 2000);
    };

    // Show loader
    const showLoader = () => {
        if (DOM.securityLoader) {
            DOM.securityLoader.classList.remove('hidden');
        }
    };

    // Hide loader
    const hideLoader = () => {
        if (DOM.securityLoader) {
            DOM.securityLoader.classList.add('hidden');
        }
    };

    // Clear previous results
    const clearResults = () => {
        if (DOM.vulnerabilitiesList) {
            DOM.vulnerabilitiesList.innerHTML = '';
        }
        if (DOM.securityScore) {
            DOM.securityScore.textContent = '0';
        }
        if (DOM.securityScoreCircle) {
            DOM.securityScoreCircle.style.strokeDasharray = '0 100';
        }
        if (DOM.threatLevelIndicator) {
            DOM.threatLevelIndicator.className = 'threat-level-indicator';
            DOM.threatLevelIndicator.textContent = 'N/A';
        }
    };

    // Perform security analysis
    const performSecurityAnalysis = (code, language) => {
        // Initialize results object
        const results = {
            vulnerabilities: [],
            securityScore: 0,
            threatLevel: 'unknown',
            scanTime: new Date().toISOString(),
            scanDepth: state.scanDepth,
            scanTypes: state.enabledScanTypes
        };

        // Skip analysis if code is empty
        if (!code) {
            state.securityScanInProgress = false;
            hideLoader();
            updateResults(results);
            return;
        }

        // Analyze code for each enabled scan type
        state.enabledScanTypes.forEach(scanType => {
            const typeVulnerabilities = analyzeCodeForVulnerabilities(code, scanType);
            results.vulnerabilities = [...results.vulnerabilities, ...typeVulnerabilities];
        });

        // Calculate security score and threat level
        calculateSecurityMetrics(results);

        // Store results
        state.lastScanResults = results;

        // Update UI with results
        state.securityScanInProgress = false;
        hideLoader();
        updateResults(results);

        // Add to activity log if CodeGuardian main module is available
        if (window.CodeGuardian && window.CodeGuardian.addActivity) {
            window.CodeGuardian.addActivity({
                type: 'security_scan',
                description: `Security scan completed with ${results.vulnerabilities.length} vulnerabilities found`,
                timestamp: new Date().toISOString(),
                details: {
                    securityScore: results.securityScore,
                    threatLevel: results.threatLevel,
                    vulnerabilitiesCount: results.vulnerabilities.length
                }
            });
        }
    };

    // Analyze code for vulnerabilities of a specific type
    const analyzeCodeForVulnerabilities = (code, scanType) => {
        const vulnerabilities = [];
        const vulnerabilityTypes = state.vulnerabilityDatabase[scanType];

        if (!vulnerabilityTypes) return vulnerabilities;

        // For each vulnerability type, check if code contains detection patterns
        vulnerabilityTypes.forEach(vulnerability => {
            // Skip some vulnerabilities based on scan depth
            if (state.scanDepth === 'basic' && vulnerability.severity !== 'critical') {
                return;
            }
            if (state.scanDepth === 'standard' && vulnerability.severity === 'low') {
                // For standard depth, randomly skip some low severity issues
                if (Math.random() > 0.5) return;
            }

            // Check if code contains any detection patterns
            const hasPattern = vulnerability.detectionPatterns.some(pattern => {
                return code.toLowerCase().includes(pattern.toLowerCase());
            });

            // For demo purposes, also add some randomness to findings
            const randomFactor = Math.random();
            const shouldInclude = hasPattern || 
                                 (scanType === 'api' && randomFactor < 0.3) || 
                                 (scanType === 'cloud' && randomFactor < 0.25) ||
                                 (scanType === 'code' && randomFactor < 0.2) ||
                                 (scanType === 'dependency' && randomFactor < 0.15);

            if (shouldInclude) {
                // Create a copy of the vulnerability with additional info
                const foundVulnerability = { ...vulnerability };
                
                // Add line numbers (simulated)
                foundVulnerability.lineStart = Math.floor(Math.random() * code.split('\n').length) + 1;
                foundVulnerability.lineEnd = foundVulnerability.lineStart + Math.floor(Math.random() * 5);
                
                // Add to vulnerabilities list
                vulnerabilities.push(foundVulnerability);
            }
        });

        return vulnerabilities;
    };

    // Calculate security score and threat level
    const calculateSecurityMetrics = (results) => {
        const vulnerabilities = results.vulnerabilities;
        
        // Count vulnerabilities by severity
        const counts = {
            critical: vulnerabilities.filter(v => v.severity === 'critical').length,
            high: vulnerabilities.filter(v => v.severity === 'high').length,
            medium: vulnerabilities.filter(v => v.severity === 'medium').length,
            low: vulnerabilities.filter(v => v.severity === 'low').length
        };
        
        // Calculate weighted score (0-100, higher is better)
        const totalWeight = counts.critical * 10 + counts.high * 5 + counts.medium * 2 + counts.low * 1;
        const maxPossibleWeight = 30; // Arbitrary maximum for normalization
        const normalizedWeight = Math.min(totalWeight, maxPossibleWeight);
        const securityScore = Math.max(0, Math.round(100 - (normalizedWeight / maxPossibleWeight * 100)));
        
        // Determine threat level
        let threatLevel = 'low';
        if (counts.critical > 0 || counts.high > 2) {
            threatLevel = 'critical';
        } else if (counts.high > 0 || counts.medium > 3) {
            threatLevel = 'high';
        } else if (counts.medium > 0 || counts.low > 5) {
            threatLevel = 'medium';
        }
        
        // Update results object
        results.securityScore = securityScore;
        results.threatLevel = threatLevel;
        results.vulnerabilityCounts = counts;
    };

    // Update UI with results
    const updateResults = (results) => {
        // Update security score
        if (DOM.securityScore) {
            animateCounter(DOM.securityScore, 0, results.securityScore, 1500);
        }
        
        // Update security score circle
        if (DOM.securityScoreCircle) {
            animateCircle(DOM.securityScoreCircle, 0, results.securityScore, 1500);
        }
        
        // Update threat level indicator
        if (DOM.threatLevelIndicator) {
            DOM.threatLevelIndicator.className = `threat-level-indicator ${results.threatLevel}`;
            DOM.threatLevelIndicator.textContent = results.threatLevel.toUpperCase();
        }
        
        // Update vulnerabilities list
        if (DOM.vulnerabilitiesList) {
            updateVulnerabilitiesList(results.vulnerabilities);
        }
        
        // Show results container
        if (DOM.resultsContainer) {
            DOM.resultsContainer.classList.remove('hidden');
        }
    };

    // Update vulnerabilities list
    const updateVulnerabilitiesList = (vulnerabilities) => {
        if (!DOM.vulnerabilitiesList) return;
        
        if (vulnerabilities.length === 0) {
            DOM.vulnerabilitiesList.innerHTML = '<div class="no-vulnerabilities">No vulnerabilities found!</div>';
            return;
        }
        
        // Sort vulnerabilities by severity (critical first)
        const sortedVulnerabilities = [...vulnerabilities].sort((a, b) => {
            const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return severityOrder[a.severity] - severityOrder[b.severity];
        });
        
        // Generate HTML for each vulnerability
        let html = '';
        sortedVulnerabilities.forEach(vulnerability => {
            html += `
                <div class="vulnerability-item ${vulnerability.severity}">
                    <div class="vulnerability-header">
                        <div class="vulnerability-severity ${vulnerability.severity}">${vulnerability.severity}</div>
                        <div class="vulnerability-id">${vulnerability.id}</div>
                        <div class="vulnerability-name">${vulnerability.name}</div>
                    </div>
                    <div class="vulnerability-details">
                        <div class="vulnerability-description">
                            <strong>Description:</strong> ${vulnerability.description}
                        </div>
                        <div class="vulnerability-location">
                            <strong>Location:</strong> Lines ${vulnerability.lineStart}-${vulnerability.lineEnd}
                        </div>
                        <div class="vulnerability-remediation">
                            <strong>Remediation:</strong> ${vulnerability.remediation}
                        </div>
                        <div class="vulnerability-cwe">
                            <strong>CWE:</strong> <a href="https://cwe.mitre.org/data/definitions/${vulnerability.cwe.split('-')[1]}.html" target="_blank">${vulnerability.cwe}</a>
                        </div>
                    </div>
                </div>
            `;
        });
        
        DOM.vulnerabilitiesList.innerHTML = html;
        
        // Add click event to toggle vulnerability details
        const vulnerabilityItems = DOM.vulnerabilitiesList.querySelectorAll('.vulnerability-item');
        vulnerabilityItems.forEach(item => {
            const header = item.querySelector('.vulnerability-header');
            const details = item.querySelector('.vulnerability-details');
            
            header.addEventListener('click', () => {
                details.classList.toggle('expanded');
                header.classList.toggle('expanded');
            });
        });
    };

    // Animate counter
    const animateCounter = (element, start, end, duration) => {
        const range = end - start;
        const increment = end > start ? 1 : -1;
        const stepTime = Math.abs(Math.floor(duration / range));
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            element.textContent = current;
            if (current === end) {
                clearInterval(timer);
            }
        }, stepTime);
    };

    // Animate circle
    const animateCircle = (element, start, end, duration) => {
        const startTime = performance.now();
        
        const updateCircle = (timestamp) => {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const value = start + (end - start) * progress;
            
            element.style.strokeDasharray = `${value} 100`;
            
            if (progress < 1) {
                requestAnimationFrame(updateCircle);
            }
        };
        
        requestAnimationFrame(updateCircle);
    };

    // Get API security recommendations
    const getAPISecurityRecommendations = () => {
        return [
            {
                title: 'Implement OAuth 2.0 or JWT Authentication',
                description: 'Use industry-standard authentication protocols to secure API access',
                priority: 'high'
            },
            {
                title: 'Apply Rate Limiting',
                description: 'Protect APIs from abuse and DoS attacks with rate limiting',
                priority: 'medium'
            },
            {
                title: 'Use HTTPS for All API Communications',
                description: 'Encrypt all API traffic using TLS/SSL',
                priority: 'high'
            },
            {
                title: 'Implement Proper Error Handling',
                description: 'Return standardized error responses without exposing sensitive information',
                priority: 'medium'
            },
            {
                title: 'Validate All Input Parameters',
                description: 'Implement strict validation for all API inputs',
                priority: 'high'
            },
            {
                title: 'Use API Gateway',
                description: 'Implement an API gateway for centralized security controls',
                priority: 'medium'
            },
            {
                title: 'Apply Principle of Least Privilege',
                description: 'Restrict API permissions to only what is necessary',
                priority: 'high'
            }
        ];
    };

    // Get cloud security recommendations
    const getCloudSecurityRecommendations = () => {
        return [
            {
                title: 'Implement Infrastructure as Code (IaC)',
                description: 'Use tools like Terraform or CloudFormation to manage cloud infrastructure securely',
                priority: 'high'
            },
            {
                title: 'Enable Multi-Factor Authentication',
                description: 'Require MFA for all cloud service accounts',
                priority: 'critical'
            },
            {
                title: 'Use Cloud Security Posture Management (CSPM)',
                description: 'Implement continuous monitoring and assessment of cloud security',
                priority: 'high'
            },
            {
                title: 'Encrypt Data at Rest and in Transit',
                description: 'Apply encryption to all cloud-stored data and communications',
                priority: 'high'
            },
            {
                title: 'Implement Network Segmentation',
                description: 'Use VPCs, subnets, and security groups to isolate resources',
                priority: 'medium'
            },
            {
                title: 'Enable Comprehensive Logging and Monitoring',
                description: 'Configure detailed logging for all cloud resources and set up alerts',
                priority: 'high'
            },
            {
                title: 'Implement Least Privilege Access',
                description: 'Apply IAM policies that grant only necessary permissions',
                priority: 'critical'
            },
            {
                title: 'Regular Security Assessments',
                description: 'Conduct regular security audits and penetration testing',
                priority: 'medium'
            },
            {
                title: 'Implement Secure CI/CD Pipelines',
                description: 'Integrate security testing into deployment pipelines',
                priority: 'high'
            }
        ];
    };

    // Initialize
    const init = () => {
        initVulnerabilityDatabase();
        initEventListeners();
    };

    // Return public methods
    return {
        init,
        startSecurityScan,
        getAPISecurityRecommendations,
        getCloudSecurityRecommendations
    };
})();

// Initialize the Security Service when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    SecurityService.init();
});

// Add custom CSS for security features
(() => {
    const style = document.createElement('style');
    style.textContent = `
        .vulnerability-item {
            margin-bottom: 15px;
            border-radius: var(--radius-sm);
            overflow: hidden;
            border-left: 4px solid var(--accent-blue);
            background-color: var(--bg-tertiary);
        }
        
        .vulnerability-item.critical {
            border-left-color: var(--accent-red);
        }
        
        .vulnerability-item.high {
            border-left-color: #ff6b00;
        }
        
        .vulnerability-item.medium {
            border-left-color: #ffcc00;
        }
        
        .vulnerability-item.low {
            border-left-color: var(--accent-blue);
        }
        
        .vulnerability-header {
            padding: 12px 15px;
            display: flex;
            align-items: center;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }
        
        .vulnerability-header:hover {
            background-color: var(--bg-secondary);
        }
        
        .vulnerability-header.expanded {
            border-bottom: 1px solid var(--border-color);
        }
        
        .vulnerability-severity {
            padding: 3px 8px;
            border-radius: var(--radius-xs);
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            margin-right: 10px;
        }
        
        .vulnerability-severity.critical {
            background-color: rgba(255, 0, 0, 0.2);
            color: var(--accent-red);
        }
        
        .vulnerability-severity.high {
            background-color: rgba(255, 107, 0, 0.2);
            color: #ff6b00;
        }
        
        .vulnerability-severity.medium {
            background-color: rgba(255, 204, 0, 0.2);
            color: #ffcc00;
        }
        
        .vulnerability-severity.low {
            background-color: rgba(0, 122, 255, 0.2);
            color: var(--accent-blue);
        }
        
        .vulnerability-id {
            font-family: monospace;
            margin-right: 15px;
            color: var(--text-tertiary);
        }
        
        .vulnerability-name {
            font-weight: 500;
        }
        
        .vulnerability-details {
            padding: 0;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease, padding 0.3s ease;
        }
        
        .vulnerability-details.expanded {
            padding: 15px;
            max-height: 500px;
        }
        
        .vulnerability-description,
        .vulnerability-location,
        .vulnerability-remediation,
        .vulnerability-cwe {
            margin-bottom: 10px;
        }
        
        .vulnerability-cwe a {
            color: var(--accent-blue);
            text-decoration: none;
        }
        
        .vulnerability-cwe a:hover {
            text-decoration: underline;
        }
        
        .no-vulnerabilities {
            padding: 20px;
            text-align: center;
            color: var(--text-tertiary);
        }
        
        .threat-level-indicator {
            display: inline-block;
            padding: 5px 10px;
            border-radius: var(--radius-xs);
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.9rem;
        }
        
        .threat-level-indicator.critical {
            background-color: rgba(255, 0, 0, 0.2);
            color: var(--accent-red);
        }
        
        .threat-level-indicator.high {
            background-color: rgba(255, 107, 0, 0.2);
            color: #ff6b00;
        }
        
        .threat-level-indicator.medium {
            background-color: rgba(255, 204, 0, 0.2);
            color: #ffcc00;
        }
        
        .threat-level-indicator.low {
            background-color: rgba(0, 122, 255, 0.2);
            color: var(--accent-blue);
        }
        
        .security-recommendation {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
            padding: 15px;
            border-radius: var(--radius-sm);
            background-color: var(--bg-tertiary);
        }
        
        .recommendation-priority {
            flex-shrink: 0;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 15px;
            margin-top: 5px;
        }
        
        .recommendation-priority.critical {
            background-color: var(--accent-red);
        }
        
        .recommendation-priority.high {
            background-color: #ff6b00;
        }
        
        .recommendation-priority.medium {
            background-color: #ffcc00;
        }
        
        .recommendation-priority.low {
            background-color: var(--accent-blue);
        }
        
        .recommendation-content {
            flex-grow: 1;
        }
        
        .recommendation-title {
            font-weight: 500;
            margin-bottom: 5px;
        }
        
        .recommendation-description {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }
    `;
    document.head.appendChild(style);
})();