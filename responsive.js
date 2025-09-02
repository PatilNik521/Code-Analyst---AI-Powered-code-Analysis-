/**
 * CodeGuardian - Responsive Design and Cross-Browser Compatibility Module
 * Handles responsive adjustments and ensures consistent experience across browsers
 */

const ResponsiveHandler = (() => {
    // Private variables
    const state = {
        currentBreakpoint: null,
        breakpoints: {
            xs: 0,    // Extra small devices
            sm: 576,  // Small devices
            md: 768,  // Medium devices
            lg: 992,  // Large devices
            xl: 1200, // Extra large devices
            xxl: 1400 // Extra extra large devices
        },
        isMobileMenuOpen: false,
        isCompatibilityWarningShown: false,
        browserInfo: null
    };

    // Cache DOM elements
    const DOM = {
        body: document.body,
        navbar: document.querySelector('.navbar'),
        navbarToggle: document.querySelector('.navbar-toggle'),
        contentArea: document.querySelector('.content-area'),
        mainContainer: document.querySelector('.main-container'),
        compatibilityBanner: document.querySelector('.compatibility-banner'),
        dismissCompatibilityBtn: document.querySelector('.dismiss-compatibility-btn'),
        sections: document.querySelectorAll('.section'),
        charts: document.querySelectorAll('.chart-container'),
        forms: document.querySelectorAll('form'),
        tables: document.querySelectorAll('table'),
        codeBlocks: document.querySelectorAll('pre code'),
        modals: document.querySelectorAll('.modal')
    };

    // Initialize event listeners
    const initEventListeners = () => {
        // Resize event listener
        window.addEventListener('resize', handleResize);

        // Mobile menu toggle
        if (DOM.navbarToggle) {
            DOM.navbarToggle.addEventListener('click', toggleMobileMenu);
        }

        // Dismiss compatibility warning
        if (DOM.dismissCompatibilityBtn) {
            DOM.dismissCompatibilityBtn.addEventListener('click', dismissCompatibilityWarning);
        }

        // Orientation change for mobile devices
        window.addEventListener('orientationchange', handleOrientationChange);

        // Add touch events for mobile
        addTouchSupport();
    };

    // Handle window resize
    const handleResize = () => {
        const width = window.innerWidth;
        let newBreakpoint = 'xs';

        // Determine current breakpoint
        if (width >= state.breakpoints.xxl) {
            newBreakpoint = 'xxl';
        } else if (width >= state.breakpoints.xl) {
            newBreakpoint = 'xl';
        } else if (width >= state.breakpoints.lg) {
            newBreakpoint = 'lg';
        } else if (width >= state.breakpoints.md) {
            newBreakpoint = 'md';
        } else if (width >= state.breakpoints.sm) {
            newBreakpoint = 'sm';
        }

        // Only update if breakpoint changed
        if (newBreakpoint !== state.currentBreakpoint) {
            state.currentBreakpoint = newBreakpoint;
            applyResponsiveAdjustments();
        }

        // Always resize charts regardless of breakpoint change
        resizeCharts();
    };

    // Handle orientation change on mobile devices
    const handleOrientationChange = () => {
        // Force a resize event after orientation change completes
        setTimeout(() => {
            handleResize();
            // Fix for iOS Safari issues with vh units after orientation change
            fixIOSViewportHeight();
        }, 200);
    };

    // Fix for iOS Safari viewport height issues
    const fixIOSViewportHeight = () => {
        // Set a custom CSS variable with the actual viewport height
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Toggle mobile menu
    const toggleMobileMenu = () => {
        state.isMobileMenuOpen = !state.isMobileMenuOpen;
        DOM.body.classList.toggle('mobile-menu-open', state.isMobileMenuOpen);
        DOM.navbar.classList.toggle('expanded', state.isMobileMenuOpen);
        DOM.navbarToggle.setAttribute('aria-expanded', state.isMobileMenuOpen);

        // Prevent body scrolling when menu is open on mobile
        if (state.isMobileMenuOpen && state.currentBreakpoint !== 'lg' && state.currentBreakpoint !== 'xl' && state.currentBreakpoint !== 'xxl') {
            DOM.body.style.overflow = 'hidden';
        } else {
            DOM.body.style.overflow = '';
        }
    };

    // Apply responsive adjustments based on current breakpoint
    const applyResponsiveAdjustments = () => {
        // Update body class with current breakpoint
        DOM.body.className = DOM.body.className.replace(/breakpoint-\w+/g, '');
        DOM.body.classList.add(`breakpoint-${state.currentBreakpoint}`);

        // Close mobile menu when switching to desktop
        if ((state.currentBreakpoint === 'lg' || state.currentBreakpoint === 'xl' || state.currentBreakpoint === 'xxl') && state.isMobileMenuOpen) {
            state.isMobileMenuOpen = false;
            DOM.body.classList.remove('mobile-menu-open');
            DOM.navbar.classList.remove('expanded');
            DOM.navbarToggle.setAttribute('aria-expanded', 'false');
            DOM.body.style.overflow = '';
        }

        // Adjust layout for different breakpoints
        adjustLayoutForBreakpoint();

        // Adjust font sizes for readability
        adjustFontSizes();

        // Adjust form elements for better mobile experience
        adjustFormElements();

        // Adjust tables for mobile view
        adjustTables();

        // Adjust code blocks for mobile view
        adjustCodeBlocks();
    };

    // Adjust layout based on current breakpoint
    const adjustLayoutForBreakpoint = () => {
        // Mobile layout (xs, sm)
        if (state.currentBreakpoint === 'xs' || state.currentBreakpoint === 'sm') {
            // Simplify UI for mobile
            document.documentElement.style.setProperty('--navbar-width', '0px');
            document.documentElement.style.setProperty('--content-padding', '10px');
            document.documentElement.style.setProperty('--card-gap', '10px');
            
            // Stack elements vertically on mobile
            DOM.sections.forEach(section => {
                const flexContainers = section.querySelectorAll('.flex-container');
                flexContainers.forEach(container => {
                    container.classList.add('flex-column');
                });
            });
        } 
        // Tablet layout (md)
        else if (state.currentBreakpoint === 'md') {
            document.documentElement.style.setProperty('--navbar-width', '60px');
            document.documentElement.style.setProperty('--content-padding', '15px');
            document.documentElement.style.setProperty('--card-gap', '15px');
            
            // Adjust flex containers for tablet
            DOM.sections.forEach(section => {
                const flexContainers = section.querySelectorAll('.flex-container');
                flexContainers.forEach(container => {
                    if (container.classList.contains('force-row')) {
                        container.classList.remove('flex-column');
                    } else {
                        // Decide based on number of children
                        const children = container.children.length;
                        if (children > 2) {
                            container.classList.add('flex-column');
                        } else {
                            container.classList.remove('flex-column');
                        }
                    }
                });
            });
        } 
        // Desktop layout (lg, xl, xxl)
        else {
            document.documentElement.style.setProperty('--navbar-width', '240px');
            document.documentElement.style.setProperty('--content-padding', '20px');
            document.documentElement.style.setProperty('--card-gap', '20px');
            
            // Restore horizontal layout on desktop
            DOM.sections.forEach(section => {
                const flexContainers = section.querySelectorAll('.flex-container');
                flexContainers.forEach(container => {
                    if (!container.classList.contains('force-column')) {
                        container.classList.remove('flex-column');
                    }
                });
            });
        }
    };

    // Adjust font sizes for different screen sizes
    const adjustFontSizes = () => {
        if (state.currentBreakpoint === 'xs') {
            document.documentElement.style.setProperty('--font-size-base', '14px');
            document.documentElement.style.setProperty('--font-size-lg', '16px');
            document.documentElement.style.setProperty('--font-size-xl', '18px');
            document.documentElement.style.setProperty('--font-size-xxl', '22px');
        } else if (state.currentBreakpoint === 'sm' || state.currentBreakpoint === 'md') {
            document.documentElement.style.setProperty('--font-size-base', '15px');
            document.documentElement.style.setProperty('--font-size-lg', '17px');
            document.documentElement.style.setProperty('--font-size-xl', '20px');
            document.documentElement.style.setProperty('--font-size-xxl', '24px');
        } else {
            document.documentElement.style.setProperty('--font-size-base', '16px');
            document.documentElement.style.setProperty('--font-size-lg', '18px');
            document.documentElement.style.setProperty('--font-size-xl', '22px');
            document.documentElement.style.setProperty('--font-size-xxl', '28px');
        }
    };

    // Adjust form elements for better mobile experience
    const adjustFormElements = () => {
        if (state.currentBreakpoint === 'xs' || state.currentBreakpoint === 'sm') {
            // Increase touch target size on mobile
            document.documentElement.style.setProperty('--input-height', '44px');
            document.documentElement.style.setProperty('--button-height', '44px');
            
            // Make form elements full width on mobile
            DOM.forms.forEach(form => {
                const formGroups = form.querySelectorAll('.form-group');
                formGroups.forEach(group => {
                    group.classList.add('full-width');
                });
            });
        } else {
            document.documentElement.style.setProperty('--input-height', '38px');
            document.documentElement.style.setProperty('--button-height', '38px');
            
            // Restore form layout on larger screens
            DOM.forms.forEach(form => {
                const formGroups = form.querySelectorAll('.form-group');
                formGroups.forEach(group => {
                    if (!group.classList.contains('force-full-width')) {
                        group.classList.remove('full-width');
                    }
                });
            });
        }
    };

    // Adjust tables for mobile view
    const adjustTables = () => {
        if (state.currentBreakpoint === 'xs' || state.currentBreakpoint === 'sm') {
            // Add responsive table wrapper
            DOM.tables.forEach(table => {
                if (!table.parentElement.classList.contains('table-responsive')) {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'table-responsive';
                    table.parentNode.insertBefore(wrapper, table);
                    wrapper.appendChild(table);
                }
            });
        }
    };

    // Adjust code blocks for mobile view
    const adjustCodeBlocks = () => {
        if (state.currentBreakpoint === 'xs' || state.currentBreakpoint === 'sm') {
            // Add horizontal scrolling for code blocks on mobile
            DOM.codeBlocks.forEach(codeBlock => {
                codeBlock.style.fontSize = '12px';
                if (!codeBlock.parentElement.classList.contains('code-responsive')) {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'code-responsive';
                    codeBlock.parentNode.insertBefore(wrapper, codeBlock);
                    wrapper.appendChild(codeBlock);
                }
            });
        } else {
            // Restore code block size on larger screens
            DOM.codeBlocks.forEach(codeBlock => {
                codeBlock.style.fontSize = '';
            });
        }
    };

    // Resize charts to fit container
    const resizeCharts = () => {
        if (window.CodeGuardian && window.CodeGuardian.resizeAllCharts) {
            window.CodeGuardian.resizeAllCharts();
        }
    };

    // Add touch support for mobile devices
    const addTouchSupport = () => {
        // Add touch-specific classes to body when touch is detected
        window.addEventListener('touchstart', function onFirstTouch() {
            DOM.body.classList.add('touch-device');
            // Remove event listener after first touch
            window.removeEventListener('touchstart', onFirstTouch);
        }, false);

        // Add swipe detection for mobile navigation
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        document.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);
        
        const handleSwipe = () => {
            const swipeThreshold = 100;
            const swipeDistance = touchEndX - touchStartX;
            
            // Only handle significant swipes
            if (Math.abs(swipeDistance) < swipeThreshold) return;
            
            // Only apply swipe navigation on mobile breakpoints
            if (state.currentBreakpoint === 'xs' || state.currentBreakpoint === 'sm' || state.currentBreakpoint === 'md') {
                if (swipeDistance > 0) {
                    // Swipe right - open menu
                    if (!state.isMobileMenuOpen) {
                        toggleMobileMenu();
                    }
                } else {
                    // Swipe left - close menu
                    if (state.isMobileMenuOpen) {
                        toggleMobileMenu();
                    }
                }
            }
        };
    };

    // Detect browser and check compatibility
    const detectBrowserAndCheckCompatibility = () => {
        const userAgent = navigator.userAgent;
        let browserName = 'Unknown';
        let browserVersion = 'Unknown';
        let isCompatible = true;
        
        // Detect browser name and version
        if (userAgent.indexOf('Chrome') > -1) {
            browserName = 'Chrome';
            browserVersion = userAgent.match(/Chrome\/(\d+\.\d+)/)[1];
        } else if (userAgent.indexOf('Firefox') > -1) {
            browserName = 'Firefox';
            browserVersion = userAgent.match(/Firefox\/(\d+\.\d+)/)[1];
        } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
            browserName = 'Safari';
            browserVersion = userAgent.match(/Version\/(\d+\.\d+)/)[1];
        } else if (userAgent.indexOf('Edge') > -1 || userAgent.indexOf('Edg') > -1) {
            browserName = 'Edge';
            browserVersion = userAgent.match(/Edge?\/(\d+\.\d+)/)[1];
        } else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) {
            browserName = 'Internet Explorer';
            isCompatible = false; // IE is not compatible
        }
        
        // Store browser info
        state.browserInfo = {
            name: browserName,
            version: browserVersion,
            isCompatible: isCompatible,
            userAgent: userAgent
        };
        
        // Check for compatibility issues
        if (!isCompatible) {
            showCompatibilityWarning();
        } else {
            // Check for older versions of supported browsers
            const versionNumber = parseFloat(browserVersion);
            if ((browserName === 'Chrome' && versionNumber < 60) ||
                (browserName === 'Firefox' && versionNumber < 60) ||
                (browserName === 'Safari' && versionNumber < 11) ||
                (browserName === 'Edge' && versionNumber < 16)) {
                showCompatibilityWarning(true);
            }
        }
        
        // Add browser info to body class for specific CSS adjustments
        DOM.body.classList.add(`browser-${browserName.toLowerCase()}`);
    };

    // Show compatibility warning
    const showCompatibilityWarning = (isOldVersion = false) => {
        if (state.isCompatibilityWarningShown || !DOM.compatibilityBanner) return;
        
        state.isCompatibilityWarningShown = true;
        
        let message = '';
        if (isOldVersion) {
            message = `You're using an older version of ${state.browserInfo.name}. Some features may not work correctly. Please update your browser for the best experience.`;
        } else {
            message = `Your browser (${state.browserInfo.name}) is not fully supported. Please use Chrome, Firefox, Safari, or Edge for the best experience.`;
        }
        
        const messageElement = DOM.compatibilityBanner.querySelector('.compatibility-message');
        if (messageElement) {
            messageElement.textContent = message;
        }
        
        DOM.compatibilityBanner.classList.remove('hidden');
    };

    // Dismiss compatibility warning
    const dismissCompatibilityWarning = () => {
        if (DOM.compatibilityBanner) {
            DOM.compatibilityBanner.classList.add('hidden');
        }
    };

    // Apply polyfills for older browsers
    const applyPolyfills = () => {
        // Polyfill for Element.matches
        if (!Element.prototype.matches) {
            Element.prototype.matches = 
                Element.prototype.msMatchesSelector || 
                Element.prototype.webkitMatchesSelector;
        }
        
        // Polyfill for Element.closest
        if (!Element.prototype.closest) {
            Element.prototype.closest = function(s) {
                let el = this;
                do {
                    if (el.matches(s)) return el;
                    el = el.parentElement || el.parentNode;
                } while (el !== null && el.nodeType === 1);
                return null;
            };
        }
        
        // Polyfill for NodeList.forEach
        if (window.NodeList && !NodeList.prototype.forEach) {
            NodeList.prototype.forEach = Array.prototype.forEach;
        }
    };

    // Initialize
    const init = () => {
        // Apply polyfills first
        applyPolyfills();
        
        // Detect browser and check compatibility
        detectBrowserAndCheckCompatibility();
        
        // Fix for iOS viewport height
        fixIOSViewportHeight();
        
        // Initialize event listeners
        initEventListeners();
        
        // Set initial breakpoint and apply responsive adjustments
        handleResize();
        
        // Add CSS for responsive features
        addResponsiveCSS();
    };

    // Add CSS for responsive features
    const addResponsiveCSS = () => {
        const style = document.createElement('style');
        style.textContent = `
            /* Responsive Table Styles */
            .table-responsive {
                width: 100%;
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
                margin-bottom: 1rem;
            }
            
            /* Responsive Code Block Styles */
            .code-responsive {
                width: 100%;
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
            }
            
            /* Mobile Menu Styles */
            .mobile-menu-open .navbar {
                transform: translateX(0);
                box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
            }
            
            .mobile-menu-open .content-area {
                transform: translateX(240px);
            }
            
            /* Compatibility Banner */
            .compatibility-banner {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background-color: var(--accent-red);
                color: white;
                padding: 10px 20px;
                z-index: 9999;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .compatibility-banner.hidden {
                display: none;
            }
            
            .dismiss-compatibility-btn {
                background: transparent;
                border: 1px solid white;
                color: white;
                padding: 5px 10px;
                border-radius: var(--radius-sm);
                cursor: pointer;
            }
            
            /* Touch Device Specific Styles */
            .touch-device .button,
            .touch-device .nav-item,
            .touch-device .form-control {
                -webkit-tap-highlight-color: transparent;
            }
            
            /* Breakpoint Specific Styles */
            /* XS - Extra Small Devices */
            @media (max-width: 575.98px) {
                .breakpoint-xs .navbar {
                    position: fixed;
                    left: -240px;
                    transition: transform 0.3s ease;
                }
                
                .breakpoint-xs .navbar-toggle {
                    display: flex;
                }
                
                .breakpoint-xs .content-area {
                    margin-left: 0;
                    transition: transform 0.3s ease;
                }
                
                .breakpoint-xs .card {
                    padding: 15px;
                }
                
                .breakpoint-xs .section-title {
                    font-size: var(--font-size-lg);
                }
                
                .breakpoint-xs .hide-xs {
                    display: none !important;
                }
            }
            
            /* SM - Small Devices */
            @media (min-width: 576px) and (max-width: 767.98px) {
                .breakpoint-sm .navbar {
                    position: fixed;
                    left: -240px;
                    transition: transform 0.3s ease;
                }
                
                .breakpoint-sm .navbar-toggle {
                    display: flex;
                }
                
                .breakpoint-sm .content-area {
                    margin-left: 0;
                    transition: transform 0.3s ease;
                }
                
                .breakpoint-sm .hide-sm {
                    display: none !important;
                }
            }
            
            /* MD - Medium Devices */
            @media (min-width: 768px) and (max-width: 991.98px) {
                .breakpoint-md .navbar {
                    width: 60px;
                }
                
                .breakpoint-md .navbar .nav-text {
                    display: none;
                }
                
                .breakpoint-md .navbar .nav-icon {
                    margin-right: 0;
                }
                
                .breakpoint-md .content-area {
                    margin-left: 60px;
                }
                
                .breakpoint-md .hide-md {
                    display: none !important;
                }
            }
            
            /* LG, XL, XXL - Large Devices and Up */
            @media (min-width: 992px) {
                .breakpoint-lg .navbar-toggle,
                .breakpoint-xl .navbar-toggle,
                .breakpoint-xxl .navbar-toggle {
                    display: none;
                }
                
                .breakpoint-lg .hide-lg,
                .breakpoint-xl .hide-xl,
                .breakpoint-xxl .hide-xxl {
                    display: none !important;
                }
            }
            
            /* Print Styles */
            @media print {
                .navbar,
                .navbar-toggle,
                .section-tabs,
                .action-buttons,
                .settings-section,
                .compatibility-banner {
                    display: none !important;
                }
                
                .content-area {
                    margin-left: 0 !important;
                    padding: 0 !important;
                }
                
                .card {
                    break-inside: avoid;
                    border: 1px solid #ddd !important;
                    box-shadow: none !important;
                }
                
                body {
                    background-color: white !important;
                    color: black !important;
                }
                
                a {
                    text-decoration: underline;
                    color: #000 !important;
                }
                
                .chart-container canvas {
                    max-width: 100% !important;
                    height: auto !important;
                }
            }
        `;
        document.head.appendChild(style);
    };

    // Return public methods
    return {
        init,
        handleResize,
        getBrowserInfo: () => state.browserInfo,
        getCurrentBreakpoint: () => state.currentBreakpoint
    };
})();

// Initialize the Responsive Handler when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    ResponsiveHandler.init();
});