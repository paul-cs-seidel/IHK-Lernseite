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

        // Lösungen Toggle
        document.querySelectorAll('.loesung-header').forEach(header => {
            header.addEventListener('click', (e) => {
                e.stopPropagation();
                const box = header.parentElement;
                box.classList.toggle('open');
            });
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
            const state = JSON.parse(saved);
            
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
            const state = JSON.parse(saved);
            
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
    timerSections: ['pruefungscheck', 'uebungen'],

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
        
        // Check visibility on scroll
        window.addEventListener('scroll', () => this.checkVisibility());
    },

    /**
     * Check if timer button should be visible
     */
    checkVisibility() {
        const openBtn = document.getElementById('open-timer-btn');
        if (!openBtn) return;

        let inTimerSection = false;
        
        for (const sectionId of this.timerSections) {
            const section = document.getElementById(sectionId);
            if (section) {
                const rect = section.getBoundingClientRect();
                const sectionTop = rect.top;
                
                // Find the next major section (next <span> with id after this section)
                let nextSection = section.nextElementSibling;
                while (nextSection && (nextSection.tagName !== 'SPAN' || !nextSection.id)) {
                    nextSection = nextSection.nextElementSibling;
                }
                
                // Check if we're within the section
                if (sectionTop < window.innerHeight && (!nextSection || nextSection.getBoundingClientRect().top > 0)) {
                    inTimerSection = true;
                    break;
                }
            }
        }

        // Show/hide timer button
        if (inTimerSection) {
            openBtn.classList.add('visible');
        } else {
            openBtn.classList.remove('visible');
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
            document.getElementById('timer-box').classList.remove('hidden');
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
     * Hide timer
     */
    hide() {
        this.pause();
        document.getElementById('timer-box').classList.add('hidden');
        this.seconds = this.startTime;
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
    
    resultDiv.innerHTML = `
        <table class="sql-tabelle">
            <tr><td><b>Präfix:</b></td><td>/${praefix}</td></tr>
            <tr><td><b>Subnetzmaske:</b></td><td>${mask.join('.')}</td></tr>
            <tr><td><b>Host-Bits:</b></td><td>${hostBits}</td></tr>
            <tr><td><b>Adressen gesamt:</b></td><td>${totalHosts.toLocaleString()}</td></tr>
            <tr><td><b>Nutzbare Hosts:</b></td><td>${nutzbarHosts.toLocaleString()}</td></tr>
            <tr><td><b>Binär-Maske:</b></td><td>${'1'.repeat(praefix)}${'0'.repeat(32-praefix)}</td></tr>
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
// INITIALIZATION
// ========================================

/**
 * Initialize all modules when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    NavigationController.init();
    MicrographicController.init();
    ExerciseController.init();
    ChecklistController.init();
    TimerController.init();
});
