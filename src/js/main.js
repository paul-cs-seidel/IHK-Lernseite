'use strict';

/**
 * ========================================
 * MAIN.JS - Entry Point
 * ========================================
 *
 * Initialisiert alle Module nach DOM-Ready.
 * Module liegen in src/js/modules/
 *
 * @author Cedric Seidel
 * @version 2.1.0
 */

document.addEventListener('DOMContentLoaded', () => {
    NavigationController.init();
    MicrographicController.init();
    ExerciseController.init();
    ChecklistController.init();
    TimerController.init();
    CaseStudyController.init();
    CalcController.init();
    SearchController.init();
    SectionController.init();
    StickySidebarController.init();
});
