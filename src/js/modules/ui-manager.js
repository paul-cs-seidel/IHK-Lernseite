'use strict';

// ========================================
// UI MANAGER - Controls exclusive element opening
// ========================================

/**
 * UIManager - Ensures only one UI element is open at a time
 */
const UIManager = {
    /**
     * Close all UI overlays (navbar, search, timer, calculator)
     * @param {string} except - Element to keep open ('navbar', 'search', 'timer', 'calc')
     */
    closeAll(except = '') {
        // Close navbar menu
        if (except !== 'navbar') {
            const burgerToggle = document.getElementById('burger-toggle');
            const blurOverlay = document.querySelector('.blur-overlay');
            if (burgerToggle?.checked) {
                burgerToggle.checked = false;
                blurOverlay?.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
        
        // Close search
        if (except !== 'search') {
            const searchBox = document.getElementById('search-box');
            const searchResults = document.getElementById('search-results');
            const searchInput = document.getElementById('search-input');
            searchBox?.classList.remove('active');
            searchResults?.classList.remove('active');
            if (searchInput) searchInput.value = '';
            if (searchResults) searchResults.innerHTML = '';
        }
        
        // Close timer (but keep running)
        if (except !== 'timer') {
            document.getElementById('timer-box')?.classList.add('hidden');
            document.getElementById('open-timer-btn')?.classList.remove('hidden');
        }
        
        // Close calculator
        if (except !== 'calc') {
            document.getElementById('calc-box')?.classList.add('hidden');
            document.getElementById('open-calc-btn')?.classList.remove('hidden');
        }
    }
};

