'use strict';

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

