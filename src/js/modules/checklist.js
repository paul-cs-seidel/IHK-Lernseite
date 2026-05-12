'use strict';

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


