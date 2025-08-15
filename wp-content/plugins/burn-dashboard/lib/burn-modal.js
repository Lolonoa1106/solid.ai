import erc20Contract from "./erc20.js";
import CoinGeckoAPI from "./coingecko.js";

class BurnModal {
  constructor() {
    this.modal = document.getElementById("burn-tokens-modal");
    this.burnButton = document.getElementById("burn-tokens-button");
    this.closeButton = document.getElementById("close-modal");
    this.cancelButton = document.getElementById("cancel-burn");
    this.confirmButton = document.getElementById("confirm-burn");
    this.inputContainer = document.querySelector(".input-container");
    this.amountInput = document.querySelector(".amount-input");
    this.receivedAmount = document.querySelector(".received-amount .amount");
    this.amountLeft = document.querySelector(".amount-left");
    this.flameIcon = document.querySelector(".flame-icon");
    this.balanceAmount = document.querySelector(".balance-amount .amount");
    this.errorMessage = document.querySelector(".input-error-message");
    this.priceDisplay = document.getElementById("aitech-price");
    this.currentBalance = 0;
    this.initialBalance = 0;
    this.isDirty = false;
    this.isBurning = false;
    this.coinGecko = new CoinGeckoAPI();
    this.aitechPrice = 0;
    this.priceCache = {
      price: 0,
      timestamp: 0,
      cacheDuration: 60000, // Cache for 1 minute
    };

    this.init();
  }

  async init() {
    // Bind event listeners
    this.closeButton.addEventListener("click", () => this.closeModal());
    this.cancelButton.addEventListener("click", () => this.closeModal());
    this.confirmButton.addEventListener("click", () => this.handleBurn());
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal && !this.isBurning) {
        this.closeModal();
      }
    });
    this.amountInput.addEventListener("input", (e) =>
      this.handleAmountInput(e)
    );
    this.amountInput.addEventListener("blur", (e) => this.handleAmountBlur(e));

    // Fetch initial AITECH price
    await this.updateAITECHPrice();

    // Listen for wallet state changes
    window.addEventListener("walletStateChanged", async (event) => {
      if (event.detail.connected) {
        await this.updateBalance(event.detail.signer);
      } else {
        // If wallet is disconnected while burn modal is open, close it
        this.closeModal();
      }
    });

    // Listen for showBurnModal event
    window.addEventListener("showBurnModal", async (event) => {
      // Only proceed if user initiated the burn modal
      if (!event.detail?.userInitiated) {
        return;
      }

      const signer = event.detail?.signer || window.globalWalletSigner;
      if (signer && signer.address) {
        try {
          await Promise.all([
            this.updateBalance(signer),
            this.updateAITECHPrice(),
          ]);
          this.openModal();
        } catch (error) {
          console.error("Error initializing burn modal:", error);
          this.closeModal();
        }
      } else {
        console.error("No valid signer available for burn modal");
        this.closeModal();
      }
    });

    // Listen for network changes
    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => {
        // Close burn modal if network changes
        this.closeModal();
      });

      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          // Close burn modal if wallet is disconnected
          this.closeModal();
        }
      });
    }
  }

  async updateAITECHPrice() {
    try {
      // Check if we have a valid cached price
      const now = Date.now();
      if (
        this.priceCache.price &&
        now - this.priceCache.timestamp < this.priceCache.cacheDuration
      ) {
        this.aitechPrice = this.priceCache.price;
        this.updatePriceDisplay();
        return;
      }

      // Fetch new price if cache is invalid
      const price = await this.coinGecko.fetchAITECHPrice();
      this.aitechPrice = price;

      // Update cache
      this.priceCache = {
        price: price,
        timestamp: now,
      };

      this.updatePriceDisplay();
    } catch (error) {
      console.error("Error fetching AITECH price:", error);
      this.aitechPrice = 0;
      this.updatePriceDisplay();
    }
  }

  updatePriceDisplay() {
    if (this.priceDisplay) {
      this.priceDisplay.textContent = this.aitechPrice.toFixed(2);
    }
  }

  async updateBalance(signer) {
    if (!signer || !signer.address) {
      console.error("No valid signer provided for balance update");
      return;
    }

    try {
      const balance = await erc20Contract.getBalance(signer.address);
      this.currentBalance = parseFloat(balance);
      this.initialBalance = this.currentBalance;

      // Update balance display
      this.balanceAmount.textContent = this.formatNumber(
        this.currentBalance.toFixed(2)
      );

      this.updateAmounts(this.amountInput.value || "0");
    } catch (error) {
      console.error("Error updating balance:", error);
      this.currentBalance = 0;
      this.initialBalance = 0;
      this.balanceAmount.textContent = "0.00";
    }
  }

  formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  updateFlameFill(numericValue) {
    const percentage = (numericValue / this.initialBalance) * 100;
    const gradientStops = [
      { offset: 0, color: "#828282" },
      { offset: Math.min(percentage / 100, 1), color: "#828282" },
      { offset: Math.min(percentage / 100, 1), color: "#323232" },
      { offset: 1, color: "#323232" },
    ];

    if (percentage > 100) {
      gradientStops[3] = { offset: 1, color: "#828282" };
    }

    const svgContent = `
      <svg width="65" height="91" viewBox="0 0 65 91" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M29.0566 86.7532C13.6068 84.7099 2.73863 70.5288 4.78199 55.0789C5.11443 51.9594 5.7495 47.7635 9.45241 40.5746C9.00225 51.5924 16.9538 56.357 22.6242 54.9535C28.2947 53.55 32.2317 46.7973 27.5552 38.3743C23.6176 31.2819 20.2423 16.5742 33.1887 4.3457C37.559 27.4558 63.9346 38.3711 60.7309 62.4786C58.6876 77.9284 44.5065 88.7966 29.0566 86.7532Z"
          stroke="url(#paint0_linear_2548_20975)"
          stroke-width="8"
          stroke-linejoin="round"
        />
        <defs>
          <linearGradient id="paint0_linear_2548_20975" x1="32.7676" y1="87.0001" x2="32.7676" y2="4.3457" gradientUnits="userSpaceOnUse">
            ${gradientStops
              .map(
                (stop) =>
                  `<stop offset="${
                    isNaN(stop.offset) ? 100 : stop.offset
                  }" stop-color="${stop.color}" />`
              )
              .join("")}
          </linearGradient>
        </defs>
      </svg>
    `;

    this.flameIcon.innerHTML = svgContent;
  }

  updateAmounts(inputValue) {
    const numericValue = parseFloat(inputValue.replace(/,/g, ""));
    if (!isNaN(numericValue)) {
      // Calculate estimated USD received (2.5x the burn amount)
      const estimatedUSD = numericValue * this.aitechPrice;
      this.receivedAmount.textContent = this.formatNumber(
        estimatedUSD.toFixed(2)
      );

      // Calculate remaining balance
      const remaining = Math.max(0, this.initialBalance - numericValue);
      this.amountLeft.textContent = `Amount left ${this.formatNumber(
        remaining.toFixed(2)
      )} AITECH`;

      // Update flame fill based on input value
      this.updateFlameFill(numericValue);

      // Enable/disable confirm button based on balance and minimum amount
      const isAmountValid =
        numericValue >= 10 && numericValue <= this.currentBalance;
      this.confirmButton.disabled = !isAmountValid;

      // Add visual feedback for invalid amount only if field is dirty
      if (this.isDirty) {
        if (numericValue === 0) {
          this.inputContainer.classList.add("error");
          this.errorMessage.textContent = "Amount cannot be 0";
          this.confirmButton.disabled = true;
        } else if (numericValue > this.currentBalance) {
          this.inputContainer.classList.add("error");
          this.errorMessage.textContent = "Amount exceeds your balance";
          this.confirmButton.disabled = true;
        } else if (numericValue < 10 && this.currentBalance > 0) {
          this.inputContainer.classList.add("error");
          this.errorMessage.textContent = "Minimum burn amount is 10 AITECH";
          this.confirmButton.disabled = true;
        } else {
          this.inputContainer.classList.remove("error");
          this.errorMessage.textContent = "";
          this.confirmButton.disabled = false;
        }
      }
    } else {
      // Reset error state when input is empty or invalid
      if (this.isDirty) {
        this.inputContainer.classList.remove("error");
        this.errorMessage.textContent = "";
      }
      this.confirmButton.disabled = false;
    }
  }

  handleAmountInput(e) {
    this.isDirty = true;
    let value = e.target.value;

    // Remove any non-numeric characters except decimal point
    value = value.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point
    const parts = value.split(".");
    if (parts.length > 2) {
      value = parts[0] + "." + parts.slice(1).join("");
    }

    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      value = parts[0] + "." + parts[1].slice(0, 2);
    }

    // Update input value
    e.target.value = value;

    // Check if value is empty or NaN
    const numericValue = parseFloat(value);
    if (!value || isNaN(numericValue)) {
      // Reset UI when input is empty or invalid
      this.receivedAmount.textContent = "0.00";
      this.amountLeft.textContent = `Amount left ${this.formatNumber(
        this.initialBalance.toFixed(2)
      )} AITECH`;
      this.updateFlameFill(0);
      this.confirmButton.disabled = true;
      if (this.isDirty) {
        this.inputContainer.classList.remove("error");
        this.errorMessage.textContent = "";
      }
      return;
    }

    this.updateAmounts(value);
  }

  handleAmountBlur(e) {
    let value = e.target.value;

    // Remove any non-numeric characters except decimal point
    value = value.replace(/[^0-9.]/g, "");

    if (value) {
      // Format to 2 decimal places
      value = parseFloat(value).toFixed(2);
      e.target.value = this.formatNumber(value);
      this.updateAmounts(value);
    }
  }

  openModal() {
    this.modal.style.display = "flex";
  }

  closeModal() {
    this.modal.style.display = "none";
    this.hideModalBackground();
  }

  async handleBurn() {
    const amount = parseFloat(this.amountInput.value.replace(/,/g, ""));

    try {
      // Set burning state
      this.isBurning = true;

      // Show loading state
      this.confirmButton.disabled = true;
      this.cancelButton.disabled = true;
      this.closeButton.disabled = true;

      await erc20Contract.burn(amount);

      // Update the burned tokens count in the header
      const burnedTokensValue = document.querySelector(".burned-tokens-value");
      const currentBurned = parseFloat(burnedTokensValue.textContent) || 0;
      burnedTokensValue.textContent = this.formatNumber(
        (currentBurned + amount).toFixed(2)
      );

      // Update current balance
      this.currentBalance -= amount;
      this.balanceAmount.textContent = this.formatNumber(
        this.currentBalance.toFixed(2)
      );

      // Close the modal
      this.closeModal();

      // Show success modal
      this.showBurnSuccessModal();
    } catch (error) {
      console.error("Error burning tokens:", error);
    } finally {
      // Reset burning state
      this.isBurning = false;

      // Reset button state
      this.confirmButton.disabled = false;
      this.confirmButton.textContent = "Burn";
      this.cancelButton.disabled = false;
      this.closeButton.disabled = false;
    }
  }

  hideModalBackground() {
    const modalBackground = document.querySelector(".modal-background");

    if (modalBackground) {
      modalBackground.style.opacity = "0";
      setTimeout(() => {
        if (modalBackground && modalBackground.parentNode) {
          modalBackground.parentNode.removeChild(modalBackground);
        }
      }, 300);
    }
  }

  showBurnSuccessModal() {
    if (!document.getElementById("burn-success-modal")) {
      const modalHtml = `
        <div id="burn-success-modal" class="success-modal-overlay">
          <div class="success-modal" style="justify-content: space-between;">
            <div class="success-modal-header">
              <button class="success-modal-close-button" id="burn-success-modal-close-btn"></button>
            </div>
            <div class="modal-body">
              <div class="success-message">${this.formatNumber(
                this.amountInput.value
              )}</div>
              <div class="success-message-description">Tokens burned</div>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML("beforeend", modalHtml);

      // Handle both close buttons
      document
        .getElementById("burn-success-modal-close-btn")
        .addEventListener("click", () => {
          const modal = document.getElementById("burn-success-modal");
          modal.classList.remove("active");
          modal.classList.add("fade-out");
          setTimeout(() => modal.remove(), 300);
        });
    }

    document.getElementById("burn-success-modal").classList.add("active");
  }
}

export default BurnModal;
