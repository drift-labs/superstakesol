import AppWrapper from "../components/AppWrapper";
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import "react-loading-skeleton/dist/skeleton.css";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata = {
  title: "Super Stake SOL",
  description: "Earn leveraged yield on your SOL staking tokens",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={plusJakarta.className}>
        <AppWrapper>
          <main className="min-h-screen px-4 pb-12 gradient-body-bg">
            <div className="w-full max-w-[1280px] m-auto">{children}</div>
          </main>
        </AppWrapper>
      </body>
    </html>
  );
}
