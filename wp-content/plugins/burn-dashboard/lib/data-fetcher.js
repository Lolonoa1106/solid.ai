import {
  ALL_TIME_BURN_QUERIES,
  TOTAL_BURNERS_QUERY,
  TOP_BURNERS_QUERY,
  USER_BURNED_TOKENS_QUERY,
  LAST_MONTH_BURN_QUERY,
} from "./queries.js";

const GRAPHQL_ENDPOINT =
  "https://subgraph.satsuma-prod.com/7cf6a30b8682/markos-team/aitech-burn-tracker/version/v0.0.4-new-version/api";

// Function to fetch data from GraphQL endpoint
async function fetchGraphQLData(query) {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error("GraphQL errors:", data.errors);
      throw new Error("GraphQL query failed");
    }

    return data;
  } catch (error) {
    console.error("Error fetching GraphQL data:", error);
    return null;
  }
}

// Cache object to store fetched data
const dataCache = {
  burnData: {},
  burnStats: null,
  topBurners: null,
  lastFetch: {
    burnData: {},
    burnStats: null,
    topBurners: null,
  },
  CACHE_DURATION: 30 * 1000, // 30 seconds in milliseconds
};

// Function to check if cache is valid for a specific data type and period
function isCacheValid(type, period = null) {
  const lastFetch = period
    ? dataCache.lastFetch[type]?.[period]
    : dataCache.lastFetch[type];
  if (!lastFetch) return false;
  return Date.now() - lastFetch < dataCache.CACHE_DURATION;
}

// Function to update cache timestamp
function updateCacheTimestamp(type, period = null) {
  if (period) {
    if (!dataCache.lastFetch[type]) {
      dataCache.lastFetch[type] = {};
    }
    dataCache.lastFetch[type][period] = Date.now();
  } else {
    dataCache.lastFetch[type] = Date.now();
  }
}

// Function to fetch data for a specific period
async function fetchPeriodData(period) {
  try {
    // Check cache first
    if (dataCache.burnData[period] && isCacheValid("burnData", period)) {
      return dataCache.burnData[period];
    }

    // Fetch new data
    const query = ALL_TIME_BURN_QUERIES[period];
    const data = await fetchGraphQLData(query);

    if (data) {
      // Add period information to the data
      data.period = period;
    }

    // Update cache
    dataCache.burnData[period] = data;
    updateCacheTimestamp("burnData", period);

    return data;
  } catch (error) {
    console.error(`Error fetching ${period} data:`, error);
    return null;
  }
}

// Function to fetch all dashboard data
export async function fetchDashboardData(period = "LAST_YEAR") {
  try {
    // Fetch period-specific data
    const burnData = await fetchPeriodData(period);

    // Fetch other data only if not in cache or cache is invalid
    let burnStats = dataCache.burnStats;
    let topBurners = dataCache.topBurners;
    let lastMonthBurned = dataCache.lastMonthBurned;

    if (!isCacheValid("burnStats") || !isCacheValid("topBurners")) {

      [burnStats, topBurners, lastMonthBurned] = await Promise.all([
        fetchGraphQLData(TOTAL_BURNERS_QUERY),
        fetchGraphQLData(TOP_BURNERS_QUERY),
        fetchGraphQLData(LAST_MONTH_BURN_QUERY)
      ]);

      // combine burnStats and lastMonthBurned
      burnStats = { 
        data: {
          burnStats: {...burnStats.data.burnStats, ...lastMonthBurned.data.burnStats },
        }
      };

      // Update cache
      dataCache.burnStats = burnStats;
      dataCache.topBurners = topBurners;

      updateCacheTimestamp("burnStats");
      updateCacheTimestamp("topBurners");
    }

    return {
      burnData,
      burnStats,
      topBurners,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return null;
  }
}

// Function to fetch user's burned tokens
export async function fetchUserBurnedTokens(address) {
  if (!address) return null;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: USER_BURNED_TOKENS_QUERY,
        variables: { address: address.toLowerCase() },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error("GraphQL errors:", data.errors);
      throw new Error("GraphQL query failed");
    }

    return data;
  } catch (error) {
    console.error("Error fetching user burned tokens:", error);
    return null;
  }
}

// Export the fetchPeriodData function for direct use
export { fetchPeriodData };
