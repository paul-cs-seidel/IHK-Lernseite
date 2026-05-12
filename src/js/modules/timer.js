'use strict';

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


