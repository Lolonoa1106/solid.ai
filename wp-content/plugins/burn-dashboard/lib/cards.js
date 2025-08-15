// Function to generate burn cards HTML
export function generateBurnCards(burnData) {
  let burnCardsHTML = '<div class="burn-cards-wrapper">';

  burnData.forEach((data, index) => {
    burnCardsHTML += `
            <div class="burn-card" id="burn-card-${index}">
                <div class="burn-card-info-corner">
                </div>
                <div class="burn-card-info-icon" data-tooltip='${
                  index === 0
                    ? "“Total Time Burned” provides a comprehensive overview of the total percentage of $AITECH tokens burned relative to the maximum supply. It also includes the percentage of tokens burned within the past year, contextualizing short-term activity within a broader deflationary framework. This serves as a key indicator of token utility and long-term ecosystem health."
                    : "“Burned Last Month” captures the volume of $AITECH tokens burned in the most recent 30-day period, along with the percentage this represents relative to the year’s total burn. It offers a near-term snapshot of platform activity and demand. Consistent or rising monthly burns may suggest increased user engagement or growing transactional volume."
                }'> </div>
                <div class="burn-title">${data.title}</div>
                <div class="burn-content">
                    <div class="burn-gauge">
                        <canvas class="gauge-canvas" id="gauge-canvas-${index}" width="160" height="80"></canvas>
                        <div class="gauge-value">
                            <div class="gauge-percent" data-value="${parseFloat(
                              data.percent
                            )}">${data.percent}</div>
                            <div class="gauge-label">$${
                              data.currency
                            } / YEAR</div>
                        </div>
                    </div>
                    <div class="burn-stats">
                        <div class="burn-amount">
                            <div class="burn-value" data-target="${
                              data.amount
                            }">${data.amount}</div>
                            <div class="burn-currency">$${data.currency}</div>
                        </div>
                        <div class="burn-supply">${data.supply} OF SUPPLY</div>
                    </div>
                </div>
            </div>`;
  });
  burnCardsHTML += "</div>";
  return burnCardsHTML;
}

// Function to generate burners widget HTML
export function generateBurnersWidget() {
  return `
        <div class="burners-card">
            <div class="burners-header">
                <div class="burners-title">
                    <span>Main Burners</span>
                    <div class="info-icon" data-tooltip="“Main Burners” section displays a transparent record of all verified $AITECH burn transactions directly from the blockchain. It ensures accountability by allowing the community to independently verify that each burn has been executed as stated."></div>
                </div>
            </div>
            <div class="burners-list">
                <div class="burners-top"></div>
                <div class="burners-regular-list"></div>
            </div>
        </div>`;
}

// Function to trim burner addresses based on screen width
export function trimBurnerAddresses() {
  const addresses = document.querySelectorAll(
    ".burner-address, .regular-address"
  );
  const burnerItems = document.querySelectorAll(".burner-item");

  // Create a temporary span to measure text width
  const measureSpan = document.createElement("span");
  measureSpan.style.visibility = "hidden";
  measureSpan.style.position = "absolute";
  measureSpan.style.whiteSpace = "nowrap";
  measureSpan.style.font = window.getComputedStyle(addresses[0]).font;
  document.body.appendChild(measureSpan);

  burnerItems.forEach((item, index) => {
    const address = addresses[index];
    if (!address) return;

    const fullAddress =
      address.getAttribute("data-full-address") || address.textContent;

    if (!address.getAttribute("data-full-address")) {
      address.setAttribute("data-full-address", fullAddress);
    }

    // Get the available width for the address
    const containerWidth = item.offsetWidth;
    const minAddressLength = 10; // Minimum length to ensure readability
    const maxAddressLength = fullAddress.length;

    // Calculate available width (accounting for padding and margins)
    const addressStyle = window.getComputedStyle(address);
    const padding =
      parseFloat(addressStyle.paddingLeft) +
      parseFloat(addressStyle.paddingRight);
    const margin =
      parseFloat(addressStyle.marginLeft) +
      parseFloat(addressStyle.marginRight);
    const availableWidth = containerWidth - padding - margin - 30; // 20px buffer for safety

    measureSpan.textContent = fullAddress;
    const fullWidth = measureSpan.offsetWidth;

    // Check if the address intersects with its container
    const addressRect = address.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const isIntersecting = addressRect.right <= itemRect.right;

    if (!isIntersecting && fullWidth > 264) {
      // If address overflows and is wider than 264px, use fixed format
      const desktopChars = 10; // Show 12 chars on each side
      address.textContent = `${fullAddress.slice(
        0,
        desktopChars
      )}...${fullAddress.slice(-desktopChars)}`;
    } else if (
      window.innerWidth <= 610 && window.innerWidth > 517
        ? fullWidth <= availableWidth - 30
        : fullWidth <= availableWidth
    ) {
      // If we have enough space, show full address
      address.textContent = fullAddress;
    } else if (document.documentElement.getBoundingClientRect().width <= 400) {
      address.textContent = `${fullAddress.slice(0, 5)}...${fullAddress.slice(
        -5
      )}`;
    } else if (document.documentElement.getBoundingClientRect().width <= 500) {
      address.textContent = `${fullAddress.slice(0, 7)}...${fullAddress.slice(
        -7
      )}`;
    } else if (document.documentElement.getBoundingClientRect().width <= 600) {
      address.textContent = `${fullAddress.slice(0, 14)}...${fullAddress.slice(
        -14
      )}`;
    } else {
      // Binary search to find the optimal number of characters
      let left = minAddressLength / 2;
      let right = Math.floor(maxAddressLength / 2);
      let optimalLength = left;

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const testText = `${fullAddress.slice(0, mid)}...${fullAddress.slice(
          -mid
        )}`;
        measureSpan.textContent = testText;

        if (measureSpan.offsetWidth <= availableWidth) {
          optimalLength = mid;
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }

      address.textContent = `${fullAddress.slice(
        0,
        optimalLength - 2
      )}...${fullAddress.slice(-(optimalLength - 2))}`;
    }
  });

  // Clean up
  document.body.removeChild(measureSpan);
}

// Function to render burners list
export function renderBurners(topBurners, regularBurners) {
  const topEl = document.querySelector(".burners-top");
  const regularEl = document.querySelector(".burners-regular-list");
  if (!topEl || !regularEl) {
    console.error("Burners widget elements not found in DOM.");
    return;
  }
  // Top 3
  let topHTML = "";
  topBurners.forEach((address, i) => {
    topHTML += `
        <div class="burner-container" onclick="window.open('https://bscscan.com/address/${address}', '_blank')">
        <div class="burner-index">${i + 1}</div>
            <div class="burner-item">
                <div class="burner-address" data-full-address="${address}">${address}</div>
                <div class="burner-arrow-purple"></div>
            </div>
        </div>`;
  });
  topEl.innerHTML = topHTML;
  // Regular (scrollable)
  let regularHTML = "";
  regularBurners.forEach((address) => {
    regularHTML += `
            <div class="burner-regular" onclick="window.open('https://bscscan.com/address/${address}', '_blank')">
                <div class="regular-address" data-full-address="${address}">${address}</div>
                <div class="burner-arrow-grey"></div>
            </div>`;
  });
  regularEl.innerHTML = regularHTML;

  // Wait for the next frame to ensure elements are rendered
  requestAnimationFrame(() => {
    // Apply initial trimming
    trimBurnerAddresses();
  });

  // Add resize listener
  window.addEventListener("resize", trimBurnerAddresses);
}
