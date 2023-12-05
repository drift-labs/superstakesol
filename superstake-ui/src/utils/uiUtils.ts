import { NINE } from '@drift-labs/sdk';
import { Buffer } from 'buffer';

// TODO we should try to get this into common-ts somehow... although buffer is so annoying to work with between packages, with but just making it a peerDependency, then making sure it's not included in the ts output should work.

export const decodeName = (bytes: number[]): string => {
	const buffer = Buffer.from(bytes);
	return buffer.toString('utf8').trim();
};

export const SOL_SPOT_MARKET_INDEX = 1;
export const SOL_PRECISION_EXP = NINE;

export const getRpcLatencyColor = (rpcLatency: number | undefined) => {
	return !rpcLatency || rpcLatency === -1
		? 'var(--status-neutral)'
		: rpcLatency < 250
		  ? 'var(--status-positive)'
		  : 'var(--status-negative)';
};

// export const aprFromApy = (apy: number, compoundsPerYear: number) => {
// 	const compoundedAmount = 1 + apy * 0.01;
// 	const estimatedApr =
// 		(Math.pow(compoundedAmount, 1 / compoundsPerYear) - 1) * compoundsPerYear;

// 	return estimatedApr * 100;
// };

// export const encodeName = (name: string): number[] => {
// 	const MAX_NAME_LENGTH = 32;

// 	if (name.length > MAX_NAME_LENGTH) {
// 		throw Error(`User name (${name}) longer than 32 characters`);
// 	}

// 	const buffer = Buffer.alloc(32);
// 	buffer.fill(name);
// 	buffer.fill(' ', name.length);

// 	return Array(...buffer);
// };
