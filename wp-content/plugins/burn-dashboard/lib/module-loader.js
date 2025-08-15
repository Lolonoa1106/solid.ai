// Module loader utility
const ModuleLoader = {
  // Store the plugin URL
  pluginUrl: null,

  // Initialize the loader
  init(url) {
    this.pluginUrl = url;
  },

  // Load a module using dynamic import
  async loadModule(modulePath, globalVar, callback) {
    if (!this.pluginUrl) {
      console.error("ModuleLoader not initialized. Call init() first.");
      return;
    }

    try {
      // Use dynamic import to load the module
      const module = await import(`${this.pluginUrl}${modulePath}`);

      // Create an API object with all exports
      const api = {};
      Object.keys(module).forEach((key) => {
        api[key] = module[key];
      });

      // Make the API object available globally
      window[globalVar] = api;

      // Also make individual functions available globally if they don't exist
      Object.keys(module).forEach((key) => {
        if (typeof window[key] === "undefined") {
          window[key] = module[key];
        }
      });

      // Call the callback if provided
      if (callback) {
        callback(api);
      }
    } catch (error) {
      console.error(`Error loading ${modulePath}:`, error);
    }
  },
};

// Make ModuleLoader available globally
window.ModuleLoader = ModuleLoader;
