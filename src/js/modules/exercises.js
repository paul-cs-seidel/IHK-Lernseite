'use strict';

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


