'use strict';

// ========================================
// 2. MICROGRAPHIC HOVER HIGHLIGHTS
// ========================================

/**
 * Micrographic Hover Controller
 * Highlights target sections on hover
 */
const MicrographicController = {
    /**
     * Initialize hover highlights
     */
    init() {
        document.querySelectorAll('.micrographic-list a').forEach(link => {
            const targetId = link.getAttribute('href');
            
            if (targetId && targetId.startsWith('#')) {
                const targetEl = document.querySelector(targetId);
                
                if (targetEl) {
                    link.addEventListener('mouseenter', () => {
                        targetEl.classList.add('hover-highlight');
                    });
                    
                    link.addEventListener('mouseleave', () => {
                        targetEl.classList.remove('hover-highlight');
                    });
                }
            }
        });
    }
};


