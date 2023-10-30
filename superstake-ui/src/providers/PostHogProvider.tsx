'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { ReactNode, useEffect } from 'react';

export default function PHProvider({ children }: { children: ReactNode }) {
	useEffect(() => {
		if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
			console.error('posthog key not found');
			return;
		}

		posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
			api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
			persistence: 'localStorage+cookie',
		});
	}, []);

	return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
