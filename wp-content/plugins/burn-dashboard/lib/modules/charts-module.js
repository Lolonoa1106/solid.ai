// Module wrapper for charts.js
(() => {
  if (typeof ModuleLoader === "undefined") {
    console.error(
      "ModuleLoader not found. Make sure module-loader.js is loaded first."
    );
    return;
  }

  ModuleLoader.loadModule("lib/charts.js", "ChartsAPI", (api) => {
    // Additional initialization if needed
  });
})();
