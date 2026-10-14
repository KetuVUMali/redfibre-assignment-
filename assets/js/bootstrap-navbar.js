import utils from './utils.js';
/*-----------------------------------------------
|   Top navigation opacity on scroll
-----------------------------------------------*/
const navbarInit = () => {
  const Selector = {
    NAVBAR: '[data-navbar-on-scroll]',
    NAVBAR_COLLAPSE: '.navbar-collapse',
    NAVBAR_TOGGLER: '.navbar-toggler',

  };

  const ClassNames = {
    COLLAPSED: 'collapsed',
  };

  const Events = {
    SCROLL: 'scroll',
    SHOW_BS_COLLAPSE: 'show.bs.collapse',
    HIDE_BS_COLLAPSE: 'hide.bs.collapse',
    HIDDEN_BS_COLLAPSE: 'hidden.bs.collapse',
  };

  const DataKey = {
    NAVBAR_ON_SCROLL: 'navbar-light-on-scroll'
  };
  const navbar = document.querySelector(Selector.NAVBAR);
  if (navbar) {
    const windowHeight = window.innerHeight;
    const html = document.documentElement;
    const navbarCollapse = navbar.querySelector(Selector.NAVBAR_COLLAPSE);
    const allColors = { ...utils.colors, ...utils.grays };

    const name = utils.getData(navbar, DataKey.NAVBAR_ON_SCROLL);
    const colorName = Object.keys(allColors).includes(name) ? name : 'light';
    const color = allColors[colorName];
    const bgClassName = `bg-${colorName}`;
    const paddingName = 'padding-transition';
    const colorRgb = utils.hexToRgb(color);
    const { backgroundImage } = window.getComputedStyle(navbar);
    const transition = 'background-color,padding 0.35s ease';
    navbar.style.backgroundImage = 'none';

    // Change navbar background color on scroll
    window.addEventListener(Events.SCROLL, () => {
      const { scrollTop } = html;

      // Keep the navbar background consistent across desktop and mobile.
      const scrollableHeight = html.scrollHeight - window.innerHeight;
      const scrollProgress = scrollableHeight > 0 ? scrollTop / scrollableHeight : 0;
      const isScrolled = scrollProgress >= 0.02;
      if (isScrolled) {
        navbar.classList.add('navbar-glass', 'backdrop');
        navbar.style.backgroundColor = 'antiquewhite';
        return;
      }
      navbar.classList.remove('navbar-glass', 'backdrop');
      navbar.style.backgroundColor = '';

      // Preserve the original mobile navbar behavior before the threshold.
      if (window.innerWidth >= 992) return;

      let alpha = (scrollTop / windowHeight) * 0.35;
      // Add class on scroll
      navbar.classList.add('backdrop');
      if (alpha === 0) {
        navbar.classList.remove('backdrop');
      }
      alpha >= 1 && (alpha = 1);
      navbar.style.backgroundColor = `rgba(${colorRgb[0]}, ${colorRgb[1]}, ${colorRgb[2]}, ${alpha})`;
      navbar.style.backgroundImage = (alpha > 0 || utils.hasClass(navbarCollapse, 'show')) ? backgroundImage : 'none';
      (alpha > 0 || utils.hasClass(navbarCollapse, 'show')) ? navbar.classList.add(paddingName) : navbar.classList.remove(paddingName);
    });

    // Apply the correct state if the browser restores a scrolled position.
    window.dispatchEvent(new Event(Events.SCROLL));

    // Toggle bg class on window resize
    utils.resize(() => {
      const breakPoint = utils.getBreakpoint(navbar);
      if (window.innerWidth > breakPoint) {
        navbar.style.backgroundImage = html.scrollTop ? backgroundImage : 'none';
        // navbar.style.transition = 'none';
      } else if (
        !utils.hasClass(
          navbar.querySelector(Selector.NAVBAR_TOGGLER),
          ClassNames.COLLAPSED
        )
      ) {
        // navbar.classList.add(bgClassName);
        // navbar.classList.add(paddingName);
        navbar.style.backgroundImage = backgroundImage;
      }

      if (window.innerWidth <= breakPoint) {
        // navbar.style.transition = utils.hasClass(navbarCollapse, 'show') ? transition : 'none';
      }

    });

    navbarCollapse.addEventListener(Events.SHOW_BS_COLLAPSE, () => {
      navbar.classList.add(bgClassName);
      // navbar.classList.add(paddingName);
      navbar.style.backgroundImage = backgroundImage;
      navbar.style.transition = transition;
    });

    navbarCollapse.addEventListener(Events.HIDE_BS_COLLAPSE, () => {
      navbar.classList.remove(bgClassName);
      // navbar.classList.remove(paddingName);
      !html.scrollTop && (navbar.style.backgroundImage = 'none');
    });

    navbarCollapse.addEventListener(Events.HIDDEN_BS_COLLAPSE, () => {
      // navbar.style.transition = 'none';
    });

  }

};

export default navbarInit;
