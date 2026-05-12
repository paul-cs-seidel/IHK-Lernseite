'use strict';

// ========================================
// COLLAPSIBLE SECTIONS - Auto-open on anchor click
// ========================================

/**
 * SectionController - Opens collapsed sections when navigating via anchor links
 */
const SectionController = {
    init() {
        // Handle initial page load with hash
        if (window.location.hash) {
            this.openSectionForTarget(window.location.hash.substring(1));
        }

        // Handle all anchor clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;
            
            const targetId = link.getAttribute('href').substring(1);
            if (targetId) {
                this.openSectionForTarget(targetId);
            }
        });

        // Handle browser back/forward
        window.addEventListener('hashchange', () => {
            if (window.location.hash) {
                this.openSectionForTarget(window.location.hash.substring(1));
            }
        });
    },

    /**
     * Find and open the section containing the target element
     * @param {string} targetId - The ID of the target element
     */
    openSectionForTarget(targetId) {
        const targetElement = document.getElementById(targetId);
        if (!targetElement) return;

        // Find all parent details elements
        let parent = targetElement.parentElement;
        while (parent) {
            if (parent.tagName === 'DETAILS' && parent.classList.contains('section-collapsible')) {
                parent.open = true;
            }
            parent = parent.parentElement;
        }

        // Small delay to allow section to open, then scroll
        setTimeout(() => {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
};

