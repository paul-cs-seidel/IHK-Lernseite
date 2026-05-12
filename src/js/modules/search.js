'use strict';

// ========================================
// 8. SEARCH CONTROLLER
// ========================================

/**
 * Search Controller
 * Handles search functionality for filtering topics
 */
const SearchController = {
    searchToggle: null,
    searchBox: null,
    searchInput: null,
    searchClear: null,
    searchResults: null,
    sections: [],

    /**
     * Initialize search controller
     */
    init() {
        this.searchToggle = document.getElementById('search-toggle');
        this.searchBox = document.getElementById('search-box');
        this.searchInput = document.getElementById('search-input');
        this.searchClear = document.getElementById('search-clear');
        this.searchResults = document.getElementById('search-results');

        if (!this.searchToggle || !this.searchInput) return;

        // Gather all searchable sections
        this.gatherSections();
        this.bindEvents();
    },

    /**
     * Gather all sections with search data
     */
    gatherSections() {
        // Gather main sections with data-search-section
        const sectionElements = document.querySelectorAll('[data-search-section]');
        const mainSections = Array.from(sectionElements).map(el => {
            const tags = el.dataset.searchTags || '';
            const title = el.textContent.replace(/\s+/g, ' ').trim();
            const id = el.id;
            return {
                element: el,
                id: id,
                title: title.replace('/', '').trim(),
                tags: tags.toLowerCase(),
                searchText: (title + ' ' + tags).toLowerCase(),
                isSubsection: false
            };
        });

        // Gather all subsections (.subheadding with id)
        const subheadingElements = document.querySelectorAll('.subheadding[id]');
        const subSections = Array.from(subheadingElements).map(el => {
            const title = el.textContent.replace(/\s+/g, ' ').trim();
            const id = el.id;
            // Generate search tags from title
            const tags = title.toLowerCase();
            return {
                element: el,
                id: id,
                title: title,
                tags: tags,
                searchText: tags,
                isSubsection: true
            };
        });

        // Combine both arrays, subsections first for higher priority
        this.sections = [...subSections, ...mainSections];
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Toggle search box
        this.searchToggle.addEventListener('click', () => this.toggleSearchBox());
        
        // Search input
        this.searchInput.addEventListener('input', () => this.handleSearch());
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSearch();
            } else if (e.key === 'Enter') {
                // Navigate to first result
                const firstResult = this.searchResults.querySelector('.search-result-item');
                if (firstResult) {
                    firstResult.click();
                }
            }
        });

        // Clear button
        this.searchClear.addEventListener('click', () => this.clearSearch());

        // Close search when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.closeSearch();
            }
        });

        // Keyboard shortcut (Ctrl+K or Cmd+K)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.toggleSearchBox();
            }
        });
    },

    /**
     * Toggle search box visibility
     */
    toggleSearchBox() {
        const isActive = this.searchBox.classList.contains('active');
        if (!isActive) {
            UIManager.closeAll('search');
            this.searchBox.classList.add('active');
            this.searchInput.focus();
        } else {
            this.closeSearch();
        }
    },

    /**
     * Handle search input
     */
    handleSearch() {
        const query = this.searchInput.value.toLowerCase().trim();
        
        if (query.length < 2) {
            this.searchResults.classList.remove('active');
            this.searchResults.innerHTML = '';
            return;
        }

        const results = this.sections.filter(section => 
            section.searchText.includes(query)
        );

        this.displayResults(results, query);
    },

    /**
     * Display search results
     */
    displayResults(results, query) {
        this.searchResults.innerHTML = '';
        
        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-results-empty">
                    Keine Ergebnisse für "${query}"
                </div>
            `;
            this.searchResults.classList.add('active');
            return;
        }

        // Limit results to 15
        results.slice(0, 15).forEach(result => {
            const item = document.createElement('a');
            item.href = '#' + result.id;
            item.className = 'search-result-item';
            
            // Find matching tags
            const tags = result.tags.split(',').map(t => t.trim()).filter(t => t);
            const matchingTags = tags.filter(tag => tag.includes(query));
            
            // Show different label for subsections
            const typeLabel = result.isSubsection 
                ? '<span class="search-result-category search-result-sub">Thema</span>' 
                : '<span class="search-result-category">Bereich</span>';
            
            item.innerHTML = `
                <div class="search-result-title">${typeLabel}${this.highlightMatch(result.title, query)}</div>
                <div class="search-result-tags">
                    ${matchingTags.slice(0, 3).map(tag => 
                        `<span class="search-result-tag">${tag}</span>`
                    ).join('')}
                </div>
            `;

            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToSection(result);
            });

            this.searchResults.appendChild(item);
        });

        this.searchResults.classList.add('active');
    },

    /**
     * Highlight matching text
     */
    highlightMatch(text, query) {
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    },

    /**
     * Escape regex special characters
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    /**
     * Navigate to a section
     */
    navigateToSection(result) {
        this.closeSearch();
        
        // Scroll to section
        const targetElement = document.getElementById(result.id);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Add highlight effect
            targetElement.classList.add('search-highlight');
            setTimeout(() => {
                targetElement.classList.remove('search-highlight');
            }, 1500);
        }
    },

    /**
     * Clear search
     */
    clearSearch() {
        this.searchInput.value = '';
        this.searchResults.classList.remove('active');
        this.searchResults.innerHTML = '';
        this.searchInput.focus();
    },

    /**
     * Close search
     */
    closeSearch() {
        this.searchBox.classList.remove('active');
        this.searchResults.classList.remove('active');
        this.searchInput.value = '';
        this.searchResults.innerHTML = '';
    }
};


