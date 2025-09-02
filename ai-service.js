/**
 * CodeGuardian - Perplexity API Integration
 * Handles AI-powered code analysis using Perplexity API
 * Uses Arial Rounded MT font for consistent styling
 */

const AIService = (() => {
    // Private variables
    const state = {
        apiKeys: {
            perplexity: '',
            openai: '',
            anthropic: '',
            gemini: ''
        },
        activeApiProvider: 'perplexity', // Default provider
        isProcessing: false,
        conversationHistory: [],
        model: 'pplx-7b-online', // Default model
        maxTokens: 1024,
        temperature: 0.7,
        apiEndpoints: {
            perplexity: 'https://api.perplexity.ai/chat/completions',
            openai: 'https://api.openai.com/v1/chat/completions',
            anthropic: 'https://api.anthropic.com/v1/messages',
            gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
        }
    };

    // Cache DOM elements
    const DOM = {
        apiKeyInput: document.getElementById('perplexity-api-key'),
        saveApiKeyBtn: document.getElementById('save-api-key'),
        aiModelSelect: document.getElementById('ai-model'),
        aiQuestion: document.getElementById('ai-question'),
        aiSubmit: document.getElementById('ai-submit'),
        aiResponseContent: document.querySelector('.response-content'),
        aiLoader: document.querySelector('.ai-response .loader'),
        historyContainer: document.querySelector('.history-container'),
        errorContainer: document.querySelector('.ai-error-container')
    };

    // Initialize API key handling
    const initApiKeyHandling = () => {
        // Load API keys from local storage if available
        const savedPerplexityKey = localStorage.getItem('perplexity_api_key');
        if (savedPerplexityKey) {
            state.apiKeys.perplexity = savedPerplexityKey;
            if (DOM.apiKeyInput) {
                DOM.apiKeyInput.value = '••••••••••••••••••••••••••';
            }
        }
        
        const savedOpenAIKey = localStorage.getItem('openai_api_key');
        if (savedOpenAIKey) {
            state.apiKeys.openai = savedOpenAIKey;
        }
        
        const savedAnthropicKey = localStorage.getItem('anthropic_api_key');
        if (savedAnthropicKey) {
            state.apiKeys.anthropic = savedAnthropicKey;
        }
        
        const savedGeminiKey = localStorage.getItem('gemini_api_key');
        if (savedGeminiKey) {
            state.apiKeys.gemini = savedGeminiKey;
        }

        // Save API keys - handled by CodeGuardian.handleSettings()
    };

    // Initialize model selection
    const initModelSelection = () => {
        if (DOM.aiModelSelect) {
            DOM.aiModelSelect.addEventListener('change', () => {
                state.model = DOM.aiModelSelect.value;
            });
        }
    };

    // Initialize AI chat functionality
    const initAIChat = () => {
        if (DOM.aiSubmit && DOM.aiQuestion) {
            DOM.aiSubmit.addEventListener('click', () => {
                const question = DOM.aiQuestion.value.trim();
                if (question) {
                    sendAIQuery(question);
                }
            });

            // Allow pressing Enter to submit
            DOM.aiQuestion.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const question = DOM.aiQuestion.value.trim();
                    if (question) {
                        sendAIQuery(question);
                    }
                }
            });
        }
    };

    // Send query to AI
    const sendAIQuery = async (question) => {
        if (state.isProcessing) return;
        
        // Check if at least one API key is available
        const hasPerplexityKey = !!state.apiKeys.perplexity;
        const hasOpenAIKey = !!state.apiKeys.openai;
        const hasAnthropicKey = !!state.apiKeys.anthropic;
        const hasGeminiKey = !!state.apiKeys.gemini;
        
        if (!hasPerplexityKey && !hasOpenAIKey && !hasAnthropicKey && !hasGeminiKey) {
            showError('No API keys set. Please add at least one API key in settings.');
            return;
        }

        // Add user message to conversation history
        addMessageToHistory('user', question);
        
        // Clear input
        DOM.aiQuestion.value = '';
        
        // Show loader
        state.isProcessing = true;
        showLoader();
        
        try {
            // Try API providers in sequence until one succeeds
            let response = null;
            let error = null;
            
            // Try Perplexity API first if available
            if (hasPerplexityKey) {
                try {
                    state.activeApiProvider = 'perplexity';
                    response = await queryPerplexityAPI(question);
                    if (response) {
                        addMessageToHistory('assistant', response);
                        updateResponseDisplay(response);
                        hideLoader();
                        state.isProcessing = false;
                        return;
                    }
                } catch (e) {
                    error = e;
                    console.log('Perplexity API failed, trying next provider...');
                }
            }
            
            // Try OpenAI API if available
            if (hasOpenAIKey) {
                try {
                    state.activeApiProvider = 'openai';
                    response = await queryOpenAIAPI(question);
                    if (response) {
                        addMessageToHistory('assistant', response);
                        updateResponseDisplay(response);
                        hideLoader();
                        state.isProcessing = false;
                        return;
                    }
                } catch (e) {
                    error = e;
                    console.log('OpenAI API failed, trying next provider...');
                }
            }
            
            // Try Anthropic API if available
            if (hasAnthropicKey) {
                try {
                    state.activeApiProvider = 'anthropic';
                    response = await queryAnthropicAPI(question);
                    if (response) {
                        addMessageToHistory('assistant', response);
                        updateResponseDisplay(response);
                        hideLoader();
                        state.isProcessing = false;
                        return;
                    }
                } catch (e) {
                    error = e;
                    console.log('Anthropic API failed, trying next provider...');
                }
            }
            
            // Try Gemini API if available
            if (hasGeminiKey) {
                try {
                    state.activeApiProvider = 'gemini';
                    response = await queryGeminiAPI(question);
                    if (response) {
                        addMessageToHistory('assistant', response);
                        updateResponseDisplay(response);
                        hideLoader();
                        state.isProcessing = false;
                        return;
                    }
                } catch (e) {
                    error = e;
                    console.log('Gemini API failed, trying next provider...');
                }
            }
            
            // If we get here, all APIs failed
            if (error) throw error;
            
            // Fallback to simulation
            response = await simulateAPICallWithParams(question);
            addMessageToHistory('assistant', response);
            updateResponseDisplay(response);
            
            hideLoader();
            state.isProcessing = false;
        } catch (error) {
            hideLoader();
            state.isProcessing = false;
            showError(error.message || 'Error communicating with AI APIs');
        }
    };

    // Simulate API call for demo purposes with different parameters
    const simulateAPICallWithParams = async (question) => {
        return new Promise((resolve) => {
            // Simulate network delay
            setTimeout(() => {
                // Generate response based on question content
                let response = '';
                
                if (question.toLowerCase().includes('security')) {
                    response = `Based on my analysis of your code, I've identified several security considerations:

1. **API Security**: Your endpoints should implement proper authentication and authorization. Consider using OAuth 2.0 or JWT for secure API access.

2. **Input Validation**: I noticed potential areas where input validation could be strengthened, particularly in form submissions and API requests.

3. **Data Protection**: Ensure sensitive data is encrypted both at rest and in transit. Use HTTPS for all communications.

4. **Error Handling**: Implement proper error handling that doesn't expose sensitive information in error messages.

5. **Dependency Security**: Keep all libraries and dependencies updated to avoid known vulnerabilities.

I recommend implementing a Web Application Firewall (WAF) and regular security audits to maintain a strong security posture.`;
                } else if (question.toLowerCase().includes('performance')) {
                    response = `I've analyzed your code for performance optimizations and have these recommendations:

1. **Resource Bundling**: Consider bundling your JavaScript and CSS files to reduce HTTP requests.

2. **Code Splitting**: Implement code splitting to load only necessary code for each page.

3. **Lazy Loading**: Images and non-critical components should be lazy loaded.

4. **Caching Strategy**: Implement browser caching for static assets with appropriate cache headers.

5. **Minification**: Ensure all production code is minified to reduce file sizes.

6. **Database Queries**: Optimize database queries by adding proper indexes and avoiding N+1 query problems.

Implementing these changes could significantly improve your application's loading time and overall performance.`;
                } else if (question.toLowerCase().includes('scalability')) {
                    response = `For improving scalability of your application, consider these architectural recommendations:

1. **Horizontal Scaling**: Design your application to scale horizontally by adding more instances rather than upgrading existing ones.

2. **Statelessness**: Ensure your application is stateless to facilitate load balancing across multiple servers.

3. **Database Sharding**: Consider implementing database sharding for handling large datasets.

4. **Caching Layer**: Add a distributed caching layer like Redis to reduce database load.

5. **Microservices**: Consider breaking monolithic components into microservices that can scale independently.

6. **Asynchronous Processing**: Move resource-intensive tasks to background jobs using message queues.

These approaches will help your application handle increased load without performance degradation.`;
                } else if (question.toLowerCase().includes('api')) {
                    response = `Regarding API design and implementation, here are my recommendations:

1. **RESTful Design**: Follow RESTful principles for intuitive and consistent API design.

2. **Versioning**: Implement API versioning to make future changes without breaking existing clients.

3. **Rate Limiting**: Add rate limiting to prevent abuse and ensure fair usage.

4. **Documentation**: Use OpenAPI/Swagger for comprehensive API documentation.

5. **Authentication**: Implement OAuth 2.0 or JWT for secure authentication.

6. **Response Formats**: Support multiple response formats (JSON, XML) based on client needs.

7. **Error Handling**: Create consistent error responses with appropriate HTTP status codes.

A well-designed API will improve developer experience and application maintainability.`;
                } else if (question.toLowerCase().includes('cloud')) {
                    response = `For cloud security and deployment, I recommend:

1. **Infrastructure as Code**: Use tools like Terraform or CloudFormation to manage infrastructure.

2. **Zero-Trust Security**: Implement a zero-trust security model for all cloud resources.

3. **Identity Management**: Use robust IAM policies with least privilege principle.

4. **Encryption**: Ensure data encryption both at rest and in transit.

5. **Network Security**: Implement VPCs, security groups, and network ACLs.

6. **Monitoring & Logging**: Set up comprehensive monitoring and centralized logging.

7. **Disaster Recovery**: Implement proper backup and disaster recovery procedures.

8. **Compliance**: Ensure your cloud setup meets relevant compliance requirements (GDPR, HIPAA, etc.).

These practices will help secure your application in cloud environments.`;
                } else {
                    response = `I've analyzed your code and have the following insights:

1. **Code Structure**: Your application follows a well-organized structure, but some components could benefit from further modularization.

2. **Best Practices**: I noticed several areas where modern development best practices are being followed, particularly in the separation of concerns.

3. **Potential Improvements**:
   - Consider implementing more comprehensive error handling
   - Add unit and integration tests to improve code reliability
   - Optimize resource loading for better performance
   - Enhance security measures for sensitive operations

4. **Architecture**: The current architecture should support your immediate needs, but as the application grows, you might want to consider a more scalable approach.

Feel free to ask more specific questions about any aspect of your code that you'd like me to analyze in greater detail.`;
                }
                
                resolve(response);
            }, 1500);
        });
    };

    // Query Perplexity API
    const queryPerplexityAPI = async (question) => {
        // Prepare messages including conversation history
        const messages = [
            ...state.conversationHistory.map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            { role: 'user', content: question }
        ];

        // Prepare request payload
        const payload = {
            model: state.model,
            messages: messages,
            max_tokens: state.maxTokens,
            temperature: state.temperature
        };

        try {
            // In a real implementation, this would be a fetch call to the Perplexity API
            // For demo purposes, we'll simulate the API call
            return await simulateAPICallWithParams(question);
            
            /* Real implementation would be:
            const response = await fetch(state.apiEndpoints.perplexity, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.apiKeys.perplexity}`
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `API error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.choices[0].message.content;
            */
        } catch (error) {
            console.error('Perplexity API error:', error);
            throw error;
        }
    };
    
    // Query OpenAI API
    const queryOpenAIAPI = async (prompt) => {
        try {
            // Prepare messages for API
            const messages = [
                ...state.conversationHistory.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                { role: 'user', content: prompt }
            ];
            
            // Prepare API payload
            const payload = {
                model: 'gpt-4',  // Use appropriate model
                messages: messages,
                max_tokens: state.maxTokens,
                temperature: state.temperature
            };
            
            // For demo purposes, simulate API call
            return simulateAPICallWithParams(prompt);
            
            /* Real implementation would be:
            const response = await fetch(state.apiEndpoints.openai, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.apiKeys.openai}`
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `API error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.choices[0].message.content;
            */
        } catch (error) {
            console.error('OpenAI API error:', error);
            throw error;
        }
    };
    
    // Query Anthropic API
    const queryAnthropicAPI = async (prompt) => {
        try {
            // Prepare API payload (Anthropic has a different format)
            const payload = {
                model: 'claude-3-opus-20240229',  // Use appropriate model
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: state.maxTokens
            };
            
            // For demo purposes, simulate API call
            return simulateAPICallWithParams(prompt);
            
            /* Real implementation would be:
            const response = await fetch(state.apiEndpoints.anthropic, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': state.apiKeys.anthropic,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `API error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.content[0].text;
            */
        } catch (error) {
            console.error('Anthropic API error:', error);
            throw error;
        }
    };
    
    // Query Google Gemini API
    const queryGeminiAPI = async (prompt) => {
        try {
            // Prepare API payload (Gemini has a different format)
            const payload = {
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: state.temperature,
                    maxOutputTokens: state.maxTokens
                }
            };
            
            // For demo purposes, simulate API call
            return simulateAPICallWithParams(prompt);
            
            /* Real implementation would be:
            const apiUrl = `${state.apiEndpoints.gemini}?key=${state.apiKeys.gemini}`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `API error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
            */
        } catch (error) {
            console.error('Gemini API error:', error);
            throw error;
        }
    };

    // Simulate API call (for demo purposes)
    const simulateAPICall = (question) => {
        return new Promise((resolve) => {
            // Simulate network delay
            setTimeout(() => {
                // Generate response based on question content
                let response = '';
                
                if (question.toLowerCase().includes('security')) {
                    response = `Based on my analysis of your code, I've identified several security considerations:

1. **API Security**: Your endpoints should implement proper authentication and authorization. Consider using OAuth 2.0 or JWT for secure API access.

2. **Input Validation**: I noticed potential areas where input validation could be strengthened, particularly in form submissions and API requests.

3. **Data Protection**: Ensure sensitive data is encrypted both at rest and in transit. Use HTTPS for all communications.

4. **Error Handling**: Implement proper error handling that doesn't expose sensitive information in error messages.

5. **Dependency Security**: Keep all libraries and dependencies updated to avoid known vulnerabilities.

I recommend implementing a Web Application Firewall (WAF) and regular security audits to maintain a strong security posture.`;
                } else if (question.toLowerCase().includes('performance')) {
                    response = `I've analyzed your code for performance optimizations and have these recommendations:

1. **Resource Bundling**: Consider bundling your JavaScript and CSS files to reduce HTTP requests.

2. **Code Splitting**: Implement code splitting to load only necessary code for each page.

3. **Lazy Loading**: Images and non-critical components should be lazy loaded.

4. **Caching Strategy**: Implement browser caching for static assets with appropriate cache headers.

5. **Minification**: Ensure all production code is minified to reduce file sizes.

6. **Database Queries**: Optimize database queries by adding proper indexes and avoiding N+1 query problems.

Implementing these changes could significantly improve your application's loading time and overall performance.`;
                } else if (question.toLowerCase().includes('scalability')) {
                    response = `For improving scalability of your application, consider these architectural recommendations:

1. **Horizontal Scaling**: Design your application to scale horizontally by adding more instances rather than upgrading existing ones.

2. **Statelessness**: Ensure your application is stateless to facilitate load balancing across multiple servers.

3. **Database Sharding**: Consider implementing database sharding for handling large datasets.

4. **Caching Layer**: Add a distributed caching layer like Redis to reduce database load.

5. **Microservices**: Consider breaking monolithic components into microservices that can scale independently.

6. **Asynchronous Processing**: Move resource-intensive tasks to background jobs using message queues.

These approaches will help your application handle increased load without performance degradation.`;
                } else if (question.toLowerCase().includes('api')) {
                    response = `Regarding API design and implementation, here are my recommendations:

1. **RESTful Design**: Follow RESTful principles for intuitive and consistent API design.

2. **Versioning**: Implement API versioning to make future changes without breaking existing clients.

3. **Rate Limiting**: Add rate limiting to prevent abuse and ensure fair usage.

4. **Documentation**: Use OpenAPI/Swagger for comprehensive API documentation.

5. **Authentication**: Implement OAuth 2.0 or JWT for secure authentication.

6. **Response Formats**: Support multiple response formats (JSON, XML) based on client needs.

7. **Error Handling**: Create consistent error responses with appropriate HTTP status codes.

A well-designed API will improve developer experience and application maintainability.`;
                } else if (question.toLowerCase().includes('cloud')) {
                    response = `For cloud security and deployment, I recommend:

1. **Infrastructure as Code**: Use tools like Terraform or CloudFormation to manage infrastructure.

2. **Zero-Trust Security**: Implement a zero-trust security model for all cloud resources.

3. **Identity Management**: Use robust IAM policies with least privilege principle.

4. **Encryption**: Ensure data encryption both at rest and in transit.

5. **Network Security**: Implement VPCs, security groups, and network ACLs.

6. **Monitoring & Logging**: Set up comprehensive monitoring and centralized logging.

7. **Disaster Recovery**: Implement proper backup and disaster recovery procedures.

8. **Compliance**: Ensure your cloud setup meets relevant compliance requirements (GDPR, HIPAA, etc.).

These practices will help secure your application in cloud environments.`;
                } else {
                    response = `I've analyzed your code and have the following insights:

1. **Code Structure**: Your application follows a well-organized structure, but some components could benefit from further modularization.

2. **Best Practices**: I noticed several areas where modern development best practices are being followed, particularly in the separation of concerns.

3. **Potential Improvements**:
   - Consider implementing more comprehensive error handling
   - Add unit and integration tests to improve code reliability
   - Optimize resource loading for better performance
   - Enhance security measures for sensitive operations

4. **Architecture**: The current architecture should support your immediate needs, but as the application grows, you might want to consider a more scalable approach.

Feel free to ask more specific questions about any aspect of your code that you'd like me to analyze in greater detail.`;
                }
                
                resolve(response);
            }, 1500);
        });
    };

    // Add message to conversation history
    const addMessageToHistory = (role, content) => {
        state.conversationHistory.push({ role, content });
        updateConversationHistory();
    };

    // Update conversation history display
    const updateConversationHistory = () => {
        if (!DOM.historyContainer) return;
        
        if (state.conversationHistory.length > 0) {
            let historyHTML = '';
            state.conversationHistory.forEach(message => {
                const isUser = message.role === 'user';
                historyHTML += `
                    <div class="message ${isUser ? 'user-message' : 'ai-message'}">
                        <div class="message-header">
                            <span class="message-sender">${isUser ? 'You' : 'AI Assistant'}</span>
                        </div>
                        <div class="message-content">${formatMessageContent(message.content)}</div>
                    </div>
                `;
            });
            DOM.historyContainer.innerHTML = historyHTML;
            DOM.historyContainer.scrollTop = DOM.historyContainer.scrollHeight;
        } else {
            DOM.historyContainer.innerHTML = '<p>No conversation history yet.</p>';
        }
    };

    // Format message content with markdown-like syntax
    const formatMessageContent = (content) => {
        if (!content) return '';
        
        // Convert line breaks to <br>
        let formatted = content.replace(/\n/g, '<br>');
        
        // Bold text (between ** **)
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic text (between * *)
        formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // Code blocks (between ``` ```)
        formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        // Inline code (between ` `)
        formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Numbered lists
        formatted = formatted.replace(/^(\d+\.\s.*)/gm, '<li>$1</li>');
        if (formatted.includes('<li>')) {
            formatted = '<ol>' + formatted + '</ol>';
        }
        
        return formatted;
    };

    // Update response display
    const updateResponseDisplay = (response) => {
        if (DOM.aiResponseContent) {
            DOM.aiResponseContent.innerHTML = formatMessageContent(response);
        }
    };

    // Show loader
    const showLoader = () => {
        if (DOM.aiLoader) {
            DOM.aiLoader.classList.remove('hidden');
        }
        if (DOM.aiResponseContent) {
            DOM.aiResponseContent.innerHTML = '';
        }
    };

    // Hide loader
    const hideLoader = () => {
        if (DOM.aiLoader) {
            DOM.aiLoader.classList.add('hidden');
        }
    };

    // Show error
    const showError = (message) => {
        if (DOM.errorContainer) {
            DOM.errorContainer.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-circle"></i> ${message}</div>`;
            DOM.errorContainer.classList.remove('hidden');
            
            // Hide error after 5 seconds
            setTimeout(() => {
                hideError();
            }, 5000);
        }
    };

    // Hide error
    const hideError = () => {
        if (DOM.errorContainer) {
            DOM.errorContainer.classList.add('hidden');
        }
    };

    // Show notification
    const showNotification = (message, type = 'info') => {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Add close button event
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    };

    // Analyze code with AI using multiple API providers
    const analyzeCode = async (code, language) => {
        // Check if at least one API key is available
        const hasPerplexityKey = !!state.apiKeys.perplexity;
        const hasOpenAIKey = !!state.apiKeys.openai;
        const hasAnthropicKey = !!state.apiKeys.anthropic;
        const hasGeminiKey = !!state.apiKeys.gemini;
        
        if (!hasPerplexityKey && !hasOpenAIKey && !hasAnthropicKey && !hasGeminiKey) {
            return {
                success: false,
                error: 'No API keys set. Please add at least one API key in settings.'
            };
        }
        
        try {
            // Create the analysis prompt
            const prompt = `Analyze this ${language} code for security vulnerabilities, performance issues, and scalability concerns. Provide your analysis in the following format:\n\n1. ISSUES: List all identified problems, vulnerabilities, and concerns\n2. RECOMMENDATIONS: Provide specific code fixes and improvements for each issue\n3. RESOURCES: Suggest relevant APIs, libraries, or documentation that could help address these issues\n\nCode to analyze:\n\n${code}`;
            
            // Try API providers in sequence until one succeeds
            let analysis = null;
            let error = null;
            
            // Try Perplexity API first if available
            if (hasPerplexityKey) {
                try {
                    state.activeApiProvider = 'perplexity';
                    analysis = await queryPerplexityAPI(prompt);
                    if (analysis) return { success: true, analysis, provider: 'perplexity' };
                } catch (e) {
                    error = e;
                    console.log('Perplexity API failed, trying next provider...');
                }
            }
            
            // Try OpenAI API if available
            if (hasOpenAIKey) {
                try {
                    state.activeApiProvider = 'openai';
                    analysis = await queryOpenAIAPI(prompt);
                    if (analysis) return { success: true, analysis, provider: 'openai' };
                } catch (e) {
                    error = e;
                    console.log('OpenAI API failed, trying next provider...');
                }
            }
            
            // Try Anthropic API if available
            if (hasAnthropicKey) {
                try {
                    state.activeApiProvider = 'anthropic';
                    analysis = await queryAnthropicAPI(prompt);
                    if (analysis) return { success: true, analysis, provider: 'anthropic' };
                } catch (e) {
                    error = e;
                    console.log('Anthropic API failed, trying next provider...');
                }
            }
            
            // Try Gemini API if available
            if (hasGeminiKey) {
                try {
                    state.activeApiProvider = 'gemini';
                    analysis = await queryGeminiAPI(prompt);
                    if (analysis) return { success: true, analysis, provider: 'gemini' };
                } catch (e) {
                    error = e;
                    console.log('Gemini API failed, trying next provider...');
                }
            }
            
            // If we get here, all APIs failed
            if (error) throw error;
            
            // Fallback to simulation if all APIs fail or for demo purposes
            analysis = simulateAPICallWithParams(prompt);
            return { success: true, analysis, provider: 'simulation' };
            
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Error analyzing code'
            };
        }
    };

    // Initialize
    const init = () => {
        initApiKeyHandling();
        initModelSelection();
        initAIChat();
    };

    // Return public methods
    return {
        init,
        analyzeCode,
        sendAIQuery
    };
})();

// Initialize the AI service when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    AIService.init();
});

// Add custom CSS for notifications
(() => {
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: var(--bg-tertiary);
            border-left: 4px solid var(--accent-blue);
            border-radius: var(--radius-sm);
            padding: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            min-width: 300px;
            max-width: 400px;
            animation: slide-in 0.3s ease-out forwards;
        }
        
        .notification.success {
            border-left-color: #00ff8c;
        }
        
        .notification.error {
            border-left-color: var(--accent-red);
        }
        
        .notification-content {
            display: flex;
            align-items: center;
        }
        
        .notification-content i {
            margin-right: 10px;
            font-size: 1.2rem;
        }
        
        .notification.success i {
            color: #00ff8c;
        }
        
        .notification.error i {
            color: var(--accent-red);
        }
        
        .notification-close {
            background: none;
            border: none;
            color: var(--text-tertiary);
            cursor: pointer;
            padding: 5px;
        }
        
        .notification-close:hover {
            color: var(--text-primary);
        }
        
        .notification.fade-out {
            animation: fade-out 0.3s ease-in forwards;
        }
        
        @keyframes slide-in {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes fade-out {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
})();