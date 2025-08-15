// Module wrapper for marketplace.js
(() => {
  if (typeof ModuleLoader === "undefined") {
    console.error(
      "ModuleLoader not found. Make sure module-loader.js is loaded first."
    );
    return;
  }

  ModuleLoader.loadModule("lib/marketplace.js", "MarketplaceAPI", (api) => {
    // Additional initialization if needed
  });
})();
