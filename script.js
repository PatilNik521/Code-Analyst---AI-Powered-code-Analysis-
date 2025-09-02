/**
 * CodeGuardian - Advanced Code Analysis Platform
 * Complex JavaScript implementation with advanced features
 */

// Main application namespace
const CodeGuardian = (() => {
    // Private variables
    const state = {
        currentSection: 'dashboard',
        analysisResults: null,
        securityScore: 0,
        performanceScore: 0,
        scalabilityScore: 0,
        issuesFound: 0,
        darkMode: true,
        accentColor: 'blue',
        analysisDepth: 'standard',
        aiModel: 'standard',
        apiKeys: {
            perplexity: '',
            openai: '',
            anthropic: '',
            gemini: ''
        },
        aiConversationHistory: [],
        recentActivity: [],
        charts: {},
        fileData: null,
        urlData: null,
        codeData: null,
        analysisInProgress: false
    };

    // Cache DOM elements
    const DOM = {
        navItems: document.querySelectorAll('.nav-item'),
        sections: document.querySelectorAll('.section'),
        tabs: document.querySelectorAll('.tab'),
        tabContents: document.querySelectorAll('.tab-content'),
        resultsTabs: document.querySelectorAll('.results-tab'),
        resultsContents: document.querySelectorAll('.results-content'),
        themeToggle: document.querySelector('.theme-toggle'),
        themeSelect: document.getElementById('theme-select'),
        accentColorSelect: document.getElementById('accent-color'),
        analysisDepthSelect: document.getElementById('analysis-depth'),
        aiModelSelect: document.getElementById('ai-model'),
        perplexityApiKey: document.getElementById('perplexity-api-key'),
        openaiApiKey: document.getElementById('openai-api-key'),
        anthropicApiKey: document.getElementById('anthropic-api-key'),
        geminiApiKey: document.getElementById('gemini-api-key'),
        saveApiKeysBtn: document.getElementById('save-api-keys'),
        urlForm: document.getElementById('url-form'),
        fileForm: document.getElementById('file-form'),
        codeForm: document.getElementById('code-form'),
        fileInput: document.getElementById('file'),
        fileInfo: document.querySelector('.file-info'),
        urlInput: document.getElementById('url'),
        codeInput: document.getElementById('code'),
        languageSelect: document.getElementById('language'),
        loader: document.querySelector('.loader'),
        resultsContainer: document.querySelector('.results-container'),
        aiQuestion: document.getElementById('ai-question'),
        aiSubmit: document.getElementById('ai-submit'),
        aiResponseContent: document.querySelector('.response-content'),
        aiLoader: document.querySelector('.ai-response .loader'),
        historyContainer: document.querySelector('.history-container'),
        counters: document.querySelectorAll('.counter'),
        progressCircles: document.querySelectorAll('.progress-circle'),
        scoreCircles: document.querySelectorAll('.score-circle'),
        activityList: document.querySelector('.activity-list'),
        issuesList: document.querySelector('.issues-list'),
        overviewSummary: document.querySelector('.overview-summary p'),
        vulnerabilitiesList: document.querySelector('.vulnerabilities-list'),
        securityRecommendationsList: document.querySelectorAll('.security-recommendations .recommendations-list'),
        performanceMetricsList: document.querySelector('.performance-metrics .metrics-list'),
        performanceRecommendationsList: document.querySelector('.performance-recommendations .recommendations-list'),
        scalabilityIssuesList: document.querySelector('.scalability-issues .issues-list'),
        scalabilityRecommendationsList: document.querySelector('.scalability-recommendations .recommendations-list'),
        recommendationsLists: document.querySelectorAll('.recommendation-category .recommendations-list')
    };

    // Initialize charts with advanced configuration
    const initCharts = () => {
        // Issue distribution chart
        const issueCtx = document.getElementById('issueChart').getContext('2d');
        state.charts.issueChart = new Chart(issueCtx, {
            type: 'doughnut',
            data: {
                labels: ['Security', 'Performance', 'Scalability', 'Code Quality'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        '#f85149',
                        '#2f81f7',
                        '#3fb950',
                        '#d29922'
                    ],
                    borderColor: '#161b22',
                    borderWidth: 3,
                    borderRadius: 5,
                    hoverOffset: 10,
                    spacing: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                animation: {
                    animateScale: true,
                    animateRotate: true,
                    duration: 2000,
                    easing: 'easeOutQuart'
                },
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#ffffff',
                            font: {
                                family: '"Roboto", sans-serif'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e1e1e',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#00b3ff',
                        borderWidth: 1,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.raw} issues`;
                            }
                        }
                    }
                },
                cutout: '70%',
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });

        // Security chart
        const securityCtx = document.getElementById('securityChart').getContext('2d');
        state.charts.securityChart = new Chart(securityCtx, {
            type: 'radar',
            data: {
                labels: ['API Security', 'Cloud Security', 'Authentication', 'Data Protection', 'Input Validation', 'Error Handling'],
                datasets: [{
                    label: 'Security Score',
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(0, 179, 255, 0.2)',
                    borderColor: '#00b3ff',
                    borderWidth: 2,
                    pointBackgroundColor: '#00b3ff',
                    pointBorderColor: '#ffffff',
                    pointHoverBackgroundColor: '#ffffff',
                    pointHoverBorderColor: '#00b3ff',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        pointLabels: {
                            color: '#ffffff',
                            font: {
                                family: '"Roboto", sans-serif'
                            }
                        },
                        ticks: {
                            backdropColor: 'transparent',
                            color: '#b3b3b3',
                            z: 100
                        },
                        suggestedMin: 0,
                        suggestedMax: 100
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1e1e1e',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#00b3ff',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `Score: ${context.raw}%`;
                            }
                        }
                    }
                }
            }
        });

        // Performance chart
        const performanceCtx = document.getElementById('performanceChart').getContext('2d');
        state.charts.performanceChart = new Chart(performanceCtx, {
            type: 'bar',
            data: {
                labels: ['Load Time', 'Resource Usage', 'Response Time', 'Optimization', 'Caching', 'Compression'],
                datasets: [{
                    label: 'Current',
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: '#00b3ff',
                    borderColor: '#00b3ff',
                    borderWidth: 1,
                    borderRadius: 4
                }, {
                    label: 'Recommended',
                    data: [80, 70, 90, 85, 75, 80],
                    backgroundColor: 'rgba(0, 179, 255, 0.2)',
                    borderColor: '#00b3ff',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#b3b3b3',
                            font: {
                                family: '"Roboto", sans-serif'
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#b3b3b3',
                            font: {
                                family: '"Roboto", sans-serif'
                            }
                        },
                        suggestedMin: 0,
                        suggestedMax: 100
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#ffffff',
                            font: {
                                family: '"Roboto", sans-serif'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e1e1e',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#00b3ff',
                        borderWidth: 1
                    }
                }
            }
        });

        // Scalability chart
        const scalabilityCtx = document.getElementById('scalabilityChart').getContext('2d');
        state.charts.scalabilityChart = new Chart(scalabilityCtx, {
            type: 'line',
            data: {
                labels: ['1x', '2x', '5x', '10x', '50x', '100x'],
                datasets: [{
                    label: 'Response Time (ms)',
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(255, 0, 60, 0.2)',
                    borderColor: '#ff003c',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#ff003c',
                    pointBorderColor: '#ffffff',
                    pointRadius: 4
                }, {
                    label: 'Resource Usage (%)',
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(0, 179, 255, 0.2)',
                    borderColor: '#00b3ff',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#00b3ff',
                    pointBorderColor: '#ffffff',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Load Multiplier',
                            color: '#ffffff',
                            font: {
                                family: '"Roboto", sans-serif',
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#b3b3b3',
                            font: {
                                family: '"Roboto", sans-serif'
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#b3b3b3',
                            font: {
                                family: '"Roboto", sans-serif'
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#ffffff',
                            font: {
                                family: '"Roboto", sans-serif'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e1e1e',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#00b3ff',
                        borderWidth: 1
                    }
                }
            }
        });
    };

    // Navigation handler
    const handleNavigation = () => {
        DOM.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.getAttribute('data-section');
                
                // Update active nav item
                DOM.navItems.forEach(navItem => navItem.classList.remove('active'));
                item.classList.add('active');
                
                // Update active section
                DOM.sections.forEach(sectionEl => sectionEl.classList.remove('active'));
                document.getElementById(section).classList.add('active');
                
                // Update state
                state.currentSection = section;
                
                // Add to recent activity
                addActivity(`Navigated to ${section.replace('-', ' ')} section`);
            });
        });
    };

    // Tab handler
    const handleTabs = () => {
        DOM.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                
                // Update active tab
                DOM.tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Handle results tabs separately
                if (tab.classList.contains('results-tab')) {
                    const resultId = tab.getAttribute('data-result');
                    if (resultId === 'activity') {
                        showRecentActivityTab();
                        return;
                    }
                }
                
                // Update active tab content
                DOM.tabContents.forEach(content => content.classList.remove('active'));
                document.getElementById(tabId).classList.add('active');
            });
        });

        DOM.resultsTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const resultId = tab.getAttribute('data-result');
                
                // Update active tab
                DOM.resultsTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update active result content
                DOM.resultsContents.forEach(content => content.classList.remove('active'));
                document.getElementById(resultId).classList.add('active');
            });
        });
    };

    // Theme handler
    const handleTheme = () => {
        DOM.themeToggle.addEventListener('click', () => {
            toggleDarkMode();
        });

        DOM.themeSelect.addEventListener('change', () => {
            const theme = DOM.themeSelect.value;
            if (theme === 'dark') {
                enableDarkMode();
            } else if (theme === 'light') {
                disableDarkMode();
            } else {
                // System default - check user preference
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    enableDarkMode();
                } else {
                    disableDarkMode();
                }
            }
        });
    };

    // Toggle dark mode
    const toggleDarkMode = () => {
        if (state.darkMode) {
            disableDarkMode();
        } else {
            enableDarkMode();
        }
    };

    // Enable dark mode
    const enableDarkMode = () => {
        document.documentElement.style.setProperty('--bg-primary', '#0a0a0a');
        document.documentElement.style.setProperty('--bg-secondary', '#121212');
        document.documentElement.style.setProperty('--bg-tertiary', '#1e1e1e');
        document.documentElement.style.setProperty('--text-primary', '#ffffff');
        document.documentElement.style.setProperty('--text-secondary', '#b3b3b3');
        document.documentElement.style.setProperty('--text-tertiary', '#808080');
        
        DOM.themeToggle.querySelector('i').className = 'fas fa-sun';
        DOM.themeToggle.querySelector('span').textContent = 'Light Mode';
        
        state.darkMode = true;
        DOM.themeSelect.value = 'dark';
        
        addActivity('Switched to dark mode');
    };

    // Disable dark mode
    const disableDarkMode = () => {
        document.documentElement.style.setProperty('--bg-primary', '#f5f5f5');
        document.documentElement.style.setProperty('--bg-secondary', '#ffffff');
        document.documentElement.style.setProperty('--bg-tertiary', '#e9e9e9');
        document.documentElement.style.setProperty('--text-primary', '#333333');
        document.documentElement.style.setProperty('--text-secondary', '#666666');
        document.documentElement.style.setProperty('--text-tertiary', '#999999');
        
        DOM.themeToggle.querySelector('i').className = 'fas fa-moon';
        DOM.themeToggle.querySelector('span').textContent = 'Dark Mode';
        
        state.darkMode = false;
        DOM.themeSelect.value = 'light';
        
        addActivity('Switched to light mode');
    };

    // Handle accent color change
    const handleAccentColor = () => {
        DOM.accentColorSelect.addEventListener('change', () => {
            const color = DOM.accentColorSelect.value;
            changeAccentColor(color);
        });
    };

    // Change accent color
    const changeAccentColor = (color) => {
        let primary, glow;
        
        switch (color) {
            case 'red':
                primary = '#ff003c';
                glow = '0 0 10px #ff003c, 0 0 20px #ff003c, 0 0 30px #ff003c';
                break;
            case 'green':
                primary = '#00ff8c';
                glow = '0 0 10px #00ff8c, 0 0 20px #00ff8c, 0 0 30px #00ff8c';
                break;
            case 'purple':
                primary = '#9d00ff';
                glow = '0 0 10px #9d00ff, 0 0 20px #9d00ff, 0 0 30px #9d00ff';
                break;
            case 'blue':
            default:
                primary = '#00b3ff';
                glow = '0 0 10px #00b3ff, 0 0 20px #00b3ff, 0 0 30px #00b3ff';
                break;
        }
        
        document.documentElement.style.setProperty('--accent-blue', primary);
        document.documentElement.style.setProperty('--accent-blue-glow', glow);
        document.documentElement.style.setProperty('--gradient-blue', `linear-gradient(135deg, ${primary}, ${adjustColorBrightness(primary, 30)})`);
        
        state.accentColor = color;
        addActivity(`Changed accent color to ${color}`);
    };

    // Adjust color brightness
    const adjustColorBrightness = (color, percent) => {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return `#${(0x1000000 + (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 + (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 + (B < 255 ? (B < 0 ? 0 : B) : 255)).toString(16).slice(1)}`;
    };

    // Handle settings
    const handleSettings = () => {
        // Analysis depth
        DOM.analysisDepthSelect.addEventListener('change', () => {
            state.analysisDepth = DOM.analysisDepthSelect.value;
            addActivity(`Changed analysis depth to ${state.analysisDepth}`);
        });
        
        // AI model
        DOM.aiModelSelect.addEventListener('change', () => {
            state.aiModel = DOM.aiModelSelect.value;
            addActivity(`Changed AI model to ${state.aiModel}`);
        });
        
        // API keys
        DOM.saveApiKeysBtn.addEventListener('click', () => {
            // Perplexity API key
            const perplexityKey = DOM.perplexityApiKey.value.trim();
            if (perplexityKey) {
                state.apiKeys.perplexity = perplexityKey;
            }
            
            // OpenAI API key
            const openaiKey = DOM.openaiApiKey.value.trim();
            if (openaiKey) {
                state.apiKeys.openai = openaiKey;
            }
            
            // Anthropic API key
            const anthropicKey = DOM.anthropicApiKey.value.trim();
            if (anthropicKey) {
                state.apiKeys.anthropic = anthropicKey;
            }
            
            // Google Gemini API key
            const geminiKey = DOM.geminiApiKey.value.trim();
            if (geminiKey) {
                state.apiKeys.gemini = geminiKey;
            }
            
            addActivity('Updated API keys');
            alert('API keys saved successfully!');
        });
    };

    // File upload handler
    const handleFileUpload = () => {
        DOM.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const fileSize = (file.size / 1024).toFixed(2);
                const fileType = file.type || 'Unknown type';
                DOM.fileInfo.innerHTML = `
                    <p><strong>File:</strong> ${file.name}</p>
                    <p><strong>Size:</strong> ${fileSize} KB</p>
                    <p><strong>Type:</strong> ${fileType}</p>
                `;
                
                // Read file content
                const reader = new FileReader();
                reader.onload = (event) => {
                    state.fileData = {
                        name: file.name,
                        size: fileSize,
                        type: fileType,
                        content: event.target.result
                    };
                };
                reader.readAsText(file);
            }
        });
    };

    // Form submission handlers
    const handleFormSubmissions = () => {
        // URL form
        DOM.urlForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const url = DOM.urlInput.value.trim();
            if (url) {
                state.urlData = { url };
                startAnalysis('url', url);
            }
        });
        
        // File form
        DOM.fileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (state.fileData) {
                startAnalysis('file', state.fileData);
            } else {
                alert('Please upload a file first');
            }
        });
        
        // Code form
        DOM.codeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const code = DOM.codeInput.value.trim();
            const language = DOM.languageSelect.value;
            
            if (code && language) {
                state.codeData = { code, language };
                startAnalysis('code', { code, language });
            } else {
                alert('Please enter code and select a language');
            }
        });
    };

    // Start analysis
    const startAnalysis = (type, data) => {
        if (state.analysisInProgress) return;
        
        state.analysisInProgress = true;
        showLoader();
        
        addActivity(`Started ${type} analysis`);
        
        // Simulate analysis delay
        setTimeout(() => {
            performAnalysis(type, data);
        }, 3000);
    };

    // Show loader
    const showLoader = () => {
        DOM.loader.classList.remove('hidden');
        DOM.resultsContainer.classList.add('hidden');
    };

    // Hide loader
    const hideLoader = () => {
        DOM.loader.classList.add('hidden');
        DOM.resultsContainer.classList.remove('hidden');
    };

    // Perform analysis
    const performAnalysis = (type, data) => {
        // This would normally call an API or perform actual analysis
        // For demo purposes, we'll generate random results
        
        // Generate random scores
        const securityScore = Math.floor(Math.random() * 40) + 60; // 60-100
        const performanceScore = Math.floor(Math.random() * 40) + 60; // 60-100
        const scalabilityScore = Math.floor(Math.random() * 40) + 60; // 60-100
        const codeQualityScore = Math.floor(Math.random() * 40) + 60; // 60-100
        
        // Generate random issues
        const securityIssues = Math.floor(Math.random() * 5) + 1;
        const performanceIssues = Math.floor(Math.random() * 5) + 1;
        const scalabilityIssues = Math.floor(Math.random() * 5) + 1;
        const codeQualityIssues = Math.floor(Math.random() * 5) + 1;
        const totalIssues = securityIssues + performanceIssues + scalabilityIssues + codeQualityIssues;
        
        // Update state
        state.securityScore = securityScore;
        state.performanceScore = performanceScore;
        state.scalabilityScore = scalabilityScore;
        state.issuesFound = totalIssues;
        
        // Update charts
        updateCharts(securityScore, performanceScore, scalabilityScore, securityIssues, performanceIssues, scalabilityIssues, codeQualityIssues);
        
        // Update dashboard counters
        updateDashboardCounters(totalIssues, securityScore, performanceScore, scalabilityScore);
        
        // Update progress circles
        updateProgressCircles(codeQualityScore, securityScore, performanceScore, scalabilityScore);
        
        // Generate and display detailed results
        generateDetailedResults(type, data, {
            securityScore,
            performanceScore,
            scalabilityScore,
            codeQualityScore,
            securityIssues,
            performanceIssues,
            scalabilityIssues,
            codeQualityIssues
        });
        
        // Hide loader and show results
        hideLoader();
        
        // Update state
        state.analysisInProgress = false;
        
        addActivity(`Completed ${type} analysis with ${totalIssues} issues found`);
        
        // If this is a code analysis, show the AI popup with analysis results
        if (type === 'code' && window.AIPopup) {
            // Create analysis data object for the popup
            const analysisData = {
                type,
                code: data.code,
                language: data.language,
                scores: {
                    security: securityScore,
                    performance: performanceScore,
                    scalability: scalabilityScore,
                    codeQuality: codeQualityScore
                },
                issues: {
                    security: securityIssues,
                    performance: performanceIssues,
                    scalability: scalabilityIssues,
                    codeQuality: codeQualityIssues,
                    total: totalIssues
                }
            };
            
            // Open the AI popup with the analysis data
            // This will trigger the AI analysis using all available API keys
            window.AIPopup.openPopup(analysisData);
        }
    };

    // Update charts with advanced animations and effects
    const updateCharts = (securityScore, performanceScore, scalabilityScore, securityIssues, performanceIssues, scalabilityIssues, codeQualityIssues) => {
        // Add visual highlight to chart containers
        document.querySelectorAll('.chart-container, .performance-chart-container').forEach(container => {
            container.classList.add('updating');
            setTimeout(() => container.classList.remove('updating'), 2000);
        });
        
        // Update issue chart with animation
        const issueData = [securityIssues, performanceIssues, scalabilityIssues, codeQualityIssues];
        
        // Animate each segment individually for more visual impact
        issueData.forEach((value, index) => {
            // Start with zero and animate to actual value
            const currentValue = state.charts.issueChart.data.datasets[0].data[index] || 0;
            animateChartValue(state.charts.issueChart, 0, index, currentValue, value, 1500);
        });
        
        // Update security chart with enhanced metrics and animation
        const securityMetrics = [
            Math.floor(Math.random() * 40) + 60, // API Security
            Math.floor(Math.random() * 40) + 60, // Cloud Security
            Math.floor(Math.random() * 40) + 60, // Authentication
            Math.floor(Math.random() * 40) + 60, // Data Protection
            Math.floor(Math.random() * 40) + 60, // Input Validation
            Math.floor(Math.random() * 40) + 60  // Error Handling
        ];
        
        // Animate each radar point individually
        securityMetrics.forEach((value, index) => {
            const currentValue = state.charts.securityChart.data.datasets[0].data[index] || 0;
            animateChartValue(state.charts.securityChart, 0, index, currentValue, value, 1800);
        });
        
        // Update performance chart with enhanced metrics and animation
        const performanceMetrics = [
            Math.floor(Math.random() * 40) + 60, // Load Time
            Math.floor(Math.random() * 40) + 60, // Resource Usage
            Math.floor(Math.random() * 40) + 60, // Response Time
            Math.floor(Math.random() * 40) + 60, // Optimization
            Math.floor(Math.random() * 40) + 60, // Caching
            Math.floor(Math.random() * 40) + 60  // Compression
        ];
        
        // Make sure the performance chart exists before updating it
        if (state.charts.performanceChart) {
            // Animate each performance metric individually
            performanceMetrics.forEach((value, index) => {
                const currentValue = state.charts.performanceChart.data.datasets[0].data[index] || 0;
                animateChartValue(state.charts.performanceChart, 0, index, currentValue, value, 1800);
            });
        } else {
            // Initialize performance chart if it doesn't exist
            initPerformanceChart(performanceMetrics);
        }
        
        // Update scalability chart with animation
        if (state.charts.scalabilityChart) {
            const scalabilityData = state.charts.scalabilityChart.data.datasets[0].data;
            const newScalabilityData = scalabilityData.map(() => Math.floor(Math.random() * 40) + 60);
            
            newScalabilityData.forEach((value, index) => {
                const currentValue = scalabilityData[index] || 0;
                animateChartValue(state.charts.scalabilityChart, 0, index, currentValue, value, 1800);
            });
        }
    };
    
    // Initialize performance chart
    const initPerformanceChart = (initialData = [0, 0, 0, 0, 0, 0]) => {
        const performanceCtx = document.getElementById('performanceChart');
        if (!performanceCtx) return;
        
        state.charts.performanceChart = new Chart(performanceCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Load Time', 'Resource Usage', 'Response Time', 'Optimization', 'Caching', 'Compression'],
                datasets: [{
                    label: 'Current',
                    data: initialData,
                    backgroundColor: '#00b3ff',
                    borderColor: '#00b3ff',
                    borderWidth: 2,
                    borderRadius: 6,
                    hoverBackgroundColor: '#2f81f7'
                }, {
                    label: 'Recommended',
                    data: [80, 70, 90, 85, 75, 80],
                    backgroundColor: 'rgba(0, 179, 255, 0.2)',
                    borderColor: '#00b3ff',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#c9d1d9'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#c9d1d9'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff',
                            font: {
                                family: '"Roboto", sans-serif'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e1e1e',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#00b3ff',
                        borderWidth: 1
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                }
            }
        });
    };
    
    // Animate chart value with smooth transitions
    const animateChartValue = (chart, datasetIndex, valueIndex, startValue, endValue, duration) => {
        const startTime = performance.now();
        
        // Use easeOutCubic for smooth animation
        const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
        
        const updateValue = (timestamp) => {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutCubic(progress);
            
            // Calculate current value in the animation
            const currentValue = startValue + (endValue - startValue) * easedProgress;
            
            // Update the chart data
            chart.data.datasets[datasetIndex].data[valueIndex] = currentValue;
            chart.update('none'); // Update without animation for smoother custom animation
            
            if (progress < 1) {
                requestAnimationFrame(updateValue);
            } else {
                // Ensure final value is exactly the target value
                chart.data.datasets[datasetIndex].data[valueIndex] = endValue;
                chart.update('none');
                
                // Add a subtle highlight effect when animation completes
                if (chart.canvas) {
                    const highlight = document.createElement('div');
                    highlight.className = 'chart-highlight';
                    chart.canvas.parentNode.appendChild(highlight);
                    
                    setTimeout(() => {
                        highlight.remove();
                    }, 500);
                }
            }
        };
        
        requestAnimationFrame(updateValue);
    };

    // Update dashboard counters
    const updateDashboardCounters = (issuesFound, securityScore, performanceScore, scalabilityScore) => {
        // Animate counters
        animateCounter(DOM.counters[0], 0, issuesFound);
        animateCounter(DOM.counters[1], 0, securityScore, '%');
        animateCounter(DOM.counters[2], 0, performanceScore, '%');
        animateCounter(DOM.counters[3], 0, scalabilityScore, '%');
    };

    // Animate counter with enhanced visual effects
    const animateCounter = (element, start, end, suffix = '') => {
        // Use requestAnimationFrame for smoother animation
        const startTime = performance.now();
        const duration = 2000; // 2 seconds for more dramatic animation
        
        // Determine if this is a score counter to apply special styling
        const isScoreCounter = element.closest('.stat') !== null || 
                              element.closest('.score-container') !== null;
        
        // Add a temporary class for animation styling
        element.classList.add('animating-counter');
        
        // Enhanced easing functions for more dynamic animation
        const easeOutQuart = t => 1 - Math.pow(1 - t, 4);
        const easeOutBack = t => {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        };
        
        // Combine easing functions for a more dynamic effect
        const customEase = t => {
            if (t < 0.75) return easeOutQuart(t / 0.75) * 0.75;
            return 0.75 + easeOutBack((t - 0.75) / 0.25) * 0.25;
        };
        
        // Ensure the element is centered and visible
        if (isScoreCounter) {
            element.style.position = 'absolute';
            element.style.top = '50%';
            element.style.left = '50%';
            element.style.transform = 'translate(-50%, -50%)';
            element.style.zIndex = '10';
            element.style.fontSize = '1.8rem';
        }
        
        const updateCounter = (timestamp) => {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = customEase(progress);
            const current = start + (end - start) * easedProgress;
            
            // Apply the counter value
            element.textContent = Math.round(current) + suffix;
            
            // Apply enhanced visual effects during animation
            if (isScoreCounter) {
                // More dynamic scale effect
                let scaleEffect;
                if (progress < 0.6) {
                    // Initial growth phase
                    scaleEffect = 1 + (progress * 0.25);
                } else if (progress < 0.8) {
                    // Peak and slight contraction
                    scaleEffect = 1.15 - ((progress - 0.6) * 0.5);
                } else {
                    // Final subtle pulsing
                    scaleEffect = 1 + Math.sin((progress - 0.8) * Math.PI * 5) * 0.05;
                }
                
                element.style.transform = `scale(${scaleEffect})`;
                
                // Enhanced color transition effect based on the value
                const hue = Math.max(0, Math.min(120, (current / 100) * 120)); // 0 to 120 (red to green)
                const saturation = 90 + Math.sin(progress * Math.PI * 2) * 10; // Pulsing saturation
                const lightness = 60 + Math.sin(progress * Math.PI * 4) * 5; // Pulsing lightness
                const alpha = 0.7 + Math.sin(progress * Math.PI * 3) * 0.3; // Pulsing opacity
                
                element.style.textShadow = `0 0 15px hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
                
                // Add a subtle glow to the parent circle if it exists
                const parentCircle = element.closest('.progress-circle, .score-circle');
                if (parentCircle) {
                    const intensity = 0.2 + (current / 500);
                    parentCircle.style.filter = `drop-shadow(0 0 ${5 + (current / 20)}px hsla(${hue}, 100%, 60%, ${intensity}))`;
                }
            }
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                // Animation complete - add a final bounce effect
                element.classList.remove('animating-counter');
                
                if (isScoreCounter) {
                    // Final bounce
                    element.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        element.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            element.style.transform = 'scale(1)';
                        }, 100);
                    }, 100);
                    
                    // Keep a subtle glow based on the final value
                    const finalHue = Math.max(0, Math.min(120, (end / 100) * 120));
                    element.style.textShadow = `0 0 12px hsla(${finalHue}, 100%, 60%, 0.7)`;
                    
                    // Add a permanent subtle pulsing glow
                    element.style.animation = 'textGlow 3s infinite alternate';
                    
                    // Add the CSS animation if it doesn't exist yet
                    if (!document.getElementById('textGlowAnimation')) {
                        const style = document.createElement('style');
                        style.id = 'textGlowAnimation';
                        style.textContent = `
                            @keyframes textGlow {
                                0% { text-shadow: 0 0 8px hsla(${finalHue}, 100%, 60%, 0.5); }
                                100% { text-shadow: 0 0 15px hsla(${finalHue}, 100%, 70%, 0.8); }
                            }
                        `;
                        document.head.appendChild(style);
                    }
                }
            }
        };
        
        requestAnimationFrame(updateCounter);
    };

    // Update progress circles
    const updateProgressCircles = (codeQualityScore, securityScore, performanceScore, scalabilityScore) => {
        // Overview progress circles
        updateProgressCircle(DOM.progressCircles[0], codeQualityScore);
        updateProgressCircle(DOM.progressCircles[1], securityScore);
        updateProgressCircle(DOM.progressCircles[2], performanceScore);
        updateProgressCircle(DOM.progressCircles[3], scalabilityScore);
        
        // Score circles
        updateScoreCircle(document.querySelector('.security-score .score-circle'), securityScore);
        updateScoreCircle(document.querySelector('.performance-score .score-circle'), performanceScore);
        updateScoreCircle(document.querySelector('.scalability-score .score-circle'), scalabilityScore);
        
        // Update text
        document.querySelectorAll('.progress-circle .progress-text').forEach((el, index) => {
            const scores = [codeQualityScore, securityScore, performanceScore, scalabilityScore];
            animateCounter(el, 0, scores[index], '%');
        });
        
        document.querySelectorAll('.score-circle .score-text').forEach((el, index) => {
            const scores = [securityScore, performanceScore, scalabilityScore];
            animateCounter(el, 0, scores[index], '%');
        });
    };

    // Update progress circle with advanced animation
    const updateProgressCircle = (element, value) => {
        // Store the current value
        const currentValue = parseInt(element.getAttribute('data-value') || '0');
        
        // Determine which gradient to use based on the element's position
        const index = Array.from(DOM.progressCircles).indexOf(element);
        let gradientVar = 'var(--gradient-blue)';
        let glowColor = '47, 129, 247'; // Default blue glow
        
        if (index === 1) {
            gradientVar = 'var(--gradient-mixed)';
            glowColor = '47, 129, 247';
        } else if (index === 2) {
            gradientVar = 'var(--gradient-red)';
            glowColor = '248, 81, 73';
        } else if (index === 3) {
            gradientVar = 'linear-gradient(90deg, var(--accent-blue), var(--accent-white))';
            glowColor = '240, 246, 252';
        }
        
        // Get the text element inside the progress circle
        const textElement = element.querySelector('.progress-text');
        
        // Apply initial scale effect to the circle
        element.style.transform = 'scale(0.95)';
        
        // Animate the progress circle
        const duration = 1800; // Longer for more dramatic effect
        const startTime = performance.now();
        
        // Enhanced easing function for smoother animation
        const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
        
        const animateProgress = (timestamp) => {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Use easeOutCubic for smoother animation
            const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
            const easedProgress = easeOutCubic(progress);
            
            const currentProgress = currentValue + (value - currentValue) * easedProgress;
            
            // Apply the gradient with a glow effect
            element.style.background = `conic-gradient(${gradientVar} ${currentProgress}%, var(--bg-tertiary) 0%)`;
            element.style.boxShadow = `0 0 ${10 + (currentProgress / 8)}px rgba(${glowColor}, ${0.2 + (currentProgress / 400)}), inset 0 0 ${5 + (currentProgress / 20)}px rgba(${glowColor}, ${0.1 + (currentProgress / 500)})`;
            
            // Add a subtle scale effect during animation
            const scaleEffect = 1 + (Math.sin(elapsed / 300) * 0.01);
            element.style.transform = `scale(${scaleEffect})`;
            
            // Update the data attribute
            element.setAttribute('data-value', Math.round(currentProgress));
            
            if (progress < 1) {
                requestAnimationFrame(animateProgress);
            } else {
                // Add a subtle bounce effect at the end
                element.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                }, 150);
            }
        };
        
        requestAnimationFrame(animateProgress);
    };

    // Update score circle with advanced animation
    const updateScoreCircle = (element, value) => {
        // Store the current value
        const currentValue = parseInt(element.getAttribute('data-value') || '0');
        
        // Determine which gradient to use based on the element's parent class
        const parent = element.closest('.score-container');
        let gradientVar = 'var(--gradient-blue)';
        let glowColor = '47, 129, 247'; // Default blue glow
        
        if (parent && parent.classList.contains('security-score')) {
            gradientVar = 'var(--gradient-mixed)';
            glowColor = '47, 129, 247';
        } else if (parent && parent.classList.contains('performance-score')) {
            gradientVar = 'var(--gradient-red)';
            glowColor = '248, 81, 73';
        } else if (parent && parent.classList.contains('scalability-score')) {
            gradientVar = 'linear-gradient(90deg, var(--accent-blue), var(--accent-white))';
            glowColor = '240, 246, 252';
        }
        
        // Get the text element inside the score circle
        const textElement = element.querySelector('.score-text');
        
        // Apply initial scale effect to the circle
        element.style.transform = 'scale(0.9)';
        
        // Animate the score circle
        const duration = 1800; // Longer for more dramatic effect
        const startTime = performance.now();
        
        // Enhanced easing function for more dynamic animation
        const easeOutElastic = t => {
            const p = 0.3;
            return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
        };
        
        // Now we'll use the easeOutElastic function defined above
        
        const animateScore = (timestamp) => {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = progress < 0.8 ? easeOutElastic(progress / 0.8) * 0.8 : 0.8 + (progress - 0.8) * (1 / 0.2);
            const currentProgress = currentValue + (value - currentValue) * easedProgress;
            
            // Apply the gradient with a pulse effect
            element.style.background = `conic-gradient(${gradientVar} ${currentProgress}%, var(--bg-tertiary) 0%)`;
            
            // Add a more dynamic pulse effect
            const pulseScale = 1 + (Math.sin(elapsed / 200) * 0.02);
            element.style.transform = `scale(${pulseScale})`;
            
            // Add a glow effect that intensifies with progress
            element.style.boxShadow = `0 0 ${8 + (currentProgress / 10)}px rgba(${glowColor}, ${0.2 + (currentProgress / 400)}), inset 0 0 ${4 + (currentProgress / 20)}px rgba(${glowColor}, ${0.1 + (currentProgress / 500)})`;
            
            // Update the data attribute
            element.setAttribute('data-value', Math.round(currentProgress));
            
            if (progress < 1) {
                requestAnimationFrame(animateScore);
            } else {
                // Add a subtle bounce effect at the end
                element.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                }, 150);
            }
        };
        
        requestAnimationFrame(animateScore);
    };

    // Generate detailed results
    const generateDetailedResults = (type, data, scores) => {
        // Generate summary
        let summary = '';
        if (type === 'url') {
            summary = `Analysis of URL: ${data} completed. Found ${scores.securityIssues + scores.performanceIssues + scores.scalabilityIssues + scores.codeQualityIssues} issues across security, performance, scalability, and code quality. Overall code quality score: ${scores.codeQualityScore}%.`;
        } else if (type === 'file') {
            summary = `Analysis of file: ${data.name} completed. Found ${scores.securityIssues + scores.performanceIssues + scores.scalabilityIssues + scores.codeQualityIssues} issues across security, performance, scalability, and code quality. Overall code quality score: ${scores.codeQualityScore}%.`;
        } else if (type === 'code') {
            summary = `Analysis of ${data.language} code completed. Found ${scores.securityIssues + scores.performanceIssues + scores.scalabilityIssues + scores.codeQualityIssues} issues across security, performance, scalability, and code quality. Overall code quality score: ${scores.codeQualityScore}%.`;
        }
        
        DOM.overviewSummary.textContent = summary;
        
        // Generate issues
        generateIssues(scores);
        
        // Generate security vulnerabilities
        generateSecurityVulnerabilities(scores.securityIssues);
        
        // Generate recommendations
        generateRecommendations();
        
        // Generate performance metrics
        generatePerformanceMetrics();
        
        // Generate scalability issues
        generateScalabilityIssues(scores.scalabilityIssues);
    };

    // Generate issues
    const generateIssues = (scores) => {
        const issueTypes = [
            { type: 'Security', count: scores.securityIssues, color: 'red' },
            { type: 'Performance', count: scores.performanceIssues, color: 'blue' },
            { type: 'Scalability', count: scores.scalabilityIssues, color: 'green' },
            { type: 'Code Quality', count: scores.codeQualityIssues, color: 'yellow' }
        ];
        
        const securityIssues = [
            'Insecure API endpoint detected',
            'Missing input validation',
            'Potential SQL injection vulnerability',
            'Weak password hashing algorithm',
            'Sensitive data exposure risk'
        ];
        
        const performanceIssues = [
            'Inefficient database query',
            'Unoptimized image loading',
            'Excessive DOM manipulation',
            'Render-blocking JavaScript',
            'Missing resource caching'
        ];
        
        const scalabilityIssues = [
            'Database connection pooling issue',
            'Missing load balancing configuration',
            'Inefficient resource allocation',
            'Stateful design limiting horizontal scaling',
            'Memory leak in long-running process'
        ];
        
        const codeQualityIssues = [
            'Duplicate code detected',
            'Complex method exceeding 50 lines',
            'Missing error handling',
            'Inconsistent naming convention',
            'Unused variables and imports'
        ];
        
        const allIssues = [];
        
        // Add random issues based on counts
        for (let i = 0; i < scores.securityIssues; i++) {
            allIssues.push({
                type: 'Security',
                description: securityIssues[i % securityIssues.length],
                severity: ['Critical', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 4)],
                color: 'red'
            });
        }
        
        for (let i = 0; i < scores.performanceIssues; i++) {
            allIssues.push({
                type: 'Performance',
                description: performanceIssues[i % performanceIssues.length],
                severity: ['Critical', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 4)],
                color: 'blue'
            });
        }
        
        for (let i = 0; i < scores.scalabilityIssues; i++) {
            allIssues.push({
                type: 'Scalability',
                description: scalabilityIssues[i % scalabilityIssues.length],
                severity: ['Critical', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 4)],
                color: 'green'
            });
        }
        
        for (let i = 0; i < scores.codeQualityIssues; i++) {
            allIssues.push({
                type: 'Code Quality',
                description: codeQualityIssues[i % codeQualityIssues.length],
                severity: ['Critical', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 4)],
                color: 'yellow'
            });
        }
        
        // Sort by severity
        allIssues.sort((a, b) => {
            const severityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
            return severityOrder[a.severity] - severityOrder[b.severity];
        });
        
        // Generate HTML
        if (allIssues.length > 0) {
            let issuesHTML = '';
            allIssues.forEach(issue => {
                issuesHTML += `
                    <div class="issue-item">
                        <div class="issue-header">
                            <span class="issue-type" style="color: var(--accent-${issue.color})">${issue.type}</span>
                            <span class="issue-severity ${issue.severity.toLowerCase()}">${issue.severity}</span>
                        </div>
                        <div class="issue-description">${issue.description}</div>
                    </div>
                `;
            });
            DOM.issuesList.innerHTML = issuesHTML;
        } else {
            DOM.issuesList.innerHTML = '<p>No issues found.</p>';
        }
    };

    // Generate security vulnerabilities
    const generateSecurityVulnerabilities = (count) => {
        const vulnerabilities = [
            'Insecure direct object references',
            'Cross-site scripting (XSS) vulnerability',
            'Cross-site request forgery (CSRF)',
            'Insecure deserialization',
            'XML external entity (XXE) injection',
            'Broken authentication',
            'Security misconfiguration',
            'Sensitive data exposure',
            'Missing function level access control',
            'Insufficient logging and monitoring'
        ];
        
        if (count > 0) {
            let vulnHTML = '';
            for (let i = 0; i < count; i++) {
                const vuln = vulnerabilities[i % vulnerabilities.length];
                const severity = ['Critical', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 4)];
                vulnHTML += `
                    <div class="vulnerability-item">
                        <div class="vulnerability-header">
                            <span class="vulnerability-name">${vuln}</span>
                            <span class="vulnerability-severity ${severity.toLowerCase()}">${severity}</span>
                        </div>
                        <div class="vulnerability-description">
                            <p>This vulnerability could allow attackers to ${getVulnerabilityImpact(vuln)}.</p>
                        </div>
                    </div>
                `;
            }
            DOM.vulnerabilitiesList.innerHTML = vulnHTML;
        } else {
            DOM.vulnerabilitiesList.innerHTML = '<p>No vulnerabilities found.</p>';
        }
    };

    // Get vulnerability impact description
    const getVulnerabilityImpact = (vulnerability) => {
        const impacts = {
            'Insecure direct object references': 'access unauthorized data by manipulating references to objects',
            'Cross-site scripting (XSS) vulnerability': 'execute malicious scripts in the context of other users',
            'Cross-site request forgery (CSRF)': 'perform actions on behalf of authenticated users without their consent',
            'Insecure deserialization': 'execute arbitrary code or manipulate application logic',
            'XML external entity (XXE) injection': 'access server files or perform server-side request forgery',
            'Broken authentication': 'impersonate users or bypass authentication mechanisms',
            'Security misconfiguration': 'exploit unpatched flaws or access default accounts',
            'Sensitive data exposure': 'access confidential information that should be protected',
            'Missing function level access control': 'perform unauthorized actions by accessing restricted functions',
            'Insufficient logging and monitoring': 'remain undetected while conducting malicious activities'
        };
        
        return impacts[vulnerability] || 'compromise system security';
    };

    // Generate recommendations
    const generateRecommendations = () => {
        const securityRecommendations = [
            'Implement proper input validation and sanitization',
            'Use parameterized queries to prevent SQL injection',
            'Implement strong authentication mechanisms',
            'Use HTTPS for all communications',
            'Implement proper session management',
            'Apply the principle of least privilege',
            'Keep all dependencies and libraries updated',
            'Implement proper error handling',
            'Use content security policy (CSP)',
            'Implement rate limiting to prevent brute force attacks'
        ];
        
        const performanceRecommendations = [
            'Optimize database queries',
            'Implement caching strategies',
            'Minify and compress static assets',
            'Use lazy loading for images and components',
            'Reduce server response time',
            'Optimize critical rendering path',
            'Reduce JavaScript execution time',
            'Implement code splitting',
            'Use CDN for static assets',
            'Optimize API calls'
        ];
        
        const scalabilityRecommendations = [
            'Implement horizontal scaling',
            'Use load balancing',
            'Implement database sharding',
            'Use caching layers',
            'Implement asynchronous processing',
            'Design for statelessness',
            'Implement microservices architecture',
            'Use message queues for background processing',
            'Implement auto-scaling',
            'Optimize database indexes'
        ];
        
        const bestPractices = [
            'Follow coding standards and conventions',
            'Implement comprehensive testing',
            'Use version control effectively',
            'Document code and APIs',
            'Implement continuous integration and deployment',
            'Conduct regular code reviews',
            'Implement logging and monitoring',
            'Use dependency management',
            'Implement error tracking',
            'Follow the DRY (Don\'t Repeat Yourself) principle'
        ];
        
        // Shuffle and select random recommendations
        const shuffleArray = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };
        
        const generateRecommendationHTML = (recommendations, count) => {
            const selected = shuffleArray([...recommendations]).slice(0, count);
            let html = '';
            selected.forEach(rec => {
                html += `<div class="recommendation-item">${rec}</div>`;
            });
            return html;
        };
        
        // Update security recommendations
        DOM.securityRecommendationsList.forEach(el => {
            el.innerHTML = generateRecommendationHTML(securityRecommendations, 5);
        });
        
        // Update performance recommendations
        DOM.performanceRecommendationsList.innerHTML = generateRecommendationHTML(performanceRecommendations, 5);
        
        // Update scalability recommendations
        DOM.scalabilityRecommendationsList.innerHTML = generateRecommendationHTML(scalabilityRecommendations, 5);
        
        // Update best practices
        DOM.recommendationsLists[3].innerHTML = generateRecommendationHTML(bestPractices, 5);
    };

    // Generate performance metrics
    const generatePerformanceMetrics = () => {
        const metrics = [
            { name: 'First Contentful Paint', value: `${Math.floor(Math.random() * 500) + 100}ms` },
            { name: 'Time to Interactive', value: `${Math.floor(Math.random() * 1000) + 500}ms` },
            { name: 'Total Blocking Time', value: `${Math.floor(Math.random() * 200) + 50}ms` },
            { name: 'Largest Contentful Paint', value: `${Math.floor(Math.random() * 1500) + 500}ms` },
            { name: 'Cumulative Layout Shift', value: `${(Math.random() * 0.1).toFixed(3)}` },
            { name: 'Server Response Time', value: `${Math.floor(Math.random() * 300) + 100}ms` },
            { name: 'JavaScript Execution Time', value: `${Math.floor(Math.random() * 400) + 200}ms` },
            { name: 'CSS Processing Time', value: `${Math.floor(Math.random() * 100) + 50}ms` }
        ];
        
        let metricsHTML = '';
        metrics.forEach(metric => {
            metricsHTML += `
                <div class="metric-item">
                    <span class="metric-name">${metric.name}</span>
                    <span class="metric-value">${metric.value}</span>
                </div>
            `;
        });
        
        DOM.performanceMetricsList.innerHTML = metricsHTML;
    };

    // Generate scalability issues
    const generateScalabilityIssues = (count) => {
        const issues = [
            'Database connection pooling not configured properly',
            'Missing load balancing configuration',
            'Stateful design limiting horizontal scaling',
            'Inefficient caching strategy',
            'Resource-intensive operations not offloaded to background jobs',
            'Lack of auto-scaling configuration',
            'Inefficient database queries that won\'t scale',
            'Memory leaks in long-running processes',
            'Synchronous processing of requests',
            'Monolithic architecture limiting scalability'
        ];
        
        if (count > 0) {
            let issuesHTML = '';
            for (let i = 0; i < count; i++) {
                const issue = issues[i % issues.length];
                issuesHTML += `<div class="scalability-issue-item">${issue}</div>`;
            }
            DOM.scalabilityIssuesList.innerHTML = issuesHTML;
        } else {
            DOM.scalabilityIssuesList.innerHTML = '<p>No scalability issues found.</p>';
        }
    };

    // Add activity to recent activity list
    const addActivity = (activity) => {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        const activityItem = {
            activity,
            time: timeString,
            date: now.toLocaleDateString()
        };
        
        state.recentActivity.unshift(activityItem);
        
        // Keep only the last 10 activities
        if (state.recentActivity.length > 10) {
            state.recentActivity.pop();
        }
        
        updateActivityList();
        
        // Show the recent activity tab if it was hidden
        const recentActivityTab = document.getElementById('recentActivityTab');
        if (recentActivityTab && recentActivityTab.classList.contains('hidden')) {
            recentActivityTab.classList.remove('hidden');
        }
        
        // Make sure the results container is visible
        if (state.recentActivity.length === 1) {
            const resultsContainer = document.querySelector('.results-container');
            if (resultsContainer && resultsContainer.classList.contains('hidden')) {
                resultsContainer.classList.remove('hidden');
            }
        }
    };

    // Update activity list
    const updateActivityList = () => {
        if (state.recentActivity.length > 0) {
            let activitiesHTML = '';
            state.recentActivity.forEach(item => {
                activitiesHTML += `
                    <div class="activity-item">
                        <div class="activity-header">
                            <div class="activity-time">${item.date} ${item.time}</div>
                            <div class="activity-indicator"></div>
                        </div>
                        <div class="activity-content">
                            <div class="activity-description">${item.activity}</div>
                        </div>
                    </div>
                `;
            });
            DOM.activityList.innerHTML = activitiesHTML;
        } else {
            DOM.activityList.innerHTML = '<div class="empty-activity">No recent activity. Run an analysis to see activities here.</div>';
        }
    };
    
    // Show the recent activity tab
    const showRecentActivityTab = () => {
        // Get all tab contents and hide them
        const tabContents = document.querySelectorAll('.results-content');
        tabContents.forEach(content => {
            content.classList.add('hidden');
        });
        
        // Show the recent activity tab content
        const recentActivityContent = document.getElementById('activity');
        if (recentActivityContent) {
            recentActivityContent.classList.remove('hidden');
        }
        
        // Update active tab
        const tabs = document.querySelectorAll('.results-tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });
        
        const recentActivityTab = document.getElementById('recentActivityTab');
        if (recentActivityTab) {
            recentActivityTab.classList.add('active');
        }
        
        // Update activity list
        updateActivityList();
    };

    // Handle AI assistant
    const handleAIAssistant = () => {
        DOM.aiSubmit.addEventListener('click', () => {
            const question = DOM.aiQuestion.value.trim();
            if (question) {
                // Show loader
                DOM.aiLoader.classList.remove('hidden');
                DOM.aiResponseContent.innerHTML = '';
                
                // Add to conversation history
                state.aiConversationHistory.push({
                    role: 'user',
                    content: question
                });
                
                // Update history display
                updateConversationHistory();
                
                // Clear input
                DOM.aiQuestion.value = '';
                
                // Simulate AI response delay
                setTimeout(() => {
                    getAIResponse(question);
                }, 2000);
            }
        });
    };

    // Get AI response
    const getAIResponse = (question) => {
        // This would normally call the Perplexity API
        // For demo purposes, we'll generate a fake response
        
        let response = '';
        
        if (question.toLowerCase().includes('security')) {
            response = 'Based on my analysis, I recommend implementing the following security measures: <br><br>1. Use HTTPS for all communications<br>2. Implement proper input validation and sanitization<br>3. Use parameterized queries to prevent SQL injection<br>4. Implement strong authentication mechanisms<br>5. Apply the principle of least privilege<br><br>These measures will significantly improve your application\'s security posture.';
        } else if (question.toLowerCase().includes('performance')) {
            response = 'To improve performance, consider these optimizations: <br><br>1. Implement caching strategies<br>2. Minify and compress static assets<br>3. Use lazy loading for images and components<br>4. Optimize database queries<br>5. Implement code splitting<br><br>These optimizations can significantly reduce load times and improve user experience.';
        } else if (question.toLowerCase().includes('scalability')) {
            response = 'For better scalability, I recommend: <br><br>1. Implement horizontal scaling<br>2. Use load balancing<br>3. Design for statelessness<br>4. Implement database sharding<br>5. Use message queues for background processing<br><br>These approaches will help your application handle increased load and traffic.';
        } else if (question.toLowerCase().includes('api')) {
            response = 'For API security, consider implementing: <br><br>1. OAuth 2.0 or JWT for authentication<br>2. Rate limiting to prevent abuse<br>3. Input validation for all parameters<br>4. HTTPS for all API endpoints<br>5. Proper error handling that doesn\'t expose sensitive information<br><br>These measures will help secure your API endpoints.';
        } else if (question.toLowerCase().includes('cloud')) {
            response = 'For cloud security, I recommend: <br><br>1. Implement proper IAM policies<br>2. Enable encryption for data at rest and in transit<br>3. Use security groups and network ACLs<br>4. Implement logging and monitoring<br>5. Regularly audit your cloud resources<br><br>These practices will help secure your cloud infrastructure.';
        } else {
            response = 'Based on my analysis of your code, I can provide the following insights: <br><br>1. Your code structure follows modern best practices<br>2. There are opportunities to improve performance through optimization<br>3. Consider implementing additional security measures<br>4. Your architecture should scale well with increased load<br>5. Follow the recommendations in the analysis report for specific improvements<br><br>Feel free to ask more specific questions about security, performance, or scalability.';
        }
        
        // Add to conversation history
        state.aiConversationHistory.push({
            role: 'assistant',
            content: response
        });
        
        // Update response display
        DOM.aiLoader.classList.add('hidden');
        DOM.aiResponseContent.innerHTML = response;
        
        // Update history display
        updateConversationHistory();
        
        addActivity('Received AI response');
    };

    // Update conversation history
    const updateConversationHistory = () => {
        if (state.aiConversationHistory.length > 0) {
            let historyHTML = '';
            state.aiConversationHistory.forEach(message => {
                const isUser = message.role === 'user';
                historyHTML += `
                    <div class="message ${isUser ? 'user-message' : 'ai-message'}">
                        <div class="message-header">
                            <span class="message-sender">${isUser ? 'You' : 'AI Assistant'}</span>
                        </div>
                        <div class="message-content">${message.content}</div>
                    </div>
                `;
            });
            DOM.historyContainer.innerHTML = historyHTML;
        } else {
            DOM.historyContainer.innerHTML = '<p>No conversation history yet.</p>';
        }
    };

    // Initialize the application
    const init = () => {
        // Initialize charts
        initCharts();
        
        // Set up event handlers
        handleNavigation();
        handleTabs();
        handleTheme();
        handleAccentColor();
        handleSettings();
        handleFileUpload();
        handleFormSubmissions();
        handleAIAssistant();
        
        // Add initial activity
        addActivity('Application initialized');
        
        // Apply CSS styles for code highlighting
        applyCodeHighlighting();
    };

    // Apply code highlighting
    const applyCodeHighlighting = () => {
        // This would normally use a library like Prism.js or highlight.js
        // For demo purposes, we'll just add a placeholder
        console.log('Code highlighting applied');
    };

    // Return public methods
    return {
        init
    };
})();

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    CodeGuardian.init();
    // Initialize AI Security Assistant if it exists
    if (typeof AISecurityAssistant !== 'undefined') {
        AISecurityAssistant.init();
    }
});

// Add custom CSS styles for additional elements
(() => {
    const style = document.createElement('style');
    style.textContent = `
        /* Additional Styles */
        .issue-item, .vulnerability-item, .recommendation-item, .metric-item, .scalability-issue-item, .activity-item, .message {
            background-color: var(--bg-tertiary);
            border-radius: var(--radius-sm);
            padding: 15px;
            margin-bottom: 10px;
            border-left: 3px solid var(--accent-blue);
        }
        
        .issue-header, .vulnerability-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        
        .issue-type, .vulnerability-name {
            font-weight: 700;
        }
        
        .issue-severity, .vulnerability-severity {
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .critical {
            background-color: rgba(255, 0, 0, 0.2);
            color: #ff5757;
        }
        
        .high {
            background-color: rgba(255, 165, 0, 0.2);
            color: #ffa500;
        }
        
        .medium {
            background-color: rgba(255, 255, 0, 0.2);
            color: #ffff00;
        }
        
        .low {
            background-color: rgba(0, 128, 0, 0.2);
            color: #00ff8c;
        }
        
        .metric-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .activity-item {
            display: flex;
            align-items: flex-start;
        }
        
        .activity-time {
            font-size: 0.8rem;
            color: var(--text-tertiary);
            margin-right: 10px;
            white-space: nowrap;
        }
        
        .message {
            max-width: 80%;
            margin-bottom: 15px;
        }
        
        .user-message {
            align-self: flex-end;
            margin-left: auto;
            border-left: none;
            border-right: 3px solid var(--accent-red);
        }
        
        .ai-message {
            align-self: flex-start;
            margin-right: auto;
        }
        
        .message-header {
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        .user-message .message-sender {
            color: var(--accent-red);
        }
        
        .ai-message .message-sender {
            color: var(--accent-blue);
        }
    `;
    document.head.appendChild(style);
})();