import { Suspense } from "react";
import { CoinOverview } from "@/components/home/CoinOverview";
import { CoinOverviewFallback, TrendingCoinsFallback } from "@/components/home/fallback";
import { TrendingCoin } from "@/components/home/TrendingCoin";

export default async function Page() {
  return (
    <main className="main-container">
      <section className="home-grid">
        <Suspense fallback={<CoinOverviewFallback />}>
          <CoinOverview />
        </Suspense>
        <Suspense fallback={<TrendingCoinsFallback />}>
          <TrendingCoin />
        </Suspense>
      </section>
      <section className="w-full mt-7 space-y-4">
        <p>Categories</p>
      </section>
    </main>
  );
}
