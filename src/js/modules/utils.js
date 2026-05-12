'use strict';

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Throttle function - limits execution to once per delay period
 * @param {Function} fn - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(fn, delay) {
    let lastCall = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            fn.apply(this, args);
        }
    };
}

/**
 * Safe JSON parse with fallback
 * @param {string} str - JSON string to parse
 * @param {*} fallback - Fallback value if parsing fails
 * @returns {*} Parsed object or fallback
 */
function safeJSONParse(str, fallback = null) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return fallback;
    }
}

