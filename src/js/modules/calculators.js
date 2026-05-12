'use strict';

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


