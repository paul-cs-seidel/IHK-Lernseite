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

        this.bindEvents();
    },

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Burger toggle change
        this.burgerToggle.addEventListener('change', () => this.handleToggle());

        // Navigation links click
        document.querySelectorAll('.nav-links-container .nav-bar-links').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavLinkClick(e, link));
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
        }
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
 * Manages checklist with localStorage persistence
 */
const ChecklistController = {
    storageKey: 'ihk-checkliste',

    /**
     * Initialize checklist
     */
    init() {
        this.loadChecklist();
        this.bindEvents();
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        document.querySelectorAll('.checkliste input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', () => this.saveChecklist());
        });

        // Reset button
        const resetBtn = document.querySelector('.reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetChecklist());
        }
    },

    /**
     * Update counter display
     */
    updateCounter() {
        const checkboxes = document.querySelectorAll('.checkliste input[type="checkbox"]');
        const checked = document.querySelectorAll('.checkliste input[type="checkbox"]:checked').length;
        const counter = document.getElementById('checked-count');
        
        if (counter) {
            counter.textContent = checked;
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
        this.updateCounter();
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
        
        this.updateCounter();
    },

    /**
     * Reset all checkboxes
     */
    resetChecklist() {
        document.querySelectorAll('.checkliste input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        
        localStorage.removeItem(this.storageKey);
        this.updateCounter();
    }
};


// ========================================
// 5. PRÜFUNGS-TIMER
// ========================================

/**
 * Timer Controller
 * Countdown timer for exam simulation
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
        if (!timerBox) return;

        this.updateDisplay();
        this.bindEvents();
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
