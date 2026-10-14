import { docReady } from './utils.js';
import navbarInit from './bootstrap-navbar.js';
import detectorInit from './detector.js';
import scrollToTop from './scroll-to-top.js';

// /* -------------------------------------------------------------------------- */
// /*                            Theme Initialization                            */
// /* -------------------------------------------------------------------------- */

docReady(navbarInit);
docReady(detectorInit);
docReady(scrollToTop);
