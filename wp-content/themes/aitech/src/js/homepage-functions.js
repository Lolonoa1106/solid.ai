
document.addEventListener('DOMContentLoaded', () => {
  const teamBlock = document.querySelector('.teams-section');
  if (!teamBlock) return;

  const tabsContent = document.querySelectorAll('.teams-section .tab-body');
  const tabsBtn = document.querySelectorAll('.teams-section .btn-list .tab-btn');

  tabsBtn[0].classList.add('active');
  tabsContent[0].classList.add('active');

  const swiperInstances = [];

  tabsContent.forEach(content => {
    const tabTeamContainer = content.querySelector('.js-team-slider');
    if (tabTeamContainer) {
      const swiper = new Swiper(tabTeamContainer, {
        slidesPerView: "auto",
        spaceBetween: 16,
        watchOverflow: true,
        speed: 1000,
        navigation: {
          nextEl: content.querySelector('.js-team-button-next'),
          prevEl: content.querySelector('.js-team-button-prev'),
        },
        pagination: {
          el: ".pagination-team",
          type: "custom",
          renderCustom: function (swiper, current, total) {
            return '<span>' + (current) + '</span>' + ' <span>//</span> ' + '<span>' + (total) + '</span>';
          }
        },
      });
      swiperInstances.push(swiper);
    }
  });

  tabsBtn.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      tabsBtn.forEach(btn => btn.classList.remove('active'));
      tabsContent.forEach(content => content.classList.remove('active'));

      tab.classList.add('active');
      tabsContent[index].classList.add('active');

      const swiper = swiperInstances[index];
      if (swiper) {
        swiper.slideTo(0);
      }
    });
  });

  function destroySwiper(swiper) {
    if (swiper !== null) {
      swiper.destroy();
    }
  }

  function checkSliderAndScreenWidth() {
    if (window.innerWidth > 922) {

      swiperInstances.forEach(swiper => destroySwiper(swiper));
    } else {

      swiperInstances.forEach((swiper, index) => {
        const tabSliderContainer = tabsContent[index].querySelector('.js-team-slider');
        if (!swiper && tabSliderContainer) {
          const newSwiper2 = new Swiper(tabSliderContainer, {
            slidesPerView: "auto",
            spaceBetween: 16,
            watchOverflow: true,
            speed: 1000,
            pagination: {
              el: ".swiper-pagination",
              clickable: true,
            },
          });
          swiperInstances[index] = newSwiper2;
        }
      });
    }
  }

  window.addEventListener('resize', checkSliderAndScreenWidth);

  checkSliderAndScreenWidth();

  const slides = document.querySelectorAll('.js-team-slider .swiper-slide');
  slides.forEach((slide) => {
    slide.addEventListener('click', () => {
      if (slide.classList.contains('content-active')) {

        slide.classList.remove('content-active');
      } else {

        slides.forEach(s => s.classList.remove('content-active'));

        slide.classList.add('content-active');
      }
    });
  });


  const partnersBlock = document.querySelector('.partners-section');
  if (!partnersBlock) return;

  const partnersTabsContent = document.querySelectorAll('.partners-section .tab-body');
  const partnersTabsBtn = document.querySelectorAll('.partners-section .btn-list .tab-btn');

  partnersTabsBtn[0].classList.add('active');
  partnersTabsContent[0].classList.add('active');

  partnersTabsBtn.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      partnersTabsBtn.forEach(btn => btn.classList.remove('active'));
      partnersTabsContent.forEach(content => content.classList.remove('active'));

      tab.classList.add('active');
      partnersTabsContent[index].classList.add('active');
    });
  });
  
  const roadmapTabsContent = document.querySelectorAll('.home-roadmap .tab-body');
  const roadmapTabsBtn = document.querySelectorAll('.home-roadmap .btn-list .tab-btn');

  roadmapTabsBtn[1].classList.add('active');
  roadmapTabsContent[1].classList.add('active');

  roadmapTabsBtn.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      roadmapTabsBtn.forEach(btn => btn.classList.remove('active'));
      roadmapTabsContent.forEach(content => content.classList.remove('active'));

      tab.classList.add('active');
      roadmapTabsContent[index].classList.add('active');
    });
  });

  const logoItems = document.querySelectorAll('.partners-section .logo-item');
  let animationInterval;


  function toggleAnimation() {
    logoItems.forEach(item => {
      if (item.classList.contains('back-side-active')) {
        item.classList.add('front-side-active');
        item.classList.remove('back-side-active');
      } else {
        item.classList.remove('front-side-active');
        item.classList.add('back-side-active');
      }
    });
  }

  function startAnimation() {
    animationInterval = setInterval(toggleAnimation, 4000);
  }

  function stopAnimation() {
    clearInterval(animationInterval);
  }

  logoItems.forEach(item => {
    item.addEventListener('mouseenter', stopAnimation);
    item.addEventListener('mouseleave', startAnimation);
  });

  startAnimation();

  const powerfulProductsHolder = document.querySelector('.powerful-products-holder');
  if (!powerfulProductsHolder) {
    return;
  }

  const items = document.querySelectorAll('.powerful-products-holder .item');

  items.forEach(item => {

    const video = item.querySelector('video');
    if (video) {

      item.addEventListener('mouseenter', () => {
        video.play();
      });
      item.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
      });
    }
  });


  const dataCenterSection = document.querySelector('.data-center');
  if (!dataCenterSection) return;

  const dataCenterTabsContent = document.querySelectorAll('.data-center .tab-body');
  const dataCenterTabsBtn = document.querySelectorAll('.data-center .btn-list .tab-btn');

  dataCenterTabsBtn[0].classList.add('active');
  dataCenterTabsContent[0].classList.add('active');

  dataCenterTabsBtn.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      dataCenterTabsBtn.forEach(btn => btn.classList.remove('active'));
      dataCenterTabsContent.forEach(content => content.classList.remove('active'));

      tab.classList.add('active');
      dataCenterTabsContent[index].classList.add('active');
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const unlockBlock = document.querySelector('.section-unlock');
  if (!unlockBlock) return;

  const unlockContent = document.querySelectorAll('.section-unlock .tab-img-wrap');
  const unlockTabs = document.querySelectorAll('.section-unlock .switcher span');
  const switcher = document.querySelector('.section-unlock .switcher');

  if (!unlockTabs.length || !switcher) return;

  unlockTabs[0].classList.add('active');
  unlockContent[0].classList.add('active');
  switcher.classList.add(unlockTabs[0].classList[0]);

  unlockTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      unlockTabs.forEach(btn => btn.classList.remove('active'));
      unlockContent.forEach(content => content.classList.remove('active'));

      tab.classList.add('active');
      unlockContent[index].classList.add('active');

      switcher.className = 'switcher';
      switcher.classList.add(tab.classList[0]);
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const sliderCardsContainer = '.cards-slider';
  const $cardsContainer = document.querySelector(sliderCardsContainer);

  if (!$cardsContainer) return;

  let swiper = null;

  const selectors = {
    sliderBlock: '.js-cards-slider',
    buttonNext: '.js-btn-next',
    buttonPrev: '.js-btn-prev',
  };

  function initSwiper() {
    swiper = new Swiper(selectors.sliderBlock, {
      slidesPerView: "auto",
      loop: true,
      autoplay: {
        delay: 2500,
      },
      spaceBetween: 16,
      watchOverflow: true,
      speed: 1000,
      pagination: {
        el: ".swiper-pagination-btn",
      },
      navigation: {
        nextEl: selectors.buttonNext,
        prevEl: selectors.buttonPrev,
      },
    });
  }
  initSwiper();
});



const currencies = new Swiper(".labs-section__inner", {
  slidesPerView: "auto",
  spaceBetween: 16,
  loop: true,
  speed: 1000,
  breakpoints: {
    768: {
      slidesPerView: 2,
    },
    1024: {
      slidesPerView: 3,
    },
    1366: {
      slidesPerView: 4,
    }
  },
  navigation: false,
  autoplay: true,
  pagination: false,
});

document.addEventListener('DOMContentLoaded', () => {

  setTimeout( () => {
    const currencyWidgets = document.querySelector('.labs-section__inner .swiper-wrapper');
    if (currencyWidgets){
      currencyWidgets.innerHTML = currencyWidgets.innerHTML.replace(/RANK/g, 'Rank');
      currencyWidgets.innerHTML = currencyWidgets.innerHTML.replace(/VOLUME/g, 'Volume');
      currencyWidgets.innerHTML = currencyWidgets.innerHTML.replace(/MARKET CAP/g, 'Market cap');
    }
  }, 1000 )
})

// Mega Menu
document.addEventListener("DOMContentLoaded", function () {
  const mainMenuBlock = document.querySelector('.site-header .menu');
  const menuItems = document.querySelectorAll('.site-header .menu > li > a');

  if (!mainMenuBlock || menuItems.length === 0) {
    return;
  }

  const activateMenuItem = (liElement) => {

    document.querySelectorAll('.site-header .menu > li').forEach((li) => {
      li.classList.remove('active');
    });

    liElement.classList.add('active');
  };


  menuItems.forEach((item) => {
    item.addEventListener('click', function (event) {

      const parentLi = item.parentElement;
      const submenuBlock = parentLi.querySelector('.submenu-block');


      if (submenuBlock && true !== parentLi.classList.contains('active')) {
        event.preventDefault();
        activateMenuItem(parentLi);
        mainMenuBlock.classList.add('menu-active');
      } else {
        document.querySelectorAll('.site-header .menu > li').forEach((li) => {
          li.classList.remove('active');
          mainMenuBlock.classList.remove('menu-active');
        });
        return true;
      }
    });
  });


  document.addEventListener('click', function (event) {
    const isClickInsideMenu = mainMenuBlock.contains(event.target);

    if (!isClickInsideMenu) {

      document.querySelectorAll('.site-header .menu > li').forEach((li) => {
        li.classList.remove('active');
        mainMenuBlock.classList.remove('menu-active');
      });
    }
  });
});

// Mobile Sidenav
document.addEventListener('DOMContentLoaded', function () {
  const headerBlock = document.getElementById('Header');
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const html = document.documentElement;
  const contactLint = document.querySelector('.home .menu-contact-lint');

  if (!headerBlock) {
    return;
  }
  mobileMenuBtn.addEventListener('click', function () {
    headerBlock.classList.toggle('show-menu');
    html.classList.toggle('overflow');
  });

  if (contactLint) {
    contactLint.addEventListener('click', function () {
      headerBlock.classList.remove('show-menu');
      html.classList.remove('overflow');
    });
  }
})

// Header scroll animation

document.addEventListener('DOMContentLoaded', function () {
  const headerSection = document.getElementById('Header');

  if (!headerSection) {
    return;
  }

  let lastScrollTop = 0;

  window.addEventListener('scroll', function () {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > lastScrollTop) {
      headerSection.style.top = '-100%';
    } else {
      headerSection.style.top = '0';
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  });

})


// Mobile Menu

document.addEventListener('DOMContentLoaded', function() {
  const mobileMenuLinks = document.querySelectorAll('.mobile-sidenav ul > li > a');

  if (!mobileMenuLinks.length) return;

  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', function(event) {
      const parentLi = this.parentElement;
      const hiddenBlock = parentLi.querySelector('.hidden-block');

      if (parentLi.classList.contains('has-submenu')) {
        event.preventDefault();

        if (parentLi.classList.contains('active')) {

          parentLi.classList.remove('active');
          collapseBlock(hiddenBlock);
        } else {
          document.querySelectorAll('.mobile-sidenav ul > li').forEach(li => {
            li.classList.remove('active');
            const otherHiddenBlock = li.querySelector('.hidden-block');
            if (otherHiddenBlock) collapseBlock(otherHiddenBlock);
          });

          parentLi.classList.add('active');
          expandBlock(hiddenBlock);
        }
      } else {

        document.querySelectorAll('.mobile-sidenav ul > li').forEach(li => {
          li.classList.remove('active');
          const otherHiddenBlock = li.querySelector('.hidden-block');
          if (otherHiddenBlock) collapseBlock(otherHiddenBlock);
        });

        parentLi.classList.add('active');
        window.location.href = this.href;
      }
    });
  });

  function expandBlock(block) {
    if (!block) return;
    block.style.height = `${block.scrollHeight}px`;
  }

  function collapseBlock(block) {
    if (!block) return;
    block.style.height = '0';
  }
});

/**
 * Counter start
 */
document.addEventListener('DOMContentLoaded', () => {
  let countElements = document.querySelectorAll(".number-counter");

  const startCounter = (item) => {
    let startnumber = 0;
    const step = parseInt(item.dataset.step) || 1;

    function counterup() {

      if (startnumber + step >= item.dataset.number) {
        startnumber = item.dataset.number;
        item.innerHTML = startnumber;
        clearInterval(stop);
      } else {
        startnumber += step;
        item.innerHTML = startnumber;
      }
    }


    let stop = setInterval(counterup, 70);
  };

  let options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  let observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, options);

  countElements.forEach(item => {
    observer.observe(item);
  });
});
/**
 * Counter End
 */