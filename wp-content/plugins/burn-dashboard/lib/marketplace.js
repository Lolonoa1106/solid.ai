// Function to generate marketplace cards HTML

const MarketplaceData = [
  {
    title: "Agent Forge",
    icon: "ai-agent-icon",
    subtitle: "AI Agent Marketplace",
    percent: "5 - 10%",
  },
  {
    title: "AI Marketplace",
    icon: "ai-marketplace-icon",
    subtitle: "AI",
    percent: "5 - 10%",
  },
  {
    title: "Compute Marketplace",
    icon: "compute-icon",
    subtitle: "Cloud Solutions",
    percent: "5 - 10%",
  },
  {
    title: "AITECH PAD",
    icon: "labs-icon",
    subtitle: "AITECH Launchpad",
    percent: "10%",
  },
  {
    title: "AI Agent TapHub",
    icon: "tap-hub-icon",
    subtitle: "AI Agent Game",
    percent: "100%",
  },
  {
    title: "VPN Subscriptions",
    icon: "vpn-icon",
    subtitle: "Privacy Tools",
    percent: "25%",
  },
  {
    title: "AITECH Debit Card",
    icon: "debit-card-icon",
    subtitle: "Decentralized Transactions",
    percent: "100%",
  },
  // {
  //   title: "AVACHAT",
  //   icon: "avachat-icon",
  //   subtitle: "AI Agent Assistant",
  //   percent: "50%",
  // },

  // {
  //   title: "Staking",
  //   icon: "staking-icon",
  //   subtitle: "Rewarding Users",
  //   percent: "20%",
  // },
  // {
  //   title: "AITECH Labs",
  //   icon: "labs-icon",
  //   subtitle: "AI Focused Accelerator",
  //   percent: "30%",
  // },
];

export function generateMarketplaceCards() {
  let marketplaceHTML =
    '<div class="marketplace-section" id="marketplace-section">';
  marketplaceHTML += '<div class="marketplace-slider">';

  // Generate initial set of cards
  MarketplaceData.forEach((card) => {
    marketplaceHTML += generateCardHTML(card);
  });

  marketplaceHTML += "</div></div>";
  return marketplaceHTML;
}

// Helper function to generate card HTML
function generateCardHTML(card) {
  return `
    <div class="marketplace-card">
      <div class="progress-fill ${
        card.percent === "100%" ? "progress-full" : ""
      }" 
           style="--fill-top: ${100 - parseInt(card.percent)}%"></div>
      <div class="card-progress"></div>
      <div class="card-header">
        <div class="card-percent">${card.percent}</div>
        <div class="marketplace-burn-icon"></div>
      </div>
      <div class="card-content">
        <div class="${card.icon}"></div>
        <div class="card-text">
          <div class="card-title">${card.title}</div>
          <div class="card-subtitle">${card.subtitle}</div>
        </div>
      </div>
    </div>`;
}

// Initialize infinite slider
export function initInfiniteSlider() {
  const slider = document.querySelector(".marketplace-slider");
  const container = document.querySelector(".marketplace-section");
  if (!slider || !container) {
    return;
  }

  // Check if we're on mobile
  const isMobile = window.innerWidth <= 1300;

  return;

  // If on mobile, don't initialize the animation
  if (isMobile) {
    return;
  }

  let isAnimating = true;
  let currentPosition = 0;
  const cardWidth = 204; // Width of each card (196.11px + 8px gap)
  const totalCards = MarketplaceData.length;
  const totalWidth = cardWidth * totalCards;
  let animationFrameId = null;

  // Function to append new cards when needed
  function appendNewCards() {
    const lastCard = slider.lastElementChild;
    const lastCardRect = lastCard.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // If the last card is about to enter the viewport, append new cards
    if (lastCardRect.right <= containerRect.right + totalWidth) {
      MarketplaceData.forEach((card) => {
        const newCard = document.createElement("div");
        newCard.innerHTML = generateCardHTML(card);
        slider.appendChild(newCard.firstElementChild);
      });
    }

    // If we've scrolled past the first set of cards, remove them
    const firstCard = slider.firstElementChild;
    const firstCardRect = firstCard.getBoundingClientRect();
    if (firstCardRect.right < containerRect.left - totalWidth) {
      for (let i = 0; i < totalCards; i++) {
        slider.removeChild(slider.firstElementChild);
      }
      currentPosition += totalWidth;
    }
  }

  function animateSlider() {
    if (!isAnimating) return;

    currentPosition -= 0.3; // Move continuously to the left
    slider.style.transform = `translateX(${currentPosition}px)`;

    // Check if we need to append or remove cards
    appendNewCards();

    animationFrameId = requestAnimationFrame(animateSlider);
  }

  // Pause on hover
  container.addEventListener("mouseenter", () => {
    isAnimating = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  });

  container.addEventListener("mouseleave", () => {
    isAnimating = true;
    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(animateSlider);
    }
  });

  // Pause on window blur (when user switches tabs or windows)
  window.addEventListener("blur", () => {
    isAnimating = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  });

  // Resume on window focus
  window.addEventListener("focus", () => {
    isAnimating = true;
    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(animateSlider);
    }
  });

  // Start animation
  animationFrameId = requestAnimationFrame(animateSlider);
}

// Initialize slider when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initInfiniteSlider);
} else {
  initInfiniteSlider();
}

// Also initialize when the marketplace section is added to the DOM
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      mutation.addedNodes.forEach((node) => {
        if (node.classList && node.classList.contains("marketplace-section")) {
          initInfiniteSlider();
        }
      });
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Handle window resize
let resizeTimeout;
window.addEventListener("resize", () => {
  const isMobile = window.innerWidth <= 1300;
  const slider = document.querySelector(".marketplace-slider");

  if (slider) {
    // Clear any existing animation frame
    if (window.animationFrameId) {
      cancelAnimationFrame(window.animationFrameId);
      window.animationFrameId = null;
    }

    // Reset transform immediately
    slider.style.transform = "none";

    // Debounce the reinitialization
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (isMobile) {
        // Keep transform reset on mobile
        slider.style.transform = "none";
      } else {
        // Reinitialize animation on desktop
        initInfiniteSlider();
      }
    }, 250); // Wait for 250ms after resize ends before reinitializing
  }
});
