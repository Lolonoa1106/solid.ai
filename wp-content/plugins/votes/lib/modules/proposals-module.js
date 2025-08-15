// Module wrapper for proposals.js
(() => {
  // Wait for ModuleLoader to be available
  const waitForModuleLoader = () => {
    if (typeof ModuleLoader !== "undefined") {
      ModuleLoader.loadModule("lib/proposals.js", "ProposalsUtils", (utils) => {
        // Additional initialization if needed
      });
    } else {
      // Try again in a bit
      setTimeout(waitForModuleLoader, 100);
    }
  };

  // Start waiting for ModuleLoader
  waitForModuleLoader();
})();
