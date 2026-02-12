/**
 * ========================================
 * MAIN.JS - Hauptskript
 * ========================================
 * 
 * Zentrale JavaScript-Datei für alle Interaktionen:
 * 
 * Module:
 * 1. Navigation & Burger Menu
 * 2. Micrographic Hover Highlights
 * 3. Übungsaufgaben Toggle
 * 4. Checkliste mit localStorage
 * 5. Prüfungs-Timer
 * 6. Selbsttest Funktionalität
 * 
 * @author Cedric Seidel
 * @version 2.0.0
 */

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


// ========================================
// 3. ÜBUNGSAUFGABEN TOGGLE
// ========================================

/**
 * Exercise Toggle Controller
 * Handles exercise and solution box toggling
 */
const ExerciseController = {
    /**
     * Initialize exercise toggles
     */
    init() {
        // Übungsaufgaben Toggle
        document.querySelectorAll('.uebung-header').forEach(header => {
            header.addEventListener('click', () => {
                const box = header.parentElement;
                box.classList.toggle('open');
            });
        });

        // Lösungen Toggle - Event Delegation für bessere Kompatibilität
        document.addEventListener('click', (e) => {
            const header = e.target.closest('.loesung-header');
            if (header) {
                e.preventDefault();
                e.stopPropagation();
                const box = header.closest('.loesung-box');
                if (box) {
                    box.classList.toggle('open');
                }
            }
        });
        
        // Auch auf aufgabe-header klickbar machen (Rechenaufgaben)
        document.querySelectorAll('.aufgabe-header').forEach(header => {
            header.style.cursor = 'pointer';
        });
    }
};


// ========================================
// 4. CHECKLISTE MIT LOCALSTORAGE
// ========================================

/**
 * Checklist Controller
 * Manages checklist and exercise checkboxes with localStorage persistence
 */
const ChecklistController = {
    storageKey: 'ihk-checkliste',
    exerciseStorageKey: 'ihk-uebungen',

    /**
     * Initialize checklist
     */
    init() {
        this.loadChecklist();
        this.loadExercises();
        this.bindEvents();
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Checkliste checkboxes
        document.querySelectorAll('.checkliste input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', () => this.saveChecklist());
        });

        // Exercise checkboxes
        document.querySelectorAll('.uebung-check').forEach(cb => {
            cb.addEventListener('change', (e) => {
                e.stopPropagation(); // Prevent toggle from opening
                this.saveExercises();
            });
            // Prevent click from bubbling to header
            cb.addEventListener('click', (e) => e.stopPropagation());
        });

        // Reset button - resets both
        const resetBtn = document.querySelector('.reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetChecklist();
                this.resetExercises();
            });
        }
    },

    /**
     * Save checklist to localStorage
     */
    saveChecklist() {
        const checkboxes = document.querySelectorAll('.checkliste input[type="checkbox"]');
        const state = {};
        
        checkboxes.forEach(cb => {
            state[cb.dataset.id] = cb.checked;
        });
        
        localStorage.setItem(this.storageKey, JSON.stringify(state));
    },

    /**
     * Load checklist from localStorage
     */
    loadChecklist() {
        const saved = localStorage.getItem(this.storageKey);
        
        if (saved) {
            const state = safeJSONParse(saved, {});
            
            document.querySelectorAll('.checkliste input[type="checkbox"]').forEach(cb => {
                if (state[cb.dataset.id]) {
                    cb.checked = true;
                }
            });
        }
    },

    /**
     * Reset checklist
     */
    resetChecklist() {
        document.querySelectorAll('.checkliste input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        
        localStorage.removeItem(this.storageKey);
    },

    /**
     * Save exercises to localStorage
     */
    saveExercises() {
        const checkboxes = document.querySelectorAll('.uebung-check');
        const state = {};
        
        checkboxes.forEach(cb => {
            state[cb.dataset.id] = cb.checked;
        });
        
        localStorage.setItem(this.exerciseStorageKey, JSON.stringify(state));
    },

    /**
     * Load exercises from localStorage
     */
    loadExercises() {
        const saved = localStorage.getItem(this.exerciseStorageKey);
        
        if (saved) {
            const state = safeJSONParse(saved, {});
            
            document.querySelectorAll('.uebung-check').forEach(cb => {
                if (state[cb.dataset.id]) {
                    cb.checked = true;
                }
            });
        }
    },

    /**
     * Reset exercises
     */
    resetExercises() {
        document.querySelectorAll('.uebung-check').forEach(cb => {
            cb.checked = false;
        });
        
        localStorage.removeItem(this.exerciseStorageKey);
    }
};


// ========================================
// 5. PRÜFUNGS-TIMER
// ========================================

/**
 * Timer Controller
 * Countdown timer for exam simulation
 * Only visible in exam-related sections
 */
const TimerController = {
    interval: null,
    seconds: 90 * 60,  // Default: 90 minutes
    running: false,
    startTime: 90 * 60,

    /**
     * Initialize timer
     */
    init() {
        const timerBox = document.getElementById('timer-box');
        const openBtn = document.getElementById('open-timer-btn');
        if (!timerBox || !openBtn) return;

        this.updateDisplay();
        this.bindEvents();
        this.checkVisibility();
        window.addEventListener('scroll', throttle(() => this.checkVisibility(), 100));
    },

    /**
     * Check if buttons should be visible based on current scroll position
     */
    checkVisibility() {
        const timerBtn = document.getElementById('open-timer-btn');
        const calcBtn = document.getElementById('open-calc-btn');
        if (!timerBtn) return;

        const scrollY = window.scrollY + window.innerHeight / 2;
        let inVisibleSection = false;

        // Get positions of key sections
        const uebungenEl = document.getElementById('uebungen');
        const toolsEl = document.getElementById('topic-rechner');
        const fallstudieEl = document.getElementById('fallstudie');

        // Range 1: Übungen bis Tools (Übungen, Prüfungssimulation)
        if (uebungenEl && toolsEl) {
            const uebungenTop = uebungenEl.getBoundingClientRect().top + window.scrollY;
            const toolsTop = toolsEl.getBoundingClientRect().top + window.scrollY;
            
            if (scrollY >= uebungenTop && scrollY < toolsTop) {
                inVisibleSection = true;
            }
        }

        // Range 2: Fallstudien bis Ende der Seite
        if (!inVisibleSection && fallstudieEl) {
            const fallstudieTop = fallstudieEl.getBoundingClientRect().top + window.scrollY;
            
            if (scrollY >= fallstudieTop) {
                inVisibleSection = true;
            }
        }

        if (inVisibleSection) {
            timerBtn.classList.add('visible');
            calcBtn?.classList.add('visible');
        } else {
            timerBtn.classList.remove('visible');
            calcBtn?.classList.remove('visible');
        }
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Timer controls
        document.getElementById('timer-start')?.addEventListener('click', () => this.start());
        document.getElementById('timer-pause')?.addEventListener('click', () => this.pause());
        document.getElementById('timer-reset')?.addEventListener('click', () => this.reset());
        document.getElementById('timer-close')?.addEventListener('click', () => this.hide());

        // Duration buttons
        document.querySelectorAll('.timer-duration-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.timer-duration-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.setDuration(parseInt(btn.dataset.minutes));
            });
        });

        // Open timer button
        document.getElementById('open-timer-btn')?.addEventListener('click', () => {
            UIManager.closeAll('timer');
            document.getElementById('timer-box').classList.remove('hidden');
            document.getElementById('open-timer-btn').classList.add('hidden');
        });
    },

    /**
     * Format seconds to HH:MM:SS
     */
    formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    },

    /**
     * Update timer display
     */
    updateDisplay() {
        const display = document.getElementById('timer-display');
        
        if (display) {
            display.textContent = this.formatTime(this.seconds);
            
            // Warning in last 10 minutes
            if (this.seconds <= 600) {
                display.classList.add('timer-warning');
            } else {
                display.classList.remove('timer-warning');
            }
        }
    },

    /**
     * Start timer
     */
    start() {
        if (this.running) return;
        
        this.running = true;
        document.getElementById('timer-box').classList.remove('hidden');
        
        this.interval = setInterval(() => {
            this.seconds--;
            this.updateDisplay();
            
            if (this.seconds <= 0) {
                clearInterval(this.interval);
                this.running = false;
                alert('Zeit abgelaufen! Die Prüfungszeit ist vorbei.');
            }
        }, 1000);
    },

    /**
     * Pause timer
     */
    pause() {
        if (!this.running) return;
        
        clearInterval(this.interval);
        this.running = false;
    },

    /**
     * Reset timer
     */
    reset() {
        this.pause();
        this.seconds = this.startTime;
        this.updateDisplay();
    },

    /**
     * Hide timer (keeps running in background)
     */
    hide() {
        document.getElementById('timer-box').classList.add('hidden');
        document.getElementById('open-timer-btn')?.classList.remove('hidden');
    },

    /**
     * Reset and hide timer
     */
    resetAndHide() {
        this.pause();
        document.getElementById('timer-box').classList.add('hidden');
        document.getElementById('open-timer-btn')?.classList.remove('hidden');
        this.seconds = this.startTime;
        this.updateDisplay();
    },

    /**
     * Set timer duration
     */
    setDuration(minutes) {
        this.startTime = minutes * 60;
        this.seconds = this.startTime;
        this.updateDisplay();
    }
};


// ========================================
// 6. SELBSTTEST FUNKTIONALITÄT
// ========================================

/**
 * Check self-test answers
 * @param {HTMLElement} button - The check button clicked
 */
function checkSelbsttest(button) {
    const container = button.closest('.selbsttest-box');
    const inputs = container.querySelectorAll('.selbsttest-input');

    inputs.forEach(input => {
        const correct = input.dataset.correct.toLowerCase().trim();
        const userAnswer = input.value.toLowerCase().trim();
        const feedback = input.nextElementSibling;

        // Allow multiple correct answers (separated by |)
        const correctAnswers = correct.split('|').map(a => a.trim());

        if (correctAnswers.includes(userAnswer)) {
            input.classList.remove('incorrect');
            input.classList.add('correct');
            
            if (feedback) {
                feedback.textContent = 'Richtig!';
                feedback.className = 'selbsttest-feedback correct';
            }
        } else {
            input.classList.remove('correct');
            input.classList.add('incorrect');
            
            if (feedback) {
                feedback.textContent = 'Falsch. Richtig: ' + correctAnswers[0];
                feedback.className = 'selbsttest-feedback incorrect';
            }
        }
    });
}

/**
 * Reset self-test
 * @param {HTMLElement} button - The reset button clicked
 */
function resetSelbsttest(button) {
    const container = button.closest('.selbsttest-box');
    const inputs = container.querySelectorAll('.selbsttest-input');
    const feedbacks = container.querySelectorAll('.selbsttest-feedback');

    inputs.forEach(input => {
        input.value = '';
        input.classList.remove('correct', 'incorrect');
    });

    feedbacks.forEach(fb => {
        fb.textContent = '';
        fb.className = 'selbsttest-feedback';
    });
}


// ========================================
// INTERAKTIVE RECHNER
// ========================================

/**
 * Subnetting-Rechner
 */
function berechneSubnetting() {
    const praefix = parseInt(document.getElementById('subnet-praefix').value);
    const resultDiv = document.getElementById('subnet-result');
    
    if (isNaN(praefix) || praefix < 0 || praefix > 32) {
        resultDiv.innerHTML = '<span style="color: #c0392b;">Bitte gültigen Präfix eingeben (0-32)</span>';
        return;
    }
    
    const hostBits = 32 - praefix;
    const totalHosts = Math.pow(2, hostBits);
    const nutzbarHosts = totalHosts - 2;
    const subnetze = Math.pow(2, praefix - 24); // Subnetze im /24
    
    // Subnetzmaske berechnen
    let mask = [];
    let bits = praefix;
    for (let i = 0; i < 4; i++) {
        if (bits >= 8) {
            mask.push(255);
            bits -= 8;
        } else if (bits > 0) {
            mask.push(256 - Math.pow(2, 8 - bits));
            bits = 0;
        } else {
            mask.push(0);
        }
    }
    
    const binaerMaske = '1'.repeat(praefix) + '0'.repeat(32-praefix);
    
    resultDiv.innerHTML = `
        <div class="rechenweg">
            <b>Dein Rechenweg für /${praefix}:</b><br><br>
            <b>1. Host-Bits:</b> 32 - ${praefix} = <b>${hostBits}</b><br><br>
            <b>2. Adressen:</b> 2<sup>${hostBits}</sup> = <b>${totalHosts.toLocaleString()}</b><br><br>
            <b>3. Nutzbare Hosts:</b> ${totalHosts.toLocaleString()} - 2 = <b>${nutzbarHosts.toLocaleString()}</b><br>
            <small>(Netzadresse und Broadcast abziehen)</small><br><br>
            <b>4. Subnetzmaske:</b><br>
            Binär: ${binaerMaske.substring(0,8)}.${binaerMaske.substring(8,16)}.${binaerMaske.substring(16,24)}.${binaerMaske.substring(24,32)}<br>
            Dezimal: <b>${mask.join('.')}</b>
        </div>
        <table class="sql-tabelle">
            <tr><td><b>Präfix:</b></td><td>/${praefix}</td></tr>
            <tr><td><b>Subnetzmaske:</b></td><td>${mask.join('.')}</td></tr>
            <tr><td><b>Host-Bits:</b></td><td>${hostBits}</td></tr>
            <tr><td><b>Adressen gesamt:</b></td><td>${totalHosts.toLocaleString()}</td></tr>
            <tr><td><b>Nutzbare Hosts:</b></td><td>${nutzbarHosts.toLocaleString()}</td></tr>
        </table>
    `;
}

/**
 * AfA-Rechner
 */
function berechneAfA() {
    const anschaffung = parseFloat(document.getElementById('afa-anschaffung').value);
    const nutzung = parseInt(document.getElementById('afa-nutzung').value);
    const restwert = parseFloat(document.getElementById('afa-restwert').value);
    const resultDiv = document.getElementById('afa-result');

    if (isNaN(anschaffung) || isNaN(nutzung) || isNaN(restwert) || anschaffung <= 0 || nutzung <= 0 || restwert < 0 || restwert >= anschaffung) {
        resultDiv.innerHTML = '<span style="color: #c0392b;">Bitte gültige Werte eingeben</span>';
        return;
    }

    const jahresAfA = (anschaffung - restwert) / nutzung;

    let tabelle = `<table class="sql-tabelle">
        <thead><tr><th>Jahr</th><th>AfA</th><th>Buchwert Anfang</th><th>Buchwert Ende</th></tr></thead>
        <tbody>`;

    let buchwert = anschaffung;
    for (let jahr = 1; jahr <= nutzung; jahr++) {
        const anfang = buchwert;
        // Im letzten Jahr auf Restwert setzen
        if (jahr === nutzung) {
            buchwert = restwert;
        } else {
            buchwert -= jahresAfA;
        }
        tabelle += `<tr>
            <td>${jahr}</td>
            <td>${jahresAfA.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})}</td>
            <td>${anfang.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})}</td>
            <td>${buchwert.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})}</td>
        </tr>`;
    }
    tabelle += '</tbody></table>';

    resultDiv.innerHTML = `
        <div class="rechenweg">
            <b>Formel:</b> AfA = (${anschaffung.toLocaleString('de-DE')} € - ${restwert.toLocaleString('de-DE')} €) ÷ ${nutzung} Jahre = <b>${jahresAfA.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})} pro Jahr</b>
        </div>
        ${tabelle}
    `;
}

/**
 * Break-Even-Rechner
 */
function berechneBreakEven() {
    const fixkosten = parseFloat(document.getElementById('bep-fixkosten').value);
    const preis = parseFloat(document.getElementById('bep-preis').value);
    const varKosten = parseFloat(document.getElementById('bep-varkosten').value);
    const resultDiv = document.getElementById('bep-result');
    
    if (isNaN(fixkosten) || isNaN(preis) || isNaN(varKosten)) {
        resultDiv.innerHTML = '<span style="color: #c0392b;">Bitte alle Werte eingeben</span>';
        return;
    }
    
    const deckungsbeitrag = preis - varKosten;
    
    if (deckungsbeitrag <= 0) {
        resultDiv.innerHTML = '<span style="color: #c0392b;">Deckungsbeitrag muss positiv sein!</span>';
        return;
    }
    
    const bep = Math.ceil(fixkosten / deckungsbeitrag);
    const umsatzBep = bep * preis;
    
    resultDiv.innerHTML = `
        <div class="rechenweg">
            <b>Deckungsbeitrag:</b> ${preis.toLocaleString('de-DE')} € - ${varKosten.toLocaleString('de-DE')} € = <b>${deckungsbeitrag.toLocaleString('de-DE')} €</b><br><br>
            <b>Break-Even-Point:</b> ${fixkosten.toLocaleString('de-DE')} € ÷ ${deckungsbeitrag.toLocaleString('de-DE')} € = <b>${bep.toLocaleString('de-DE')} Stück</b><br><br>
            <b>Umsatz am BEP:</b> ${bep.toLocaleString('de-DE')} × ${preis.toLocaleString('de-DE')} € = <b>${umsatzBep.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})}</b>
        </div>
    `;
}


// ========================================
// 8. FALLSTUDIE / CASE STUDY CONTROLLER
// ========================================

/**
 * Case Study Controller
 * Handles interactive case study with gamification
 */
const CaseStudyController = {
    totalPoints: 0,
    maxPoints: 100,
    completedMissions: new Set(),
    
    /**
     * Initialize case study
     */
    init() {
        this.loadProgress();
        this.updateProgressBar();
    },
    
    /**
     * Save progress to localStorage
     */
    saveProgress() {
        const data = {
            totalPoints: this.totalPoints,
            completedMissions: Array.from(this.completedMissions)
        };
        localStorage.setItem('caseStudyProgress', JSON.stringify(data));
    },
    
    /**
     * Load progress from localStorage
     */
    loadProgress() {
        const saved = localStorage.getItem('caseStudyProgress');
        if (saved) {
            const data = safeJSONParse(saved, {});
            this.totalPoints = data.totalPoints || 0;
            this.completedMissions = new Set(data.completedMissions || []);
            
            // Mark completed missions in UI
            this.completedMissions.forEach(id => {
                const mission = document.getElementById(`mission-${id}`);
                if (mission) {
                    mission.classList.add('completed');
                    mission.classList.remove('active');
                }
            });
        }
    },
    
    /**
     * Update progress bar
     */
    updateProgressBar() {
        const fill = document.getElementById('case-progress-fill');
        const points = document.getElementById('case-points');
        
        if (fill && points) {
            const percentage = (this.totalPoints / this.maxPoints) * 100;
            fill.style.width = `${percentage}%`;
            points.textContent = `${this.totalPoints} / ${this.maxPoints} Punkte`;
        }
        
        // Check if all missions completed
        if (this.completedMissions.size === 5) {
            this.showResult();
        }
    },
    
    /**
     * Add points
     */
    addPoints(points) {
        this.totalPoints += points;
        this.updateProgressBar();
        this.saveProgress();
    },
    
    /**
     * Show final result
     */
    showResult() {
        const result = document.getElementById('case-result');
        const score = document.getElementById('case-final-score');
        const grade = document.getElementById('case-grade');
        
        if (result && score && grade) {
            result.classList.add('show');
            score.textContent = `${this.totalPoints} / ${this.maxPoints} Punkte`;
            
            // Calculate grade
            const percentage = (this.totalPoints / this.maxPoints) * 100;
            let gradeText = '';
            if (percentage >= 92) gradeText = 'Note 1 – Sehr gut! 🏆';
            else if (percentage >= 81) gradeText = 'Note 2 – Gut! 🎯';
            else if (percentage >= 67) gradeText = 'Note 3 – Befriedigend 👍';
            else if (percentage >= 50) gradeText = 'Note 4 – Ausreichend ✓';
            else if (percentage >= 30) gradeText = 'Note 5 – Mangelhaft 📚';
            else gradeText = 'Note 6 – Ungenügend – Mehr üben! 📖';
            
            grade.textContent = gradeText;
        }
    },
    
    /**
     * Reset case study
     */
    reset() {
        this.totalPoints = 0;
        this.completedMissions = new Set();
        localStorage.removeItem('caseStudyProgress');
        
        // Reset UI
        document.querySelectorAll('.case-mission').forEach((mission, index) => {
            mission.classList.remove('completed', 'active');
            if (index === 0) mission.classList.add('active');
        });
        
        document.querySelectorAll('.case-feedback').forEach(fb => {
            fb.classList.remove('show');
            fb.innerHTML = '';
        });
        
        document.querySelectorAll('.case-mc-option').forEach(opt => {
            opt.classList.remove('selected', 'correct', 'wrong');
        });
        
        document.querySelectorAll('.case-answer-input').forEach(input => {
            input.value = '';
        });
        
        const result = document.getElementById('case-result');
        if (result) result.classList.remove('show');
        
        this.updateProgressBar();
    }
};

/**
 * Toggle mission accordion
 */
function toggleMission(missionId) {
    const mission = document.getElementById(`mission-${missionId}`);
    if (!mission) return;
    
    // Don't toggle if already completed
    if (mission.classList.contains('completed')) return;
    
    const wasActive = mission.classList.contains('active');
    
    // Close all missions
    document.querySelectorAll('.case-mission').forEach(m => {
        if (!m.classList.contains('completed')) {
            m.classList.remove('active');
        }
    });
    
    // Toggle clicked mission
    if (!wasActive) {
        mission.classList.add('active');
    }
}

/**
 * Select MC option
 */
function selectMcOption(element) {
    const parent = element.closest('.case-mc-options');
    if (!parent) return;
    
    // Deselect all in this group
    parent.querySelectorAll('.case-mc-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Select clicked
    element.classList.add('selected');
}

/**
 * Check mission answers
 */
function checkMission(missionId) {
    const mission = document.getElementById(`mission-${missionId}`);
    const feedback = document.getElementById(`feedback-${missionId}`);
    if (!mission || !feedback) return;
    
    // Already completed
    if (CaseStudyController.completedMissions.has(missionId)) return;
    
    let correctCount = 0;
    let totalQuestions = 0;
    let feedbackHtml = '';
    
    // Check based on mission
    switch(missionId) {
        case 1:
            // Netzwerk
            totalQuestions = 4;
            if (checkInput('m1-hosts', '254')) correctCount++;
            if (checkInput('m1-available', '194')) correctCount++;
            if (checkInput('m1-network', '192.168.10.0')) correctCount++;
            if (checkInput('m1-broadcast', '192.168.10.255')) correctCount++;
            
            feedbackHtml = correctCount === totalQuestions 
                ? '<b>Perfekt!</b> Du hast das Subnetting verstanden. /24 = 256 - 2 = 254 Hosts. Mit 60 vergeben, bleiben 194 übrig – mehr als genug für 5 neue Arbeitsplätze!'
                : `<b>${correctCount}/${totalQuestions} richtig.</b> Bei /24 (Subnetzmaske 255.255.255.0) gibt es 2^8 = 256 Adressen. Minus Netzwerk (.0) und Broadcast (.255) = 254 nutzbare Hosts.`;
            break;
            
        case 2:
            // Hardware
            totalQuestions = 2;
            if (checkInput('m2-costA', ['2400', '2.400'])) correctCount++;
            if (checkInput('m2-costB', ['1600', '1.600'])) correctCount++;
            
            const recommendation = document.getElementById('m2-recommendation')?.value || '';
            const hasGoodReasoning = recommendation.toLowerCase().includes('hybrid') || 
                                    recommendation.toLowerCase().includes('home') || 
                                    recommendation.toLowerCase().includes('mobil') ||
                                    recommendation.toLowerCase().includes('notebook');
            
            if (hasGoodReasoning && recommendation.length > 50) correctCount++;
            totalQuestions++;
            
            feedbackHtml = correctCount >= 2
                ? '<b>Gut gemacht!</b> Option A (Notebook) kostet zwar mehr, ist aber für das Hybrid-Modell die richtige Wahl. Bei der IHK: Immer die Anforderungen des Szenarios berücksichtigen, nicht nur den Preis!'
                : `<b>${correctCount}/${totalQuestions} richtig.</b> Notebook: 1800 + 400 + 200 = 2400€. Desktop: 1200 + 400 = 1600€. Die Begründung muss zum Hybrid-Modell passen!`;
            break;
            
        case 3:
            // IT-Sicherheit
            totalQuestions = 2;
            const ciaSelected = document.querySelector('#m3-cia .case-mc-option.selected');
            if (ciaSelected?.dataset.value === 'c') {
                correctCount++;
                ciaSelected.classList.add('correct');
            } else if (ciaSelected) {
                ciaSelected.classList.add('wrong');
                document.querySelector('#m3-cia .case-mc-option[data-value="c"]')?.classList.add('correct');
            }
            
            if (checkInput('m3-vpn', ['VPN', 'Virtual Private Network'])) correctCount++;
            
            const measures = document.getElementById('m3-measures')?.value || '';
            if (measures.length > 80) correctCount++;
            totalQuestions++;
            
            feedbackHtml = correctCount >= 2
                ? '<b>Sehr gut!</b> Vertraulichkeit (Confidentiality) ist beim Fernzugriff auf Kundendaten kritisch. VPN verschlüsselt die Verbindung. Technische Maßnahmen: VPN, 2FA, Festplattenverschlüsselung, Firewall. Organisatorisch: Passwortrichtlinie, Schulungen, Clean Desk.'
                : `<b>${correctCount}/${totalQuestions} richtig.</b> Bei Kundendaten ist Vertraulichkeit am wichtigsten. VPN schafft einen sicheren Tunnel ins Firmennetzwerk.`;
            break;
            
        case 4:
            // DSGVO
            totalQuestions = 3;
            const legalSelected = document.querySelector('#m4-legal .case-mc-option.selected');
            if (legalSelected?.dataset.value === 'b') {
                correctCount++;
                legalSelected.classList.add('correct');
            } else if (legalSelected) {
                legalSelected.classList.add('wrong');
                document.querySelector('#m4-legal .case-mc-option[data-value="b"]')?.classList.add('correct');
            }
            
            if (checkInput('m4-tom', ['Technisch-organisatorische Maßnahmen', 'Technische und organisatorische Maßnahmen', 'technisch organisatorische Maßnahmen'])) correctCount++;
            if (checkInput('m4-right', ['Auskunft', 'Auskunftsrecht', 'Recht auf Auskunft'])) correctCount++;
            
            feedbackHtml = correctCount === totalQuestions
                ? '<b>Perfekt!</b> Vertragserfüllung (Art. 6 Abs. 1 lit. b) ist hier die Rechtsgrundlage – die Daten werden für die ERP-Dienstleistung benötigt. TOM sind das Bindeglied zwischen DSGVO und IT-Sicherheit!'
                : `<b>${correctCount}/${totalQuestions} richtig.</b> Bei Kundenverträgen ist meist Art. 6 Abs. 1 lit. b (Vertragserfüllung) die Rechtsgrundlage. TOM = Technisch-organisatorische Maßnahmen.`;
            break;
            
        case 5:
            // Projektplanung
            totalQuestions = 4;
            if (checkInput('m5-lasten', ['Lastenheft'])) correctCount++;
            if (checkInput('m5-pflichten', ['Pflichtenheft'])) correctCount++;
            if (checkInput('m5-p1', '2')) correctCount++;
            if (checkInput('m5-p2', '3')) correctCount++;
            if (checkInput('m5-p3', '1')) correctCount++;
            if (checkInput('m5-p4', '4')) correctCount++;
            
            // Simplified: count phase answers as one
            const phaseCorrect = checkInput('m5-p1', '2') && checkInput('m5-p2', '3') && checkInput('m5-p3', '1') && checkInput('m5-p4', '4');
            correctCount = 0;
            if (checkInput('m5-lasten', ['Lastenheft'])) correctCount++;
            if (checkInput('m5-pflichten', ['Pflichtenheft'])) correctCount++;
            if (phaseCorrect) correctCount += 2;
            
            feedbackHtml = correctCount >= 3
                ? '<b>Ausgezeichnet!</b> „Kunde = Last, Dienstleister = Pflicht" – ein wichtiger Merksatz! Die 4 Phasen: Definition → Planung → Durchführung → Abschluss.'
                : `<b>${correctCount}/${totalQuestions} richtig.</b> Lastenheft = WAS (vom Kunden), Pflichtenheft = WIE (vom Dienstleister). Phasen: Definition → Planung → Durchführung → Abschluss.`;
            break;
    }
    
    // Calculate points for this mission
    const missionPoints = parseInt(mission.dataset.points) || 20;
    const earnedPoints = Math.round((correctCount / totalQuestions) * missionPoints);
    
    // Show feedback
    const success = correctCount >= totalQuestions * 0.5;
    feedback.className = `case-feedback show ${success ? 'success' : 'error'}`;
    feedback.innerHTML = `
        <div class="case-feedback-title">${earnedPoints} von ${missionPoints} Punkten erreicht</div>
        <p>${feedbackHtml}</p>
    `;
    
    // Mark mission as completed after a delay
    setTimeout(() => {
        mission.classList.add('completed');
        mission.classList.remove('active');
        CaseStudyController.completedMissions.add(missionId);
        CaseStudyController.addPoints(earnedPoints);
        
        // Open next mission
        const nextMission = document.getElementById(`mission-${missionId + 1}`);
        if (nextMission && !nextMission.classList.contains('completed')) {
            nextMission.classList.add('active');
        }
    }, 2000);
}

/**
 * Helper to check input value
 */
function checkInput(inputId, correctValues) {
    const input = document.getElementById(inputId);
    if (!input) return false;
    
    const value = input.value.trim().toLowerCase();
    if (Array.isArray(correctValues)) {
        return correctValues.some(cv => value.includes(cv.toLowerCase()));
    }
    return value === correctValues.toLowerCase() || value.includes(correctValues.toLowerCase());
}

/**
 * Show hint for mission
 */
function showHint(missionId) {
    const hints = {
        1: 'Formel: Hosts = 2^(32-Präfix) - 2. Bei /24: 2^8 - 2 = 254 Hosts. Netzwerkadresse immer .0, Broadcast immer .255 bei /24.',
        2: 'Addiere alle Kosten pro Option. Für die Begründung: Was brauchen die Entwickler laut Szenario? Hybrid-Modell = Home-Office = Mobilität nötig!',
        3: 'CIA: Welches Schutzziel ist für VERTRAULICHE Kundendaten am wichtigsten? Für sichere Verbindungen nutzt man einen verschlüsselten Tunnel...',
        4: 'Wenn Daten für einen Vertrag benötigt werden, ist die Rechtsgrundlage meist Vertragserfüllung. TOM sind Maßnahmen, die sowohl technisch als auch organisatorisch sein können.',
        5: 'Merksatz: „Kunde = Last, Dienstleister = Pflicht". Die Projektphasen beginnen mit der Projekidee (Definition) und enden mit dem Projektabschluss.'
    };
    
    alert('💡 Hinweis:\n\n' + (hints[missionId] || 'Kein Hinweis verfügbar.'));
}

/**
 * Reset case study
 */
function resetCaseStudy(caseId) {
    if (confirm('Möchtest du die Fallstudie wirklich zurücksetzen? Dein gesamter Fortschritt geht verloren.')) {
        if (caseId === 'techstart') {
            CaseStudyController.reset();
        } else if (caseId === 'dataflow') {
            resetCase2();
        } else if (caseId === 'medtech') {
            resetCase3();
        }
    }
}

// ========================================
// FALLSTUDIE 2 - DATAFLOW AG
// ========================================

const Case2State = {
    points: 0,
    completedMissions: new Set()
};

function toggleMission2(missionId) {
    const mission = document.getElementById(`mission2-${missionId}`);
    if (mission) {
        mission.classList.toggle('active');
    }
}

function checkMission2(missionId) {
    const mission = document.getElementById(`mission2-${missionId}`);
    const feedback = document.getElementById(`feedback2-${missionId}`);
    if (!mission || !feedback) return;
    
    if (Case2State.completedMissions.has(missionId)) return;
    
    let correctCount = 0;
    let totalQuestions = 0;
    let feedbackHtml = '';
    
    switch(missionId) {
        case 1:
            totalQuestions = 4;
            if (checkInput('m2-1-problem', ['konflikt', 'gleiche', 'routing', 'routbar'])) correctCount++;
            if (checkInput('m2-1-hh', ['/24', '24', '/23', '23'])) correctCount++;
            if (checkInput('m2-1-hh-range', ['172.16'])) correctCount++;
            if (checkInput('m2-1-vpn', ['vpn', 'ipsec'])) correctCount++;
            
            feedbackHtml = correctCount === totalQuestions 
                ? '<b>Perfekt!</b> Wenn zwei Standorte den gleichen IP-Bereich nutzen, können sie nicht miteinander kommunizieren. VPN (Site-to-Site) verbindet Standorte sicher über das Internet.'
                : `<b>${correctCount}/${totalQuestions} richtig.</b> Bei gleichem IP-Bereich entstehen Adresskonflikte. Jeder Standort braucht einen eigenen Bereich aus 172.16.0.0/16.`;
            break;
            
        case 2:
            totalQuestions = 4;
            if (checkInput('m2-2-dmz', ['dmz', 'demilitarisiert'])) correctCount++;
            if (checkInput('m2-2-ports', ['80', '443'])) correctCount++;
            if (checkInput('m2-2-vlan', ['vlan', 'virtual'])) correctCount++;
            if (checkInput('m2-2-osi', ['3', 'vermittlung', 'network', 'schicht 3'])) correctCount++;
            
            feedbackHtml = correctCount === totalQuestions 
                ? '<b>Sehr gut!</b> Die DMZ schützt interne Systeme, während öffentliche Server erreichbar bleiben. VLANs segmentieren das Netzwerk logisch.'
                : `<b>${correctCount}/${totalQuestions} richtig.</b> Webserver gehören in die DMZ. HTTP=80, HTTPS=443. Firewalls arbeiten auf OSI-Schicht 3 (und 4).`;
            break;
            
        case 3:
            totalQuestions = 3;
            if (checkInput('m2-3-costA', ['7500', '7.500'])) correctCount++;
            if (checkInput('m2-3-costB', ['7850', '7.850'])) correctCount++;
            
            const rec = document.getElementById('m2-3-recommend')?.value || '';
            if (rec.length > 30) correctCount++;
            
            feedbackHtml = correctCount >= 2
                ? '<b>Gut berechnet!</b> Anbieter A: 1200+2800+3500 = 7500€ (inkl. Support). Anbieter B: 1350+2500+3200+800 = 7850€. Bei 3-Monats-Deadline ist die kürzere Lieferzeit von A ein großer Vorteil!'
                : `<b>${correctCount}/${totalQuestions} richtig.</b> Anbieter A = 7500€, Anbieter B = 7850€. Die Lieferzeit kann bei engen Zeitplänen entscheidend sein!`;
            break;
            
        case 4:
            totalQuestions = 4;
            if (checkInput('m2-4-duration', ['11', 'elf'])) correctCount++;
            if (checkInput('m2-4-path', ['a', 'b', 'd', 'e', 'f', 'g'])) correctCount++;
            if (checkInput('m2-4-buffer', ['2'])) correctCount++;
            
            const risk = document.getElementById('m2-4-risk')?.value || '';
            if (risk.length > 30) correctCount++;
            
            feedbackHtml = correctCount >= 3
                ? '<b>Ausgezeichnet!</b> Kritischer Pfad: A(2)+B(3)+D(2)+E(1)+F(2)+G(1)=11 Wochen. C hat 2 Wochen Puffer, da D+E parallel 3 Wochen dauern, C aber nur 1.'
                : `<b>${correctCount}/${totalQuestions} richtig.</b> Der kritische Pfad bestimmt die Mindestdauer. Arbeitspakete auf dem kritischen Pfad haben keinen Puffer.`;
            break;
    }
    
    const missionPoints = parseInt(mission.dataset.points) || 25;
    const earnedPoints = Math.round((correctCount / totalQuestions) * missionPoints);
    
    const success = correctCount >= totalQuestions * 0.5;
    feedback.className = `case-feedback show ${success ? 'success' : 'error'}`;
    feedback.innerHTML = `
        <div class="case-feedback-title">${earnedPoints} von ${missionPoints} Punkten erreicht</div>
        <p>${feedbackHtml}</p>
    `;
    
    setTimeout(() => {
        mission.classList.add('completed');
        mission.classList.remove('active');
        Case2State.completedMissions.add(missionId);
        Case2State.points += earnedPoints;
        updateCase2Progress();
        
        const nextMission = document.getElementById(`mission2-${missionId + 1}`);
        if (nextMission && !nextMission.classList.contains('completed')) {
            nextMission.classList.add('active');
        }
        
        if (Case2State.completedMissions.size === 4) {
            showCase2Result();
        }
    }, 2000);
}

function showHint2(num) {
    const hints = {
        1: 'Bei 150 Hosts brauchst du mindestens /24 (254 Hosts). Wenn zwei Standorte die gleiche IP haben, können Pakete nicht geroutet werden. VPN = Virtual Private Network.',
        2: 'DMZ = Demilitarisierte Zone zwischen Internet und internem Netz. Standard-Webports: HTTP=80, HTTPS=443. Paketfilter-Firewalls arbeiten auf Schicht 3/4.',
        3: 'Addiere alle Einzelpositionen. Bei Anbieter B den Support-Aufschlag nicht vergessen! Beachte den engen Zeitrahmen von 3 Monaten.',
        4: 'Kritischer Pfad = längste Kette. Rechne: A→B→D→E→F→G = 2+3+2+1+2+1 = 11. C kann parallel zu D+E laufen und hat Puffer.'
    };
    alert('[TIPP]\n\n' + (hints[num] || 'Kein Hinweis verfügbar.'));
}

function updateCase2Progress() {
    const fill = document.getElementById('case2-progress-fill');
    const points = document.getElementById('case2-points');
    if (fill) fill.style.width = Case2State.points + '%';
    if (points) points.textContent = Case2State.points + ' / 100 Punkte';
}

function showCase2Result() {
    const result = document.getElementById('case2-result');
    const score = document.getElementById('case2-final-score');
    const grade = document.getElementById('case2-grade');
    
    if (result) result.classList.add('show');
    if (score) score.textContent = Case2State.points + ' / 100 Punkte';
    if (grade) {
        const g = Case2State.points >= 92 ? 'sehr gut' : Case2State.points >= 81 ? 'gut' : Case2State.points >= 67 ? 'befriedigend' : Case2State.points >= 50 ? 'ausreichend' : 'nicht bestanden';
        grade.textContent = 'Bewertung: ' + g;
    }
}

function resetCase2() {
    Case2State.points = 0;
    Case2State.completedMissions.clear();
    updateCase2Progress();
    
    document.querySelectorAll('[id^="mission2-"]').forEach(m => {
        m.classList.remove('completed');
        m.classList.remove('active');
    });
    document.getElementById('mission2-1')?.classList.add('active');
    document.querySelectorAll('[id^="m2-"]').forEach(i => { if (i.value !== undefined) i.value = ''; });
    document.querySelectorAll('[id^="feedback2-"]').forEach(f => f.className = 'case-feedback');
    document.getElementById('case2-result')?.classList.remove('show');
}

// ========================================
// FALLSTUDIE 3 - MEDTECH SOLUTIONS
// ========================================

const Case3State = {
    points: 0,
    completedMissions: new Set()
};

function toggleMission3(missionId) {
    const mission = document.getElementById(`mission3-${missionId}`);
    if (mission) {
        mission.classList.toggle('active');
    }
}

function selectMcOption3(element) {
    const parent = element.parentElement;
    parent.querySelectorAll('.case-mc-option').forEach(o => o.classList.remove('selected'));
    element.classList.add('selected');
}

function checkMission3(missionId) {
    const mission = document.getElementById(`mission3-${missionId}`);
    const feedback = document.getElementById(`feedback3-${missionId}`);
    if (!mission || !feedback) return;
    
    if (Case3State.completedMissions.has(missionId)) return;
    
    let correctCount = 0;
    let totalQuestions = 0;
    let feedbackHtml = '';
    
    switch(missionId) {
        case 1:
            totalQuestions = 4;
            if (checkInput('m3-1-article', ['9', 'art. 9', 'artikel 9'])) correctCount++;
            
            const legalSel = document.querySelector('#m3-1-legal .case-mc-option.selected');
            if (legalSel?.dataset.value === 'b') {
                correctCount++;
                legalSel.classList.add('correct');
            } else if (legalSel) {
                legalSel.classList.add('wrong');
                document.querySelector('#m3-1-legal .case-mc-option[data-value="b"]')?.classList.add('correct');
            }
            
            if (checkInput('m3-1-cia', ['vertraulich', 'confidential', 'c'])) correctCount++;
            
            const tom = document.getElementById('m3-1-tom')?.value || '';
            if (tom.length > 30) correctCount++;
            
            feedbackHtml = correctCount >= 3
                ? '<b>Sehr gut!</b> Art. 9 DSGVO regelt besondere Kategorien wie Gesundheitsdaten. Arztpraxen verarbeiten auf Basis des Behandlungsvertrags. Unverschlüsselte Backups verletzen die Vertraulichkeit.'
                : `<b>${correctCount}/${totalQuestions} richtig.</b> Gesundheitsdaten fallen unter Art. 9 DSGVO (besondere Kategorien). Unverschlüsselung = Vertraulichkeitsproblem.`;
            break;
            
        case 2:
            totalQuestions = 4;
            
            const rule = document.getElementById('m3-2-rule')?.value || '';
            if (rule.toLowerCase().includes('3') && rule.toLowerCase().includes('2') && rule.toLowerCase().includes('1')) correctCount++;
            
            if (checkInput('m3-2-media', ['7', 'sieben'])) correctCount++;
            
            const typeSel = document.querySelector('#m3-2-type .case-mc-option.selected');
            if (typeSel?.dataset.value === 'b') {
                correctCount++;
                typeSel.classList.add('correct');
            } else if (typeSel) {
                typeSel.classList.add('wrong');
                document.querySelector('#m3-2-type .case-mc-option[data-value="b"]')?.classList.add('correct');
            }
            
            if (checkInput('m3-2-offsite', ['brand', 'diebstahl', 'katastroph', 'feuer', 'einbruch', 'gebäude', 'standort'])) correctCount++;
            
            feedbackHtml = correctCount >= 3
                ? '<b>Gut gemacht!</b> 3-2-1: 3 Kopien, 2 verschiedene Medien, 1 Offsite. Differentiell sichert seit letztem Vollbackup. Offsite schützt vor Standort-Katastrophen.'
                : `<b>${correctCount}/${totalQuestions} richtig.</b> 3-2-1-Regel ist Backup-Standard. Differentiell = alle Änderungen seit Vollbackup.`;
            break;
            
        case 3:
            totalQuestions = 4;
            if (checkInput('m3-3-afa', ['2500', '2.500', '2400', '2.400'])) correctCount++;
            if (checkInput('m3-3-tcoA', ['15500', '15.500'])) correctCount++;
            if (checkInput('m3-3-tcoB', ['24000', '24.000'])) correctCount++;
            
            const recText = document.getElementById('m3-3-recommend')?.value || '';
            if (recText.length > 30) correctCount++;
            
            feedbackHtml = correctCount >= 3
                ? '<b>Ausgezeichnet!</b> AfA = 12.500/5 = 2.500€/Jahr. TCO Option A: 12.000+500+(50×60)=15.500€. TCO Option B: 400×60=24.000€. NAS ist deutlich günstiger, aber bei Cloud-Backup für Gesundheitsdaten ist der Serverstandort (EU!) und AVV wichtig.'
                : `<b>${correctCount}/${totalQuestions} richtig.</b> AfA = Anschaffung / Nutzungsdauer. TCO = alle Kosten über die gesamte Laufzeit.`;
            break;
            
        case 4:
            totalQuestions = 4;
            if (checkInput('m3-4-pdca', ['plan', 'do', 'check', 'act'])) correctCount++;
            if (checkInput('m3-4-iso', ['9001'])) correctCount++;
            if (checkInput('m3-4-sla', ['sla', 'service level'])) correctCount++;
            if (checkInput('m3-4-avv', ['avv', 'auftragsverarbeitung'])) correctCount++;
            
            feedbackHtml = correctCount >= 3
                ? '<b>Perfekt!</b> PDCA = Plan-Do-Check-Act (Deming-Kreis). ISO 9001 ist DIE QM-Norm. SLA regelt Dienstleisterleistungen. AVV ist bei Cloud-Diensten Pflicht nach DSGVO Art. 28.'
                : `<b>${correctCount}/${totalQuestions} richtig.</b> PDCA ist der kontinuierliche Verbesserungsprozess. Bei externen IT-Diensten: SLA für Leistungen, AVV für Datenschutz.`;
            break;
    }
    
    const missionPoints = parseInt(mission.dataset.points) || 25;
    const earnedPoints = Math.round((correctCount / totalQuestions) * missionPoints);
    
    const success = correctCount >= totalQuestions * 0.5;
    feedback.className = `case-feedback show ${success ? 'success' : 'error'}`;
    feedback.innerHTML = `
        <div class="case-feedback-title">${earnedPoints} von ${missionPoints} Punkten erreicht</div>
        <p>${feedbackHtml}</p>
    `;
    
    setTimeout(() => {
        mission.classList.add('completed');
        mission.classList.remove('active');
        Case3State.completedMissions.add(missionId);
        Case3State.points += earnedPoints;
        updateCase3Progress();
        
        const nextMission = document.getElementById(`mission3-${missionId + 1}`);
        if (nextMission && !nextMission.classList.contains('completed')) {
            nextMission.classList.add('active');
        }
        
        if (Case3State.completedMissions.size === 4) {
            showCase3Result();
        }
    }, 2000);
}

function showHint3(num) {
    const hints = {
        1: 'Gesundheitsdaten sind "besondere Kategorien" nach Art. 9 DSGVO. Ärzte verarbeiten auf Basis des Behandlungsvertrags. CIA = Confidentiality, Integrity, Availability.',
        2: '3-2-1: 3 Kopien, 2 verschiedene Medientypen, 1 extern. Differentiell = seit letztem VOLL-Backup. Offsite = anderer Standort (Schutz vor Brand etc.).',
        3: 'AfA = Anschaffungskosten / Nutzungsdauer. TCO = Anschaffung + alle laufenden Kosten. Bei Cloud: 400€ × 12 × 5 = 24.000€.',
        4: 'PDCA = Plan-Do-Check-Act. ISO 9001 = QM. SLA = Service Level Agreement. AVV ist Pflicht bei Auftragsverarbeitung (Cloud).'
    };
    alert('[TIPP]\n\n' + (hints[num] || 'Kein Hinweis verfügbar.'));
}

function updateCase3Progress() {
    const fill = document.getElementById('case3-progress-fill');
    const points = document.getElementById('case3-points');
    if (fill) fill.style.width = Case3State.points + '%';
    if (points) points.textContent = Case3State.points + ' / 100 Punkte';
}

function showCase3Result() {
    const result = document.getElementById('case3-result');
    const score = document.getElementById('case3-final-score');
    const grade = document.getElementById('case3-grade');
    
    if (result) result.classList.add('show');
    if (score) score.textContent = Case3State.points + ' / 100 Punkte';
    if (grade) {
        const g = Case3State.points >= 92 ? 'sehr gut' : Case3State.points >= 81 ? 'gut' : Case3State.points >= 67 ? 'befriedigend' : Case3State.points >= 50 ? 'ausreichend' : 'nicht bestanden';
        grade.textContent = 'Bewertung: ' + g;
    }
}

function resetCase3() {
    Case3State.points = 0;
    Case3State.completedMissions.clear();
    updateCase3Progress();
    
    document.querySelectorAll('[id^="mission3-"]').forEach(m => {
        m.classList.remove('completed');
        m.classList.remove('active');
    });
    document.getElementById('mission3-1')?.classList.add('active');
    document.querySelectorAll('[id^="m3-"]').forEach(i => { if (i.value !== undefined) i.value = ''; });
    document.querySelectorAll('[id^="feedback3-"]').forEach(f => f.className = 'case-feedback');
    document.querySelectorAll('#case-medtech .case-mc-option').forEach(o => o.classList.remove('selected', 'correct', 'wrong'));
    document.getElementById('case3-result')?.classList.remove('show');
}

// ========================================
// IT-RECHNER (Programmer Calculator)
// ========================================

const CalcController = {
    currentMode: 'convert',
    expression: '',

    init() {
        const calcBox = document.getElementById('calc-box');
        const openBtn = document.getElementById('open-calc-btn');
        if (!calcBox || !openBtn) return;

        this.bindEvents();
    },

    bindEvents() {
        // Open/Close
        document.getElementById('open-calc-btn')?.addEventListener('click', () => {
            UIManager.closeAll('calc');
            document.getElementById('calc-box')?.classList.remove('hidden');
            document.getElementById('open-calc-btn')?.classList.add('hidden');
        });

        document.getElementById('calc-close')?.addEventListener('click', () => {
            document.getElementById('calc-box')?.classList.add('hidden');
            document.getElementById('open-calc-btn')?.classList.remove('hidden');
        });

        // Mode buttons
        document.querySelectorAll('.calc-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.calc-mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.setMode(btn.dataset.mode);
            });
        });

        // Conversion inputs
        ['dec', 'bin', 'hex', 'oct'].forEach(type => {
            const input = document.getElementById(`calc-${type}`);
            if (input) {
                input.addEventListener('input', () => this.convertFrom(type, input.value));
            }
        });
    },

    setMode(mode) {
        this.currentMode = mode;
        // Hide all panels
        document.getElementById('calc-convert-mode').style.display = 'none';
        document.getElementById('calc-calc-mode').style.display = 'none';
        document.getElementById('calc-subnet-mode').style.display = 'none';
        
        // Show selected panel
        if (mode === 'convert') document.getElementById('calc-convert-mode').style.display = 'block';
        if (mode === 'calc') document.getElementById('calc-calc-mode').style.display = 'block';
        if (mode === 'subnet') document.getElementById('calc-subnet-mode').style.display = 'block';
    },

    convertFrom(type, value) {
        if (value === '') {
            ['dec', 'bin', 'hex', 'oct'].forEach(t => {
                if (t !== type) document.getElementById(`calc-${t}`).value = '';
            });
            return;
        }

        let decimal;
        try {
            switch(type) {
                case 'dec': decimal = parseInt(value, 10); break;
                case 'bin': decimal = parseInt(value, 2); break;
                case 'hex': decimal = parseInt(value, 16); break;
                case 'oct': decimal = parseInt(value, 8); break;
            }

            if (isNaN(decimal) || decimal < 0) return;

            if (type !== 'dec') document.getElementById('calc-dec').value = decimal;
            if (type !== 'bin') document.getElementById('calc-bin').value = decimal.toString(2);
            if (type !== 'hex') document.getElementById('calc-hex').value = decimal.toString(16).toUpperCase();
            if (type !== 'oct') document.getElementById('calc-oct').value = decimal.toString(8);
        } catch(e) { /* ignore */ }
    }
};

// Global calc functions for onclick handlers
function calcKey(key) {
    const display = document.getElementById('calc-expression');
    if (display) display.value = (display.value || '') + key;
}

function calcClear() {
    const display = document.getElementById('calc-expression');
    if (display) display.value = '';
    const result = document.getElementById('calc-result-value');
    if (result) result.textContent = '—';
}

function calcEvaluate() {
    const display = document.getElementById('calc-expression');
    const result = document.getElementById('calc-result-value');
    if (!display || !result) return;
    
    try {
        let expr = display.value.replace(/\*\*/g, '**');
        let res = Function('"use strict"; return (' + expr + ')')();
        result.textContent = res;
    } catch(e) {
        result.textContent = 'Fehler';
    }
}

function calcSubnet() {
    const ipInput = document.getElementById('calc-subnet-ip')?.value || '';
    const cidrInput = document.getElementById('calc-subnet-cidr')?.value || '';

    const ipParts = ipInput.split('.').map(n => parseInt(n));
    const cidr = parseInt(cidrInput);

    if (ipParts.length !== 4 || ipParts.some(p => isNaN(p) || p < 0 || p > 255) || isNaN(cidr) || cidr < 0 || cidr > 32) {
        document.getElementById('subnet-network').textContent = 'Ungültig';
        document.getElementById('subnet-broadcast').textContent = '—';
        document.getElementById('subnet-mask').textContent = '—';
        document.getElementById('subnet-hosts').textContent = '—';
        return;
    }

    const hostBits = 32 - cidr;
    const mask = cidr === 0 ? 0 : (0xFFFFFFFF << hostBits) >>> 0;
    const ipInt = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
    const networkInt = (ipInt & mask) >>> 0;
    const broadcastInt = (networkInt | (~mask >>> 0)) >>> 0;

    const toIP = n => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');

    document.getElementById('subnet-network').textContent = toIP(networkInt);
    document.getElementById('subnet-broadcast').textContent = toIP(broadcastInt);
    document.getElementById('subnet-mask').textContent = toIP(mask);
    document.getElementById('subnet-hosts').textContent = hostBits <= 1 ? (hostBits === 0 ? 1 : 2) : Math.pow(2, hostBits) - 2;
}


// ========================================
// 8. SEARCH CONTROLLER
// ========================================

/**
 * Search Controller
 * Handles search functionality for filtering topics
 */
const SearchController = {
    searchToggle: null,
    searchBox: null,
    searchInput: null,
    searchClear: null,
    searchResults: null,
    sections: [],

    /**
     * Initialize search controller
     */
    init() {
        this.searchToggle = document.getElementById('search-toggle');
        this.searchBox = document.getElementById('search-box');
        this.searchInput = document.getElementById('search-input');
        this.searchClear = document.getElementById('search-clear');
        this.searchResults = document.getElementById('search-results');

        if (!this.searchToggle || !this.searchInput) return;

        // Gather all searchable sections
        this.gatherSections();
        this.bindEvents();
    },

    /**
     * Gather all sections with search data
     */
    gatherSections() {
        // Gather main sections with data-search-section
        const sectionElements = document.querySelectorAll('[data-search-section]');
        const mainSections = Array.from(sectionElements).map(el => {
            const tags = el.dataset.searchTags || '';
            const title = el.textContent.replace(/\s+/g, ' ').trim();
            const id = el.id;
            return {
                element: el,
                id: id,
                title: title.replace('/', '').trim(),
                tags: tags.toLowerCase(),
                searchText: (title + ' ' + tags).toLowerCase(),
                isSubsection: false
            };
        });

        // Gather all subsections (.subheadding with id)
        const subheadingElements = document.querySelectorAll('.subheadding[id]');
        const subSections = Array.from(subheadingElements).map(el => {
            const title = el.textContent.replace(/\s+/g, ' ').trim();
            const id = el.id;
            // Generate search tags from title
            const tags = title.toLowerCase();
            return {
                element: el,
                id: id,
                title: title,
                tags: tags,
                searchText: tags,
                isSubsection: true
            };
        });

        // Combine both arrays, subsections first for higher priority
        this.sections = [...subSections, ...mainSections];
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Toggle search box
        this.searchToggle.addEventListener('click', () => this.toggleSearchBox());
        
        // Search input
        this.searchInput.addEventListener('input', () => this.handleSearch());
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSearch();
            } else if (e.key === 'Enter') {
                // Navigate to first result
                const firstResult = this.searchResults.querySelector('.search-result-item');
                if (firstResult) {
                    firstResult.click();
                }
            }
        });

        // Clear button
        this.searchClear.addEventListener('click', () => this.clearSearch());

        // Close search when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.closeSearch();
            }
        });

        // Keyboard shortcut (Ctrl+K or Cmd+K)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.toggleSearchBox();
            }
        });
    },

    /**
     * Toggle search box visibility
     */
    toggleSearchBox() {
        const isActive = this.searchBox.classList.contains('active');
        if (!isActive) {
            UIManager.closeAll('search');
            this.searchBox.classList.add('active');
            this.searchInput.focus();
        } else {
            this.closeSearch();
        }
    },

    /**
     * Handle search input
     */
    handleSearch() {
        const query = this.searchInput.value.toLowerCase().trim();
        
        if (query.length < 2) {
            this.searchResults.classList.remove('active');
            this.searchResults.innerHTML = '';
            return;
        }

        const results = this.sections.filter(section => 
            section.searchText.includes(query)
        );

        this.displayResults(results, query);
    },

    /**
     * Display search results
     */
    displayResults(results, query) {
        this.searchResults.innerHTML = '';
        
        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-results-empty">
                    Keine Ergebnisse für "${query}"
                </div>
            `;
            this.searchResults.classList.add('active');
            return;
        }

        // Limit results to 15
        results.slice(0, 15).forEach(result => {
            const item = document.createElement('a');
            item.href = '#' + result.id;
            item.className = 'search-result-item';
            
            // Find matching tags
            const tags = result.tags.split(',').map(t => t.trim()).filter(t => t);
            const matchingTags = tags.filter(tag => tag.includes(query));
            
            // Show different label for subsections
            const typeLabel = result.isSubsection 
                ? '<span class="search-result-category search-result-sub">Thema</span>' 
                : '<span class="search-result-category">Bereich</span>';
            
            item.innerHTML = `
                <div class="search-result-title">${typeLabel}${this.highlightMatch(result.title, query)}</div>
                <div class="search-result-tags">
                    ${matchingTags.slice(0, 3).map(tag => 
                        `<span class="search-result-tag">${tag}</span>`
                    ).join('')}
                </div>
            `;

            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToSection(result);
            });

            this.searchResults.appendChild(item);
        });

        this.searchResults.classList.add('active');
    },

    /**
     * Highlight matching text
     */
    highlightMatch(text, query) {
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    },

    /**
     * Escape regex special characters
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    /**
     * Navigate to a section
     */
    navigateToSection(result) {
        this.closeSearch();
        
        // Scroll to section
        const targetElement = document.getElementById(result.id);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Add highlight effect
            targetElement.classList.add('search-highlight');
            setTimeout(() => {
                targetElement.classList.remove('search-highlight');
            }, 1500);
        }
    },

    /**
     * Clear search
     */
    clearSearch() {
        this.searchInput.value = '';
        this.searchResults.classList.remove('active');
        this.searchResults.innerHTML = '';
        this.searchInput.focus();
    },

    /**
     * Close search
     */
    closeSearch() {
        this.searchBox.classList.remove('active');
        this.searchResults.classList.remove('active');
        this.searchInput.value = '';
        this.searchResults.innerHTML = '';
    }
};


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

// ========================================
// INITIALIZATION
// ========================================

/**
 * Initialize all modules when DOM is ready
 */
// ========================================
// STICKY SIDEBAR CONTROLLER
// ========================================

const StickySidebarController = {
    sidebars: [],
    navHeight: 56,
    offset: 16,
    
    init() {
        // Nur auf Desktop
        if (window.innerWidth <= 1024) return;
        
        this.sidebars = Array.from(document.querySelectorAll('.container0 > .sidebar-sticky-wrapper'));
        if (this.sidebars.length === 0) return;
        
        // Initiale Breiten speichern
        this.sidebars.forEach(sidebar => {
            const container = sidebar.closest('.container0');
            if (container) {
                sidebar._containerWidth = container.offsetWidth;
                sidebar.style.width = sidebar._containerWidth + 'px';
            }
        });
        
        // Scroll-Handler mit throttle
        window.addEventListener('scroll', throttle(() => this.handleScroll(), 16), { passive: true });
        window.addEventListener('resize', throttle(() => this.handleResize(), 100));
        
        this.handleScroll();
    },
    
    handleScroll() {
        if (window.innerWidth <= 1024) return;
        
        const scrollTop = window.scrollY;
        const viewportTop = scrollTop + this.navHeight + this.offset;
        
        this.sidebars.forEach(sidebar => {
            const container = sidebar.closest('.container0');
            const grid = container?.closest('.grid');
            if (!container || !grid) return;
            
            const gridRect = grid.getBoundingClientRect();
            const gridTop = scrollTop + gridRect.top;
            const gridBottom = gridTop + grid.offsetHeight;
            const sidebarHeight = sidebar.offsetHeight;
            
            // Position innerhalb des Grid-Bereichs berechnen
            const stickyTop = this.navHeight + this.offset;
            const maxStickyBottom = gridBottom - sidebarHeight;
            
            if (scrollTop < gridTop - stickyTop) {
                // Vor dem Grid: Normal positioniert
                sidebar.classList.remove('is-sticky', 'is-bottom');
                sidebar.style.top = '';
            } else if (scrollTop + stickyTop + sidebarHeight > gridBottom) {
                // Am Ende des Grid: An unterer Kante fixiert
                sidebar.classList.remove('is-sticky');
                sidebar.classList.add('is-bottom');
            } else {
                // Im Grid: Sticky
                sidebar.classList.add('is-sticky');
                sidebar.classList.remove('is-bottom');
            }
        });
    },
    
    handleResize() {
        if (window.innerWidth <= 1024) {
            // Mobile: Alle Klassen entfernen
            this.sidebars.forEach(sidebar => {
                sidebar.classList.remove('is-sticky', 'is-bottom');
                sidebar.style.width = '';
            });
            return;
        }
        
        // Breiten neu berechnen
        this.sidebars.forEach(sidebar => {
            const container = sidebar.closest('.container0');
            if (container) {
                sidebar._containerWidth = container.offsetWidth;
                sidebar.style.width = sidebar._containerWidth + 'px';
            }
        });
        
        this.handleScroll();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    NavigationController.init();
    MicrographicController.init();
    ExerciseController.init();
    ChecklistController.init();
    TimerController.init();
    CaseStudyController.init();
    CalcController.init();
    SearchController.init();
    SectionController.init();
    StickySidebarController.init();
});

