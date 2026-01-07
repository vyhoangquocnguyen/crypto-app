import React from "react";
import DataTable from "../DataTable";

const skeletonRows = Array.from({ length: 6 }).map((_, i) => ({ id: `skeleton-${i}` }));

export function CoinOverviewFallback() {
  return (
    <div id="coin-overview-fallback">
      <div className="header p-2">
        <div className="header-image bg-dark-400 animate-pulse" />
        <div className="info">
          <div className="header-line-lg bg-dark-400 animate-pulse" />
          <div className="header-line-sm bg-dark-400 animate-pulse" />
        </div>
      </div>

      <div className="flex items-center gap-2 px-2 mb-4">
        <div className="period-button-skeleton bg-dark-400 animate-pulse" />
        <div className="period-button-skeleton bg-dark-400 animate-pulse" />
        <div className="period-button-skeleton bg-dark-400 animate-pulse" />
      </div>

      <div className="chart px-2">
        <div className="chart-skeleton bg-dark-400 animate-pulse rounded-xl" />
      </div>
    </div>
  );
}

const columns = [
  {
    header: "Name",
    cellClassName: "name-cell",
    cell: () => (
      <div className="name-link">
        <div className="name-image bg-dark-400 animate-pulse rounded-full" />
        <div className="name-line bg-dark-400 animate-pulse" />
      </div>
    ),
  },
  {
    header: "24h Change",
    cellClassName: "change-cell",
    cell: () => <div className="change-line bg-dark-400 animate-pulse" />,
  },
  {
    header: "Price",
    cellClassName: "price-cell",
    cell: () => <div className="price-line bg-dark-400 animate-pulse" />,
  },
];

export function TrendingCoinsFallback() {
  return (
    <div id="trending-coins-fallback">
      <h4 className="px-5">Trending Coins</h4>
      <div className="trending-coins-table px-2">
        <DataTable
          data={skeletonRows}
          columns={columns}
          rowKey={(row, idx) => row.id || String(idx)}
          headerCellClassName="py-3!"
          bodyCellClassName="py-2!"
        />
      </div>
    </div>
  );
}
