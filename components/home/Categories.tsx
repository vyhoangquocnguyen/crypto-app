import { fetcher } from "@/lib/coingecko.actions";
import DataTable from "../DataTable";
import Image from "next/image";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

export default async function Categories() {
  const categories = await fetcher<Category[]>("/coins/categories");
  const collumns: DataTableColumn<Category>[] = [
    {
      header: "Category",
      cellClassName: "category-cell",
      cell: (category) => category.name,
    },
    {
      header: "Top Gainer Coins",
      cellClassName: "top-gainers-cell",
      cell: (category) =>
        category.top_3_coins.map((coin) => <Image key={coin} src={coin} alt={coin} width={28} height={28} />),
    },
    {
      header: "24h Change",
      cellClassName: "change-header-cell",
      cell: (category) => {
        const priceChange = category.market_cap_change_24h ?? 0;
        const isTrendingUp = priceChange > 0;

        return (
          <div className={cn("change-cell", isTrendingUp ? "text-green-500" : "text-red-500")}>
            <p className="flex items-center">
              {formatPercentage(priceChange)}%
              {isTrendingUp ? <TrendingUp width={16} height={16} /> : <TrendingDown width={16} height={16} />}
            </p>
          </div>
        );
      }, //category.market_cap_change_24h,
    },
    {
      header: "Market Cap",
      cellClassName: "market-cap-cell",
      cell: (category) => formatCurrency(category.market_cap), //category.market_cap,
    },
    {
      header: "Volume (24h)",
      cellClassName: "volume-cell",
      cell: (category) => formatCurrency(category.volume_24h),
    },
  ];
  return (
    <div id="categories" className="custom-scrollbar">
      <h4>Top Categories</h4>

      <DataTable
        columns={collumns}
        data={categories?.slice(0, 10)}
        rowKey={(_, index) => index}
        tableClassName="mt-3"
      />
    </div>
  );
}
