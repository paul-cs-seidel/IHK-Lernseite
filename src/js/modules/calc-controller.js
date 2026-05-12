'use strict';

// ========================================
// IT-RECHNER (Programmer Calculator)
// ========================================

const CalcController = {
    currentMode: 'convert',
    expression: '',

    init() {
        const calcBox = document.getElementById('calc-box');
        const openBtn = document.getElementById('open-calc-btn');
        if (!calcBox || !openBtn) return;

        this.bindEvents();
    },

    bindEvents() {
        // Open/Close
        document.getElementById('open-calc-btn')?.addEventListener('click', () => {
            UIManager.closeAll('calc');
            document.getElementById('calc-box')?.classList.remove('hidden');
            document.getElementById('open-calc-btn')?.classList.add('hidden');
        });

        document.getElementById('calc-close')?.addEventListener('click', () => {
            document.getElementById('calc-box')?.classList.add('hidden');
            document.getElementById('open-calc-btn')?.classList.remove('hidden');
        });

        // Mode buttons
        document.querySelectorAll('.calc-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.calc-mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.setMode(btn.dataset.mode);
            });
        });

        // Conversion inputs
        ['dec', 'bin', 'hex', 'oct'].forEach(type => {
            const input = document.getElementById(`calc-${type}`);
            if (input) {
                input.addEventListener('input', () => this.convertFrom(type, input.value));
            }
        });
    },

    setMode(mode) {
        this.currentMode = mode;
        // Hide all panels
        document.getElementById('calc-convert-mode').style.display = 'none';
        document.getElementById('calc-calc-mode').style.display = 'none';
        document.getElementById('calc-subnet-mode').style.display = 'none';
        
        // Show selected panel
        if (mode === 'convert') document.getElementById('calc-convert-mode').style.display = 'block';
        if (mode === 'calc') document.getElementById('calc-calc-mode').style.display = 'block';
        if (mode === 'subnet') document.getElementById('calc-subnet-mode').style.display = 'block';
    },

    convertFrom(type, value) {
        if (value === '') {
            ['dec', 'bin', 'hex', 'oct'].forEach(t => {
                if (t !== type) document.getElementById(`calc-${t}`).value = '';
            });
            return;
        }

        let decimal;
        try {
            switch(type) {
                case 'dec': decimal = parseInt(value, 10); break;
                case 'bin': decimal = parseInt(value, 2); break;
                case 'hex': decimal = parseInt(value, 16); break;
                case 'oct': decimal = parseInt(value, 8); break;
            }

            if (isNaN(decimal) || decimal < 0) return;

            if (type !== 'dec') document.getElementById('calc-dec').value = decimal;
            if (type !== 'bin') document.getElementById('calc-bin').value = decimal.toString(2);
            if (type !== 'hex') document.getElementById('calc-hex').value = decimal.toString(16).toUpperCase();
            if (type !== 'oct') document.getElementById('calc-oct').value = decimal.toString(8);
        } catch(e) { /* ignore */ }
    }
};

// Global calc functions for onclick handlers
function calcKey(key) {
    const display = document.getElementById('calc-expression');
    if (display) display.value = (display.value || '') + key;
}

function calcClear() {
    const display = document.getElementById('calc-expression');
    if (display) display.value = '';
    const result = document.getElementById('calc-result-value');
    if (result) result.textContent = '—';
}

function calcEvaluate() {
    const display = document.getElementById('calc-expression');
    const result = document.getElementById('calc-result-value');
    if (!display || !result) return;
    
    try {
        let expr = display.value.replace(/\*\*/g, '**');
        let res = Function('"use strict"; return (' + expr + ')')();
        result.textContent = res;
    } catch(e) {
        result.textContent = 'Fehler';
    }
}

function calcSubnet() {
    const ipInput = document.getElementById('calc-subnet-ip')?.value || '';
    const cidrInput = document.getElementById('calc-subnet-cidr')?.value || '';

    const ipParts = ipInput.split('.').map(n => parseInt(n));
    const cidr = parseInt(cidrInput);

    if (ipParts.length !== 4 || ipParts.some(p => isNaN(p) || p < 0 || p > 255) || isNaN(cidr) || cidr < 0 || cidr > 32) {
        document.getElementById('subnet-network').textContent = 'Ungültig';
        document.getElementById('subnet-broadcast').textContent = '—';
        document.getElementById('subnet-mask').textContent = '—';
        document.getElementById('subnet-hosts').textContent = '—';
        return;
    }

    const hostBits = 32 - cidr;
    const mask = cidr === 0 ? 0 : (0xFFFFFFFF << hostBits) >>> 0;
    const ipInt = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
    const networkInt = (ipInt & mask) >>> 0;
    const broadcastInt = (networkInt | (~mask >>> 0)) >>> 0;

    const toIP = n => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');

    document.getElementById('subnet-network').textContent = toIP(networkInt);
    document.getElementById('subnet-broadcast').textContent = toIP(broadcastInt);
    document.getElementById('subnet-mask').textContent = toIP(mask);
    document.getElementById('subnet-hosts').textContent = hostBits <= 1 ? (hostBits === 0 ? 1 : 2) : Math.pow(2, hostBits) - 2;
}


