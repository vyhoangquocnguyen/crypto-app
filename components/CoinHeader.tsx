import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { TrendingDown, TrendingUp } from "lucide-react";

export default function CoinHeader({
  name,
  image,
  livePrice,
  livePriceChangePercentage24h,
  priceChangePercentage30d,
  priceChange24h,
}: LiveCoinHeaderProps) {
  const isTrendingup = livePriceChangePercentage24h > 0;
  const isThirtyDayUp = priceChangePercentage30d > 0;
  const isPriceChangeUp = priceChange24h > 0;
  const stats = [
    {
      label: "Today",
      value: livePriceChangePercentage24h,
      isUp: isTrendingup,
      formatter: formatPercentage,
      showIcon: true,
    },
    {
      label: "30 Days",
      value: priceChangePercentage30d,
      isUp: isThirtyDayUp,
      formatter: formatPercentage,
      showIcon: true,
    },
    {
      label: "Price Change (24h)",
      value: priceChange24h,
      isUp: isPriceChangeUp,
      formatter: formatCurrency,
      showIcon: false,
    },
  ];

  return (
    <div id="coin-header">
      <h3>{name}</h3>
      <div className="info">
        <Image src={image} alt={name} width={77} height={77} />
        <div className="price-row">
          <h1>{formatCurrency(livePrice)}</h1>
          <Badge className={cn("badge", isTrendingup ? "badge-up" : "badge-down")}>
            {formatPercentage(livePriceChangePercentage24h)}
            {isTrendingup ? <TrendingUp /> : <TrendingDown />}
            (24h)
          </Badge>
        </div>
      </div>
      <ul className="stats">
        {stats.map((stat, index) => (
          <li key={stat.label + index}>
            <p className="label">{stat.label}</p>
            <div className={cn("value", { "text-green-500": stat.isUp, "text-red-500": !stat.isUp })}>
              <p>{stat.formatter(stat.value)}</p>
              {stat.showIcon && (stat.isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
