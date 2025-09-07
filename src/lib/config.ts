// Simple configuration utility for managing app modes
export const config = {
  // Check if we're in simulated mode
  isSimulated(): boolean {
    // const forceMode = process.env.FORCE_APP_MODE;
    const forceMode = "real";
    if (forceMode === "simulated") return true;
    if (forceMode === "real") return false;

    return process.env.NODE_ENV !== "production";
  },

  // Check if we're in real API mode
  isReal(): boolean {
    return !this.isSimulated();
  },

  // Log current mode for debugging
  logMode(): void {
    const mode = this.isSimulated() ? "simulated" : "real";
    console.log(`🚀 App running in ${mode} mode`);
    if (process.env.FORCE_APP_MODE) {
      console.log(`🔧 Force mode override: ${process.env.FORCE_APP_MODE}`);
    }
  },
};

// Log mode on import
config.logMode();
