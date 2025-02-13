/** @type {import('next').NextConfig} */
const nextConfig = {
	typescript: { ignoreBuildErrors: true },
	swcMinify: false, // Disable code minification

	webpack(config, { isServer }) {
		if (!isServer) {
			config.resolve.fallback = {
				fs: false, // Disables the polyfill for 'fs' module
				tls: false, // Disables the polyfill for 'tls' module
				net: false, // Disables the polyfill for 'net' module
				dgram: false, // Disables the polyfill for 'dgram' module
				dns: false, // Disables the polyfill for 'dgram' module
				path: require.resolve('path-browserify'), // Polyfill for 'path' module
			};
		}

		return config;
	},
};

module.exports = nextConfig;
