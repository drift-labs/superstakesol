This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

Build all the required dependencies with the build_all script
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or 
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

# Adding a new Liquid Staking Token (LST)

1. Add the relevant config in `LST.ts`
2. Add the method to get historical prices of the LST to `calculateSolEarned()` in `superStake.ts` of the Drift SDK.
3. Add hook to fetch metrics e.g. `useSyncMSolMetrics.tsx`
4. Add metrics to `useCurrentLstMetrics.tsx`
5. Update `NEW_LST_DATE_ADDED` in `useLastAcknowledgedTerms.tsx`
6. Update Terms and FAQ

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
