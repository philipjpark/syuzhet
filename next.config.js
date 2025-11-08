/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Ignore missing files in node_modules (Windows path length issues)
    const originalWarn = config.infrastructureLogging || {};
    config.infrastructureLogging = {
      ...originalWarn,
      level: 'error', // Only show errors, suppress warnings
    };

    // Suppress specific module resolution warnings
    config.ignoreWarnings = [
      { module: /node_modules\/@dynamic-labs/ },
      { module: /node_modules\/mammoth/ },
      { module: /node_modules\/pino/ },
      /Failed to parse source map/,
      /Can't resolve 'pino-pretty'/,
    ];

    // Make mammoth server-side only
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        mammoth: false,
      };
    }

    // Suppress module resolution errors for known Windows path issues
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      // Handle optional pino-pretty dependency (not needed in browser)
      'pino-pretty': false,
    };

    return config;
  },
};

module.exports = nextConfig;

