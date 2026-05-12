'use strict';

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

