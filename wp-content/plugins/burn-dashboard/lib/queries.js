import erc20Contract from "./erc20.js";

// Helper functions for date calculations
function getLastYearRange() {
  const now = new Date();
  const lastYear = new Date(
    now.getFullYear() - 1,
    now.getMonth(),
    now.getDate()
  );
  return {
    start: Math.floor(lastYear.getTime() / 1000),
    end: Math.floor(now.getTime() / 1000),
  };
}

function getLastMonthRange() {
  const now = new Date();
  const lastMonth = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate()
  );
  return {
    start: Math.floor(lastMonth.getTime() / 1000),
    end: Math.floor(now.getTime() / 1000),
  };
}

function getLastWeekRange() {
  const now = new Date();
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return {
    start: Math.floor(lastWeek.getTime() / 1000),
    end: Math.floor(now.getTime() / 1000),
  };
}

function getLastDayRange() {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return {
    start: Math.floor(yesterday.getTime() / 1000),
    end: Math.floor(now.getTime() / 1000),
  };
}

const ALL_TIME_BURN_QUERIES = {
  LAST_YEAR: `
    query {
      dailyBurns(
        where: {
          date_gte: ${getLastYearRange().start},
          date_lte: ${getLastYearRange().end}
        },
        orderBy: date,
        orderDirection: asc
      ) {
        totalBurned
        burnCount
        date
      }
    }
  `,
  LAST_MONTH: `
    query {
      dailyBurns(
        where: {
          date_gte: ${getLastMonthRange().start},
          date_lte: ${getLastMonthRange().end}
        },
        orderBy: date,
        orderDirection: asc
      ) {
        totalBurned
        burnCount
        date
      }
    }
  `,
  LAST_WEEK: `
    query {
      dailyBurns(
        where: {
          date_gte: ${getLastWeekRange().start},
          date_lte: ${getLastWeekRange().end}
        },
        orderBy: date,
        orderDirection: asc
      ) {
        totalBurned
        burnCount
        date
      }
    }
  `,
  LAST_DAY: `
    query {
      dailyBurns(
        where: {
          date_gte: ${getLastDayRange().start},
          date_lte: ${getLastDayRange().end}
        },
        orderBy: date,
        orderDirection: asc
      ) {
        totalBurned
        burnCount
        date
      }
    }
  `,
};

const TOTAL_BURNERS_QUERY = `
    query {
        burnStats(id: "burn-stats") {
            totalBurned
            totalBurnCount
        }
    }
`;

const LAST_MONTH_BURN_QUERY = `
    query {
        burnStats(id: "burn-stats") {
            lastMonthBurned
        }
    }
`;

const TOP_BURNERS_QUERY = `
    query {
        burners(first: 10, orderBy: totalBurned, orderDirection: desc) {
            id
            totalBurned
            burnCount
            lastBurnTimestamp
            firstBurnTimestamp
        }
    }
`;

const USER_BURNED_TOKENS_QUERY = `
    query($address: String!) {
        burner(id: $address) {
            totalBurned
        }
    }
`;

// Function to transform burn data for charts
function transformBurnData(data) {
  if (!data || !data.data) return null;

  // Extract data from GraphQL response
  const dailyBurns = data.data.dailyBurns;
  const period = data.period || "LAST_YEAR";

  // Generate all time labels for the period
  let timeLabels = [];
  let chartData = [];

  const now = new Date();
  let startDate, endDate;
  switch (period) {
    case "LAST_YEAR":
      startDate = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate()
      );
      endDate = now;
      break;
    case "LAST_MONTH":
      startDate = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );
      endDate = now;
      break;
    case "LAST_WEEK":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      endDate = now;
      break;
    case "LAST_DAY":
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      endDate = now;
      break;
    default:
      startDate = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate()
      );
      endDate = now;
  }

  // Create a map to store aggregated data
  const aggregatedData = new Map();

  // Process daily burns and aggregate based on period
  dailyBurns.forEach((burn) => {
    const burnDate = new Date(burn.date * 1000);
    let key;

    switch (period) {
      case "LAST_YEAR":
        // Group by month for yearly view
        key = burnDate.toLocaleDateString("en-US", {
          month: "numeric",
          year: "2-digit",
          separator: "/"
        });
        break;
      case "LAST_MONTH":
      case "LAST_WEEK":
        // Use daily view for month and week
        key = burnDate.toLocaleDateString("en-US", {
          day: "numeric",
          month: "numeric",
          separator: "/"
        });
        break;
      case "LAST_DAY":
        // Use hourly view for day
        key = burnDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          hour12: true,
        });
        break;
      default:
        key = burnDate.toLocaleDateString("en-US", {
          month: "numeric",
          day: "numeric",
        });
    }

    const currentValue = aggregatedData.get(key) || 0;
    aggregatedData.set(
      key,
      currentValue + parseFloat(weiToEther(burn.totalBurned))
    );
  });

  // Generate time labels and corresponding data
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    let label;
    switch (period) {
      case "LAST_YEAR":
        label = currentDate.toLocaleDateString("en-US", {
          month: "numeric",
          year: "2-digit",
          separator: "/"
        });
        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      case "LAST_MONTH":
      case "LAST_WEEK":
        label = currentDate.toLocaleDateString("en-US", {
          day: "numeric",
          month: "numeric",
          separator: "/"
        });
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case "LAST_DAY":
        // For last day, generate hourly labels
        for (let hour = 0; hour < 24; hour++) {
          const hourDate = new Date(currentDate);
          hourDate.setHours(hour, 0, 0, 0);
          label = hourDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            hour12: true,
          });
          timeLabels.push(label);
          chartData.push(aggregatedData.get(label) || 0);
        }
        // Move to next day after processing all hours
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      default:
        label = currentDate.toLocaleDateString("en-US", {
          month: "numeric",
          day: "numeric",
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }

    if (period !== "LAST_DAY") {
      timeLabels.push(label);
      chartData.push(aggregatedData.get(label) || 0);
    }
  }

  return {
    chartData,
    timeLabels,
    maxChartValue: Math.max(...chartData) * 1.2 || 1,
  };
}

// Function to transform burn statistics
async function transformBurnStats(data) {
  if (!data || !data.data || !data.data.burnStats) {
    return [
      {
        title: "Total Time Burned",
        percent: "0%",
        amount: "0",
        currency: "AITECH",
        supply: "0%",
      },
      {
        title: "Burned Last Month",
        percent: "0%",
        amount: "0",
        currency: "AITECH",
        supply: "0%",
      },
    ];
  }

  const { burnStats } = data.data;
  
  try {
    // Get total supply from contract
    const totalSupply = await erc20Contract.getTotalSupply();

    // Convert to number since getTotalSupply already returns formatted value
    const totalSupplyNum = parseFloat(totalSupply);

    // Calculate burned amounts in ether
    const totalBurned = parseFloat(weiToEther(burnStats.totalBurned));
    const lastMonthBurned = parseFloat(weiToEther(burnStats.lastMonthBurned));

    // Calculate percentages with more precision
    const totalBurnedPercent = (totalBurned / totalSupplyNum) * 100;
    const lastMonthBurnedPercent = (lastMonthBurned / totalSupplyNum) * 100;

    // Calculate remaining supply percentages
    let totalSupplyPercent = 100 - parseFloat(totalBurnedPercent);
    totalSupplyPercent = (100 - +totalSupplyPercent).toFixed(4);

    let lastMonthSupplyPercent = 100 - parseFloat(lastMonthBurnedPercent);
    lastMonthSupplyPercent = (100 - +lastMonthSupplyPercent).toFixed(4);

    const result = [
      {
        title: "Total Time Burned",
        percent: `${totalBurnedPercent.toFixed(2)}%`,
        amount: weiToEtherFormat(burnStats.totalBurned) || "0",
        currency: "AITECH",
        supply: `${totalSupplyPercent}%`,
      },
      {
        title: "Burned Last Month",
        percent: `${lastMonthBurnedPercent.toFixed(2)}%`,
        amount: weiToEtherFormat(burnStats.lastMonthBurned) || "0",
        currency: "AITECH",
        supply: `${lastMonthSupplyPercent}%`,
      },
    ];

    return result;
  } catch (error) {
    console.error("Error calculating supply percentages:", error);
    // Return fallback values if there's an error
    const fallbackResult = [
      {
        title: "Total Time Burned",
        percent: "0%",
        amount: weiToEtherFormat(burnStats.totalBurned) || "0",
        currency: "AITECH",
        supply: "0%",
      },
      {
        title: "Burned Last Month",
        percent: "0%",
        amount: weiToEtherFormat(burnStats.lastMonthBurned) || "0",
        currency: "AITECH",
        supply: "0%",
      },
    ];

    return fallbackResult;
  }
}

// Function to transform top burners data
function transformTopBurners(data) {
  if (!data || !data.data || !data.data.burners) return null;

  const { burners } = data.data;

  // Split burners into top and regular
  const topBurners = burners.slice(0, 3).map((burner) => burner.id);
  const regularBurners = burners.slice(3).map((burner) => burner.id);

  return {
    topBurners,
    regularBurners,
  };
}

// Function to convert wei to ether
function weiToEther(wei) {
  if (!wei) return "0";
  // Convert wei to ether (1 ether = 10^18 wei)
  const ether = parseFloat(wei) / 1e18;
  // Handle potential overflow by checking if result is finite
  if (!Number.isFinite(ether)) return "0";

  return ether.toFixed(0);
}

function weiToEtherFormat(wei) {
  if (!wei) return "0";
  // Convert wei to ether (1 ether = 10^18 wei)
  const ether = parseFloat(wei) / 1e18;
  // Handle potential overflow by checking if result is finite
  if (!Number.isFinite(ether)) return "0";

  return formatNumber(ether);
}

// Function to convert ether to wei
function etherToWei(ether) {
  if (!ether) return "0";
  // Convert ether to wei (1 ether = 10^18 wei)
  const wei = parseFloat(ether) * 1e18;
  // Handle potential overflow by checking if result is finite
  if (!Number.isFinite(wei)) return "0";
  return wei.toString();
}

function formatUnixTimestamp(timestamp) {
  if (!timestamp) return "";

  const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Get month (0-11) and pad with 0
  const year = date.getFullYear().toString().slice(-2); // Get last 2 digits of year
  return `${month}/${year}`;
}

// Helper function to format numbers
function formatNumber(num) {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return num.toString();
}

// Function to transform user's burned tokens data
function transformUserBurnedTokens(data) {
  if (!data || !data.data || !data.data.burner) return "0";
  return weiToEtherFormat(data.data.burner.totalBurned) || "0";
}

// Export all queries and transformation functions
export {
  ALL_TIME_BURN_QUERIES,
  TOTAL_BURNERS_QUERY,
  LAST_MONTH_BURN_QUERY,
  TOP_BURNERS_QUERY,
  USER_BURNED_TOKENS_QUERY,
  transformBurnData,
  transformBurnStats,
  transformTopBurners,
  transformUserBurnedTokens,
  formatNumber,
};
