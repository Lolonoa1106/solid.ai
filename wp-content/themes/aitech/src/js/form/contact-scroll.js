document.addEventListener("DOMContentLoaded", function () {

    document.querySelectorAll('a[href*="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            const url = new URL(this.href);
            const targetId = url.hash.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement && window.location.pathname === url.pathname) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 20,
                    behavior: "smooth"
                });
            }
        });
    });


    if (window.location.hash) {
        const targetElement = document.getElementById(window.location.hash.substring(1));
        if (targetElement) {
            setTimeout(() => {
                window.scrollTo({
                    top: targetElement.offsetTop - 20,
                    behavior: "smooth"
                });
            }, 100);
        }
    }
});
