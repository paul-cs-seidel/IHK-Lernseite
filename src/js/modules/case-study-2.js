'use strict';

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

