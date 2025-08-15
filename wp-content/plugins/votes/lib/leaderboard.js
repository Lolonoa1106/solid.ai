jQuery(document).ready(($) => {
  // Only use a single global instance
  window.leaderboardService = new LeaderboardService(new LeaderboardState());
  window.leaderboardService.initialize();

  $(document).on("visibilitychange", () => {
    if (LeaderboardUtils.isLeaderboardTabActive()) {
      window.leaderboardService.initialize();
    }
  });

  // Always trigger leaderboard fetch and loading on tab click
  $(document).on("click", ".aitech-tab", function () {
    const tabId = $(this).data("tab");
    if (tabId === "leaderboard") {
      // Clear leaderboard body and show loading
      const leaderboardBody = $(".aitech-leaderboard-body");
      const paginationContainer = $(".aitech-leaderboard-pagination");

      // Only reset if we're not already on the leaderboard tab
      if (!LeaderboardUtils.isLeaderboardTabActive()) {
        leaderboardBody.html(
          '<div class="aitech-loading"><div class="spinner"></div></div>'
        );
        window.leaderboardService.state.reset();
        // Preserve pagination container
        paginationContainer.show();
      }
      window.leaderboardService.fetchLeaderboard();
    }
  });
});

const LEADERBOARD_CONFIG = {
  PAGE_SIZE: 10,
  REFRESH_INTERVAL: 30000,
  SCROLL_THRESHOLD: 0.1,
  SCROLL_MARGIN: "200px",
};

class LeaderboardState {
  constructor() {
    this.currentPage = 1;
    this.isLoading = false;
    this.hasMore = true;
    this.isInitialLoad = true;
    this.pagination = {
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 10,
      totalItems: 0,
      maxVisiblePages: 10,
      loadingPage: null,
    };
    this.cache = new Map();
    this.lastFetch = new Map();
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    this.spaceCache = null;
    this.spaceLastFetch = 0;
    this.SPACE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    this.sorting = {
      column: "votesCount", // Default sort column
      direction: "desc", // Default sort direction
    };
    this.isLoadingSpace = false;
  }

  // Generate cache key for leaderboard
  getLeaderboardCacheKey(page = 1, sorting = this.sorting) {
    return `${page}-${sorting.column}-${sorting.direction}`;
  }

  isCacheValid(page = 1, sorting = this.sorting) {
    const key = this.getLeaderboardCacheKey(page, sorting);
    const hasCache = this.cache.has(key);
    const lastFetchTime = this.lastFetch.get(key);
    const isValid =
      hasCache &&
      lastFetchTime &&
      Date.now() - lastFetchTime < this.CACHE_DURATION;

    return isValid;
  }

  updateCache(data, page = 1, sorting = this.sorting) {
    if (!data) return;

    const key = this.getLeaderboardCacheKey(page, sorting);
    this.cache.set(key, data);
    this.lastFetch.set(key, Date.now());
  }

  getCachedData(page = 1, sorting = this.sorting) {
    const key = this.getLeaderboardCacheKey(page, sorting);
    const data = this.cache.get(key);

    return data;
  }

  isSpaceCacheValid() {
    return (
      this.spaceCache &&
      this.spaceLastFetch &&
      Date.now() - this.spaceLastFetch < this.SPACE_CACHE_DURATION
    );
  }

  updateSpaceCache(data) {
    if (data && data.space) {
      this.spaceCache = data;
      this.spaceLastFetch = Date.now();
    }
  }

  getCachedVotesCount() {
    if (this.isSpaceCacheValid() && this.spaceCache && this.spaceCache.space) {
      return this.spaceCache.space.votesCount || 0;
    }
    return 0;
  }

  reset() {
    // Preserve pagination state when resetting
    const currentPagination = { ...this.pagination };

    this.currentPage = 1;
    this.hasMore = true;
    this.isInitialLoad = true;
    this.isLoading = false;

    // Restore pagination state but reset current page
    this.pagination = {
      ...currentPagination,
      currentPage: 1,
      loadingPage: null,
    };
  }

  load() {
    this.isLoading = true;
  }
}

const LeaderboardAPI = {
  LEADERBOARD_QUERY: `
    query LeaderBoard($first: Int!, $skip: Int!, $orderBy: String!, $orderDirection: OrderDirection!) {
      leaderboards(
        first: $first,
        skip: $skip,
        orderBy: $orderBy,
        orderDirection: $orderDirection,
        where: {space: "aitechio.eth"}
      ) {
        user
        proposalsCount
        votesCount
        lastVote
      }
    }
  `,
  fetchLeaderboard(
    { first, skip, orderBy, orderDirection },
    onSuccess,
    onError,
    onComplete
  ) {
    window.jQuery.ajax({
      url: "https://d8ckkgcrj0.execute-api.eu-central-1.amazonaws.com/prod/graphql",
      type: "POST",
      data: JSON.stringify({
        query: LeaderboardAPI.LEADERBOARD_QUERY,
        variables: { first, skip, orderBy, orderDirection },
      }),
      contentType: "application/json",
      success: onSuccess,
      error: onError,
      complete: onComplete,
    });
  },
};

const LeaderboardUI = {
  createLoadingIndicator() {
    const indicator = document.createElement("div");
    indicator.className = "aitech-infinite-scroll-trigger";
    indicator.style.cssText =
      "height: 20px; width: 100%; background: transparent;";
    return indicator;
  },

  showLoading(container, append = false) {
    if (append) {
      container
        .find(".aitech-leaderboard-body")
        .append('<div class="aitech-loading-more">Loading more...</div>');
    } else {
      container.find(".aitech-leaderboard-body").html(`
        <div class="aitech-loading">
          <div class="spinner"></div>
        </div>
      `);
      // Don't hide pagination during loading
      // container.find(".aitech-leaderboard-pagination").hide();
    }
  },

  hideLoading(container) {
    container.find(".aitech-loading-more").remove();
    container.find(".aitech-loading").remove();
    // Always ensure pagination is visible after loading
    container.find(".aitech-leaderboard-pagination").show();
  },

  showError(container, message, append = false) {
    if (!append) {
      container
        .find(".aitech-leaderboard-body")
        .html(`<div class="aitech-error">${message}</div>`);
    }
  },

  updateSortIndicators(container, sorting) {
    const header = container
      .closest(".aitech-leaderboard-table")
      .find(".aitech-leaderboard-header");

    // Remove all sort indicators
    header.find(".sortable").removeClass("asc desc");

    // Add indicators to active sort column
    const activeHeader = header.find(
      `.sortable[data-sort='${sorting.column}']`
    );
    if (activeHeader.length) {
      activeHeader.addClass(sorting.direction);
    }
  },

  createLeaderboardHeader() {
    return `
      <div class="aitech-leaderboard-header">
        <div class="aitech-leaderboard-cell-header">
          <span>User</span>
        </div>
        <div class="aitech-leaderboard-cell-header sortable" data-sort="proposalsCount">
          <span>Proposals</span>
          <div class="sort-icon"></div>
        </div>
        <div class="aitech-leaderboard-cell-header sortable" data-sort="votesCount">
          <span>Votes</span>
          <div class="sort-icon"></div>
        </div>
      </div>
    `;
  },

  updatePagination(pagination) {
    const container = window.jQuery(".aitech-leaderboard-pagination");
    if (!container.length) return;

    // Hide pagination if there's only one page or no pages
    if (pagination.totalPages <= 1) {
      container.html("");
      return;
    }

    // Update breakpoints
    const isMobile = window.innerWidth <= 610; // Changed to <= 570px
    const isTablet = window.innerWidth <= 800 && window.innerWidth > 610; // Updated tablet range
    const maxVisiblePages = isMobile
      ? 3
      : isTablet
      ? 7
      : pagination.maxVisiblePages;

    let html = `
      <div class="aitech-pagination">
        <div class="aitech-page-nav prev-page ${
          pagination.currentPage === 1 ? "disabled" : ""
        }" data-page="${pagination.currentPage - 1}">
          <div class="aitech-page-nav-icon left"></div>
        </div>
        <div class="aitech-pagination-pages">
    `;

    if (isMobile) {
      // Mobile pagination logic (3 items)
      // Always show first page if not current
      if (pagination.currentPage !== 1) {
        html += `
          <div class="aitech-page-item" data-page="1">
            <span>1</span>
          </div>
        `;
        // Add ellipsis if there's a gap
        if (pagination.currentPage > 2) {
          html += '<div class="aitech-page-ellipsis">...</div>';
        }
      }

      // Always show current page
      html += `
        <div class="aitech-page-item active" data-page="${pagination.currentPage}">
          <span>${pagination.currentPage}</span>
        </div>
      `;

      // Show last page if not current
      if (pagination.currentPage !== pagination.totalPages) {
        // Add ellipsis if there's a gap
        if (pagination.currentPage < pagination.totalPages - 1) {
          html += '<div class="aitech-page-ellipsis">...</div>';
        }
        html += `
          <div class="aitech-page-item" data-page="${pagination.totalPages}">
            <span>${pagination.totalPages}</span>
          </div>
        `;
      }
    } else {
      // Desktop/Tablet pagination logic
      let startPage = Math.max(
        1,
        pagination.currentPage - Math.floor(maxVisiblePages / 2)
      );
      let endPage = Math.min(
        pagination.totalPages,
        startPage + maxVisiblePages - 1
      );

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

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

    // Add resize listener to update pagination on screen size change
    if (!window.leaderboardPaginationResizeListener) {
      window.leaderboardPaginationResizeListener = window
        .jQuery(window)
        .on("resize", () => {
          const state = window.leaderboardService.state;
          if (state && state.pagination) {
            LeaderboardUI.updatePagination(state.pagination);
          }
        });
    }

    this.attachPaginationHandlers();
  },

  attachPaginationHandlers() {
    // Remove any existing handlers first - use more specific selectors
    window
      .jQuery(document)
      .off("click", ".aitech-leaderboard-pagination .aitech-page-item");
    window
      .jQuery(document)
      .off("click", ".aitech-leaderboard-pagination .aitech-page-nav");

    // Handle page number clicks - only for leaderboard pagination
    window
      .jQuery(document)
      .on(
        "click",
        ".aitech-leaderboard-pagination .aitech-page-item",
        function (e) {
          e.preventDefault();
          e.stopPropagation();

          const target = window.jQuery(this);
          const page = parseInt(target.data("page"));
          const state = window.leaderboardService.state;

          // Don't do anything if clicking the current page or if it's already loading
          if (
            page === state.pagination.currentPage ||
            page === state.pagination.loadingPage
          ) {
            return;
          }

          state.pagination.loadingPage = page;
          LeaderboardUI.updatePagination(state.pagination);

          state.currentPage = page;
          window.leaderboardService.fetchLeaderboard();
        }
      );

    // Handle navigation arrows - only for leaderboard pagination
    window
      .jQuery(document)
      .on(
        "click",
        ".aitech-leaderboard-pagination .aitech-page-nav",
        function (e) {
          e.preventDefault();
          e.stopPropagation();

          const target = window.jQuery(this);
          if (target.hasClass("disabled")) {
            return;
          }

          const state = window.leaderboardService.state;
          const currentPage = state.pagination.currentPage;
          const isPrev = target.hasClass("prev-page");
          const newPage = isPrev ? currentPage - 1 : currentPage + 1;

          // Don't do anything if it's already loading
          if (newPage === state.pagination.loadingPage) {
            return;
          }

          state.pagination.loadingPage = newPage;
          LeaderboardUI.updatePagination(state.pagination);

          state.currentPage = newPage;
          window.leaderboardService.fetchLeaderboard();
        }
      );
  },
};

class LeaderboardService {
  constructor(state) {
    this.state = state;
    this.isCheckingMorePages = false;
  }

  updateLeaderboard(leaderboards, container) {
    const leaderboardBody = container.find(".aitech-leaderboard-body");
    if (!leaderboards?.length) {
      this.state.hasMore = false;
      this.renderPagination(container);
      return;
    }

    // Calculate max values for percentages
    const maxProposals = Math.max(...leaderboards.map((u) => u.proposalsCount));
    const maxVotes = Math.max(...leaderboards.map((u) => u.votesCount));

    // Build new HTML
    const newHtml = leaderboards
      .map((user, i) => {
        const avatar_class = i % 2 === 0 ? "avatar-1" : "avatar-2";
        const proposalsPercent =
          maxProposals > 0
            ? Math.round((user.proposalsCount / maxProposals) * 100)
            : 0;
        const votesPercent =
          maxVotes > 0 ? Math.round((user.votesCount / maxVotes) * 100) : 0;

        const isMobile = window.innerWidth <= 992;

        return isMobile
          ? this.getMobileLeaderboard(user, proposalsPercent, votesPercent)
          : this.getDesktopLeaderboard(user, proposalsPercent, votesPercent);
      })
      .join("");

    window.addEventListener("resize", () => {
      const isMobile = window.innerWidth <= 992;

      const newHtml = leaderboards
        .map((user, i) => {
          const proposalsPercent =
            maxProposals > 0
              ? Math.round((user.proposalsCount / maxProposals) * 100)
              : 0;
          const votesPercent =
            maxVotes > 0 ? Math.round((user.votesCount / maxVotes) * 100) : 0;

          return isMobile
            ? this.getMobileLeaderboard(user, proposalsPercent, votesPercent)
            : this.getDesktopLeaderboard(user, proposalsPercent, votesPercent);
        })
        .join("");

      leaderboardBody.html(newHtml);
    });

    // Add header if it doesn't exist
    if (!container.find(".aitech-leaderboard-header").length) {
      container.prepend(LeaderboardUI.createLeaderboardHeader());
    }
    leaderboardBody.html(newHtml);

    // Always update sort indicators after content is loaded
    const header = container.find(".aitech-leaderboard-header");
    header.find(".sortable").removeClass("asc desc");
    const activeHeader = header.find(
      `.sortable[data-sort='${this.state.sorting.column}']`
    );
    if (activeHeader.length) {
      activeHeader.addClass(this.state.sorting.direction);
    }

    // Add sorting handlers
    const self = this;
    container
      .find(".aitech-leaderboard-header .sortable")
      .off("click")
      .on("click", function () {
        const column = window.jQuery(this).data("sort");
        const currentDirection = self.state.sorting.direction;

        // Remove all sort classes first
        container
          .find(".aitech-leaderboard-header .sortable")
          .removeClass("asc desc");

        // Store the old sorting state
        const oldSorting = { ...self.state.sorting };

        if (column === self.state.sorting.column) {
          // Toggle direction
          self.state.sorting.direction =
            currentDirection === "asc" ? "desc" : "asc";
        } else {
          // New column, set to desc
          self.state.sorting.column = column;
          self.state.sorting.direction = "desc";
        }

        // Add the new sort class
        window.jQuery(this).addClass(self.state.sorting.direction);

        // Reset to page 1 when sorting changes
        self.state.currentPage = 1;

        // Show loading spinner if cache is not valid for the new sort state
        const sorting = { ...self.state.sorting };
        if (!self.state.isCacheValid(1, sorting)) {
          container
            .find(".aitech-leaderboard-body")
            .html(
              '<div class="aitech-loading"><div class="spinner"></div></div>'
            );
        }

        self.fetchLeaderboard();
      });

    // Render pagination
    this.renderPagination(container);
  }

  getDesktopLeaderboard(user, proposalsPercent, votesPercent) {
    return `
        <div class="aitech-leaderboard-row">
          <div class="aitech-leaderboard-user-cell">
            <div class="voter-avatar">
                <div class="voter-avatar-placeholder"></div>
                <img class="voter-avatar-image" 
                     src="${window.ProposalsUtils.buildAvatarUrl(user.user)}" 
                     alt="Voter Avatar"
                     onload="this.classList.add('loaded'); this.previousElementSibling.classList.add('hidden');"
                     onerror="this.classList.add('error'); this.previousElementSibling.classList.add('hidden');">
                <div class="eye-icon"></div>
              </div>
            <div class="aitech-user-info" data-address="${user.user}">
              <div class="aitech-user-name">${user.user}</div>
              <div class="aitech-user-address">${user.user.substring(
                0,
                6
              )}...${user.user.substring(user.user.length - 4)}</div>
            </div>
          </div>
          <div class="aitech-leaderboard-data-cell">
            <div class="aitech-data-value">${user.proposalsCount}</div>
            <div class="aitech-data-percentage">${proposalsPercent}%</div>
          </div>
          <div class="aitech-leaderboard-data-cell">
            <div class="aitech-data-value">${user.votesCount}</div>
            <div class="aitech-data-percentage">${votesPercent}%</div>
          </div>
        </div>
      `;
  }

  getMobileLeaderboard(user, proposalsPercent, votesPercent) {
    return `
        <div class="aitech-leaderboard-row">
          <div class="aitech-leaderboard-user-cell">
            <div class="voter-avatar">
                <div class="voter-avatar-placeholder"></div>
                <img class="voter-avatar-image" 
                     src="${window.ProposalsUtils.buildAvatarUrl(user.user)}" 
                     alt="Voter Avatar"
                     onload="this.classList.add('loaded'); this.previousElementSibling.classList.add('hidden');"
                     onerror="this.classList.add('error'); this.previousElementSibling.classList.add('hidden');">
                <div class="eye-icon"></div>
              </div>
            <div class="aitech-user-info" data-address="${user.user}">
              <div class="aitech-user-name">${
                window.innerWidth < 768
                  ? user.user.substring(0, 6) +
                    "..." +
                    user.user.substring(user.user.length - 4)
                  : user.user
              }</div>
              <div class="aitech-user-address">${user.user.substring(
                0,
                6
              )}...${user.user.substring(user.user.length - 4)}</div>
            </div>
          </div>
          <div class="aitech-leaderboard-data-cell">
            <div class="aitech-data-value">${user.proposalsCount}</div>
            <div class="aitech-data-percentage">${proposalsPercent}%</div>
          </div>
          <div class="aitech-leaderboard-data-cell">
            <div class="aitech-data-value">${user.votesCount}</div>
            <div class="aitech-data-percentage">${votesPercent}%</div>
          </div>
        </div>
      `;
  }

  renderPagination(container) {
    const state = this.state;
    const paginationContainer = container.find(
      ".aitech-leaderboard-pagination"
    );
    if (!paginationContainer.length) return;

    if (state.totalPages <= 1) {
      paginationContainer.html("");
      return;
    }

    let html = `
      <div class="aitech-pagination">
        <div class="aitech-page-nav prev-page ${
          state.currentPage === 1 ? "disabled" : ""
        }" data-page="${state.currentPage - 1}">
          <div class="aitech-page-nav-icon left"></div>
        </div>
        <div class="aitech-pagination-pages">
    `;

    // Always show first page
    html += `
      <div class="aitech-page-item ${
        1 === state.currentPage ? "active" : ""
      }" data-page="1">
        <span>1</span>
      </div>
    `;

    // Calculate range of pages to show
    let startPage = Math.max(2, state.currentPage - 2);
    let endPage = Math.min(state.totalPages - 1, state.currentPage + 2);

    // Add ellipsis if needed before startPage
    if (startPage > 2) {
      html += `<div class="aitech-page-item disabled"><span>...</span></div>`;
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      html += `
        <div class="aitech-page-item ${
          i === state.currentPage ? "active" : ""
        }" data-page="${i}">
          <span>${i}</span>
        </div>
      `;
    }

    // Add ellipsis if needed after endPage
    if (endPage < state.totalPages - 1) {
      html += `<div class="aitech-page-item disabled"><span>...</span></div>`;
    }

    // Always show last page if there is more than one page
    if (state.totalPages > 1) {
      html += `
        <div class="aitech-page-item ${
          state.totalPages === state.currentPage ? "active" : ""
        }" data-page="${state.totalPages}">
          <span>${state.totalPages}</span>
        </div>
      `;
    }

    html += `
        </div>
        <div class="aitech-page-nav ${
          state.currentPage === state.totalPages ? "disabled" : ""
        }" data-page="${state.currentPage + 1}">
          <div class="aitech-page-nav-icon"></div>
        </div>
      </div>
    `;

    paginationContainer.html(html);
  }

  async checkNextPage(pageNumber) {
    if (this.isCheckingMorePages) return false;
    this.isCheckingMorePages = true;

    try {
      const response = await new Promise((resolve, reject) => {
        LeaderboardAPI.fetchLeaderboard(
          {
            first: LEADERBOARD_CONFIG.PAGE_SIZE,
            skip: (pageNumber - 1) * LEADERBOARD_CONFIG.PAGE_SIZE,
            orderBy: this.state.sorting.column,
            orderDirection: this.state.sorting.direction,
          },
          (response) => resolve(response),
          (error) => reject(error)
        );
      });

      if (
        response.data?.leaderboards?.length === LEADERBOARD_CONFIG.PAGE_SIZE
      ) {
        // If we got a full page, increment total pages and check the next one
        this.state.pagination.totalPages = pageNumber;
        this.isCheckingMorePages = false;
        return await this.checkNextPage(pageNumber + 1);
      } else {
        // If we got less than a full page, this is the last page
        this.isCheckingMorePages = false;
        return false;
      }
    } catch (error) {
      this.isCheckingMorePages = false;
      return false;
    }
  }

  fetchLeaderboard(showLoading = true) {
    if (this.state.isLoading || !this.state.hasMore) return;
    const sorting = { ...this.state.sorting }; // Create a copy of the sorting state

    // Check cache for current page and sorting
    if (this.state.isCacheValid(this.state.currentPage, sorting)) {
      const containers = window.jQuery(".aitech-leaderboard-container");
      containers.each((_, container) => {
        const cachedData = this.state.getCachedData(
          this.state.currentPage,
          sorting
        );
        if (cachedData) {
          // Don't show loading when using cached data
          this.updateLeaderboard(cachedData, window.jQuery(container));
          LeaderboardUI.hideLoading(window.jQuery(container));
          // Update pagination state when using cached data
          this.state.pagination.currentPage = this.state.currentPage;
          this.state.pagination.loadingPage = null;
          LeaderboardUI.updatePagination(this.state.pagination);
          // Always ensure pagination is visible
          window
            .jQuery(container)
            .find(".aitech-leaderboard-pagination")
            .show();
        }
      });
      return;
    }

    // Only show loading state if we need to fetch from API and showLoading is true
    const containers = window.jQuery(".aitech-leaderboard-container");
    if (!containers.length) return;

    this.state.isLoading = showLoading;
    if (showLoading) {
      containers.each((_, container) => {
        const $container = window.jQuery(container);
        LeaderboardUI.showLoading($container);
        // Always ensure pagination is visible during loading
        $container.find(".aitech-leaderboard-pagination").show();
      });
    }

    // Get votes count from cache if available
    const votesCount = this.state.getCachedVotesCount();
    if (votesCount > 0) {
      this.state.pagination.totalItems = votesCount;
      // Start with 45 pages initially
      this.state.pagination.totalPages = 45;
    }

    // Fetch votes count for totalPages calculation if not in cache
    fetchSpaceData(this.state, async (spaceData) => {
      // Get votes count from space data
      let votesCount = 0;
      if (
        spaceData &&
        spaceData.space &&
        typeof spaceData.space.votesCount === "number"
      ) {
        votesCount = spaceData.space.votesCount;
      }

      this.state.pagination.totalItems = votesCount;
      // Start with 45 pages initially
      this.state.pagination.totalPages = 45;

      // Check if there are more pages beyond 45
      await this.checkNextPage(46);

      containers.each((_, container) => {
        const $container = window.jQuery(container);
        LeaderboardAPI.fetchLeaderboard(
          {
            first: LEADERBOARD_CONFIG.PAGE_SIZE,
            skip: (this.state.currentPage - 1) * LEADERBOARD_CONFIG.PAGE_SIZE,
            orderBy: this.state.sorting.column,
            orderDirection: this.state.sorting.direction,
          },
          (response) => {
            if (response.data?.leaderboards) {
              // Cache the results
              this.state.updateCache(
                response.data.leaderboards,
                this.state.currentPage,
                this.state.sorting
              );
              this.updateLeaderboard(response.data.leaderboards, $container);
              // Update pagination state
              this.state.pagination.currentPage = this.state.currentPage;
              this.state.pagination.loadingPage = null;
              LeaderboardUI.updatePagination(this.state.pagination);
            } else {
              const errorMessage = response.errors
                ? `Error loading leaderboard: ${response.errors[0].message}`
                : "Error loading leaderboard. Please try again.";
              LeaderboardUI.showError($container, errorMessage);
              this.state.pagination.loadingPage = null;
              LeaderboardUI.updatePagination(this.state.pagination);
            }
          },
          () => {
            LeaderboardUI.showError(
              $container,
              "Error loading leaderboard. Please try again."
            );
            this.state.pagination.loadingPage = null;
            LeaderboardUI.updatePagination(this.state.pagination);
          },
          () => {
            if (showLoading) {
              LeaderboardUI.hideLoading($container);
            }
            this.state.isLoading = false;
            LeaderboardUI.updatePagination(this.state.pagination);
          }
        );
      });
    });
  }

  initialize() {
    this.state.reset();

    // Only initialize if leaderboard tab is active
    if (LeaderboardUtils.isLeaderboardTabActive()) {
      this.fetchLeaderboard();
    }

    // Listen for tab changes
    window.jQuery(".aitech-tab").on("click", (e) => {
      const tabId = window.jQuery(e.currentTarget).data("tab");
      if (tabId === "leaderboard") {
        this.state.reset();
        this.fetchLeaderboard();
      }
    });

    // Also initialize when the page becomes visible
    window.jQuery(document).on("visibilitychange", () => {
      if (
        document.visibilityState === "visible" &&
        LeaderboardUtils.isLeaderboardTabActive()
      ) {
        this.state.reset();
        this.fetchLeaderboard();
      }
    });
  }
}

const LeaderboardUtils = {
  formatAddress(address) {
    return address.length > 10
      ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
      : address;
  },

  calculatePercentages(data, maxProposals, maxVotes) {
    return {
      proposalsPercent:
        maxProposals > 0
          ? Math.round((data.proposalsCount / maxProposals) * 100)
          : 0,
      votesPercent:
        maxVotes > 0 ? Math.round((data.votesCount / maxVotes) * 100) : 0,
    };
  },

  getMaxValues(existingData, newData) {
    const allData = [...existingData, ...newData];
    return {
      maxProposals: Math.max(...allData.map((u) => u.proposalsCount)),
      maxVotes: Math.max(...allData.map((u) => u.votesCount)),
    };
  },

  isLeaderboardTabActive() {
    return window.jQuery("#leaderboard").hasClass("active");
  },
};

const SPACE_QUERY = `
  query Spaces {
    space(id: "aitechio.eth") {
      id
      name
      proposalsCount
      followersCount
      votesCount
      about
    }
  }
`;

function fetchSpaceData(state, cb) {
  // If we have valid cached data, use it
  if (state.isSpaceCacheValid()) {
    cb(state.spaceCache);
    return;
  }

  // If we're already fetching, don't start another request
  if (state.isLoadingSpace) {
    return;
  }

  state.isLoadingSpace = true;

  window.jQuery.ajax({
    url: "https://d8ckkgcrj0.execute-api.eu-central-1.amazonaws.com/prod/graphql",
    type: "POST",
    data: JSON.stringify({ query: SPACE_QUERY }),
    contentType: "application/json",
    success: function (response) {
      if (response.data && response.data.space) {
        state.updateSpaceCache(response.data);
        cb(response.data);
      }
    },
    error: function () {
      // If there's an error, try to use cached data even if expired
      if (state.spaceCache) {
        cb(state.spaceCache);
      }
    },
    complete: function () {
      state.isLoadingSpace = false;
    },
  });
}

// Pagination click handler
jQuery(document).on(
  "click",
  ".aitech-leaderboard-pagination .aitech-page-item, .aitech-leaderboard-pagination .aitech-page-nav",
  function (e) {
    e.preventDefault();
    const target = jQuery(e.currentTarget);
    if (target.hasClass("disabled")) return;
    const page = parseInt(target.data("page"));
    if (!page || page < 1) return;
    if (window.leaderboardService) {
      window.leaderboardService.state.currentPage = page;
      window.leaderboardService.state.pagination.loadingPage = page;
      LeaderboardUI.updatePagination(
        window.leaderboardService.state.pagination
      );
      window.leaderboardService.fetchLeaderboard(false);
    }
  }
);
