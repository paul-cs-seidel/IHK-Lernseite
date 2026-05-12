'use strict';

// ========================================
// STICKY SIDEBAR CONTROLLER
// ========================================

const StickySidebarController = {
    sidebars: [],
    navHeight: 56,
    offset: 16,
    
    init() {
        // Nur auf Desktop
        if (window.innerWidth <= 1024) return;
        
        this.sidebars = Array.from(document.querySelectorAll('.container0 > .sidebar-sticky-wrapper'));
        if (this.sidebars.length === 0) return;
        
        // Initiale Breiten speichern
        this.sidebars.forEach(sidebar => {
            const container = sidebar.closest('.container0');
            if (container) {
                sidebar._containerWidth = container.offsetWidth;
                sidebar.style.width = sidebar._containerWidth + 'px';
            }
        });
        
        // Scroll-Handler mit throttle
        window.addEventListener('scroll', throttle(() => this.handleScroll(), 16), { passive: true });
        window.addEventListener('resize', throttle(() => this.handleResize(), 100));
        
        this.handleScroll();
    },
    
    handleScroll() {
        if (window.innerWidth <= 1024) return;
        
        const scrollTop = window.scrollY;
        const viewportTop = scrollTop + this.navHeight + this.offset;
        
        this.sidebars.forEach(sidebar => {
            const container = sidebar.closest('.container0');
            const grid = container?.closest('.grid');
            if (!container || !grid) return;
            
            const gridRect = grid.getBoundingClientRect();
            const gridTop = scrollTop + gridRect.top;
            const gridBottom = gridTop + grid.offsetHeight;
            const sidebarHeight = sidebar.offsetHeight;
            
            // Position innerhalb des Grid-Bereichs berechnen
            const stickyTop = this.navHeight + this.offset;
            const maxStickyBottom = gridBottom - sidebarHeight;
            
            if (scrollTop < gridTop - stickyTop) {
                // Vor dem Grid: Normal positioniert
                sidebar.classList.remove('is-sticky', 'is-bottom');
                sidebar.style.top = '';
            } else if (scrollTop + stickyTop + sidebarHeight > gridBottom) {
                // Am Ende des Grid: An unterer Kante fixiert
                sidebar.classList.remove('is-sticky');
                sidebar.classList.add('is-bottom');
            } else {
                // Im Grid: Sticky
                sidebar.classList.add('is-sticky');
                sidebar.classList.remove('is-bottom');
            }
        });
    },
    
    handleResize() {
        if (window.innerWidth <= 1024) {
            // Mobile: Alle Klassen entfernen
            this.sidebars.forEach(sidebar => {
                sidebar.classList.remove('is-sticky', 'is-bottom');
                sidebar.style.width = '';
            });
            return;
        }
        
        // Breiten neu berechnen
        this.sidebars.forEach(sidebar => {
            const container = sidebar.closest('.container0');
            if (container) {
                sidebar._containerWidth = container.offsetWidth;
                sidebar.style.width = sidebar._containerWidth + 'px';
            }
        });
        
        this.handleScroll();
    }
};

