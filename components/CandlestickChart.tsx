"use client";
import { getCandlestickConfig, getChartConfig, PERIOD_BUTTONS, PERIOD_CONFIG } from "@/constants";
import { fetcher } from "@/lib/coingecko.actions";
import { convertOHLCData } from "@/lib/utils";
import { CandlestickSeries, createChart, IChartApi, ISeriesApi } from "lightweight-charts";
import { useEffect, useRef, useState, useTransition } from "react";

export default function CandlestickChart({
  children,
  data,
  coinId,
  height = 360,
  initialPeriod = "daily",
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [ohclcData, setOhlcData] = useState<OHLCData[]>(data ?? []);
  const [isPending, startTransition] = useTransition();

  const fetchOHLCData = async (selectedPeriod: Period) => {
    try {
      const { days, interval } = PERIOD_CONFIG[selectedPeriod];
      const newData = await fetcher<OHLCData[]>(`coins/${coinId}/ohlc`, {
        vs_currency: "usd",
        days: days,
        // interval: interval, // Currently not used in the DemoAPI
        precision: "full",
      });
      setOhlcData(newData ?? []);
    } catch (error) {
      console.log("Error fetching OHLC data:", error);
    }
  };

  const handlePeriodChange = (newPeriod: Period) => {
    if (newPeriod === period) return;
    startTransition(async () => {
      setPeriod(newPeriod);
      await fetchOHLCData(newPeriod);
    });
  };
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const showTime = ["daily", "weekly", "monthly"].includes(period);

    const chart = createChart(container, {
      ...getChartConfig(height, showTime),
      width: container.clientWidth,
    });
    const series = chart.addSeries(CandlestickSeries, getCandlestickConfig());

    const convertedToSeconds = ohclcData.map(
      (item) => [Math.floor(item[0] / 1000), item[1], item[2], item[3], item[4]] as OHLCData
    );
    series.setData(convertOHLCData(convertedToSeconds));
    chart.timeScale().fitContent();

    chartRef.current = chart;
    candleSeriesRef.current = series;

    const observer = new ResizeObserver((entries) => {
      if (!entries.length) return;
      chart.applyOptions({ width: entries[0].contentRect.width });
    });
    observer.observe(container);

    return () => {
      observer.unobserve(container);
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, [height, period]);

  useEffect(() => {
    if (!candleSeriesRef.current) return;

    const convertedToSeconds = ohclcData.map(
      (item) => [Math.floor(item[0] / 1000), item[1], item[2], item[3], item[4]] as OHLCData
    );

    const converted = convertOHLCData(convertedToSeconds);
    candleSeriesRef.current.setData(converted);
    chartRef.current?.timeScale().fitContent();
  }, [ohclcData, data]);
  return (
    <div id="candlestick-chart">
      <div className="flex-1">{children}</div>
      <div className="button-group">
        <span className="text-sm mx-2 font-medium text-purple-100/50">Period:</span>
        {PERIOD_BUTTONS.map(({ value, label }) => (
          <button
            key={value}
            className={period === value ? "config-button-active" : "config-button"}
            onClick={() => handlePeriodChange(value)}
            disabled={isPending}>
            {label}
          </button>
        ))}
      </div>
      <div ref={chartContainerRef} className="chart" style={{ height }} />
    </div>
  );
}
