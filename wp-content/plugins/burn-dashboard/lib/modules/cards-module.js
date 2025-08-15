// Module wrapper for cards.js
(() => {
  if (typeof ModuleLoader === "undefined") {
    console.error(
      "ModuleLoader not found. Make sure module-loader.js is loaded first."
    );
    return;
  }

  ModuleLoader.loadModule("lib/cards.js", "CardsAPI", (api) => {
    // Additional initialization if needed
  });
})();
