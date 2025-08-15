// avoid quick flash of default text
let el = document.createElement('style');
document.head.appendChild(el);
let styleSheet = el.sheet;
styleSheet.insertRule('.certik-emblem { display: none; }', 0);

/**
 * Load CERTIK script
 */
let script = document.createElement('script');
script.src = "https://emblem.certik-assets.com/script?pid=solidus-ai-tech&vid=bbfe9657"
script.async = true;
document.head.append(script);

script.onload = function() {
    if (window.innerWidth < 500) { // on mobile default behavior
        return false;
    }

    let widget = document.querySelector('.certik-emblem');
    if (widget) {
        let widgetPopup = null;

        /**
         * wait shadowRoot is ready
         */
        let intervalInit = setInterval(()=> {
            if (widget.shadowRoot) {
                widgetPopup = widget.shadowRoot.querySelector('.ctk-clickable');
                initHover();
                clearInterval(intervalInit);

                const style = document.createElement('style');
                style.textContent = `
                  .ctk-view-port.ctk-relative {
                    transform: none !important;
                    height: 44px;
                    width: auto;
                  }
                `;
                widget.shadowRoot.appendChild(style);
            }
        }, 150);

        function initHover() {
            /**
             * Hide jump-effect of popup after our styles.
             */
            widgetPopup.style.opacity = 0;

            /**
             * Override widget style. Align popup to the right.
             * Delay allows to apply styles after native widget scripts.
             */
            widget.addEventListener("mouseover", (e)=> {
                setTimeout(()=> {
                    widgetPopup.style.left = 'auto';
                    widgetPopup.style.right = '-283px';
                    widgetPopup.style.opacity = 1;
                }, 100);
            });

            widget.addEventListener("mouseout", (e)=> {
                widgetPopup.style.opacity = 0;
            });
        }
    }
};