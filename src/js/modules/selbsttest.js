'use strict';

// ========================================
// 6. SELBSTTEST FUNKTIONALITÄT
// ========================================

/**
 * Check self-test answers
 * @param {HTMLElement} button - The check button clicked
 */
function checkSelbsttest(button) {
    const container = button.closest('.selbsttest-box') || button.closest('.pruefung-simulation');
    if (!container) return;
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
    const container = button.closest('.selbsttest-box') || button.closest('.pruefung-simulation');
    if (!container) return;
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


