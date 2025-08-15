window.jQuery(document).ready(function () {
  // Check if we're on the profile page
  if (window.location.pathname.includes("/profile/")) {
    return; // Don't initialize proposals.js on profile page
  }

  const ethersScript = document.createElement("script");

  ethersScript.src =
    "https://cdnjs.cloudflare.com/ajax/libs/ethers/5.6.0/ethers.umd.min.js";
  ethersScript.type = "text/javascript";
  ethersScript.onload = () => {
    window.dispatchEvent(new CustomEvent("onEthersLoad"));
  };
  document.head.appendChild(ethersScript);

  window.addEventListener("onEthersLoad", () => {
    const snapshotScript = document.createElement("script");
    snapshotScript.src =
      "https://cdn.jsdelivr.net/npm/@snapshot-labs/snapshot.js";
    snapshotScript.onload = () => {
      window.client = new window.snapshot.Client712("https://hub.snapshot.org");

      const controller = new ProposalsController();
      window.aitechProposals.state = controller.state;
      controller.initialize();

      window.restoreWalletConnection();

      // Function to create voting power modal
      const createVotingPowerModal = () => {
        if (!window.globalWalletSigner) return;

        // Remove existing modal if any
        window.jQuery(".voting-power-modal").remove();

        window.jQuery("body").append(`
      <div class="voting-power-modal">
        <div class="voting-power-modal-content">
          <div class="voting-power-modal-header">
            <div class="voting-power-header-title">Your Voting Power</div>
            <div class="voting-power-modal-close">
            </div>
          </div>
          <div class="voting-power-modal-body">
            <div class="voting-power-avatar" style="display: flex; align-items: center; gap: 12px;">
             <div class="voter-avatar"  style="min-width: 36px; min-height: 36px;">
                <div class="voter-avatar-placeholder"></div>
                <img class="voter-avatar-image" 
                     src="${ProposalsUtils.buildAvatarUrl(
                       window.globalWalletSigner.address
                     )}" 
                     alt="Voter Avatar"
                     onload="this.classList.add('loaded'); this.previousElementSibling.classList.add('hidden');"
                     onerror="this.classList.add('error'); this.previousElementSibling.classList.add('hidden');">
                <div class="eye-icon"></div>
              </div>
              <div class="aitech-user-info" data-address="${
                window.globalWalletSigner.address
              }">
                <div class="aitech-user-name">${window.globalWalletSigner.address.substring(
                  0,
                  6
                )}...${window.globalWalletSigner.address.substring(
          window.globalWalletSigner.address.length - 4
        )}</div>
                <div class="aitech-user-address">${window.globalWalletSigner.address.substring(
                  0,
                  6
                )}...${window.globalWalletSigner.address.substring(
          window.globalWalletSigner.address.length - 4
        )}</div>
              </div>
            </div>
            <div class="voting-power-value" style="font-family: 'Roboto Flex';
              font-weight: 700;
              font-size: 16px;
              line-height: 18px;
              letter-spacing: 0%;
              text-transform: uppercase;
              color: #FFFFFF;">
              <span class="voting-power-button-value-number"></span> AITECH
            </div>
          </div>
        </div>
      </div>
    `);
      };

      // Import web3-modal and check wallet connection
      import("./web3-modal.js").then(({ default: web3Modal }) => {
        // Wait for wallet initialization
        const checkWalletInitialization = async () => {
          // Skip wallet initialization on single proposal page
          if (window.isSingleProposalPage) {
            return;
          }

          // Wait up to 3 seconds for wallet initialization
          for (let i = 0; i < 30; i++) {
            if (
              window.globalWalletSigner ||
              localStorage.getItem("walletConnected")
            ) {
              // Wallet is initialized and connected, create voting power modal
              createVotingPowerModal();
              return;
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          // After waiting, if still no wallet connection, show modal
          if (
            !window.globalWalletSigner &&
            !localStorage.getItem("walletConnected")
          ) {
            //web3Modal.show();
          }
        };

        // Listen for wallet connection events
        window.addEventListener("walletStateChanged", async (event) => {
          if (event.detail.connected && event.detail.signer) {
            createVotingPowerModal();
          }
        });

        // Start checking wallet initialization
        checkWalletInitialization();

        // Add click handler for create proposal button
        window
          .jQuery(document)
          .on("click", ".aitech-create-proposal-btn", function (e) {
            // Check if user is admin
            const isAdmin =
              window.globalWalletSigner &&
              window.aitechProposals.state.cache.space?.space?.members
                ?.map((member) => member.toLowerCase())
                .includes(window.globalWalletSigner.address.toLowerCase());

            if (!isAdmin) {
              e.preventDefault();
              return;
            }

            window.location.href = "/create-proposal";
          });
      });

      // Function to update create proposal button state
      const updateCreateProposalButton = () => {
        const button = window.jQuery(".aitech-create-proposal-btn");
        if (!button.length) return;

        const isAdmin =
          window.globalWalletSigner &&
          window.aitechProposals.state.cache.space?.space?.members
            ?.map((member) => member.toLowerCase())
            .includes(window.globalWalletSigner.address.toLowerCase());

        if (!isAdmin) {
          button
            .addClass("disabled")
            .prop("disabled", true)
            .attr("disabled", "disabled")
            .css("pointer-events", "none");
        } else {
          button
            .removeClass("disabled")
            .prop("disabled", false)
            .removeAttr("disabled")
            .css("pointer-events", "auto");
        }
      };

      // Update button state when wallet connects/disconnects
      window.addEventListener("walletStateChanged", async (event) => {
        if (event.detail.connected && event.detail.signer) {
          updateCreateProposalButton();
        } else {
          const button = window.jQuery(".aitech-create-proposal-btn");
          if (button.length) {
            button
              .addClass("disabled")
              .prop("disabled", true)
              .attr("disabled", "disabled")
              .css("pointer-events", "none");
          }
        }
      });

      // Update button state when space data is loaded
      ProposalsAPI.fetchSpaceData(window.aitechProposals.state, () => {
        updateCreateProposalButton();
      });

      // Add click handler for voting power display
      window
        .jQuery(document)
        .on("click", ".voting-power-display", async function (e) {
          e.preventDefault();

          // If no wallet is connected, show wallet connect modal first
          if (!window.globalWalletSigner) {
            // Show wallet connect modal
            window.web3Modal.show();

            // Listen for wallet connection event
            const handleWalletConnected = async (event) => {
              if (event.detail.connected && event.detail.signer) {
                // Remove the listener since we only need it once
                window.removeEventListener(
                  "walletStateChanged",
                  handleWalletConnected
                );

                // Now that wallet is connected, show voting power modal
                const modal = window.jQuery(".voting-power-modal");
                const value = window
                  .jQuery(this)
                  .find(".voting-power-button-value-number")
                  .text();
                modal.find(".voting-power-value-number").text(value);
                modal.addClass("active");
                setTimeout(() => {
                  modal.addClass("show");
                }, 10);
              }
            };

            // Listen for wallet connection
            window.addEventListener(
              "walletStateChanged",
              handleWalletConnected
            );
            return;
          }

          // If wallet is connected, show voting power modal directly
          const modal = window.jQuery(".voting-power-modal");
          const value = window
            .jQuery(this)
            .find(".voting-power-button-value-number")
            .text();
          modal.find(".voting-power-value-number").text(value);
          modal.addClass("active");
          setTimeout(() => {
            modal.addClass("show");
          }, 10);
        });

      // Add listener for wallet disconnection to update voting power
      window.addEventListener("walletStateChanged", async (event) => {
        if (!event.detail.connected) {
          // Update voting power display to '-' when wallet is disconnected
          window.votingPower = "-";
          window.jQuery(".voting-power-button-value-number").text("-");
          window
            .jQuery(".voting-power-modal .voting-power-button-value-number")
            .text("-");

          // Close voting power modal if it's open
          const modal = window.jQuery(".voting-power-modal");
          if (modal.hasClass("show")) {
            modal.removeClass("show");
            setTimeout(() => {
              modal.removeClass("active");
            }, 300);
          }
        }
      });

      // Add click handler for modal close button
      window
        .jQuery(document)
        .on("click", ".voting-power-modal-close", function () {
          const modal = window.jQuery(".voting-power-modal");
          modal.removeClass("show");
          setTimeout(() => {
            modal.removeClass("active");
          }, 300);
        });

      // Close modal when clicking outside
      window.jQuery(document).on("click", ".voting-power-modal", function (e) {
        if (e.target === this) {
          const modal = window.jQuery(this);
          modal.removeClass("show");
          setTimeout(() => {
            modal.removeClass("active");
          }, 300);
        }
      });
    };
    document.head.appendChild(snapshotScript);
  });
});

class ProposalsState {
  constructor() {
    this.cache = {
      proposals: new Map(),
      space: null,
      leaderboard: null,
      lastFetch: {
        proposals: new Map(),
        space: 0,
        leaderboard: 0,
      },
    };
    this.CACHE_DURATION = 5 * 60 * 1000;
    this.searchTimeout = null;
    this.pagination = {
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 10,
      totalItems: 0,
      maxVisiblePages: 10,
      loadingPage: null,
    };
    this.currentRequest = null;
    this.sorting = {
      column: "created", // Default sort column
      direction: "desc", // Default sort direction
    };
  }
  // Generate cache key for proposals
  getProposalsCacheKey(page = 1, sorting = this.sorting, filters = null) {
    let key = `${page}-${sorting.column}-${sorting.direction}`;
    if (filters) {
      if (filters.status && filters.status !== "any") {
        key += `-status:${filters.status}`;
      }
      if (filters.author && filters.author !== "any") {
        key += `-author:${filters.author}`;
      }
    }
    return key;
  }
  isCacheValid(type, page = 1, sorting = this.sorting, filters = null) {
    if (type === "proposals") {
      const key = this.getProposalsCacheKey(page, sorting, filters);
      return (
        this.cache[type].has(key) &&
        Date.now() - this.cache.lastFetch[type].get(key) < this.CACHE_DURATION
      );
    }
    return (
      this.cache[type] &&
      Date.now() - this.cache.lastFetch[type] < this.CACHE_DURATION
    );
  }
  updateCache(type, data, page = 1, sorting = this.sorting, filters = null) {
    if (type === "proposals") {
      const key = this.getProposalsCacheKey(page, sorting, filters);
      this.cache[type].set(key, data);
      this.cache.lastFetch[type].set(key, Date.now());
    } else {
      this.cache[type] = data;
      this.cache.lastFetch[type] = Date.now();
    }
  }
}

const ProposalsAPI = {
  PROPOSALS_QUERY: `
    query Proposals($first: Int!, $skip: Int!, $titleContains: String, $orderBy: String, $orderDirection: OrderDirection, $state: String, $author_in: [String]) {
      proposals(
        first: $first,
        skip: $skip,
        where: { 
          title_contains: $titleContains, 
          state: $state,
          author_in: $author_in
          space: "aitechio.eth"
        },
        orderBy: $orderBy,
        orderDirection: $orderDirection
      ) {
        id
        title
        author
        votes
        quorum
        created
        end
        state
        choices
        scores
        scores_total
        network
        snapshot
        space {
          id
          strategies {
            name
            params
          } 
        }
        strategies {
          name
          params
        }
      }
    }
  `,
  SPACE_QUERY: `
    query Spaces {
      space(id: "aitechio.eth") {
        id 
        name
        proposalsCount
        followersCount
        votesCount
        about
        admins
        moderators
        members
        strategies {
          name
          params
        }
      }
    }
  `,

  async getTotalVotingPower(proposals) {
    if (!window.globalWalletSigner) {
      window.votingPower = "-";
      window.jQuery(".voting-power-button-value-number").text("-");
      window
        .jQuery(".voting-power-modal .voting-power-button-value-number")
        .text("-");
      return;
    }

    const totalVotingPower = await this.getVotingPower(proposals[0]);
    window.votingPower = totalVotingPower.toFixed(0);
    window
      .jQuery(".voting-power-button-value-number")
      .text(totalVotingPower.toFixed(0));
    window
      .jQuery(".voting-power-modal .voting-power-button-value-number")
      .text(totalVotingPower.toFixed(0));
  },

  async getVotingPower(proposal) {
    if (!window.globalWalletSigner) {
      return 0;
    }

    if (
      !proposal ||
      !proposal.space.strategies ||
      !Array.isArray(proposal.space.strategies)
    ) {
      console.warn("Invalid proposal data for voting power calculation");
      return 0;
    }

    try {
      const { Web3Provider } = ethers.providers;
      const provider = new Web3Provider(window.ethereum);
      const [account] = await provider.listAccounts();

      if (!account) {
        console.warn("No account available for voting power calculation");
        return 0;
      }

      const result = await window.snapshot.utils.getVp(
        account,
        proposal.network,
        proposal.space.strategies,
        proposal.snapshot,
        proposal.space.id,
        proposal.strategies.some((strategy) => strategy.name === "delegation")
      );

      return result.vp;
    } catch (error) {
      console.error("Error in getVotingPower:", error);
      return 0;
    }
  },
  fetchProposals(searchTerm = "", state, cb, page = 1) {
    const containers = window.jQuery(".aitech-proposals-list");
    if (!containers.length) {
      return;
    }

    // Check cache for the specific page, sorting, and filters
    const sorting = state.sorting;
    if (
      !searchTerm &&
      state.isCacheValid("proposals", page, sorting, state.filters)
    ) {
      containers.each(function () {
        const container = window.jQuery(this);
        container.find(".aitech-loading").remove();
        state.pagination.currentPage = page;
        state.pagination.loadingPage = null;
        const key = state.getProposalsCacheKey(page, sorting, state.filters);
        cb(state.cache.proposals.get(key), container);
        ProposalsUI.updatePagination(state.pagination, searchTerm);
      });
      return;
    }

    // Abort any existing request
    if (state.currentRequest) {
      state.currentRequest.abort();
    }

    // Create new abort controller
    const controller = new AbortController();
    state.currentRequest = controller;

    // Otherwise fetch new data
    containers.each(function () {
      const container = window.jQuery(this);
      // Only show loading state if not a pagination request
      if (page === 1) {
        ProposalsUI.showLoadingState(container);
      }

      const skip = (page - 1) * state.pagination.itemsPerPage;

      // Prepare variables for GraphQL query
      const variables = {
        first: state.pagination.itemsPerPage,
        skip: skip,
        orderBy: state.sorting.column,
        orderDirection: state.sorting.direction,
      };

      // Always include search term in title_contains if present
      if (searchTerm) {
        variables.titleContains = searchTerm;
      }

      // Add status filter if set
      if (state.filters?.status && state.filters.status !== "any") {
        variables.state = state.filters.status.toLowerCase();
      }

      // Add author filter if set
      if (state.filters?.author && state.filters.author !== "any") {
        if (state.cache.space?.space) {
          if (state.filters.author === "admin") {
            variables.author_in = state.cache.space.space.admins;
          } else if (state.filters.author === "moderator") {
            variables.author_in = state.cache.space.space.moderators;
          }
        }
      }

      window.jQuery.ajax({
        url: "https://d8ckkgcrj0.execute-api.eu-central-1.amazonaws.com/prod/graphql",
        type: "POST",
        data: JSON.stringify({
          query: ProposalsAPI.PROPOSALS_QUERY,
          variables: variables,
        }),
        contentType: "application/json",
        signal: controller.signal,
        success: function (response) {
          if (response.data && response.data.proposals) {
            // Cache the results for this page with current filters
            const key = state.getProposalsCacheKey(
              page,
              sorting,
              state.filters
            );
            state.updateCache(
              "proposals",
              response.data.proposals,
              page,
              sorting,
              state.filters
            );

            ProposalsAPI.getTotalVotingPower(response.data.proposals);

            // Update pagination state
            state.pagination.currentPage = page;
            state.pagination.loadingPage = null;

            // Only set totalItems for default view
            if (
              !searchTerm &&
              !state.filters?.status &&
              !state.filters?.author &&
              state.cache.space &&
              state.cache.space.space
            ) {
              const totalProposals = state.cache.space.space.proposalsCount;
              state.pagination.totalItems = totalProposals;
              state.pagination.totalPages = Math.max(
                1,
                Math.ceil(totalProposals / state.pagination.itemsPerPage)
              );
            } else if (
              searchTerm ||
              state.filters?.status ||
              state.filters?.author
            ) {
              // For search or filtered view, only show one page (no pagination)
              state.pagination.totalPages = 1;
              state.pagination.currentPage = 1;
            }

            cb(response.data.proposals, container);
            ProposalsUI.updatePagination(state.pagination, searchTerm);
          } else {
            const errorMessage = response.errors
              ? `Error loading proposals: ${response.errors[0].message}`
              : "Error loading proposals. Please try again.";
            container.html(`<div class="aitech-error">${errorMessage}</div>`);
            state.pagination.loadingPage = null;
            ProposalsUI.updatePagination(state.pagination, searchTerm);
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          // Only show error if the request wasn't aborted
          if (textStatus !== "abort") {
            container.html(
              '<div class="aitech-error">Error loading proposals. Please try again.</div>'
            );
          }
          state.pagination.loadingPage = null;
          ProposalsUI.updatePagination(state.pagination, searchTerm);
        },
      });
    });
  },
  fetchSpaceData(state, cb) {
    if (state.isCacheValid("space")) {
      cb(state.cache.space);
      // Update pagination if we have proposals loaded
      if (state.cache.proposals) {
        const totalProposals = state.cache.space.space.proposalsCount;
        state.pagination.totalPages = Math.max(
          1,
          Math.ceil(totalProposals / state.pagination.itemsPerPage)
        );

        ProposalsUI.updatePagination(state.pagination);
      }
      return;
    }
    window.jQuery.ajax({
      url: "https://d8ckkgcrj0.execute-api.eu-central-1.amazonaws.com/prod/graphql",
      type: "POST",
      data: JSON.stringify({ query: ProposalsAPI.SPACE_QUERY }),
      contentType: "application/json",
      success: function (response) {
        if (response.data && response.data.space) {
          state.updateCache("space", response.data);
          cb(response.data);
          // Update pagination if we have proposals loaded
          if (state.cache.proposals) {
            const totalProposals = response.data.space.proposalsCount;
            state.pagination.totalPages = Math.max(
              1,
              Math.ceil(totalProposals / state.pagination.itemsPerPage)
            );

            ProposalsUI.updateSpaceStats(response.data);
            ProposalsUI.updatePagination(state.pagination);
          }
        }
      },
      error: function () {},
    });
  },
  calculateWinningOption(proposal) {
    if (!proposal.scores || !proposal.choices || proposal.scores.length === 0) {
      return null;
    }

    const totalScore = proposal.scores.reduce((sum, score) => sum + score, 0);
    const maxScore = Math.max(...proposal.scores);
    const winningIndices = proposal.scores.reduce((indices, score, index) => {
      if (score === maxScore) {
        indices.push(index);
      }
      return indices;
    }, []);

    const winningChoices = winningIndices.map(
      (index) => proposal.choices[index]
    );
    const percentage = ((maxScore / totalScore) * 100).toFixed(1);

    return {
      choices: winningChoices.join(", "),
      percentage: percentage,
    };
  },
};

const ProposalsUI = {
  showLoadingState(container) {
    container.html(`
      <div class="aitech-loading">
        <div class="spinner"></div>
      </div>
    `);

    window.jQuery(".aitech-pagination").hide();
  },
  updateSpaceStats(spaceData) {
    if (!spaceData || !spaceData.space) return;
    const stats = spaceData.space;
    window
      .jQuery(".aitech-stat-proposals")
      .text(ProposalsUtils.formatNumberWithK(stats.proposalsCount));
    window
      .jQuery(".aitech-stat-votes")
      .text(ProposalsUtils.formatNumberWithK(stats.votesCount));
    window
      .jQuery(".aitech-stat-followers")
      .text(ProposalsUtils.formatNumberWithK(stats.followersCount, 1));
    if (stats.about) {
      window.jQuery(".aitech-description").text(stats.about);
    }
  },
  updateProposals(proposals, container) {
    // Only render rows in .aitech-proposals-list
    let html = "";
    if (!proposals || proposals.length === 0) {
      html = '<div class="no-records">No proposals found</div>';
      window.jQuery(".aitech-pagination").hide();
      container.html(html);
      return;
    }

    // Get admins if space data exists
    const admins =
      window.aitechProposals.state.cache.space?.space?.admins || [];

    proposals.forEach((proposal) => {
      const winningOption = ProposalsAPI.calculateWinningOption(proposal);

      let badgeType = "moderator";
      if (admins.includes(proposal.author.toLowerCase())) {
        badgeType = "admin";
      }

      const isMobile = window.innerWidth <= 992;

      if (isMobile) {
        window
          .jQuery(".mobile-title-count")
          .text(`${proposals.length} results`);
      }

      html += isMobile
        ? getMobileProposal(proposal, badgeType, winningOption)
        : getDesktopProposal(proposal, badgeType, winningOption);

      window.addEventListener("resize", () => {
        const isMobile = window.innerWidth <= 992;
        const container = window.jQuery(".aitech-proposals-list");

        if (proposals) {
          let html = "";
          proposals.forEach((proposal) => {
            const winningOption = ProposalsAPI.calculateWinningOption(proposal);
            let badgeType = "moderator";
            if (admins.includes(proposal.author.toLowerCase())) {
              badgeType = "admin";
            }
            html += isMobile
              ? getMobileProposal(proposal, badgeType, winningOption)
              : getDesktopProposal(proposal, badgeType, winningOption);
          });
          container.html(html);
        }
      });
    });
    container.html(html);

    // Add click handler for proposal rows
    window
      .jQuery(".proposal-row")
      .off("click")
      .on("click", function (e) {
        if (e.currentTarget.className === "aitech-author") {
          return;
        }

        const id = window.jQuery(this).data("id");
        if (id) {
          window.location.href = `/proposals/${id}`;
        }
      });

    window.jQuery(document).on("click", ".aitech-author", function (e) {
      e.stopPropagation();
      e.preventDefault();

      const address = window.jQuery(this).data("address");
      if (address) window.location.href = `/profile/${address}`;
    });

    window.jQuery(document).on("click", ".aitech-user-info", function (e) {
      e.stopPropagation();
      e.preventDefault();

      const address = window.jQuery(this).data("address");
      if (address) window.location.href = `/profile/${address}`;
    });

    // Add sort indicators to static header
    const state = window.aitechProposals.state;
    const tableHeader = container
      .closest(".aitech-table-container")
      .find(".aitech-table-header");

    // Update the sort indicators
    tableHeader.find(".sortable").removeClass("active asc desc");
    tableHeader.find(".sort-icon").hide();
    tableHeader
      .find(`.sortable[data-sort='${state.sorting.column}']`)
      .addClass("active")
      .addClass(state.sorting.direction)
      .find(".sort-icon")
      .show();

    function getDesktopProposal(proposal, badgeType, winningOption) {
      return `
        <div class="aitech-table-row proposal-row" data-id="${
          proposal.id
        }" style="cursor:pointer;">
          <div class="aitech-table-cell">
            <div class="aitech-proposal-info">
              <div class="aitech-proposal-id">
                <span>#${proposal.id.substring(0, 5)}</span> <span>by</span>
                <div class="aitech-proposal-id-divider"></div>
                <div class="aitech-author" data-address="${proposal.author}">
                  <div class="aitech-author-avatar"> 
                  <img
                  class="aitech-author-avatar aitech-single-proposal-author-avatar"
                  src="${ProposalsUtils.buildAvatarUrl(proposal.author)}"
                  alt="Author Avatar"
                 />
            </div>
                  <span class="aitech-author-address">${proposal.author.substring(
                    0,
                    5
                  )}...${proposal.author.substring(38)}</span>
                </div>
              </div>
              ${
                badgeType
                  ? `<div class="aitech-moderator-badge"><img
                  class="aitech-author-avatar aitech-single-proposal-author-avatar"
                  src="${ProposalsUtils.buildAvatarUrl(proposal.author)}"
                  alt="Author Avatar"
                 /> <span>${badgeType}</span></div>`
                  : ""
              }
            </div>
            <div class="aitech-proposal-title">${proposal.title}</div>
          </div>
          <div class="aitech-table-cell">
            <div class="aitech-result-option">${
              winningOption?.choices || ""
            }</div>
            <div class="aitech-result-text">${
              winningOption ? `${+winningOption.percentage || 0}%` : ""
            }</div>
          </div>
          <div class="aitech-table-cell">
            <div class="aitech-date-status">${
              proposal.state === "active" || proposal.state === "pending"
                ? "ENDS ON"
                : "ENDED"
            }</div>
            <div class="aitech-date-time">${
              proposal.state === "active" || proposal.state === "pending"
                ? `${ProposalsUtils.formatTimeRemaining(proposal.end)}`
                : `${ProposalsUtils.formatDate(proposal.end)}`
            }</div>
          </div>
           <div class="aitech-table-cell">
          <div class="${
            proposal.state === "active" || proposal.state === "pending"
              ? "aitech-status-badge"
              : "aitech-closed-status-badge"
          }">
              <span>${proposal.state.toUpperCase()}</span>
            </div>
          </div>
          <div class="aitech-table-cell">
            <div class="aitech-quorum-value">${ProposalsUtils.formatNumberWithK(
              proposal.quorum,
              2
            )}%</div>
          </div>
        </div>
      `;
    }

    function getMobileProposal(proposal, badgeType, winningOption) {
      return `
        <div class="mobile-proposal">
          <div class="aitech-table-cell">
            <div class="aitech-proposal-info">
              <div class="aitech-proposal-id">
                <span>#${proposal.id.substring(0, 5)}</span> <span>by</span>
                <div class="aitech-proposal-id-divider"></div>
                <div class="aitech-author" data-address="${proposal.author}">
                  <div class="aitech-author-avatar"> 
                  <img
                  class="aitech-author-avatar aitech-single-proposal-author-avatar"
                  src="${ProposalsUtils.buildAvatarUrl(proposal.author)}"
                  alt="Author Avatar"
                 />
            </div>
                  <span class="aitech-author-address">${proposal.author.substring(
                    0,
                    5
                  )}...${proposal.author.substring(38)}</span>
                </div>
              </div>
              ${
                badgeType
                  ? `<div class="aitech-moderator-badge"><img
                  class="aitech-author-avatar aitech-single-proposal-author-avatar"
                  src="${ProposalsUtils.buildAvatarUrl(proposal.author)}"
                  alt="Author Avatar"
                 /> <span>${badgeType}</span></div>`
                  : ""
              }
            </div>
            <div class="aitech-proposal-title">${proposal.title}</div>
          </div>
          <div class="aitech-table-cell mobile-proposal-cell">
          <div class="mobile-proposal-title">ENDED</div>
           <div class="mobile-proposal-status"> <div class="aitech-date-status">${
             proposal.state === "active" || proposal.state === "pending"
               ? "ENDS ON"
               : "ENDED"
           }</div>
            <div class="aitech-date-time">${
              proposal.state === "active" || proposal.state === "pending"
                ? `${ProposalsUtils.formatTimeRemaining(proposal.end)}`
                : `${ProposalsUtils.formatDate(proposal.end)}`
            }</div></div>
          </div>
           <div class="aitech-table-cell mobile-proposal-cell">
           <div class="mobile-proposal-title">STATUS</div>
            <div class="${
              proposal.state === "active" || proposal.state === "pending"
                ? "aitech-status-badge"
                : "aitech-closed-status-badge"
            }">
              <span>${proposal.state.toUpperCase()}</span>
            </div>
          </div>
          <div class="aitech-table-cell mobile-proposal-cell">
          <div class="mobile-proposal-title">RESULT</div>
            <div class="mobile-proposal-result">
              <div class="aitech-result-option">${
                winningOption?.choices || ""
              }</div>
              <div class="aitech-result-text">${
                winningOption ? `${+winningOption.percentage || 0}%` : ""
              }</div>
            </div>
          </div>
          <div class="aitech-table-cell mobile-proposal-cell">
          <div class="mobile-proposal-title">QUORUM</div>
            <div class="aitech-quorum-value">${ProposalsUtils.formatNumberWithK(
              proposal.quorum,
              2
            )}%</div>
          </div>
          <div class="mobile-proposal-details-btn-container">
          <button type="button" class="mobile-proposal-details-btn" data-id="${
            proposal.id
          }"><span>Details</span></button>
          </div>
        </div>
      `;
    }
  },
  updatePagination(pagination, searchTerm = "") {
    const container = window.jQuery(".aitech-pagination");
    if (!container.length) return;

    // Hide pagination if there are no proposals, if filters are applied, or if there's only one page
    if (
      pagination.totalItems === 0 ||
      searchTerm ||
      window.aitechProposals.state.filters?.status ||
      window.aitechProposals.state.filters?.author ||
      pagination.totalPages <= 1
    ) {
      container.html("");
      return;
    }

    let html = `
      <div class="aitech-pagination">
        <div class="aitech-page-nav prev-page ${
          pagination.currentPage === 1 ? "disabled" : ""
        }" data-page="${pagination.currentPage - 1}">
          <div class="aitech-page-nav-icon left"></div>
        </div>
        <div class="aitech-pagination-pages">
    `;

    // Calculate the range of pages to show
    let startPage = Math.max(
      1,
      pagination.currentPage - Math.floor(pagination.maxVisiblePages / 2)
    );
    let endPage = Math.min(
      pagination.totalPages,
      startPage + pagination.maxVisiblePages - 1
    );

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < pagination.maxVisiblePages) {
      startPage = Math.max(1, endPage - pagination.maxVisiblePages + 1);
    }

    // Always show first page
    if (startPage > 1) {
      html += `
        <div class="aitech-page-item" data-page="1">
          <span>1</span>
        </div>
      `;
      if (startPage > 2) {
        html += '<div class="aitech-page-ellipsis">...</div>';
      }
    }

    // Show page numbers
    for (let i = startPage; i <= endPage; i++) {
      const isActive = i === pagination.currentPage;
      const isLoading = i === pagination.loadingPage;
      html += `
        <div class="aitech-page-item ${isActive ? "active" : ""} ${
        isLoading ? "loading" : ""
      }" data-page="${i}">
          <span>${i}</span>
        </div>
      `;
    }

    // Always show last page
    if (endPage < pagination.totalPages) {
      if (endPage < pagination.totalPages - 1) {
        html += '<div class="aitech-page-ellipsis">...</div>';
      }
      html += `
        <div class="aitech-page-item" data-page="${pagination.totalPages}">
          <span>${pagination.totalPages}</span>
        </div>
      `;
    }

    html += `
        </div>
        <div class="aitech-page-nav next-page ${
          pagination.currentPage === pagination.totalPages ? "disabled" : ""
        }" data-page="${pagination.currentPage + 1}">
          <div class="aitech-page-nav-icon"></div>
        </div>
      </div>
    `;

    container.html(html);
    window.jQuery(".aitech-pagination").show();

    // Attach event handlers
    this.attachPaginationHandlers();
  },
  attachPaginationHandlers() {
    // Remove any existing handlers first - use more specific selectors
    window
      .jQuery(document)
      .off("click", ".aitech-pagination .aitech-page-item");
    window.jQuery(document).off("click", ".aitech-pagination .aitech-page-nav");

    // Handle page number clicks - only for proposals pagination
    window
      .jQuery(document)
      .on("click", ".aitech-pagination .aitech-page-item", function (e) {
        e.preventDefault();
        e.stopPropagation();

        const target = window.jQuery(this);
        const page = parseInt(target.data("page"));

        const state = window.aitechProposals.state;

        // Don't do anything if clicking the current page or if it's already loading
        if (
          page === state.pagination.currentPage ||
          page === state.pagination.loadingPage
        ) {
          return;
        }

        state.pagination.loadingPage = page;
        ProposalsUI.updatePagination(state.pagination);

        const searchTerm = window.jQuery(".aitech-search-input").val().trim();

        ProposalsAPI.fetchProposals(
          searchTerm,
          state,
          ProposalsUI.updateProposals,
          page
        );
      });

    // Handle navigation arrows - only for proposals pagination
    window
      .jQuery(document)
      .on("click", ".aitech-pagination .aitech-page-nav", function (e) {
        e.preventDefault();
        e.stopPropagation();

        const target = window.jQuery(this);
        if (target.hasClass("disabled")) {
          return;
        }

        const state = window.aitechProposals.state;
        const currentPage = state.pagination.currentPage;
        const isPrev = target.hasClass("prev-page");
        const newPage = isPrev ? currentPage - 1 : currentPage + 1;

        // Don't do anything if it's already loading
        if (newPage === state.pagination.loadingPage) {
          return;
        }

        state.pagination.loadingPage = newPage;
        ProposalsUI.updatePagination(state.pagination);

        const searchTerm = window.jQuery(".aitech-search-input").val().trim();

        ProposalsAPI.fetchProposals(
          searchTerm,
          state,
          ProposalsUI.updateProposals,
          newPage
        );
      });
  },
};

// Add filter dropdown functionality
const FilterDropdowns = {
  initialize() {
    // Handle Proposed by filter
    window.jQuery(".aitech-filter:first-child").on("click", function (e) {
      e.stopPropagation();
      const dropdownMenu = window
        .jQuery(this)
        .find(".aitech-filter-dropdown-menu");
      const isActive = dropdownMenu.hasClass("active");
      window.jQuery(".aitech-filter-dropdown-menu").removeClass("active");
      if (!isActive) {
        dropdownMenu.addClass("active");
      }
    });

    // Handle Status filter - only if we're in proposals context
    window.jQuery(".aitech-filter:last-child").on("click", function (e) {
      // Check if we're in profile context
      if (window.profileState) {
        return; // Let profile.js handle the filter
      }

      e.stopPropagation();
      const dropdownMenu = window
        .jQuery(this)
        .find(".aitech-filter-dropdown-menu");
      const isActive = dropdownMenu.hasClass("active");
      window.jQuery(".aitech-filter-dropdown-menu").removeClass("active");
      if (!isActive) {
        dropdownMenu.addClass("active");
      }
    });

    // Close dropdowns when clicking outside
    window.jQuery(document).on("click", function () {
      window.jQuery(".aitech-filter-dropdown-menu").removeClass("active");
    });

    // Handle filter option selection - only if we're in proposals context
    window.jQuery(".filter-option").on("click", function (e) {
      // Check if we're in profile context
      if (window.profileState) {
        return; // Let profile.js handle the filter
      }

      e.stopPropagation();
      const value = window.jQuery(this).data("value");
      const label = window.jQuery(this).text();
      const filterContainer = window.jQuery(this).closest(".aitech-filter");
      const dropdownMenu = filterContainer.find(".aitech-filter-dropdown-menu");

      // Remove selected class from all options in this dropdown
      dropdownMenu.find(".filter-option").removeClass("selected");

      // Add selected class to clicked option
      window.jQuery(this).addClass("selected");

      // Update the selected value display
      filterContainer.find(".aitech-filter-value span").text(label);

      // Update the filter state
      const filterType = filterContainer
        .find(".aitech-filter-label")
        .text()
        .toLowerCase()
        .includes("proposed")
        ? "author"
        : "status";
      window.aitechProposals.state.filters =
        window.aitechProposals.state.filters || {};
      window.aitechProposals.state.filters[filterType] = value;

      // Close the dropdown
      window.jQuery(".aitech-filter-dropdown-menu").removeClass("active");

      // Get current search term
      const searchTerm = window.jQuery(".aitech-search-input").val().trim();

      // Refresh proposals with new filter and current search term
      ProposalsAPI.fetchProposals(
        searchTerm,
        window.aitechProposals.state,
        ProposalsUI.updateProposals
      );
    });

    // Initialize selected states based on current filters
    this.initializeSelectedStates();
  },

  initializeSelectedStates() {
    // Check if we're in profile context
    if (window.profileState) {
      return; // Let profile.js handle the state initialization
    }

    const state = window.aitechProposals?.state;
    if (!state) return;

    // Initialize filters if they don't exist
    if (!state.filters) {
      state.filters = {};
      return;
    }

    // Handle author filter
    if (state.filters.author) {
      const authorFilter = window.jQuery(".aitech-filter:first-child");
      if (!authorFilter.length) return;

      const authorOption = authorFilter.find(
        `.filter-option[data-value="${state.filters.author}"]`
      );
      if (authorOption.length) {
        authorOption.addClass("selected");
        authorFilter
          .find(".aitech-filter-value span")
          .text(authorOption.text());
      }
    }

    // Handle status filter
    if (state.filters.status) {
      const statusFilter = window.jQuery(".aitech-filter:last-child");
      if (!statusFilter.length) return;

      const statusOption = statusFilter.find(
        `.filter-option[data-value="${state.filters.status}"]`
      );
      if (statusOption.length) {
        statusOption.addClass("selected");
        statusFilter
          .find(".aitech-filter-value span")
          .text(statusOption.text());
      }
    }
  },
};

// Initialize filter dropdowns when document is ready
window.jQuery(document).ready(() => {
  FilterDropdowns.initialize();
});

class ProposalsController {
  constructor() {
    this.state = new ProposalsState();
    this.hasFetchedProposals = false;
  }
  initialize() {
    // Initial data fetch if proposals tab is active
    if (ProposalsUtils.isProposalsTabActive()) {
      // Always fetch space first, then proposals
      ProposalsAPI.fetchSpaceData(this.state, () => {
        ProposalsAPI.fetchProposals(
          "",
          this.state,
          async (proposals, container) => {
            ProposalsUI.updateProposals(proposals, container);
            this.hasFetchedProposals = true;
            await this.checkAndFetchVotingPower();
          }
        );
        ProposalsUI.updateSpaceStats(this.state.cache.space.space);
      });
    }

    // Listen for wallet connection events
    window.addEventListener("walletStateChanged", async (event) => {
      if (event.detail.connected && event.detail.signer) {
        await this.checkAndFetchVotingPower();
      }
    });

    this.handleSearch();
    // Listen for tab changes
    window.jQuery(".aitech-nav a").on("click", async (e) => {
      e.preventDefault();
      const tabId = window.jQuery(e.currentTarget).data("tab");
      if (this.state.searchTimeout) {
        clearTimeout(this.state.searchTimeout);
        this.state.searchTimeout = null;
      }
      if (tabId === "proposals" || tabId === "overview") {
        ProposalsAPI.fetchSpaceData(this.state, () => {
          ProposalsAPI.fetchProposals(
            "",
            this.state,
            async (proposals, container) => {
              ProposalsUI.updateProposals(proposals, container);
              this.hasFetchedProposals = true;
              await this.checkAndFetchVotingPower();
            }
          );
          ProposalsUI.updateSpaceStats(this.state.cache.space.space);
        });
      } else if (tabId === "leaderboard") {
        if (window.leaderboardService) {
          window.leaderboardService.state.reset();
          window.leaderboardService.fetchLeaderboard();
        }
      }
    });
    // Also initialize when the proposals tab becomes visible
    window.jQuery(document).on("visibilitychange", () => {
      if (ProposalsUtils.isProposalsTabActive()) {
        this.initialize();
      }
    });
  }

  async checkAndFetchVotingPower() {
    if (this.hasFetchedProposals && window.globalWalletSigner) {
      try {
        // Get the first proposal from cache
        const proposals = this.state.cache.proposals.get(
          this.state.getProposalsCacheKey(1)
        );
        if (!proposals || !proposals.length) {
          console.warn("No proposals available for voting power calculation");
          return;
        }

        // Get voting power using the first proposal
        const votingPower = await ProposalsAPI.getTotalVotingPower(proposals);

        if (votingPower !== undefined) {
          // Update voting power display
          window
            .jQuery(".voting-power-button-value-number")
            .text(ProposalsUtils.formatNumberWithK(votingPower));
          // Update modal if it exists
          window
            .jQuery(".voting-power-modal .voting-power-button-value-number")
            .text(ProposalsUtils.formatNumberWithK(votingPower));
        }
      } catch (error) {
        console.error("Error fetching voting power:", error);
      }
    }
  }

  handleSearch() {
    const searchInput = window.jQuery(".aitech-search-input");
    let searchTimeout = null;

    searchInput.on("input", (e) => {
      const searchTerm = window.jQuery(e.currentTarget).val().trim();

      // Clear any existing timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
        searchTimeout = null;
      }

      const container = window.jQuery(".aitech-proposals-list");

      if (!searchTerm) {
        // Reset to first page when search is cleared
        this.state.pagination.currentPage = 1;

        // Clear any search-related cache
        this.state.cache.proposals.clear();
        this.state.cache.lastFetch.proposals.clear();

        ProposalsUI.showLoadingState(container);
        hideSearchLoader(); // Hide loader when search is cleared
        ProposalsAPI.fetchProposals(
          "",
          this.state,
          function (proposals, container) {
            ProposalsUI.updateProposals(proposals, container);
            hideSearchLoader();
          }
        );
        return;
      }

      searchTimeout = setTimeout(() => {
        ProposalsUI.showLoadingState(container);
        showSearchLoader(); // Show loader when search starts
        // Reset to first page when searching
        this.state.pagination.currentPage = 1;
        ProposalsAPI.fetchProposals(
          searchTerm,
          this.state,
          function (proposals, container) {
            ProposalsUI.updateProposals(proposals, container);
            hideSearchLoader(); // Hide loader when search completes
          }
        );
      }, 1000);
    });
  }
}

const ProposalsUtils = {
  buildAvatarUrl(address) {
    return `https://cdn.stamp.fyi/avatar/${address}?s=64`;
  },
  formatNumberWithK(num, decimals = 0) {
    if (+num < 1 && +num > 0) {
      return `< 1`;
    }

    if (!num) return 0;

    const units = [
      { value: 1000000000, suffix: "b" }, // billion
      { value: 1000000, suffix: "m" }, // million
      { value: 1000, suffix: "k" }, // thousand
    ];

    for (const unit of units) {
      if (+num >= unit.value) {
        return (num / unit.value).toFixed(decimals) + unit.suffix;
      }
    }

    return +num.toFixed(decimals);
  },
  formatTimeRemaining(endTimestamp) {
    const date = new Date(endTimestamp * 1000);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  },
  formatDate(timestamp) {
    const timeUnits = [
      { unit: "s", divisor: 1, threshold: 60 },
      { unit: "m", divisor: 60, threshold: 60 },
      { unit: "h", divisor: 3600, threshold: 24 },
      { unit: "d", divisor: 86400, threshold: 30 },
      { unit: "mo", divisor: 2592000, threshold: 12 },
      { unit: "y", divisor: 31536000, threshold: Infinity },
    ];

    const now = new Date();
    const created = new Date(timestamp * 1000);
    const diffInSeconds = Math.floor((now - created) / 1000);

    for (const { unit, divisor, threshold } of timeUnits) {
      const value = Math.floor(diffInSeconds / divisor);
      if (value < threshold) {
        return `${value}${unit} ago`;
      }
    }
  },
  isProposalsTabActive() {
    return (
      window.jQuery("#proposals").hasClass("active") ||
      window.jQuery("#overview").hasClass("active")
    );
  },
  formatNumber(num) {
    if (!num) return "0";
    if (num < 1000) return num.toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + "k";
    return (num / 1000000).toFixed(1) + "m";
  },
  calculateWinningOption(proposal) {
    if (!proposal.scores || !proposal.choices || !proposal.scores.length) {
      return null;
    }

    const totalScore = proposal.scores.reduce((sum, score) => sum + score, 0);
    const maxScore = Math.max(...proposal.scores);
    const winningIndices = proposal.scores.reduce((indices, score, index) => {
      if (score === maxScore) {
        indices.push(index);
      }
      return indices;
    }, []);

    const winningChoices = winningIndices.map(
      (index) => proposal.choices[index]
    );
    const percentage = ((maxScore / totalScore) * 100).toFixed(1);

    return {
      choices: winningChoices.join(", "),
      percentage: percentage,
    };
  },
};

window.ProposalsUtils = ProposalsUtils;

// Export ProposalsUtils
export { ProposalsUtils };

// Make state accessible globally
window.aitechProposals = {
  state: null,
};

// Attach sorting click handler to static header (event delegation)
jQuery(document).on(
  "click",
  ".aitech-table-container .aitech-table-header .sortable",
  function () {
    const column = jQuery(this).data("sort");
    const state = window.aitechProposals.state;

    // Update sort icon immediately
    const tableHeader = jQuery(this).closest(".aitech-table-header");
    tableHeader.find(".sortable").removeClass("asc desc");

    if (column === state.sorting.column) {
      state.sorting.direction =
        state.sorting.direction === "asc" ? "desc" : "asc";
    } else {
      state.sorting.column = column;
      state.sorting.direction = "desc";
    }

    // Add new sort class immediately
    jQuery(this).addClass(state.sorting.direction);

    state.pagination.currentPage = 1;
    const searchTerm = jQuery(".aitech-search-input").val().trim();
    ProposalsAPI.fetchProposals(
      searchTerm,
      state,
      ProposalsUI.updateProposals,
      1
    );
  }
);

// Utility functions to show/hide search loader
function showSearchLoader() {
  window.jQuery(".aitech-search-icon").hide();
  window.jQuery(".aitech-search-loader").show();
}
function hideSearchLoader() {
  window.jQuery(".aitech-search-loader").hide();
  window.jQuery(".aitech-search-icon").show();
}

// Add click handler for action dots
window.jQuery(document).on("click", ".action-dots", function (e) {
  e.stopPropagation();
  const dropdown = window.jQuery(this).siblings(".action-dropdown");
  const isActive = dropdown.hasClass("active");

  // Close all other dropdowns first
  window.jQuery(".action-dropdown").removeClass("active closing");

  if (!isActive) {
    dropdown.addClass("active");
  }
});

// Close dropdown when clicking outside
window.jQuery(document).on("click", function (e) {
  if (
    !window.jQuery(e.target).closest(".action-dropdown, .action-dots").length
  ) {
    const dropdowns = window.jQuery(".action-dropdown.active");
    dropdowns.each(function () {
      const dropdown = window.jQuery(this);
      dropdown.addClass("closing");
      setTimeout(() => {
        dropdown.removeClass("active closing");
      }, 200);
    });
  }
});

// Close dropdown when clicking a dropdown option
window.jQuery(document).on("click", ".dropdown-option", function (e) {
  const dropdown = window.jQuery(this).closest(".action-dropdown");
  dropdown.addClass("closing");
  setTimeout(() => {
    dropdown.removeClass("active closing");
  }, 200);
});

// Add click handler for mobile proposal details button
window
  .jQuery(document)
  .on("click", ".mobile-proposal-details-btn", function () {
    const proposalId = window.jQuery(this).data("id");
    if (proposalId) {
      window.location.href = `/proposals/${proposalId}`;
    }
  });
