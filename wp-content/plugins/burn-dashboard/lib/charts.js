import { formatNumber } from "./queries.js";

// Function to generate sine wave data for charts
function generateSineData(points, amplitude, offset) {
  return Array.from({ length: points }, (_, i) => {
    return Math.sin((i / points) * Math.PI * 2) * amplitude + offset;
  });
}

// Function to initialize mini charts
function initializeMiniCharts(cryptoData) {
  const miniCharts = {};
  const maxRetries = 3;
  const retryDelay = 500; // 500ms delay between retries

  async function initializeChart(crypto, index, retryCount = 0) {
    const canvasId = `mini-chart-${crypto.symbol}-${index}`;
    const canvas = document.getElementById(canvasId);

    if (!canvas) {
      if (retryCount < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        return initializeChart(crypto, index, retryCount + 1);
      }
      console.error(
        `Mini-chart canvas with id '${canvasId}' not found in DOM after ${maxRetries} retries.`
      );
      return null;
    }

    const ctx = canvas.getContext("2d");
    if (miniCharts[canvasId]) {
      miniCharts[canvasId].destroy();
    }

    // Transform the price chart data to the format Chart.js expects
    const chartData = crypto.chartData.stats.map((point) => point[1]); // Extract just the price values
    const percentChange = parseFloat(crypto.percent);
    const isPositive = percentChange >= 0;
    const chartColor = isPositive ? "#97FF80" : "#FF8080"; // Green for positive, Red for negative

    miniCharts[canvasId] = new Chart(ctx, {
      type: "line",
      data: {
        labels: Array.from({ length: chartData.length }, (_, i) => i + 1),
        datasets: [
          {
            data: chartData,
            borderColor: chartColor,
            backgroundColor: `${chartColor}1A`, // Add transparency to the background color
            fill: true,
            borderWidth: 2,
            tension: 0.8,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { y: { display: false }, x: { display: false } },
      },
    });

    // Update the percent display color
    const percentElement = document.querySelector(
      `.crypto-percent-${crypto.symbol}`
    );
    if (percentElement) {
      percentElement.style.color = chartColor;
    }

    return miniCharts[canvasId];
  }

  // Initialize all charts with retry logic
  const chartPromises = [...cryptoData, ...cryptoData, ...cryptoData, ...cryptoData].map((crypto, index) => initializeChart(crypto, index));
  return Promise.all(chartPromises).then(() => miniCharts);
}

// Add vertical line on hover plugin
const verticalLinePlugin = {
  id: "verticalLineOnHover",
  afterDraw: function (chart) {
    if (chart.tooltip?._active && chart.tooltip._active.length) {
      const ctx = chart.ctx;
      ctx.save();
      const activePoint = chart.tooltip._active[0];
      // Draw vertical line
      ctx.beginPath();
      ctx.moveTo(activePoint.element.x, chart.chartArea.top);
      ctx.lineTo(activePoint.element.x, chart.chartArea.bottom);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#714AFC";
      ctx.stroke();
      // Draw intersection point (circle)
      ctx.beginPath();
      ctx.arc(activePoint.element.x, activePoint.element.y, 8, 0, 2 * Math.PI); // Outer circle
      ctx.fillStyle = "#1a112b"; // Outer color (matches screenshot background)
      ctx.shadowColor = "#714AFC";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(activePoint.element.x, activePoint.element.y, 6, 0, 2 * Math.PI); // Middle circle
      ctx.fillStyle = "#714AFC";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(activePoint.element.x, activePoint.element.y, 4, 0, 2 * Math.PI); // Inner circle
      ctx.fillStyle = "#1a112b";
      ctx.fill();
      ctx.restore();
    }
  },
};

// Custom external tooltip handler for Chart.js
function customTooltipHandler(context) {
  let tooltipEl = document.getElementById("custom-chart-tooltip");
  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.id = "custom-chart-tooltip";
    tooltipEl.style.position = "absolute";
    tooltipEl.style.pointerEvents = "none";
    tooltipEl.style.zIndex = "100";
    tooltipEl.style.transition = "opacity 0.2s";
    tooltipEl.style.opacity = "0";
    document.body.appendChild(tooltipEl);
  }

  const { chart, tooltip } = context;

  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = "0";
    return;
  }

  // Get value and label
  const value = tooltip.dataPoints?.[0]?.formattedValue || "";
  const label = tooltip.dataPoints?.[0]?.label || "";

  // Set HTML (custom style)
  tooltipEl.innerHTML = `
    <div class=\"custom-chart-tooltip\">
      <div class=\"custom-chart-tooltip-title\">${value}</div>
      <div class=\"custom-chart-tooltip-subtitle\">${label}</div>
    </div>
  `;

  // Position tooltip
  const canvasRect = chart.canvas.getBoundingClientRect();
  const tooltipRect = tooltipEl.getBoundingClientRect();
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  // Calculate position: centered horizontally
  let left =
    canvasRect.left + scrollLeft + tooltip.caretX - tooltipRect.width / 2;
  // Default to above
  let top =
    canvasRect.top + scrollTop + tooltip.caretY - tooltipRect.height - 55;

  // Prevent overflow left/right
  if (left < 0) left = 0;
  if (left + tooltipRect.width > window.innerWidth + scrollLeft)
    left = window.innerWidth + scrollLeft - tooltipRect.width;

  // Check if there is enough space above
  const caretYInViewport = canvasRect.top + tooltip.caretY;
  const tooltipHeight = tooltipRect.height + 20;
  if (caretYInViewport < tooltipHeight) {
    // Not enough space above, show below
    top = canvasRect.top + scrollTop + tooltip.caretY + 20;
  }

  tooltipEl.style.opacity = "1";
  tooltipEl.style.left = `${left}px`;
  tooltipEl.style.top = `${top}px`;
}

// Function to initialize main burn chart
function initializeMainBurnChart({ chartData: mainChartData, timeLabels }) {
  const canvas = document.getElementById("main-burn-chart-canvas");
  if (!canvas) {
    console.error("Main burn chart canvas not found in DOM.");
    return null;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Failed to get canvas context.");
    return null;
  }

  let mainChart = null;

  // Function to create/update the chart
  const createChart = () => {

    // Destroy existing chart if it exists
    if (mainChart) {
      mainChart.destroy();
    }

    // Set canvas size to match container
    const container = canvas.parentElement;
    if (container) {
      canvas.height = container.clientHeight;
      canvas.width = container.clientWidth;
    }

    mainChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: timeLabels,
        datasets: [
          {
            label: "All Time Burn",
            data: mainChartData,
            borderColor: "#714AFC",
            backgroundColor: "rgba(113,74,252,0.1)",
            fill: true,
            tension: 0.4,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: false,
            external: customTooltipHandler,
          },
          verticalLineOnHover: {},
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: "rgba(255, 255, 255, 0.1)",
              borderDash: [5, 5],
              borderDashOffset: 2,
            },
            border: {
              display: false,
            },
            ticks: {
              callback: formatNumber,
            },
          },
          x: {
            grid: {
              display: false,
            },
            border: {
              display: true,
              color: "rgba(255, 255, 255, 0.1)",
              width: 1,
            },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 8,
            },
          },
        },
        animation: {
          duration: 0,
        },
        interaction: {
          mode: "index",
          intersect: false,
        },
      },
      plugins: [verticalLinePlugin],
    });
  };

  // Initial chart creation
  createChart();

  // Add resize listener
  let resizeTimeout;
  window.addEventListener("resize", () => {
    // Clear the timeout if it exists
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }

    // Set a new timeout to debounce the resize event
    resizeTimeout = setTimeout(() => {
      createChart();
    }, 250); // 250ms debounce
  });

  return mainChart;
}

// Function to initialize period switcher
function initializePeriodSwitcher(mainChart, timeLabels) {
  let currentChart = mainChart; // Keep track of current chart instance
  let isUpdating = false; // Flag to prevent multiple simultaneous updates
  let currentPeriod = "year"; // Track current period

  // Function to move the sliding background
  function moveSwitcherBg(tab, skipActiveState = false) {
    const bg = document.querySelector(".switcher-bg");
    const visibleTabs = Array.from(
      document.querySelectorAll(".switcher-item")
    ).filter((tab) => tab.offsetParent !== null);

    if (visibleTabs.length < 2 || !tab.offsetParent) {
      bg.style.display = "none";
      return;
    }

    // Start the sliding animation first
    const left = tab.offsetLeft;
    const width = tab.offsetWidth;
    bg.style.display = "block";
    bg.style.transform = `translateX(${left}px)`;
    bg.style.width = `${width}px`;

    if (!skipActiveState) {
      // Remove active class from all items immediately
      document.querySelectorAll(".switcher-item").forEach((item) => {
        item.classList.remove("active");
        const textElement = item.querySelector(".switcher-text");
        if (textElement) {
          textElement.classList.remove("active");
          textElement.classList.add("inactive");
        }
      });

      // Add active class to clicked item after a small delay to match the animation
      setTimeout(() => {
        tab.classList.add("active");
        const textElement = tab.querySelector(".switcher-text");
        if (textElement) {
          textElement.classList.add("active");
          textElement.classList.remove("inactive");
        }
      }, 50); // Small delay to let the animation start
    }
  }

  // Initialize the sliding background
  if (!document.querySelector(".switcher-bg")) {
    const switcher = document.querySelector(".chart-switcher");
    const bg = document.createElement("div");
    bg.className = "switcher-bg";
    switcher.insertBefore(bg, switcher.firstChild);
  }

  // Set initial position and active state
  const yearTab = document.querySelector('.switcher-item[data-period="year"]');
  if (yearTab) {
    moveSwitcherBg(yearTab, true); // Skip active state update for initial setup
    yearTab.classList.add("active");
    const textElement = yearTab.querySelector(".switcher-text");
    if (textElement) {
      textElement.classList.add("active");
      textElement.classList.remove("inactive");
    }
  }

  const updateChart = async (periodKey, item) => {
    if (isUpdating) return;
    isUpdating = true;

    try {
      // Show loading state only on the main burn chart
      const mainChartContent = document.getElementById("main-chart-content");
      const mainBurnChartCanvas = document.getElementById(
        "main-burn-chart-canvas"
      );

      if (mainBurnChartCanvas) {
        // Add fade out effect to canvas only
        mainBurnChartCanvas.style.transition = "opacity 0.3s ease-out";
        mainBurnChartCanvas.style.opacity = "0";

        // Wait for fade out
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      if (mainChartContent) {
        // Replace only the canvas with loading spinner
        mainChartContent.innerHTML = `
          <div class="chart-loading-state">
            <div class="loading-spinner"></div>
          </div>
        `;
      }

      // Fetch only the period-specific data
      const { fetchPeriodData } = await import("./data-fetcher.js");
      const newData = await fetchPeriodData(periodKey);

      if (!newData) {
        throw new Error("Failed to fetch data for selected period");
      }

      // Transform only the chart data
      const { transformBurnData } = await import("./queries.js");
      const chartData = transformBurnData(newData);

      if (!chartData) {
        throw new Error("Failed to transform chart data");
      }

      // Restore only the canvas
      if (mainChartContent) {
        mainChartContent.innerHTML = `
          <canvas id="main-burn-chart-canvas"></canvas>
        `;
      }

      // Wait for the canvas to be available
      await new Promise((resolve) => setTimeout(resolve, 0));

      const canvas = document.getElementById("main-burn-chart-canvas");
      if (!canvas) {
        throw new Error("Chart canvas not found");
      }

      // Destroy existing chart if it exists
      if (currentChart) {
        currentChart.destroy();
      }

      // Create new chart with updated data
      currentChart = new Chart(canvas.getContext("2d"), {
        type: "line",
        data: {
          labels: chartData.timeLabels,
          datasets: [
            {
              label: "All Time Burn",
              data: chartData.chartData,
              borderColor: "#714AFC",
              backgroundColor: "rgba(113,74,252,0.1)",
              fill: true,
              tension: 0.4,
              pointRadius: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: false,
              external: customTooltipHandler,
            },
            verticalLineOnHover: {},
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                display: true,
                color: "rgba(255, 255, 255, 0.1)", 
                borderDash: [5, 5],
                borderDashOffset: 2,
              },
              border: {
                display: false,
              },
              ticks: {
                callback: formatNumber,
              },
            },
            x: {
              grid: {
                display: false,
              },
              border: {
                display: true,
                color: "rgba(255, 255, 255, 0.1)",
                width: 1,
              },
            },
          },
          animation: {
            duration: 0,
          },
          onRender: () => {},
          interaction: {
            mode: "index",
            intersect: false,
          },
        },
        plugins: [verticalLinePlugin],
      });

      // Fade in the new canvas
      canvas.style.opacity = "0";
      requestAnimationFrame(() => {
        canvas.style.transition = "opacity 0.3s ease-out";
        canvas.style.opacity = "1";
      });

      // Update the switcher background
      moveSwitcherBg(item);

      isUpdating = false;
    } catch (error) {
      console.error("Error updating chart:", error);
      isUpdating = false;
    }
  };

  // Function to update tab selection
  const updateTabSelection = (period) => {
    document.querySelectorAll(".switcher-item").forEach((item) => {
      const itemPeriod = item.getAttribute("data-period");
      const textElement = item.querySelector(".switcher-text");

      if (itemPeriod === period) {
        item.classList.add("active");
        if (textElement) {
          textElement.classList.add("active");
          textElement.classList.remove("inactive");
        }
        // Move the sliding background to the active tab
        moveSwitcherBg(item);
      } else {
        item.classList.remove("active");
        if (textElement) {
          textElement.classList.remove("active");
          textElement.classList.add("inactive");
        }
      }
    });
  };

  // Function to attach event listeners to switcher items
  const attachSwitcherListeners = () => {
    document.querySelectorAll(".switcher-item").forEach((item) => {
      // Remove existing listeners by cloning and replacing
      const newItem = item.cloneNode(true);
      item.parentNode.replaceChild(newItem, item);

      newItem.addEventListener("click", async function () {
        const period = newItem.getAttribute("data-period");

        // Don't do anything if clicking the already active period
        if (period === currentPeriod) {
          return;
        }

        currentPeriod = period; // Update current period
        let periodKey;

        switch (period) {
          case "year":
            periodKey = "LAST_YEAR";
            break;
          case "month":
            periodKey = "LAST_MONTH";
            break;
          case "week":
            periodKey = "LAST_WEEK";
            break;
          case "day":
            periodKey = "LAST_DAY";
            break;
          default:
            periodKey = "LAST_YEAR";
        }

        await updateChart(periodKey, newItem);
      });
    });
  };

  // Initial attachment of event listeners
  attachSwitcherListeners();

  // Add resize listener to update sliding background position
  window.addEventListener("resize", function () {
    const activeTab = document.querySelector(".switcher-item.active");
    if (activeTab) {
      moveSwitcherBg(activeTab);
    }
  });
}

// Function to initialize gauge charts
function initializeGaugeCharts(burnData) {
  burnData.forEach((data, index) => {
    const ctx = document
      .getElementById(`gauge-canvas-${index}`)
      .getContext("2d");

    new Chart(ctx, {
      type: "doughnut",
      data: {
        datasets: [
          // Background (track)
          {
            data: [100],
            backgroundColor: ["rgba(255, 255, 255, 0.05)"],
            borderWidth: 0,
            borderRadius: 25,
            cutout: "55%",
            circumference: 180,
            rotation: 270,
            spacing: -5,
          },
          // Foreground (progress)
          {
            data: [100],
            backgroundColor: ["#714AFC"],
            borderWidth: 0,
            borderRadius: 25,
            cutout: "78%",
            circumference: getCircumferenceForPercentage(data.percent),
            rotation: 265,
            spacing: 15,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          datalabels: {
            display: false,
          },
        },
        animation: {
          animateRotate: true,
          animateScale: false,
        },
      },
    });
  });
}

function getCircumferenceForPercentage(percentageStr, maxCircumference = 190) {
  const percentage = +percentageStr.replace("%", "");

  const pct = Math.max(0, Math.min(percentage, 100));
  return (maxCircumference * pct) / 100;
}

// Function to generate main burn chart HTML
export function generateMainBurnChartHTML() {
  return `
        <div style="position:relative; width: 100%;">
        <div class="chart-header">
            <div class="chart-title">
                <div class="chart-title-text">All Time Burn</div>
                <div class="info-icon" data-tooltip="The “All-Time Burn” metric reflects the cumulative number of $AITECH tokens permanently removed from circulation since inception. Spikes in this figure often align with major platform developments, product launches, or periods of elevated demand, offering insight into long-term deflationary trends."></div>
            </div>
            <div class="chart-switcher">
                <div class="switcher-bg"></div>
                <div class="switcher-item" data-period="year">
                    <div class="switcher-text active">YEAR</div>
                </div>
                <div class="switcher-item" data-period="month">
                    <div class="switcher-text inactive">MONTH</div>
                </div>
                <div class="switcher-item" data-period="week">
                    <div class="switcher-text inactive">WEEK</div>
                </div>
                <div class="switcher-item" data-period="day">
                    <div class="switcher-text inactive">DAY</div>
                </div>
            </div>
        </div>
        <div id="main-chart-content">
            <canvas id="main-burn-chart-canvas"></canvas>
        </div>
    </div>`;
}

// Function to initialize tooltips
function initializeTooltips() {
  // Create tooltip element
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  const tooltipContent = document.createElement("div");
  tooltipContent.className = "tooltip-content";
  const tooltipArrow = document.createElement("div");
  tooltipArrow.className = "tooltip-arrow";
  tooltip.appendChild(tooltipContent);
  tooltip.appendChild(tooltipArrow);
  document.body.appendChild(tooltip);

  // Add event listeners to all elements with data-tooltip attribute
  document.querySelectorAll("[data-tooltip]").forEach((element) => {
    element.addEventListener("mouseenter", (e) => {
      const tooltipText = e.target.getAttribute("data-tooltip");
      tooltipContent.textContent = tooltipText;
      tooltip.style.display = "block";

      const rect = e.target.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();

      // Position tooltip above the element
      tooltip.style.left = `${
        rect.left + rect.width / 2 - tooltipRect.width / 2
      }px`;
      tooltip.style.top = `${rect.top - tooltipRect.height - 45}px`;
      tooltip.style.opacity = "1";
    });

    element.addEventListener("mouseleave", () => {
      tooltip.style.opacity = "0";
      setTimeout(() => {
        tooltip.style.display = "none";
      }, 300);
    });
  });
}

// Add initializeTooltips() call to the document ready event
document.addEventListener("DOMContentLoaded", function () {
  // ... existing initialization code ...
  initializeTooltips();
});

// Function to trim burner addresses based on screen width
function trimBurnerAddresses() {
  const addresses = document.querySelectorAll(
    ".burner-address, .regular-address"
  );
  const screenWidth = window.innerWidth;

  addresses.forEach((address) => {
    const fullAddress =
      address.getAttribute("data-full-address") || address.textContent;
    if (!address.getAttribute("data-full-address")) {
      address.setAttribute("data-full-address", fullAddress);
    }

    if (screenWidth <= 768) {
      // For mobile: show first 5 and last 5 characters
      address.textContent = `${fullAddress.slice(0, 5)}...${fullAddress.slice(
        -5
      )}`;
    } else if (screenWidth <= 560) {
      address.textContent = `${fullAddress.slice(0, 3)}...${fullAddress.slice(
        -3
      )}`;
    } else {
      // For desktop: show full address
      address.textContent = fullAddress;
    }
  });
}

// Function to render burners list
function renderBurners(topBurners, regularBurners) {
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

  // Apply initial trimming
  trimBurnerAddresses();

  // Add resize listener
  window.addEventListener("resize", trimBurnerAddresses);
}

function initializeDashboard() {
  // Hide dashboard content initially
  const dashboardContent = document.getElementById("dashboard-content");
  if (dashboardContent) {
    dashboardContent.style.display = "none";
  }

  // Add initial loading state to burn-dashboard-container
  const dashboardContainer = document.querySelector(
    ".burn-dashboard-container"
  );
  if (dashboardContainer) {
    const loadingOverlay = document.createElement("div");
    loadingOverlay.className = "dashboard-loading";
    loadingOverlay.innerHTML = `
      <div class="loading-spinner"></div>
    `;
    dashboardContainer.appendChild(loadingOverlay);
  }

  try {
    // Show loading state only on the main burn chart
    const mainBurnChart = document.getElementById("main-burn-chart");
    if (mainBurnChart) {
      mainBurnChart.innerHTML = `
        <div class="chart-loading-state">
          <div class="loading-spinner"></div>
        </div>
      `;
    }

    // Rest of the initialization code...
    // ... existing code ...

    // Show dashboard content with fade-in effect
    if (dashboardContent) {
      dashboardContent.style.display = "block";
      dashboardContent.style.opacity = "0";
      requestAnimationFrame(() => {
        dashboardContent.style.transition = "opacity 0.5s ease-out";
        dashboardContent.style.opacity = "1";
      });
    }

    // Remove loading overlay when done
    const loadingOverlay = document.querySelector(".dashboard-loading");

    if (loadingOverlay) {
      loadingOverlay.style.opacity = "0";
      loadingOverlay.style.transition = "opacity 0.3s ease-out";
      setTimeout(() => {
        loadingOverlay.remove();
      }, 300);
    }
  } catch (error) {
    console.error("Error initializing dashboard:", error);
    const loadingOverlay = document.querySelector(".dashboard-loading");
    if (loadingOverlay) {
      loadingOverlay.remove();
    }
    showError();
  }
}

// Add CSS for the sliding background
(function () {
  const styleId = "chart-switcher-bg-style";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      .chart-switcher {
        position: relative;
      }
      .switcher-bg {
        position: absolute;
        top: 3px;
        left: 2px;
        width: 0;
        height: 100%;
        max-height: 32px;
        max-width: 55px;
        background: #4e4e4e;
        border-radius: 24px;
        transition: transform 0.3s cubic-bezier(.4,0,.2,1), width 0.3s cubic-bezier(.4,0,.2,1);
        z-index: 0;
        pointer-events: none;
      }
      .switcher-item {
        position: relative;
        z-index: 1;
        transition: color 0.3s ease;
      }
      .switcher-item.active {
        color: #ffffff;
      }
    `;
    document.head.appendChild(style);
  }
})();

// Export other necessary functions
export {
  initializeMainBurnChart,
  initializePeriodSwitcher,
  initializeMiniCharts,
  initializeGaugeCharts,
  initializeTooltips,
  renderBurners,
  trimBurnerAddresses,
  initializeDashboard,
};
