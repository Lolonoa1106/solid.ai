document.addEventListener("DOMContentLoaded", () => {
	const isMobileView = window.innerWidth < 800;



	function toggleMenu() {
		document.querySelector('.burger').classList.toggle("open");
		document.querySelector('.site-header').classList.toggle("nav-active");

		if (document.body.style.overflow === 'hidden') {
			document.body.style.overflow = 'auto';
		} else {
			document.body.style.overflow = 'hidden';
		}
	}

	// const video = document.getElementById('video');
	// const playBtn = document.getElementById('play-btn');
	//
	// playBtn.addEventListener('click', () => {
	// 	if (video.paused) {
	// 		video.play();
	// 		playBtn.style.display = 'none';
	// 	} else {
	// 		video.pause();
	// 		playBtn.style.display = 'block';
	// 	}
	// });
	//
	// video.addEventListener('click', () => {
	// 	if (video.paused) {
	// 		video.play();
	// 		playBtn.style.display = 'none';
	// 	} else {
	// 		video.pause();
	// 		playBtn.style.display = 'block';
	// 	}
	// });
	//
	// video.addEventListener('play', () => {
	// 	playBtn.style.display = 'none';
	// });
	//
	// video.addEventListener('pause', () => {
	// 	playBtn.style.display = 'block';
	// });



	const sideNav = document.querySelector('.side-navigation');
	const sections = document.querySelectorAll('section');

	// Dynamically populate side navigation items
	sections.forEach((section) => {
		const navItem = document.createElement('a');
		navItem.classList.add('side-navigation__item');
		navItem.href = `#${section.id}`;
	});

	const navItems = document.querySelectorAll('.side-navigation__item');

	// Scroll to the section on click
	navItems.forEach((item) => {
		item.addEventListener('click', (e) => {
			e.preventDefault(); // Prevent default anchor behavior
			const targetId = item.getAttribute('href').substring(1); // Get the ID of the target section
			const targetSection = document.getElementById(targetId);

			// Smooth scroll to the section
			targetSection.scrollIntoView({
				behavior: 'smooth',
				block: 'start', // Align to the top of the section
			});

			// Optional: Update the active class manually (to provide instant feedback)
			navItems.forEach((nav) => nav.classList.remove('active'));
			item.classList.add('active');
		});
	});

	// Highlight the active nav item based on scroll position
	const onScroll = () => {
		let currentSection = null;

		sections.forEach((section) => {
			const rect = section.getBoundingClientRect();
			// Check if the section is in view
			if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
				currentSection = section;
			}
		});

		// Add active class to corresponding nav item
		navItems.forEach((item) => {
			item.classList.remove('active');
			if (item.getAttribute('href') === `#${currentSection?.id}`) {
				item.classList.add('active');
			}
		});
	};

	// Listen to scroll events
	window.addEventListener('scroll', onScroll);

	const infoItems = document.querySelectorAll(".hover-video");

	infoItems.forEach(item => {
		video.addEventListener("click", (event) => {
			event.preventDefault();
			video.play();
		});

		item.addEventListener("mouseenter", () => {
			const video = item.querySelector("video");
			if (video) {
				video.play();
			}
		});

		item.addEventListener("mouseleave", () => {
			const video = item.querySelector("video");
			if (video) {
				video.pause();
			}
		});
	});


	const startUsingItems = document.querySelectorAll(".section-start-using .item");
	const startUsingImg = document.querySelector('.section-start-using .info img')
	startUsingItems.forEach(item => {
		item.addEventListener('click', () => {
			const videoElement = item.querySelector(".item-image");
			const sourceElement = videoElement.querySelector("source");
			const newSrc = sourceElement.getAttribute("src");

			if (newSrc) {
				const infoVideo = document.querySelector(".info video");
				const sourceElement = infoVideo.querySelector("source");

				infoVideo.classList.add("is-changing");
				setTimeout(() => {
					sourceElement.setAttribute("src", newSrc);
					infoVideo.load();
					infoVideo.play();
					infoVideo.classList.remove("is-changing");
				}, 500);

			}

			startUsingItems.forEach(el => el.classList.remove('active'));
			item.classList.add('active');
		});
	});


	// Innovation items switch
	const innovationItems = document.querySelectorAll('.section-unleash .content-item');
	const innovationImage = document.querySelector('.section-unleash .img-wrap img'); // Assuming one image to update

	innovationItems.forEach((item) => {
		item.addEventListener('click', (e) => {
			innovationItems.forEach((nav) => nav.classList.remove('active'));

			item.classList.add('active');

			const newSrc = item.dataset.src; // Get the data-src value
			if (newSrc) {
				changeImage( innovationImage, newSrc )
			}
		});
	});

	if (isMobileView) {
		const missions = new Swiper(".section-multilayered .content", {
			slidesPerView: 1.4,
			spaceBetween: 20,
			centeredSlides: true,
		});

		document.querySelectorAll('.no-br-mobile').forEach(el => {
			el.innerHTML = el.innerHTML.replace(/<br\s*\/?>/gi, ''); // Remove <br> tags
		});
	}


});

function changeImage( img, src ) {






	setTimeout(() => {
		img.src = src;

		img.onload = () => {
			img.classList.remove("is-changing");
		};
	}, 500);
}






