export class CoinGeckoAPI {
  constructor() {
    this.baseUrl = "https://pro-api.coingecko.com/api/v3";
    this.coins = {
      tao: {
        id: "bittensor",
        name: "Bittensor",
        symbol: "TAO",
      },
      near: {
        id: "near",
        name: "NEAR Protocol",
        symbol: "NEAR",
      },
      aitech: {
        id: "solidus-aitech",
        name: "Tech",
        symbol: "AITECH",
      },
      render: {
        id: "render-token",
        name: "Render",
        symbol: "RENDER",
      },
      fet: {
        id: "fetch-ai",
        name: "Fetch.ai",
        symbol: "FET",
      },
      cgpt: {
        id: "chaingpt",
        name: "ChainGPT",
        symbol: "CGPT",
      },
      inj: {
        id: "injective-protocol",
        name: "Injective",
        symbol: "INJ",
      },
      kaito: {
        id: "kaito",
        name: "KAITO",
        symbol: "KAITO",
      },
      ai16z: {
        id: "ai16z",
        name: "ai16z",
        symbol: "AI16Z",
      },
      grass: {
        id: "grass",
        name: "Grass",
        symbol: "GRASS",
      },
    };

    // Generate priceCharts object from coins array
    this.priceCharts = {};
    Object.entries(this.coins).forEach(([key, coin]) => {
      this.priceCharts[
        key
      ] = `${this.baseUrl}/coins/${coin.id}/market_chart?vs_currency=usd&days=1`;
    });

    this.headers = {
      "x-cg-pro-api-key": "CG-hPKG6MYDVqMc3nfZwSkxCL6X",
    };
  }

  async fetchAITECHPrice() {
    try {
      const response = await fetch(
        `${this.baseUrl}/simple/price?ids=solidus-aitech&vs_currencies=usd`,
        {
          method: "GET",
          headers: this.headers,
        }
      );
      const data = await response.json();

      return data["solidus-aitech"].usd || 0;
    } catch (error) {
      console.error("Error fetching AITECH price:", error);
      return 0;
    }
  }

  async fetchCoinData() {
    try {
      const ids = Object.values(this.coins)
        .map((coin) => coin.id)
        .join(",");
      const response = await fetch(
        `${this.baseUrl}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
        {
          method: "GET",
          headers: this.headers,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data from CoinGecko");
      }

      const data = await response.json();
      return await this.formatCoinData(data);
    } catch (error) {
      console.error("Error fetching coin data:", error);
      return this.getFallbackData();
    }
  }

  async formatCoinData(data) {
    return await Promise.all(
      Object.entries(this.coins)
        .map(async ([key, coin]) => {
          const coinData = data[coin.id];
          if (!coinData) return null;

          const priceChart = await fetch(this.priceCharts[key], {
            method: "GET",
            headers: this.headers,
          });
          const priceChartData = await priceChart.json();

          // Transform the data to match the expected format
          const transformedData = {
            stats: priceChartData.prices.map(([timestamp, price]) => [
              timestamp,
              price,
            ]),
          };

          return {
            symbol: coin.symbol,
            name: coin.name,
            price: coinData.usd.toFixed(2),
            percent: `${coinData.usd_24h_change.toFixed(2)}%`,
            icon_class: `crypto-icon-${key}`,
            chartData: transformedData,
          };
        })
        .filter(Boolean)
    );
  }

  generateChartData(change) {
    // Generate some random data points for the chart
    const points = 20;
    const data = [];
    const baseValue = 100;
    const volatility = Math.abs(change) / 2;

    for (let i = 0; i < points; i++) {
      const randomChange = (Math.random() - 0.5) * volatility;
      data.push(baseValue + randomChange);
    }

    return data;
  }

  getFallbackData() {
    return this.coins.map((coin) => ({
      symbol: coin.symbol,
      name: coin.name,
      price: "0.00",
      percent: "0.00%",
      icon_class: `crypto-icon-${coin.key}`,
      chartData: { stats: [] },
    }));
  }
}

// Export the CoinGeckoAPI class
export default CoinGeckoAPI;

const SAMPLE_PRICE_CHART = {
  stats: [
    [1747907699337, 0.0007723946334474237],
    [1747907946370, 0.0007696025408929878],
    [1747908364403, 0.0007697751774878186],
    [1747908550657, 0.0007664057073546732],
    [1747908891655, 0.0007662622066687783],
    [1747909320876, 0.0007662599249721318],
    [1747909469736, 0.0007662591632839642],
  ],
};
