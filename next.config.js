/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
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
      { module: /node_modules\/ethers/ },
      /Failed to parse source map/,
      /Can't resolve 'pino-pretty'/,
      /Can't resolve.*subscriber-polling/,
      /Can't resolve.*subscriber-filterid/,
      /Can't resolve.*subscriber-connection/,
      /Can't resolve '\.\/subscriber-polling\.js'/,
      /Can't resolve '\.\/subscriber-filterid\.js'/,
      /Can't resolve '\.\/subscriber-connection\.js'/,
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
      // Handle ethers.js optional subscriber modules
      './subscriber-polling.js': false,
      './subscriber-polling': false,
      './subscriber-filterid.js': false,
      './subscriber-filterid': false,
      './subscriber-connection.js': false,
      './subscriber-connection': false,
    };

    // Handle ethers.js internal modules - mark as external or ignore
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
      });
    }

    // Fix Next.js vendor chunk issues with @turnkey (Dynamic Labs dependency)
    // The error occurs because Next.js tries to load vendor chunks that don't exist
    // We'll configure webpack to handle this properly
    config.optimization = config.optimization || {};
    if (config.optimization.splitChunks) {
      // Keep existing splitChunks config but ensure it works properly
      config.optimization.splitChunks.cacheGroups = config.optimization.splitChunks.cacheGroups || {};
      // Ensure @turnkey is not split into a separate chunk that causes issues
      config.optimization.splitChunks.cacheGroups.default = {
        ...config.optimization.splitChunks.cacheGroups.default,
        minChunks: 1,
        reuseExistingChunk: true,
      };
    }

    // Add plugin to replace ethers subscriber modules with empty module
    const webpack = require('webpack');
    const path = require('path');
    config.plugins = config.plugins || [];
    
    // Replace all subscriber-*.js imports from ethers providers with empty module
    // This handles optional dependencies that aren't needed for basic JSON-RPC usage
    const subscriberModules = [
      'subscriber-polling',
      'subscriber-filterid',
      'subscriber-connection',
    ];
    
    subscriberModules.forEach((moduleName) => {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          new RegExp(`${moduleName}\\.js$`),
          (resource) => {
            // Only replace if it's from ethers providers directory
            if (resource.context && resource.context.includes('ethers') && resource.context.includes('providers')) {
              resource.request = path.resolve(__dirname, 'lib/webpack/empty-module.js');
            }
          }
        )
      );
    });

    return config;
  },
};

module.exports = nextConfig;

