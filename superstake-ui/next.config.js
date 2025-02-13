/** @type {import('next').NextConfig} */
const nextConfig = {
	typescript: { ignoreBuildErrors: true },

	output: 'standalone',

	// <Force dynamic rendering>
	dynamicParams: true,
	experimental: {
		disableStaticGeneration: true,
	},
	generateStaticParams: false,
	unstable_runtimeJS: true,
	// </Force dnamic rendering> :: The above params are an attempt to fix a build error during "static site generation" in Vercel which I can't solve and doesn't seem worth spending more time fixing considering we're going to decommission superstake soon anyway.

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
