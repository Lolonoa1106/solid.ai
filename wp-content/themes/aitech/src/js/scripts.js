document.addEventListener("DOMContentLoaded", () => {

    const video = document.getElementById('video');

    if(!video){
        return;
    }
    const playBtn = document.getElementById('play-btn');

    playBtn.addEventListener('click', () => {

        if (video.paused) {
            video.play();
            playBtn.style.display = 'none';
        } else {
            video.pause();
            playBtn.style.display = 'block';
        }
    });

    video.addEventListener('play', () => {
        playBtn.style.display = 'none';
    });

    video.addEventListener('pause', () => {
        playBtn.style.display = 'block';
    });

    document.querySelectorAll('.nav-section-link').forEach(function(element) {
        element.addEventListener('click', function() {
            toggleMenu();
            console.log('nav');
        });
    });
});
