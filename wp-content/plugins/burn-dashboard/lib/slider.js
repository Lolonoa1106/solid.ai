import { CoinGeckoAPI } from "./coingecko.js";

// Export the CryptoSlider class
export class CryptoSlider {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.coinGecko = new CoinGeckoAPI();
    this.cryptoData = [];

    // Animation properties
    this.isAnimating = false;
    this.animationPosition = 0;
    this.animationSpeed = 0.5; // pixels per frame
    this.animationFrameId = null;
    this.isPaused = false;
    this.slider = null;
    this.sliderInner = null;
    this.maxPosition = 0;

    this.init();
  }

  async init() {
    try {
      await this.fetchData();
      this.generateHTML();
      this.initializeAnimation();
      this.startAutoRefresh();
    } catch (error) {
      console.error("Failed to initialize crypto slider:", error);
      // Show error state in the container
      this.container.innerHTML = `
        <div class="crypto-slider-error">
          <p>Failed to load crypto data. Please try refreshing the page.</p>
        </div>
      `;
    }
  }

  async fetchData() {
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds delay between retries

    while (retryCount < maxRetries) {
      try {
        const data = await this.coinGecko.fetchCoinData();

        // Validate that we have data and it's in the expected format
        if (data && Array.isArray(data) && data.length > 0) {
          // Ensure each crypto item has the required properties
          const validData = data.filter(
            (crypto) =>
              crypto &&
              crypto.symbol &&
              crypto.chartData &&
              crypto.chartData.stats
          );

          if (validData.length > 0) {
            this.cryptoData = validData;
            return;
          }
        }

        throw new Error("Invalid data format received from CoinGecko");
      } catch (error) {
        console.warn(
          `Attempt ${retryCount + 1} failed to fetch crypto data:`,
          error
        );
        retryCount++;

        if (retryCount < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }
    }

    // If all retries failed, throw an error
    throw new Error("Failed to fetch crypto data after multiple attempts");
  }

  async refreshData() {
    await this.fetchData();
    this.generateHTML();
    this.initializeAnimation();
  }

  startAutoRefresh() {
    // // Refresh data every 60 seconds
    // setInterval(() => this.refreshData(), 60000);
  }

  generateHTML() {
    let cryptoSliderHTML = `
            <div class="slider-container">
                <div class="slider">
                    <div class="slider-inner">`;

    // Duplicate the cards to create seamless endless loop
    const duplicatedData = [
      ...this.cryptoData,
      ...this.cryptoData,
      ...this.cryptoData,
      ...this.cryptoData,
    ];

    duplicatedData.forEach((crypto, index) => {
      const direction = crypto.percent.includes("-") ? "down" : "up";
      const chartClass = direction === "up" ? "chart-up" : "chart-down";
      const percentClass = direction === "up" ? "percent-up" : "percent-down";
      const arrowClass = direction === "up" ? "arrow-up" : "arrow-down";

      cryptoSliderHTML += `
            <div class="crypto-card" data-symbol="${crypto.symbol}">
             <div class="crypto-card-corner"></div>
                <div class="crypto-info">
                    <div class="crypto-name">
                        <div class="crypto-icon">
                            <div class="crypto-icon-inner ${crypto.icon_class}"></div>
                        </div>
                        <div class="crypto-text">
                            <div class="crypto-symbol">${crypto.symbol}</div>
                            <div class="crypto-fullname">${crypto.name}</div>
                        </div>
                    </div>
                    <div class="crypto-price">
                        <div class="price-value" id="price-${crypto.symbol}-${index}">${crypto.price} USDT</div>
                        <div class="price-movement">
                            <div class="movement-percent">
                                <div class="percent ${percentClass}" id="percent-${crypto.symbol}-${index}">${crypto.percent}</div>
                                <div class="arrow ${arrowClass}" id="arrow-${crypto.symbol}-${index}"></div>
                            </div>
                            <div class="time-period">24H</div>
                        </div>
                    </div>
                </div>
                <div class="chart">
                  <canvas class="mini-chart-canvas" id="mini-chart-${crypto.symbol}-${index}" width="80" height="40"></canvas>
                </div>
            </div>`;
    });

    cryptoSliderHTML += `
                    </div>
                </div>
            </div>`;

    this.container.innerHTML = cryptoSliderHTML;
  }

  initializeAnimation() {
    this.slider = this.container.querySelector(".slider");
    this.sliderInner = this.container.querySelector(".slider-inner");

    if (!this.slider || !this.sliderInner) return;

    // Calculate maximum position for animation
    this.calculateMaxPosition();

    // Reset animation position
    this.animationPosition = 0;
    this.sliderInner.style.transform = "translateX(0px)";

    // Set up hover pause/resume
    this.slider.addEventListener("mouseenter", () => {
      this.pauseAnimation();
    });

    this.slider.addEventListener("mouseleave", () => {
      this.resumeAnimation();
    });

    // Handle window focus/blur
    window.addEventListener("blur", () => {
      this.pauseAnimation();
    });

    window.addEventListener("focus", () => {
      this.resumeAnimation();
    });

    // Handle window resize
    window.addEventListener("resize", () => {
      this.handleResize();
    });

    // Start animation
    this.startAnimation();
  }

  calculateMaxPosition() {
    const cardWidth = this.getCardWidth();
    const originalSetWidth = cardWidth * this.cryptoData.length * 3;

    // Maximum position is the width of one complete set of cards
    this.maxPosition = originalSetWidth;
  }

  getCardWidth() {
    const card = this.sliderInner.querySelector(".crypto-card");
    if (!card) return 400; // fallback width

    const rect = card.getBoundingClientRect();
    const style = window.getComputedStyle(card);
    const marginRight = parseFloat(style.marginRight) || 0;
    const marginLeft = parseFloat(style.marginLeft) || 0;
    const gap = 16; // default gap between cards

    return rect.width + marginLeft + marginRight + gap;
  }

  startAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.isAnimating = true;
    this.isPaused = false;
    this.animate();
  }

  pauseAnimation() {
    this.isPaused = true;
  }

  resumeAnimation() {
    if (this.isAnimating) {
      this.isPaused = false;
    }
  }

  stopAnimation() {
    this.isAnimating = false;
    this.isPaused = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  animate() {
    if (!this.isAnimating || !this.sliderInner) return;

    if (!this.isPaused) {
      // Move continuously to the right
      this.animationPosition += this.animationSpeed;

      // Check if we need to cycle cards (move from front to back)
      this.cycleCards();

      // Apply the transform (this will be overridden by cycleCards if cycling occurred)
      this.sliderInner.style.transform = `translateX(-${this.animationPosition}px)`;
    }

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  cycleCards() {
    if (!this.sliderInner) return;

    // When we've moved past the first set of cards, reset to beginning for seamless loop
    if (this.animationPosition >= this.maxPosition) {
      this.refreshData();
    }
  }

  handleResize() {
    // Recalculate max position on resize
    this.calculateMaxPosition();

    // Adjust current position if it's now out of bounds
    if (this.animationPosition > this.maxPosition) {
      this.animationPosition = this.maxPosition;
      this.sliderInner.style.transform = `translateX(-${this.animationPosition}px)`;
    }
  }

  async getCryptoData() {
    if (this.cryptoData.length === 0) {
      await this.fetchData();
    }
    return this.cryptoData;
  }
}

// Also export as default for backward compatibility
export default CryptoSlider;
