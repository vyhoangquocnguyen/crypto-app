import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";
import { fetcher } from "@/lib/coingecko.actions";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import DataTable from "@/components/DataTable";
import CoinsPagination from "@/components/CoinsPagination";

export default async function Page({ searchParams }: NextPageProps) {
  const { page } = await searchParams;
  const perpage = 10;
  const currentPage = Number(page) || 1;
  const coinsData = await fetcher<CoinMarketData[]>(
    "/coins/markets",
    {
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: perpage,
      page: currentPage,
      sparkline: false,
      price_change_percentage: "24h",
    },
    300
  );

  const columns: DataTableColumn<CoinMarketData>[] = [
    {
      header: "Rank",
      // cellClassName: "rank-cell",
      cell: (coin) => (
        <Link href={`/coins/${coin.id}`} className="block">
          #{coin.market_cap_rank}
        </Link>
      ),
    },
    {
      header: "Token",
      cellClassName: "token-cell",
      cell: (coin) => {
        return (
          <div className="token-info">
            <Image src={coin.image} alt={coin.name} width={28} height={28} />
            <p>
              {coin.name} ({coin.symbol.toUpperCase()})
            </p>
          </div>
        );
      },
    },

    {
      header: "Price",
      cellClassName: "price-cell",
      cell: (coin) => formatCurrency(coin.current_price), //coin.current_price,
    },
    {
      header: "24h Change",
      cellClassName: "change-cell",
      cell: (coin) => {
        const priceChange = coin.price_change_percentage_24h ?? 0;
        const isTrendingUp = priceChange > 0;

        return (
          <div className={cn("change-cell", isTrendingUp ? "text-green-500" : "text-red-500")}>
            <p className="flex items-center">
              {formatPercentage(priceChange)}
              {isTrendingUp ? <TrendingUp width={16} height={16} /> : <TrendingDown width={16} height={16} />}
            </p>
          </div>
        );
      },
    },
    {
      header: "Market Cap",
      cellClassName: "market-cap-cell",
      cell: (coin) => formatCurrency(coin.market_cap), //coin.market_cap,
    },
  ];

  const hasMorePages = coinsData.length === perpage;

  const estimatedTotalPages = currentPage >= 100 ? Math.ceil(currentPage / 100) * 100 + 100 : 100;
  return (
    <main id="coins-page">
      <div className="content">
        <h4>All Coins</h4>

        <DataTable columns={columns} data={coinsData} rowKey={(_, index) => index} tableClassName="coins-table" />
        <CoinsPagination currentPage={currentPage} totalPages={estimatedTotalPages} hasMorePages={hasMorePages} />
      </div>
    </main>
  );
}
