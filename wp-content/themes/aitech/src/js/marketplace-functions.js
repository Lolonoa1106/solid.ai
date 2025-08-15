const sliderContainer = '.grid-slider';
const $container = document.querySelector(sliderContainer);


let swiper = null;

const selectors = {
  slider: '.js-grid-slider',
};

function initSwiper() {
  swiper = new Swiper(selectors.slider, {
    slidesPerView: "auto",
    spaceBetween: 16,
    watchOverflow: true,
    speed: 1000,
    loopAdditionalSlides: 4,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });
}

function destroySwiper() {
  if (swiper !== null) {
    swiper.destroy();
    swiper = null;
  }
}

function checkSliderAndScreenWidth() {
  if (window.innerWidth > 992) {
    if (swiper !== null) {
      destroySwiper();
    }
  } else {
    if (swiper === null) {
      initSwiper();
    }
  }
}

window.addEventListener('resize', checkSliderAndScreenWidth);
window.addEventListener('DOMContentLoaded', checkSliderAndScreenWidth);



document.addEventListener('DOMContentLoaded', () => {
  const tabsBlock = document.querySelector('.slider-tabs');
  if (!tabsBlock) return;

  const tabsContent = document.querySelectorAll('.tabs-slider');
  const tabsBtn = document.querySelectorAll('.tab-btn-list .tab-btn');

  tabsBtn[0].classList.add('active');
  tabsContent[0].classList.add('active');

  const swiperInstances = [];

  tabsContent.forEach(content => {
    const tabSliderContainer = content.querySelector('.js-tabs-slider');
    if (tabSliderContainer) {
      const swiper = new Swiper(tabSliderContainer, {
        slidesPerView: "auto",
        spaceBetween: 24,
        watchOverflow: true,
        speed: 1000,
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
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
        const tabSliderContainer = tabsContent[index].querySelector('.js-tabs-slider');
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
});


document.addEventListener('DOMContentLoaded', () => {
  const twoColumnsTabs = document.querySelector('.two-column-tabs');
  if (!twoColumnsTabs) return;

  const tabsContentImage = document.querySelectorAll('.two-column-tabs .video-column');
  const tabsItem = document.querySelectorAll('.two-column-tabs .tab-item');

  tabsItem[0].classList.add('active');
  tabsContentImage[0].classList.add('active');

  // tabsItem.forEach((tab, index) => {
  //   tab.addEventListener('click', () => {
  //     tabsItem.forEach(btn => btn.classList.remove('active'));
  //     tabsContentImage.forEach(content => content.classList.remove('active'));
  //
  //     tab.classList.add('active');
  //     tabsContentImage[index].classList.add('active');
  //   });
  // });
});

document.addEventListener('DOMContentLoaded', () => {
  const scrollBtn = document.querySelector('.scroll-btn');
  const headerSection = document.querySelector('.hero-inner-section');

  if (!scrollBtn || !headerSection) {
    return;
  }

  scrollBtn.addEventListener('click', function () {
    const nextSection = headerSection.nextElementSibling;
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const productCategories = document.querySelector('.product-categories');
  if (!productCategories) {
    return;
  }

  const items = document.querySelectorAll('.product-categories .grid-slider .swiper-slide');

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
});


