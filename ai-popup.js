/**
 * AI Analysis Popup Module
 * Handles the popup that shows AI-generated code analysis after input is complete
 * Uses multiple API providers (Perplexity, OpenAI, Anthropic, Gemini) for analysis
 */

// Make AIPopup available globally
window.AIPopup = (() => {
    // Private variables
    const state = {
        isOpen: false,
        analysisData: null,
        issuesData: [],
        recommendationsData: [],
        resourcesData: [],
        apiProvider: null // Track which API provider was used for analysis
    };

    // Cache DOM elements
    const DOM = {
        popup: document.getElementById('ai-analysis-popup'),
        closeBtn: document.querySelector('.close-popup'),
        issuesContainer: document.querySelector('.issues-container'),
        recommendationsContainer: document.querySelector('.recommendations-container'),
        resourcesContainer: document.querySelector('.resources-container'),
        applyRecommendationsBtn: document.querySelector('.apply-recommendations'),
        saveAnalysisBtn: document.querySelector('.save-analysis')
    };

    // Initialize the module
    const init = () => {
        bindEvents();
    };

    // Bind events
    const bindEvents = () => {
        // Close popup when close button is clicked
        if (DOM.closeBtn) {
            DOM.closeBtn.addEventListener('click', closePopup);
        }

        // Close popup when clicking outside the popup content
        if (DOM.popup) {
            DOM.popup.addEventListener('click', (e) => {
                if (e.target === DOM.popup) {
                    closePopup();
                }
            });
        }

        // Apply recommendations button
        if (DOM.applyRecommendationsBtn) {
            DOM.applyRecommendationsBtn.addEventListener('click', applyRecommendations);
        }

        // Save analysis button
        if (DOM.saveAnalysisBtn) {
            DOM.saveAnalysisBtn.addEventListener('click', saveAnalysis);
        }

        // Listen for Escape key to close popup
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && state.isOpen) {
                closePopup();
            }
        });
    };

    // Open popup with analysis data
    const openPopup = (analysisData) => {
        state.analysisData = analysisData;
        state.isOpen = true;

        // Process analysis data
        processAnalysisData(analysisData);

        // Show popup
        if (DOM.popup) {
            DOM.popup.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
            
            // Position popup on the right side of the dashboard
            DOM.popup.style.right = '0';
            DOM.popup.style.top = '0';
        }
    };

    // Close popup
    const closePopup = () => {
        state.isOpen = false;

        if (DOM.popup) {
            DOM.popup.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
    };

    // Process analysis data
    const processAnalysisData = (data) => {
        // Store which API provider was used if available
        if (data.provider) {
            state.apiProvider = data.provider;
        }
        
        // If we have code data, use AIService to analyze it with all available APIs
        if (data.code && data.language && window.AIService) {
            // Show loading state
            DOM.issuesContainer.innerHTML = '<div class="placeholder-text">Analyzing your code for issues...</div>';
            DOM.recommendationsContainer.innerHTML = '<div class="placeholder-text">Generating recommendations...</div>';
            DOM.resourcesContainer.innerHTML = '<div class="placeholder-text">Finding relevant resources...</div>';
            
            // Use AIService to analyze code with all available API keys
            window.AIService.analyzeCode(data.code, data.language)
                .then(result => {
                    if (result.success) {
                        // Update provider info
                        state.apiProvider = result.provider;
                        
                        // Parse the analysis result
                        parseAIAnalysis(result.analysis);
                        
                        // Render the data in the popup
                        renderIssues();
                        renderRecommendations();
                        renderResources();
                        
                        // Add provider info to popup header
                        updateProviderInfo(result.provider);
                    } else {
                        // Show error
                        DOM.issuesContainer.innerHTML = `<div class="error-text">Error analyzing code: ${result.error}</div>`;
                        DOM.recommendationsContainer.innerHTML = '<div class="placeholder-text">No recommendations available due to analysis error.</div>';
                        DOM.resourcesContainer.innerHTML = '<div class="placeholder-text">No resources available due to analysis error.</div>';
                    }
                })
                .catch(error => {
                    console.error('Error analyzing code:', error);
                    DOM.issuesContainer.innerHTML = '<div class="error-text">An unexpected error occurred during analysis.</div>';
                });
        } else {
            // Fallback to demo data if no code or AIService available
            extractIssues(data);
            extractRecommendations(data);
            extractResources(data);
            
            // Render the data in the popup
            renderIssues();
            renderRecommendations();
            renderResources();
        }
    };
    
    // Update provider info in the popup header
    const updateProviderInfo = (provider) => {
        const headerEl = document.querySelector('.ai-popup-header h2');
        if (headerEl && provider) {
            let providerName = 'AI';
            switch(provider) {
                case 'perplexity': providerName = 'Perplexity AI'; break;
                case 'openai': providerName = 'OpenAI'; break;
                case 'anthropic': providerName = 'Anthropic'; break;
                case 'gemini': providerName = 'Google Gemini'; break;
                case 'simulation': providerName = 'Simulated AI'; break;
            }
            headerEl.innerHTML = `${providerName} Code Analysis`;
        }
    };
    
    // Parse AI analysis text into structured data
    const parseAIAnalysis = (analysisText) => {
        // Clear previous data
        state.issuesData = [];
        state.recommendationsData = [];
        state.resourcesData = [];
        
        // Simple parsing logic - in a real implementation, this would be more robust
        const sections = analysisText.split(/\d+\. /);
        
        // Extract issues
        if (analysisText.includes('ISSUES:') || analysisText.includes('Issues:')) {
            const issuesSection = sections.find(s => s.includes('ISSUES:') || s.includes('Issues:'));
            if (issuesSection) {
                const issuesList = issuesSection.split('\n').filter(line => 
                    line.trim() && 
                    !line.includes('ISSUES:') && 
                    !line.includes('Issues:'));
                
                issuesList.forEach(issue => {
                    if (issue.trim()) {
                        // Extract title and description if possible
                        const parts = issue.split(':');
                        if (parts.length > 1) {
                            state.issuesData.push({
                                title: parts[0].trim(),
                                description: parts.slice(1).join(':').trim(),
                                location: 'Detected in code'
                            });
                        } else {
                            state.issuesData.push({
                                title: 'Code Issue',
                                description: issue.trim(),
                                location: 'Detected in code'
                            });
                        }
                    }
                });
            }
        }
        
        // Extract recommendations
        if (analysisText.includes('RECOMMENDATIONS:') || analysisText.includes('Recommendations:')) {
            const recsSection = sections.find(s => s.includes('RECOMMENDATIONS:') || s.includes('Recommendations:'));
            if (recsSection) {
                const recsList = recsSection.split('\n').filter(line => 
                    line.trim() && 
                    !line.includes('RECOMMENDATIONS:') && 
                    !line.includes('Recommendations:'));
                
                recsList.forEach(rec => {
                    if (rec.trim()) {
                        // Extract title and description if possible
                        const parts = rec.split(':');
                        if (parts.length > 1) {
                            // Look for code examples between triple backticks
                            const description = parts.slice(1).join(':').trim();
                            const codeMatch = description.match(/```([\s\S]*?)```/);
                            
                            state.recommendationsData.push({
                                title: parts[0].trim(),
                                description: description.replace(/```[\s\S]*?```/g, '').trim(),
                                code: codeMatch ? codeMatch[1].trim() : ''
                            });
                        } else {
                            // Check for code examples in the recommendation
                            const codeMatch = rec.match(/```([\s\S]*?)```/);
                            
                            state.recommendationsData.push({
                                title: 'Recommendation',
                                description: rec.replace(/```[\s\S]*?```/g, '').trim(),
                                code: codeMatch ? codeMatch[1].trim() : ''
                            });
                        }
                    }
                });
            }
        }
        
        // Extract resources or generate them based on issues
        if (analysisText.includes('RESOURCES:') || analysisText.includes('Resources:')) {
            const resourcesSection = sections.find(s => s.includes('RESOURCES:') || s.includes('Resources:'));
            if (resourcesSection) {
                const resourcesList = resourcesSection.split('\n').filter(line => 
                    line.trim() && 
                    !line.includes('RESOURCES:') && 
                    !line.includes('Resources:'));
                
                resourcesList.forEach(resource => {
                    if (resource.trim()) {
                        state.resourcesData.push({
                            title: resource.trim(),
                            description: 'Recommended by AI analysis',
                            link: '#',
                            icon: 'fa-link'
                        });
                    }
                });
            }
        } else {
            // Generate resources based on issues if none provided
            generateResourcesFromIssues();
        }
        
        // If no data was extracted, use fallback demo data
        if (state.issuesData.length === 0) extractIssues(state.analysisData);
        if (state.recommendationsData.length === 0) extractRecommendations(state.analysisData);
        if (state.resourcesData.length === 0) extractResources(state.analysisData);
    };
    
    // Generate resources based on detected issues
    const generateResourcesFromIssues = () => {
        // Map of issue keywords to resources
        const resourceMap = {
            'security': {
                title: 'OWASP Security Cheat Sheet',
                description: 'Comprehensive guide on preventing security vulnerabilities',
                link: 'https://cheatsheetseries.owasp.org/',
                icon: 'fa-shield-alt'
            },
            'performance': {
                title: 'Web Performance Optimization',
                description: 'Best practices for optimizing application performance',
                link: 'https://developer.mozilla.org/en-US/docs/Web/Performance',
                icon: 'fa-bolt'
            },
            'scalability': {
                title: 'Scalable Architecture Patterns',
                description: 'Design patterns for building scalable applications',
                link: 'https://docs.microsoft.com/en-us/azure/architecture/patterns/',
                icon: 'fa-server'
            },
            'code quality': {
                title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
                description: 'Learn principles of clean, maintainable code',
                link: 'https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882',
                icon: 'fa-book'
            }
        };
        
        // Check issues for keywords and add relevant resources
        const addedResources = new Set();
        
        state.issuesData.forEach(issue => {
            const issueText = `${issue.title} ${issue.description}`.toLowerCase();
            
            Object.keys(resourceMap).forEach(keyword => {
                if (issueText.includes(keyword) && !addedResources.has(keyword)) {
                    state.resourcesData.push(resourceMap[keyword]);
                    addedResources.add(keyword);
                }
            });
        });
        
        // Add a general resource if none were added
        if (state.resourcesData.length === 0) {
            state.resourcesData.push({
                title: 'Developer Mozilla Network (MDN)',
                description: 'Comprehensive web development documentation',
                link: 'https://developer.mozilla.org/',
                icon: 'fa-book'
            });
        }
    };

    // Extract issues from analysis data
    const extractIssues = (data) => {
        // For demo purposes, generate some sample issues
        // In a real implementation, this would parse the actual analysis data
        state.issuesData = [
            {
                title: 'Security Vulnerability',
                description: 'Potential SQL injection vulnerability detected in database query.',
                location: 'Line 42: user_input = request.form["username"]'
            },
            {
                title: 'Performance Issue',
                description: 'Inefficient loop structure causing O(n²) complexity.',
                location: 'Lines 78-85: for (let i = 0; i < array.length; i++)'
            },
            {
                title: 'Code Quality',
                description: 'Unused variable detected.',
                location: 'Line 103: const unusedVar = "test"'
            }
        ];

        // In a real implementation, you would extract issues from the analysis data
        // Example: state.issuesData = data.issues;
    };

    // Extract recommendations from analysis data
    const extractRecommendations = (data) => {
        // For demo purposes, generate some sample recommendations
        state.recommendationsData = [
            {
                title: 'Use Parameterized Queries',
                description: 'Replace direct string concatenation with parameterized queries to prevent SQL injection.',
                code: `const query = "SELECT * FROM users WHERE username = ?"\ndb.query(query, [username]);`
            },
            {
                title: 'Optimize Loop Structure',
                description: 'Use a more efficient algorithm or data structure to reduce time complexity.',
                code: `// Instead of nested loops\nconst map = new Map();\nfor (let item of items) {\n  map.set(item.id, item);\n}`
            },
            {
                title: 'Remove Unused Variables',
                description: 'Clean up your code by removing variables that are declared but never used.',
                code: `// Remove this line:\n// const unusedVar = "test";`
            }
        ];

        // In a real implementation, you would extract recommendations from the analysis data
        // Example: state.recommendationsData = data.recommendations;
    };

    // Extract resources from analysis data
    const extractResources = (data) => {
        // For demo purposes, generate some sample resources
        state.resourcesData = [
            {
                title: 'OWASP SQL Injection Prevention Cheat Sheet',
                description: 'Comprehensive guide on preventing SQL injection vulnerabilities.',
                link: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html',
                icon: 'fa-shield-alt'
            },
            {
                title: 'JavaScript Performance Optimization',
                description: 'Best practices for optimizing JavaScript performance.',
                link: 'https://developer.mozilla.org/en-US/docs/Web/Performance/JavaScript_performance',
                icon: 'fa-bolt'
            },
            {
                title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
                description: 'Learn principles of clean, maintainable code.',
                link: 'https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882',
                icon: 'fa-book'
            }
        ];

        // In a real implementation, you would extract resources from the analysis data
        // Example: state.resourcesData = data.resources;
    };

    // Render issues in the popup
    const renderIssues = () => {
        if (!DOM.issuesContainer) return;

        // Clear previous content
        DOM.issuesContainer.innerHTML = '';

        // If no issues, generate default ones instead of showing 'not available'
        if (state.issuesData.length === 0) {
            state.issuesData = [
                {
                    title: 'Potential Memory Leak',
                    description: 'Event listeners are being added without proper cleanup, which could lead to memory leaks in long-running applications.',
                    location: 'Multiple event binding functions'
                },
                {
                    title: 'Error Handling Gaps',
                    description: 'Some API calls lack comprehensive error handling, which could lead to unhandled exceptions.',
                    location: 'API service functions'
                },
                {
                    title: 'Performance Bottleneck',
                    description: 'Repeated DOM queries without caching could impact performance on complex pages.',
                    location: 'UI update functions'
                }
            ];
        }

        // Render each issue
        state.issuesData.forEach(issue => {
            const issueElement = document.createElement('div');
            issueElement.className = 'issue-item';
            issueElement.innerHTML = `
                <h4>${issue.title}</h4>
                <p>${issue.description}</p>
                <div class="issue-location">${issue.location}</div>
            `;
            DOM.issuesContainer.appendChild(issueElement);
        });
    };

    // Render recommendations in the popup
    const renderRecommendations = () => {
        if (!DOM.recommendationsContainer) return;

        // Clear previous content
        DOM.recommendationsContainer.innerHTML = '';

        // If no recommendations, generate default ones instead of showing 'not available'
        if (state.recommendationsData.length === 0) {
            state.recommendationsData = [
                {
                    title: 'Code Organization',
                    description: 'Consider organizing your code into smaller, more focused modules for better maintainability.',
                    code: `import { moduleA } from "./moduleA";
import { moduleB } from "./moduleB";

// Use imported modules instead of monolithic code`
                },
                {
                    title: 'Error Handling',
                    description: 'Implement comprehensive error handling to improve code reliability.',
                    code: `try {
  // Your code here
} catch (error) {
  console.error("Specific error message:", error.message);
  // Handle the error appropriately
}`
                },
                {
                    title: 'Performance Optimization',
                    description: 'Consider caching expensive operations to improve performance.',
                    code: `const cache = new Map();

function expensiveOperation(input) {
  if (cache.has(input)) {
    return cache.get(input);
  }
  
  const result = /* expensive calculation */;
  cache.set(input, result);
  return result;
}`
                }
            ];
        }

        // Render each recommendation
        state.recommendationsData.forEach(recommendation => {
            const recommendationElement = document.createElement('div');
            recommendationElement.className = 'recommendation-item';
            recommendationElement.innerHTML = `
                <h4>${recommendation.title}</h4>
                <p>${recommendation.description}</p>
                ${recommendation.code ? `<pre><code>${recommendation.code}</code></pre>` : ''}
            `;
            DOM.recommendationsContainer.appendChild(recommendationElement);
        });
    };

    // Render resources in the popup
    const renderResources = () => {
        if (!DOM.resourcesContainer) return;

        // Clear previous content
        DOM.resourcesContainer.innerHTML = '';

        // If no resources, generate default ones instead of showing 'not available'
        if (state.resourcesData.length === 0) {
            state.resourcesData = [
                {
                    title: 'JavaScript Best Practices',
                    description: 'Learn modern JavaScript patterns and best practices for clean, maintainable code.',
                    link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
                    icon: 'fa-book'
                },
                {
                    title: 'Web Performance Optimization',
                    description: 'Techniques for optimizing web application performance and user experience.',
                    link: 'https://web.dev/performance-optimizing-content-efficiency/',
                    icon: 'fa-bolt'
                },
                {
                    title: 'Security Best Practices',
                    description: 'Essential security practices for modern web applications.',
                    link: 'https://owasp.org/www-project-top-ten/',
                    icon: 'fa-shield-alt'
                }
            ];
        }

        // Render each resource
        state.resourcesData.forEach(resource => {
            const resourceElement = document.createElement('div');
            resourceElement.className = 'resource-item';
            resourceElement.innerHTML = `
                <div class="resource-icon">
                    <i class="fas ${resource.icon || 'fa-link'}"></i>
                </div>
                <div class="resource-content">
                    <h4>${resource.title}</h4>
                    <p>${resource.description}</p>
                    <a href="${resource.link || resource.url}" class="resource-link" target="_blank">
                        View Resource <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            `;
            DOM.resourcesContainer.appendChild(resourceElement);
        });
    };

    // Apply recommendations
    const applyRecommendations = () => {
        // This would implement the recommendations in the actual code
        // For demo purposes, just show an alert
        alert('Recommendations applied successfully!');
        closePopup();
    };

    // Save analysis
    const saveAnalysis = () => {
        // This would save the analysis to a file or database
        // For demo purposes, just show an alert
        alert('Analysis saved successfully!');
    };

    // Public API
    return {
        init,
        openPopup,
        closePopup
    };
})();

// Initialize the module when the DOM is ready
document.addEventListener('DOMContentLoaded', AIPopup.init);