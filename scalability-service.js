/**
 * CodeGuardian - Scalability Assessment Service
 * Handles scalability analysis for websites and applications
 */

const ScalabilityService = (() => {
    // Private variables
    const state = {
        assessmentInProgress: false,
        lastAssessmentResults: null,
        assessmentDepth: 'standard', // 'basic', 'standard', 'comprehensive'
        assessmentTypes: ['frontend', 'backend', 'database', 'infrastructure'],
        enabledAssessmentTypes: ['frontend', 'backend', 'database', 'infrastructure']
    };

    // Cache DOM elements
    const DOM = {
        assessBtn: document.getElementById('scalability-assess-btn'),
        assessDepthSelect: document.getElementById('assess-depth'),
        assessTypeCheckboxes: document.querySelectorAll('.assess-type-checkbox'),
        resultsContainer: document.querySelector('.scalability-results-container'),
        issuesList: document.querySelector('.scalability-issues-list'),
        scalabilityScore: document.querySelector('.scalability-score-value'),
        scalabilityScoreCircle: document.querySelector('.scalability-score-circle .progress-circle-fill'),
        scalabilityLevelIndicator: document.querySelector('.scalability-level-indicator'),
        scalabilityLoader: document.querySelector('.scalability-assessment .loader'),
        frontendScalabilityTab: document.getElementById('frontend-scalability-tab'),
        backendScalabilityTab: document.getElementById('backend-scalability-tab'),
        databaseScalabilityTab: document.getElementById('database-scalability-tab'),
        infrastructureScalabilityTab: document.getElementById('infrastructure-scalability-tab'),
        recommendationsContainer: document.querySelector('.scalability-recommendations')
    };

    // Scalability issues database (simplified for demo)
    const scalabilityIssuesDatabase = {
        frontend: [
            {
                id: 'FRONT-SCALE-001',
                name: 'Unoptimized Images and Assets',
                description: 'Large unoptimized images and assets can significantly impact load times and scalability',
                impact: 'high',
                remediation: 'Implement image optimization, compression, and lazy loading techniques',
                detectionPatterns: ['img', 'image', 'png', 'jpg', 'jpeg', 'svg']
            },
            {
                id: 'FRONT-SCALE-002',
                name: 'Excessive DOM Size',
                description: 'Large DOM trees with many elements can cause performance issues at scale',
                impact: 'medium',
                remediation: 'Reduce DOM size, implement virtualization for large lists, and optimize rendering',
                detectionPatterns: ['div', 'span', 'document', 'createElement']
            },
            {
                id: 'FRONT-SCALE-003',
                name: 'Render-Blocking Resources',
                description: 'CSS and JavaScript files that block rendering can delay page load',
                impact: 'high',
                remediation: 'Use async/defer for scripts, inline critical CSS, and optimize the critical rendering path',
                detectionPatterns: ['script', 'link', 'stylesheet', 'css']
            },
            {
                id: 'FRONT-SCALE-004',
                name: 'Inefficient Event Handling',
                description: 'Too many event listeners or inefficient event handling can cause performance issues',
                impact: 'medium',
                remediation: 'Use event delegation, debounce/throttle event handlers, and remove unnecessary listeners',
                detectionPatterns: ['addEventListener', 'onclick', 'onchange', 'event']
            },
            {
                id: 'FRONT-SCALE-005',
                name: 'No Code Splitting',
                description: 'Large JavaScript bundles without code splitting can slow initial load times',
                impact: 'medium',
                remediation: 'Implement code splitting to load only necessary code for each page or feature',
                detectionPatterns: ['import', 'require', 'webpack', 'bundle']
            }
        ],
        backend: [
            {
                id: 'BACK-SCALE-001',
                name: 'Synchronous Processing of Requests',
                description: 'Handling requests synchronously can limit throughput and cause bottlenecks',
                impact: 'critical',
                remediation: 'Implement asynchronous processing, use non-blocking I/O, and consider event-driven architecture',
                detectionPatterns: ['function', 'app', 'request', 'response']
            },
            {
                id: 'BACK-SCALE-002',
                name: 'Inefficient Database Queries',
                description: 'Unoptimized database queries can cause performance issues at scale',
                impact: 'high',
                remediation: 'Optimize queries, add proper indexes, and implement query caching',
                detectionPatterns: ['query', 'select', 'where', 'database', 'db']
            },
            {
                id: 'BACK-SCALE-003',
                name: 'No Caching Strategy',
                description: 'Lack of caching can increase load on backend services and databases',
                impact: 'high',
                remediation: 'Implement appropriate caching at multiple levels (CDN, application, database)',
                detectionPatterns: ['cache', 'redis', 'memcached']
            },
            {
                id: 'BACK-SCALE-004',
                name: 'Monolithic Architecture',
                description: 'Monolithic applications can be difficult to scale horizontally',
                impact: 'medium',
                remediation: 'Consider microservices architecture for independent scaling of components',
                detectionPatterns: ['app', 'server', 'express', 'application']
            },
            {
                id: 'BACK-SCALE-005',
                name: 'Stateful Application Design',
                description: 'Storing session state in application memory limits horizontal scaling',
                impact: 'high',
                remediation: 'Design stateless applications and store session data in distributed stores',
                detectionPatterns: ['session', 'state', 'store', 'memory']
            }
        ],
        database: [
            {
                id: 'DB-SCALE-001',
                name: 'No Database Sharding',
                description: 'Large databases without sharding can hit scaling limits',
                impact: 'high',
                remediation: 'Implement database sharding for horizontal scaling of data storage',
                detectionPatterns: ['database', 'db', 'model', 'schema']
            },
            {
                id: 'DB-SCALE-002',
                name: 'Missing Indexes',
                description: 'Tables without proper indexes can cause slow queries at scale',
                impact: 'high',
                remediation: 'Add appropriate indexes based on query patterns',
                detectionPatterns: ['index', 'query', 'find', 'where']
            },
            {
                id: 'DB-SCALE-003',
                name: 'No Connection Pooling',
                description: 'Creating new database connections for each request limits scalability',
                impact: 'medium',
                remediation: 'Implement connection pooling to reuse database connections',
                detectionPatterns: ['connect', 'connection', 'database', 'db']
            },
            {
                id: 'DB-SCALE-004',
                name: 'No Read/Write Splitting',
                description: 'Using the same database for reads and writes can limit throughput',
                impact: 'medium',
                remediation: 'Implement read replicas and direct read queries to replicas',
                detectionPatterns: ['read', 'write', 'query', 'update']
            },
            {
                id: 'DB-SCALE-005',
                name: 'Large Transactions',
                description: 'Long-running transactions can block other operations and limit concurrency',
                impact: 'high',
                remediation: 'Break down large transactions into smaller ones and minimize transaction duration',
                detectionPatterns: ['transaction', 'commit', 'rollback']
            }
        ],
        infrastructure: [
            {
                id: 'INFRA-SCALE-001',
                name: 'No Auto-Scaling Configuration',
                description: 'Fixed infrastructure without auto-scaling cannot handle variable loads',
                impact: 'critical',
                remediation: 'Implement auto-scaling for dynamic resource allocation based on demand',
                detectionPatterns: ['server', 'host', 'deploy', 'cloud']
            },
            {
                id: 'INFRA-SCALE-002',
                name: 'Single Region Deployment',
                description: 'Deploying to a single region increases latency for distant users and creates a single point of failure',
                impact: 'high',
                remediation: 'Implement multi-region deployment with proper load balancing',
                detectionPatterns: ['region', 'deploy', 'aws', 'azure', 'gcp']
            },
            {
                id: 'INFRA-SCALE-003',
                name: 'No CDN Integration',
                description: 'Serving static assets directly from application servers limits scalability',
                impact: 'high',
                remediation: 'Use CDNs to distribute static content globally',
                detectionPatterns: ['static', 'assets', 'public', 'dist']
            },
            {
                id: 'INFRA-SCALE-004',
                name: 'Insufficient Monitoring',
                description: 'Lack of comprehensive monitoring makes it difficult to identify scaling issues',
                impact: 'medium',
                remediation: 'Implement robust monitoring and alerting for all components',
                detectionPatterns: ['log', 'monitor', 'metric', 'trace']
            },
            {
                id: 'INFRA-SCALE-005',
                name: 'No Load Testing Strategy',
                description: 'Without load testing, it\'s difficult to identify scaling bottlenecks before production',
                impact: 'medium',
                remediation: 'Implement regular load testing as part of the development process',
                detectionPatterns: ['test', 'performance', 'load']
            }
        ]
    };

    // Initialize event listeners
    const initEventListeners = () => {
        // Scalability assessment button
        if (DOM.assessBtn) {
            DOM.assessBtn.addEventListener('click', () => {
                if (!state.assessmentInProgress) {
                    startScalabilityAssessment();
                }
            });
        }

        // Assessment depth selection
        if (DOM.assessDepthSelect) {
            DOM.assessDepthSelect.addEventListener('change', () => {
                state.assessmentDepth = DOM.assessDepthSelect.value;
            });
        }

        // Assessment type checkboxes
        if (DOM.assessTypeCheckboxes) {
            DOM.assessTypeCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    updateEnabledAssessmentTypes();
                });
            });
        }

        // Scalability tab navigation
        const scalabilityTabs = [
            DOM.frontendScalabilityTab, 
            DOM.backendScalabilityTab, 
            DOM.databaseScalabilityTab, 
            DOM.infrastructureScalabilityTab
        ];
        
        scalabilityTabs.forEach(tab => {
            if (tab) {
                tab.addEventListener('click', () => {
                    showScalabilityTabContent(tab.id);
                });
            }
        });
    };

    // Update enabled assessment types based on checkboxes
    const updateEnabledAssessmentTypes = () => {
        state.enabledAssessmentTypes = [];
        DOM.assessTypeCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                state.enabledAssessmentTypes.push(checkbox.value);
            }
        });
    };

    // Show scalability tab content
    const showScalabilityTabContent = (tabId) => {
        // Hide all tab content
        const tabContents = document.querySelectorAll('.scalability-tab-content');
        tabContents.forEach(content => {
            content.classList.add('hidden');
        });

        // Remove active class from all tabs
        const tabs = document.querySelectorAll('.scalability-tab');
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

    // Start scalability assessment
    const startScalabilityAssessment = () => {
        state.assessmentInProgress = true;
        showLoader();
        clearResults();

        // Get code from CodeGuardian main module
        const code = window.CodeGuardian ? window.CodeGuardian.getCurrentCode() : '';
        const language = window.CodeGuardian ? window.CodeGuardian.getCurrentLanguage() : 'unknown';

        // Simulate assessment delay
        setTimeout(() => {
            performScalabilityAnalysis(code, language);
        }, 2000);
    };

    // Show loader
    const showLoader = () => {
        if (DOM.scalabilityLoader) {
            DOM.scalabilityLoader.classList.remove('hidden');
        }
    };

    // Hide loader
    const hideLoader = () => {
        if (DOM.scalabilityLoader) {
            DOM.scalabilityLoader.classList.add('hidden');
        }
    };

    // Clear previous results
    const clearResults = () => {
        if (DOM.issuesList) {
            DOM.issuesList.innerHTML = '';
        }
        if (DOM.scalabilityScore) {
            DOM.scalabilityScore.textContent = '0';
        }
        if (DOM.scalabilityScoreCircle) {
            DOM.scalabilityScoreCircle.style.strokeDasharray = '0 100';
        }
        if (DOM.scalabilityLevelIndicator) {
            DOM.scalabilityLevelIndicator.className = 'scalability-level-indicator';
            DOM.scalabilityLevelIndicator.textContent = 'N/A';
        }
        if (DOM.recommendationsContainer) {
            DOM.recommendationsContainer.innerHTML = '';
        }
    };

    // Perform scalability analysis
    const performScalabilityAnalysis = (code, language) => {
        // Initialize results object
        const results = {
            issues: [],
            scalabilityScore: 0,
            scalabilityLevel: 'unknown',
            assessmentTime: new Date().toISOString(),
            assessmentDepth: state.assessmentDepth,
            assessmentTypes: state.enabledAssessmentTypes,
            recommendations: []
        };

        // Skip analysis if code is empty
        if (!code) {
            state.assessmentInProgress = false;
            hideLoader();
            updateResults(results);
            return;
        }

        // Analyze code for each enabled assessment type
        state.enabledAssessmentTypes.forEach(assessType => {
            const typeIssues = analyzeCodeForScalabilityIssues(code, assessType);
            results.issues = [...results.issues, ...typeIssues];
        });

        // Generate recommendations based on issues
        results.recommendations = generateRecommendations(results.issues);

        // Calculate scalability score and level
        calculateScalabilityMetrics(results);

        // Store results
        state.lastAssessmentResults = results;

        // Update UI with results
        state.assessmentInProgress = false;
        hideLoader();
        updateResults(results);

        // Add to activity log if CodeGuardian main module is available
        if (window.CodeGuardian && window.CodeGuardian.addActivity) {
            window.CodeGuardian.addActivity({
                type: 'scalability_assessment',
                description: `Scalability assessment completed with ${results.issues.length} issues found`,
                timestamp: new Date().toISOString(),
                details: {
                    scalabilityScore: results.scalabilityScore,
                    scalabilityLevel: results.scalabilityLevel,
                    issuesCount: results.issues.length
                }
            });
        }
    };

    // Analyze code for scalability issues of a specific type
    const analyzeCodeForScalabilityIssues = (code, assessType) => {
        const issues = [];
        const issueTypes = scalabilityIssuesDatabase[assessType];

        if (!issueTypes) return issues;

        // For each issue type, check if code contains detection patterns
        issueTypes.forEach(issue => {
            // Skip some issues based on assessment depth
            if (state.assessmentDepth === 'basic' && issue.impact !== 'critical' && issue.impact !== 'high') {
                return;
            }
            if (state.assessmentDepth === 'standard' && issue.impact === 'low') {
                // For standard depth, randomly skip some low impact issues
                if (Math.random() > 0.5) return;
            }

            // Check if code contains any detection patterns
            const hasPattern = issue.detectionPatterns.some(pattern => {
                return code.toLowerCase().includes(pattern.toLowerCase());
            });

            // For demo purposes, also add some randomness to findings
            const randomFactor = Math.random();
            const shouldInclude = hasPattern || 
                                 (assessType === 'frontend' && randomFactor < 0.3) || 
                                 (assessType === 'backend' && randomFactor < 0.25) ||
                                 (assessType === 'database' && randomFactor < 0.2) ||
                                 (assessType === 'infrastructure' && randomFactor < 0.15);

            if (shouldInclude) {
                // Create a copy of the issue with additional info
                const foundIssue = { ...issue };
                
                // Add line numbers (simulated)
                foundIssue.lineStart = Math.floor(Math.random() * code.split('\n').length) + 1;
                foundIssue.lineEnd = foundIssue.lineStart + Math.floor(Math.random() * 5);
                
                // Add to issues list
                issues.push(foundIssue);
            }
        });

        return issues;
    };

    // Generate recommendations based on issues
    const generateRecommendations = (issues) => {
        const recommendations = [];
        
        // Add general recommendations
        recommendations.push({
            title: 'Implement Horizontal Scaling',
            description: 'Design your application to scale horizontally by adding more instances rather than upgrading existing ones',
            priority: 'high',
            category: 'infrastructure'
        });
        
        recommendations.push({
            title: 'Use Content Delivery Networks (CDNs)',
            description: 'Distribute static content through CDNs to reduce load on application servers and improve global performance',
            priority: 'high',
            category: 'frontend'
        });
        
        recommendations.push({
            title: 'Implement Caching Strategies',
            description: 'Add multi-level caching (browser, CDN, application, database) to reduce load and improve response times',
            priority: 'high',
            category: 'backend'
        });
        
        // Add specific recommendations based on issues
        const issueTypes = {};
        issues.forEach(issue => {
            issueTypes[issue.id] = true;
        });
        
        // Frontend recommendations
        if (issueTypes['FRONT-SCALE-001']) {
            recommendations.push({
                title: 'Optimize Images and Assets',
                description: 'Compress images, use WebP format, implement lazy loading, and minimize CSS/JS files',
                priority: 'high',
                category: 'frontend'
            });
        }
        
        if (issueTypes['FRONT-SCALE-002']) {
            recommendations.push({
                title: 'Reduce DOM Complexity',
                description: 'Simplify DOM structure, use virtualization for large lists, and optimize component rendering',
                priority: 'medium',
                category: 'frontend'
            });
        }
        
        // Backend recommendations
        if (issueTypes['BACK-SCALE-001']) {
            recommendations.push({
                title: 'Implement Asynchronous Processing',
                description: 'Use non-blocking I/O, background jobs, and message queues for resource-intensive tasks',
                priority: 'critical',
                category: 'backend'
            });
        }
        
        if (issueTypes['BACK-SCALE-005']) {
            recommendations.push({
                title: 'Design Stateless Applications',
                description: 'Store session state in distributed stores like Redis instead of application memory',
                priority: 'high',
                category: 'backend'
            });
        }
        
        // Database recommendations
        if (issueTypes['DB-SCALE-001']) {
            recommendations.push({
                title: 'Implement Database Sharding',
                description: 'Partition data across multiple database instances to improve scalability',
                priority: 'high',
                category: 'database'
            });
        }
        
        if (issueTypes['DB-SCALE-002']) {
            recommendations.push({
                title: 'Optimize Database Indexes',
                description: 'Add appropriate indexes based on query patterns to improve database performance',
                priority: 'high',
                category: 'database'
            });
        }
        
        // Infrastructure recommendations
        if (issueTypes['INFRA-SCALE-001']) {
            recommendations.push({
                title: 'Configure Auto-Scaling',
                description: 'Set up auto-scaling groups to automatically adjust capacity based on demand',
                priority: 'critical',
                category: 'infrastructure'
            });
        }
        
        if (issueTypes['INFRA-SCALE-002']) {
            recommendations.push({
                title: 'Implement Multi-Region Deployment',
                description: 'Deploy to multiple geographic regions with proper load balancing for improved availability and performance',
                priority: 'high',
                category: 'infrastructure'
            });
        }
        
        return recommendations;
    };

    // Calculate scalability score and level
    const calculateScalabilityMetrics = (results) => {
        const issues = results.issues;
        
        // Count issues by impact
        const counts = {
            critical: issues.filter(i => i.impact === 'critical').length,
            high: issues.filter(i => i.impact === 'high').length,
            medium: issues.filter(i => i.impact === 'medium').length,
            low: issues.filter(i => i.impact === 'low').length
        };
        
        // Calculate weighted score (0-100, higher is better)
        const totalWeight = counts.critical * 10 + counts.high * 5 + counts.medium * 2 + counts.low * 1;
        const maxPossibleWeight = 30; // Arbitrary maximum for normalization
        const normalizedWeight = Math.min(totalWeight, maxPossibleWeight);
        const scalabilityScore = Math.max(0, Math.round(100 - (normalizedWeight / maxPossibleWeight * 100)));
        
        // Determine scalability level
        let scalabilityLevel = 'excellent';
        if (counts.critical > 0 || counts.high > 2) {
            scalabilityLevel = 'poor';
        } else if (counts.high > 0 || counts.medium > 3) {
            scalabilityLevel = 'fair';
        } else if (counts.medium > 0 || counts.low > 5) {
            scalabilityLevel = 'good';
        }
        
        // Update results object
        results.scalabilityScore = scalabilityScore;
        results.scalabilityLevel = scalabilityLevel;
        results.issueCounts = counts;
    };

    // Update UI with results
    const updateResults = (results) => {
        // Update scalability score
        if (DOM.scalabilityScore) {
            animateCounter(DOM.scalabilityScore, 0, results.scalabilityScore, 1500);
        }
        
        // Update scalability score circle
        if (DOM.scalabilityScoreCircle) {
            animateCircle(DOM.scalabilityScoreCircle, 0, results.scalabilityScore, 1500);
        }
        
        // Update scalability level indicator
        if (DOM.scalabilityLevelIndicator) {
            DOM.scalabilityLevelIndicator.className = `scalability-level-indicator ${results.scalabilityLevel}`;
            DOM.scalabilityLevelIndicator.textContent = results.scalabilityLevel.toUpperCase();
        }
        
        // Update issues list
        if (DOM.issuesList) {
            updateIssuesList(results.issues);
        }
        
        // Update recommendations
        if (DOM.recommendationsContainer) {
            updateRecommendations(results.recommendations);
        }
        
        // Show results container
        if (DOM.resultsContainer) {
            DOM.resultsContainer.classList.remove('hidden');
        }
    };

    // Update issues list
    const updateIssuesList = (issues) => {
        if (!DOM.issuesList) return;
        
        if (issues.length === 0) {
            DOM.issuesList.innerHTML = '<div class="no-issues">No scalability issues found!</div>';
            return;
        }
        
        // Sort issues by impact (critical first)
        const sortedIssues = [...issues].sort((a, b) => {
            const impactOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return impactOrder[a.impact] - impactOrder[b.impact];
        });
        
        // Generate HTML for each issue
        let html = '';
        sortedIssues.forEach(issue => {
            html += `
                <div class="scalability-issue-item ${issue.impact}">
                    <div class="issue-header">
                        <div class="issue-impact ${issue.impact}">${issue.impact}</div>
                        <div class="issue-id">${issue.id}</div>
                        <div class="issue-name">${issue.name}</div>
                    </div>
                    <div class="issue-details">
                        <div class="issue-description">
                            <strong>Description:</strong> ${issue.description}
                        </div>
                        <div class="issue-location">
                            <strong>Location:</strong> Lines ${issue.lineStart}-${issue.lineEnd}
                        </div>
                        <div class="issue-remediation">
                            <strong>Remediation:</strong> ${issue.remediation}
                        </div>
                    </div>
                </div>
            `;
        });
        
        DOM.issuesList.innerHTML = html;
        
        // Add click event to toggle issue details
        const issueItems = DOM.issuesList.querySelectorAll('.scalability-issue-item');
        issueItems.forEach(item => {
            const header = item.querySelector('.issue-header');
            const details = item.querySelector('.issue-details');
            
            header.addEventListener('click', () => {
                details.classList.toggle('expanded');
                header.classList.toggle('expanded');
            });
        });
    };

    // Update recommendations
    const updateRecommendations = (recommendations) => {
        if (!DOM.recommendationsContainer) return;
        
        if (recommendations.length === 0) {
            DOM.recommendationsContainer.innerHTML = '<div class="no-recommendations">No recommendations available</div>';
            return;
        }
        
        // Sort recommendations by priority (critical first)
        const sortedRecommendations = [...recommendations].sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        
        // Generate HTML for each recommendation
        let html = '<h3>Recommendations to Improve Scalability</h3>';
        sortedRecommendations.forEach(recommendation => {
            html += `
                <div class="scalability-recommendation">
                    <div class="recommendation-priority ${recommendation.priority}"></div>
                    <div class="recommendation-content">
                        <div class="recommendation-title">${recommendation.title}</div>
                        <div class="recommendation-description">${recommendation.description}</div>
                        <div class="recommendation-category">${recommendation.category}</div>
                    </div>
                </div>
            `;
        });
        
        DOM.recommendationsContainer.innerHTML = html;
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

    // Get scalability recommendations for different categories
    const getScalabilityRecommendations = (category = 'all') => {
        const allRecommendations = {
            frontend: [
                {
                    title: 'Implement Lazy Loading',
                    description: 'Load resources only when needed to improve initial page load time',
                    priority: 'high'
                },
                {
                    title: 'Use Code Splitting',
                    description: 'Split JavaScript bundles to load only necessary code for each page',
                    priority: 'high'
                },
                {
                    title: 'Optimize Images and Assets',
                    description: 'Compress images, use WebP format, and minimize CSS/JS files',
                    priority: 'high'
                },
                {
                    title: 'Implement Client-Side Caching',
                    description: 'Use browser caching and service workers for offline capabilities',
                    priority: 'medium'
                },
                {
                    title: 'Use Virtualization for Large Lists',
                    description: 'Render only visible items in large lists to improve performance',
                    priority: 'medium'
                }
            ],
            backend: [
                {
                    title: 'Design Stateless Applications',
                    description: 'Avoid storing session state in application memory',
                    priority: 'critical'
                },
                {
                    title: 'Implement Asynchronous Processing',
                    description: 'Use non-blocking I/O and background jobs for resource-intensive tasks',
                    priority: 'high'
                },
                {
                    title: 'Use Message Queues',
                    description: 'Decouple components with message queues for better scalability',
                    priority: 'high'
                },
                {
                    title: 'Implement API Rate Limiting',
                    description: 'Protect backend services from excessive requests',
                    priority: 'medium'
                },
                {
                    title: 'Consider Microservices Architecture',
                    description: 'Break monolithic applications into independently scalable services',
                    priority: 'medium'
                }
            ],
            database: [
                {
                    title: 'Implement Database Sharding',
                    description: 'Partition data across multiple database instances',
                    priority: 'high'
                },
                {
                    title: 'Use Read Replicas',
                    description: 'Direct read queries to replicas to reduce load on primary database',
                    priority: 'high'
                },
                {
                    title: 'Implement Connection Pooling',
                    description: 'Reuse database connections to reduce overhead',
                    priority: 'medium'
                },
                {
                    title: 'Optimize Indexes',
                    description: 'Add appropriate indexes based on query patterns',
                    priority: 'high'
                },
                {
                    title: 'Consider NoSQL for Specific Use Cases',
                    description: 'Use NoSQL databases for specific scalability requirements',
                    priority: 'medium'
                }
            ],
            infrastructure: [
                {
                    title: 'Implement Horizontal Scaling',
                    description: 'Design for adding more instances rather than upgrading existing ones',
                    priority: 'critical'
                },
                {
                    title: 'Use Content Delivery Networks',
                    description: 'Distribute static content through CDNs',
                    priority: 'high'
                },
                {
                    title: 'Configure Auto-Scaling',
                    description: 'Automatically adjust capacity based on demand',
                    priority: 'critical'
                },
                {
                    title: 'Implement Multi-Region Deployment',
                    description: 'Deploy to multiple geographic regions for improved availability',
                    priority: 'high'
                },
                {
                    title: 'Use Container Orchestration',
                    description: 'Leverage Kubernetes or similar tools for container management',
                    priority: 'medium'
                }
            ]
        };
        
        if (category === 'all') {
            return {
                frontend: allRecommendations.frontend,
                backend: allRecommendations.backend,
                database: allRecommendations.database,
                infrastructure: allRecommendations.infrastructure
            };
        }
        
        return allRecommendations[category] || [];
    };

    // Initialize
    const init = () => {
        initEventListeners();
    };

    // Return public methods
    return {
        init,
        startScalabilityAssessment,
        getScalabilityRecommendations
    };
})();

// Initialize the Scalability Service when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    ScalabilityService.init();
});

// Add custom CSS for scalability features
(() => {
    const style = document.createElement('style');
    style.textContent = `
        .scalability-issue-item {
            margin-bottom: 15px;
            border-radius: var(--radius-sm);
            overflow: hidden;
            border-left: 4px solid var(--accent-blue);
            background-color: var(--bg-tertiary);
        }
        
        .scalability-issue-item.critical {
            border-left-color: var(--accent-red);
        }
        
        .scalability-issue-item.high {
            border-left-color: #ff6b00;
        }
        
        .scalability-issue-item.medium {
            border-left-color: #ffcc00;
        }
        
        .scalability-issue-item.low {
            border-left-color: var(--accent-blue);
        }
        
        .issue-header {
            padding: 12px 15px;
            display: flex;
            align-items: center;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }
        
        .issue-header:hover {
            background-color: var(--bg-secondary);
        }
        
        .issue-header.expanded {
            border-bottom: 1px solid var(--border-color);
        }
        
        .issue-impact {
            padding: 3px 8px;
            border-radius: var(--radius-xs);
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            margin-right: 10px;
        }
        
        .issue-impact.critical {
            background-color: rgba(255, 0, 0, 0.2);
            color: var(--accent-red);
        }
        
        .issue-impact.high {
            background-color: rgba(255, 107, 0, 0.2);
            color: #ff6b00;
        }
        
        .issue-impact.medium {
            background-color: rgba(255, 204, 0, 0.2);
            color: #ffcc00;
        }
        
        .issue-impact.low {
            background-color: rgba(0, 122, 255, 0.2);
            color: var(--accent-blue);
        }
        
        .issue-id {
            font-family: monospace;
            margin-right: 15px;
            color: var(--text-tertiary);
        }
        
        .issue-name {
            font-weight: 500;
        }
        
        .issue-details {
            padding: 0;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease, padding 0.3s ease;
        }
        
        .issue-details.expanded {
            padding: 15px;
            max-height: 500px;
        }
        
        .issue-description,
        .issue-location,
        .issue-remediation {
            margin-bottom: 10px;
        }
        
        .no-issues {
            padding: 20px;
            text-align: center;
            color: var(--text-tertiary);
        }
        
        .scalability-level-indicator {
            display: inline-block;
            padding: 5px 10px;
            border-radius: var(--radius-xs);
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.9rem;
        }
        
        .scalability-level-indicator.poor {
            background-color: rgba(255, 0, 0, 0.2);
            color: var(--accent-red);
        }
        
        .scalability-level-indicator.fair {
            background-color: rgba(255, 107, 0, 0.2);
            color: #ff6b00;
        }
        
        .scalability-level-indicator.good {
            background-color: rgba(255, 204, 0, 0.2);
            color: #ffcc00;
        }
        
        .scalability-level-indicator.excellent {
            background-color: rgba(0, 255, 140, 0.2);
            color: #00ff8c;
        }
        
        .scalability-recommendation {
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
            margin-bottom: 5px;
        }
        
        .recommendation-category {
            display: inline-block;
            padding: 2px 8px;
            border-radius: var(--radius-xs);
            font-size: 0.8rem;
            background-color: var(--bg-secondary);
            color: var(--text-tertiary);
            text-transform: capitalize;
        }
        
        .no-recommendations {
            padding: 20px;
            text-align: center;
            color: var(--text-tertiary);
        }
    `;
    document.head.appendChild(style);
})();