'use strict';

// ========================================
// 1. NAVIGATION & BURGER MENU
// ========================================

/**
 * Burger Menu Controller
 * Handles menu toggle and outside click
 */
const NavigationController = {
    burgerToggle: null,
    blurOverlay: null,
    isTouch: false,

    /**
     * Initialize navigation
     */
    init() {
        this.burgerToggle = document.getElementById('burger-toggle');
        this.blurOverlay = document.getElementById('blur-overlay');

        if (!this.burgerToggle || !this.blurOverlay) return;

        // Detect touch device
        this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.activeSubmenu = null;
        this.submenusMovedToBody = false;
        this.originalSubmenuParents = new Map(); // Store original parents

        // Store all submenu parent references first
        this.storeSubmenuParents();
        
        this.handleSubmenuPlacement();
        this.bindEvents();
        
        // Handle resize to move submenus back if needed
        window.addEventListener('resize', () => this.handleSubmenuPlacement());
    },

    /**
     * Store references to all submenu parents for later use
     */
    storeSubmenuParents() {
        document.querySelectorAll('.nav-item').forEach(navItem => {
            const submenu = navItem.querySelector('.nav-submenu');
            if (submenu) {
                const href = navItem.querySelector('.nav-bar-links')?.getAttribute('href') || '';
                submenu.dataset.navItemId = href;
                this.originalSubmenuParents.set(href, navItem);
            }
        });
    },

    /**
     * Handle submenu placement based on viewport size
     * Desktop: Move to body (to avoid overflow clipping)
     * Mobile: Keep in nav-item (for accordion behavior)
     */
    handleSubmenuPlacement() {
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile && this.submenusMovedToBody) {
            // Move submenus back to their original parents
            this.moveSubmenusBackToNavItems();
        } else if (!isMobile && !this.submenusMovedToBody) {
            // Move submenus to body
            this.moveSubmenusToBody();
        }
    },

    /**
     * Move all submenus to body to avoid overflow clipping (Desktop only)
     */
    moveSubmenusToBody() {
        document.querySelectorAll('.nav-submenu[data-nav-item-id]').forEach(submenu => {
            // Move to body
            document.body.appendChild(submenu);
        });
        this.submenusMovedToBody = true;
    },

    /**
     * Move submenus back to their original nav-items (for Mobile)
     */
    moveSubmenusBackToNavItems() {
        document.querySelectorAll('.nav-submenu[data-nav-item-id]').forEach(submenu => {
            const href = submenu.dataset.navItemId;
            const originalParent = this.originalSubmenuParents.get(href);
            if (originalParent) {
                originalParent.appendChild(submenu);
            }
        });
        this.submenusMovedToBody = false;
    },

    /**
     * Get submenu for a nav item
     */
    getSubmenuForNavItem(navItem) {
        const href = navItem.querySelector('.nav-bar-links')?.getAttribute('href') || '';
        return document.querySelector(`.nav-submenu[data-nav-item-id="${href}"]`);
    },

    /**
     * Position submenu relative to nav item
     */
    positionSubmenu(navItem, submenu) {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) return false;

        const navItemRect = navItem.getBoundingClientRect();
        const navContainer = document.querySelector('.nav-links-container');
        
        if (!navContainer) return false;
        
        const navContainerRect = navContainer.getBoundingClientRect();
        
        // Position submenu directly next to the nav container (no gap)
        const submenuWidth = 260;
        const gap = 0; // No gap - directly adjacent
        let left = navContainerRect.left - submenuWidth - gap;
        let top = navItemRect.top;

        // Keep submenu within viewport vertically
        const submenuHeight = submenu.scrollHeight || 300;
        const viewportHeight = window.innerHeight;
        
        if (top + submenuHeight > viewportHeight - 20) {
            top = viewportHeight - submenuHeight - 20;
        }
        if (top < 60) {
            top = 60;
        }

        // If submenu would go off left side, position it to the right instead
        if (left < 10) {
            left = navContainerRect.right + gap;
        }

        submenu.style.left = `${left}px`;
        submenu.style.top = `${top}px`;
        return true;
    },

    /**
     * Show submenu
     */
    showSubmenu(navItem) {
        const submenu = this.getSubmenuForNavItem(navItem);
        if (!submenu) return;

        // Hide any other open submenu
        this.hideAllSubmenus();

        // Position and show
        if (this.positionSubmenu(navItem, submenu)) {
            submenu.classList.add('visible');
            this.activeSubmenu = submenu;
        }
    },

    /**
     * Hide all submenus
     */
    hideAllSubmenus() {
        document.querySelectorAll('.nav-submenu.visible').forEach(s => {
            s.classList.remove('visible');
        });
        this.activeSubmenu = null;
    },

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Burger toggle change
        this.burgerToggle.addEventListener('change', () => this.handleToggle());

        // Navigation item hover for submenu
        document.addEventListener('mouseover', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem && !this.isTouch && window.innerWidth > 768) {
                this.showSubmenu(navItem);
            }
        });

        // Hide submenu when leaving nav area
        document.addEventListener('mouseout', (e) => {
            if (this.isTouch || window.innerWidth <= 768) return;
            
            const navContainer = document.querySelector('.nav-links-container');
            const relatedTarget = e.relatedTarget;
            
            // Check if we're leaving the nav container and not entering a submenu
            if (navContainer && !navContainer.contains(relatedTarget) && 
                !relatedTarget?.closest('.nav-submenu')) {
                // Small delay to allow entering submenu
                setTimeout(() => {
                    const hoveredSubmenu = document.querySelector('.nav-submenu:hover');
                    const hoveredNavItem = document.querySelector('.nav-item:hover');
                    if (!hoveredSubmenu && !hoveredNavItem) {
                        this.hideAllSubmenus();
                    }
                }, 100);
            }
        });

        // Submenu mouse events (they are now in body)
        document.addEventListener('mouseenter', (e) => {
            if (e.target.classList?.contains('nav-submenu')) {
                e.target.classList.add('visible');
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target.classList?.contains('nav-submenu')) {
                // Delay to check if mouse moved to nav-item
                setTimeout(() => {
                    const hoveredNavItem = document.querySelector('.nav-item:hover');
                    if (!hoveredNavItem) {
                        e.target.classList.remove('visible');
                    }
                }, 100);
            }
        }, true);

        // Navigation links click (main nav links in .nav-item)
        document.querySelectorAll('.nav-item > .nav-bar-links').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavItemClick(e, link));
        });

        // Submenu links click - use event delegation on document since submenus are moved to body
        document.addEventListener('click', (e) => {
            const submenuLink = e.target.closest('.nav-submenu a');
            if (submenuLink) {
                this.handleSubmenuLinkClick(e, submenuLink);
            }
        });

        // Blur overlay click - closes menu when clicking outside
        this.blurOverlay.addEventListener('click', () => this.closeMenu());
    },

    /**
     * Lock scroll on touch devices
     */
    lockScroll() {
        if (this.isTouch) {
            document.body.style.overflow = 'hidden';
        }
    },

    /**
     * Unlock scroll on touch devices
     */
    unlockScroll() {
        if (this.isTouch) {
            document.body.style.overflow = '';
        }
    },

    /**
     * Handle burger toggle change
     */
    handleToggle() {
        if (this.burgerToggle.checked) {
            UIManager.closeAll('navbar');
            this.blurOverlay.classList.add('active');
            this.lockScroll();
        } else {
            this.blurOverlay.classList.remove('active');
            this.unlockScroll();
            // Close all submenus when menu closes
            this.hideAllSubmenus();
            document.querySelectorAll('.nav-item.active').forEach(item => {
                item.classList.remove('active');
            });
        }
    },

    /**
     * Handle main nav item click (toggle submenu on mobile/small screens, navigate on large desktop)
     */
    handleNavItemClick(e, link) {
        const navItem = link.closest('.nav-item');
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // On small screens (mobile or small desktop window), toggle submenu
            e.preventDefault();
            
            // Close other open submenus
            document.querySelectorAll('.nav-item.active').forEach(item => {
                if (item !== navItem) {
                    item.classList.remove('active');
                }
            });
            
            // Toggle current submenu
            navItem.classList.toggle('active');
        } else {
            // On desktop, navigate directly
            this.handleNavLinkClick(e, link);
        }
    },

    /**
     * Handle submenu link click
     */
    handleSubmenuLinkClick(e, link) {
        e.preventDefault();
        const targetId = link.getAttribute('href');

        // Close menu
        this.burgerToggle.checked = false;
        this.blurOverlay.classList.remove('active');
        this.unlockScroll();
        
        // Close all submenus
        this.hideAllSubmenus();
        document.querySelectorAll('.nav-item.active').forEach(item => {
            item.classList.remove('active');
        });

        // Scroll to target after short delay
        setTimeout(() => {
            let targetElement = document.querySelector(targetId);
            
            // If target not found, try to find the main section
            if (!targetElement && targetId) {
                // Extract section from submenu's data attribute
                const submenu = link.closest('.nav-submenu');
                const mainSectionId = submenu?.dataset.navItemId;
                if (mainSectionId) {
                    targetElement = document.querySelector(mainSectionId);
                }
            }
            
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 50);
    },

    /**
     * Handle navigation link click
     */
    handleNavLinkClick(e, link) {
        e.preventDefault();
        const targetId = link.getAttribute('href');

        // Close menu first
        this.burgerToggle.checked = false;
        this.blurOverlay.classList.remove('active');
        this.unlockScroll();

        // Scroll to target after short delay
        setTimeout(() => {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 50);
    },



    /**
     * Close menu helper
     */
    closeMenu() {
        this.burgerToggle.checked = false;
        this.blurOverlay.classList.remove('active');
        this.unlockScroll();
        // Close all submenus
        this.hideAllSubmenus();
        document.querySelectorAll('.nav-item.active').forEach(item => {
            item.classList.remove('active');
        });
    }
};
