# IHK-Lernseite — AP1 Prüfungsvorbereitung

[![Live ansehen](https://img.shields.io/badge/Live%20ansehen-%E2%86%92-252525?style=for-the-badge)](https://cedricseidel.github.io/IHK-Lernseite/)

Kostenlose, interaktive Lernseite zur Vorbereitung auf die IHK Abschlussprüfung Teil 1 (AP1) für Fachinformatiker Systemintegration & Anwendungsentwicklung.

---

## Themengebiete

| Kategorie | Inhalte |
|---|---|
| **AP1 Grundlagen** | Was ist die AP1, Prüfungsinhalte, Aufgabentypen, Szenario-Aufgaben |
| **IT-Rollen** | Analysieren, Entscheiden, Dokumentieren, A-E-D-Schema |
| **Netzwerke** | OSI-Modell, TCP/IP, IPv4/IPv6, Subnetting, VLAN, VPN, DHCP, DNS, NAT |
| **Wirtschaftlichkeit** | Kostenarten, Nutzwertanalyse, TCO, Amortisation, Handelskalkulation, BWL-Kennzahlen |
| **Projektmanagement** | Wasserfall, Scrum, Agile, Netzplan, Gantt, PSP, Lasten-/Pflichtenheft |
| **Teamarbeit** | Tuckman-Modell, Kommunikation, Vier-Ohren-Modell, Betriebsrat |
| **UML & BPMN** | Aktivitäts-, Use-Case-, Klassen-, Sequenzdiagramm, BPMN |
| **Datenschutz** | DSGVO, Betroffenenrechte, TOM, Rechtsgrundlagen |
| **IT-Sicherheit** | CIA-Schutzziele, Verschlüsselung, Hash-Werte, BSI-Grundschutz, Firewall, Backup |
| **Hardware** | CPU, RAM, RAID, USV, Von-Neumann-Architektur, Virtualisierung |
| **Betriebssysteme** | OS-Aufgaben, Lizenzen, Deployment |
| **Datenbanken** | ER-Modell, Normalisierung, SQL-Übungen |
| **Cloud & Virtualisierung** | VM vs. Container, Cloud-Modelle (IaaS/PaaS/SaaS) |
| **Softwareentwicklung** | Paradigmen, Algorithmen, Testverfahren, Pseudocode |
| **Verträge & Recht** | Vertragsarten, SLA, Gewährleistung, Urheberrecht, AGB, EVB-IT |
| **Change Management** | ITIL, PDCA, Kaizen, Lewin-Modell |
| **Marketing & Märkte** | Marktformen, ABC-Analyse, Produktlebenszyklus, Marketing-Mix |
| **KI** | Grundlagen, Einsatzgebiete, Ethik, KI am Arbeitsplatz |
| **Prüfungs-Check** | Top 10 Themen, Formeln, Last-Minute-Tipps, häufige Fehler |
| **Übungsaufgaben** | Netzplan, Subnetting, Nutzwertanalyse, Verschlüsselung, SQL, DSGVO u. v. m. |

---

## Features

- Interaktiver **Prüfungs-Timer** mit Countdown
- **Selbsttests** mit sofortigem Feedback
- **Checkliste** mit lokalem Speicher (localStorage)
- **Volltextsuche** über alle Inhalte
- **Druckoptimierung** für alle Lernkarten
- Responsive Design — mobilfreundlich

---

## Projektstruktur

```
IHK-Lernseite/
├── index.html                  # Single-Page-App Einstiegspunkt
└── src/
    ├── assets/                 # Logo & Icons
    │   ├── logo.svg
    │   ├── logo-icon.svg
    │   └── apple-touch-icon.png
    ├── styles/
    │   ├── base/               # Design-Grundlage
    │   │   ├── tokens.css      # Design Tokens & CSS-Variablen
    │   │   ├── base.css        # CSS-Reset & Basis-Styles
    │   │   └── print.css       # Druckoptimierung
    │   ├── layout/             # Seitenstruktur
    │   │   ├── layout.css      # Grid-System & Hero
    │   │   └── sections.css    # Aufklappbare Sektionen
    │   ├── components/         # UI-Komponenten
    │   │   ├── navbar.css      # Navigation & Burger-Menü
    │   │   ├── search.css      # Suchleiste
    │   │   ├── components.css  # Wiederverwendbare UI-Elemente
    │   │   ├── exercises.css   # Übungsaufgaben & Selbsttests
    │   │   └── timer.css       # Prüfungs-Timer
    │   └── main.css            # CSS-Einstiegspunkt (importiert alle Module)
    └── js/
        └── main.js             # Alle JavaScript-Funktionen
```

---

## Lokale Nutzung

Da es sich um eine reine statische Seite handelt, reicht es aus, `index.html` direkt im Browser zu öffnen — kein Build-Step notwendig.

```bash
git clone https://github.com/CedricSeidel/IHK-Lernseite.git
cd IHK-Lernseite
open index.html
```

---

## Autor

**Cedric Seidel** — © 2024–2026 Alle Rechte vorbehalten.
