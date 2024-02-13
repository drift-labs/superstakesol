const doDlog = (key: string, message: any, ...optionalParams: any[]) => {
	console.debug(`🔧::${key}::\n${message}`, ...optionalParams);
};

const doDerr = (key: string, ...optionalParams: any[]) => {
	console.error(`🔧::ERROR_${key}`, ...optionalParams);
};

const PROD_ALLOWED_KEYS = ['market_subscriptions'];
const PROD_ALLOWED_KEYS_LOOKUP = new Set(PROD_ALLOWED_KEYS);

export function dlog(key: string, message: any, ...optionalParams: any[]) {
	/**
	 * Prod allowed keys
	 */
	if (PROD_ALLOWED_KEYS_LOOKUP.has(key)) {
		doDlog(key, message, ...optionalParams);
		return;
	}

	if (process.env.NEXT_PUBLIC_ENV === 'mainnet-beta') {
		return;
	}

	doDlog(key, message, ...optionalParams);
}

export function derr(key: string, ...optionalParams: any[]) {
	if (process.env.NEXT_PUBLIC_ENV === 'mainnet-beta') {
		return;
	}

	doDerr(key, ...optionalParams);
}
