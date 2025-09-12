import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MarketOverview() {
  const { data: marketIndices = [], isLoading: isLoadingIndices } = useQuery({
    queryKey: ["/api/market-indices"],
  });

  const { data: portfolio, isLoading: isLoadingPortfolio } = useQuery({
    queryKey: ["/api/portfolio"],
  });

  const { data: marketSentiment, isLoading: isLoadingSentiment } = useQuery({
    queryKey: ["/api/ai/market-sentiment"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-success" : "text-danger";
  };

  if (isLoadingIndices || isLoadingPortfolio || isLoadingSentiment) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const nifty = marketIndices.find((index: any) => index.id === "NIFTY50");
  const sensex = marketIndices.find((index: any) => index.id === "SENSEX");

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {nifty && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">NIFTY 50</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(nifty.currentValue)}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${getChangeColor(nifty.changeAmount)}`}>
                  {nifty.changeAmount >= 0 ? '+' : ''}{formatNumber(nifty.changeAmount)}
                </p>
                <p className={`text-sm ${getChangeColor(nifty.changeAmount)}`}>
                  {nifty.changePercent >= 0 ? '+' : ''}{formatNumber(nifty.changePercent)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {sensex && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">SENSEX</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(sensex.currentValue)}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${getChangeColor(sensex.changeAmount)}`}>
                  {sensex.changeAmount >= 0 ? '+' : ''}{formatNumber(sensex.changeAmount)}
                </p>
                <p className={`text-sm ${getChangeColor(sensex.changeAmount)}`}>
                  {sensex.changePercent >= 0 ? '+' : ''}{formatNumber(sensex.changePercent)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {portfolio && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(portfolio.totalValue)}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${getChangeColor(portfolio.dayChange)}`}>
                  {portfolio.dayChange >= 0 ? '+' : ''}{formatCurrency(portfolio.dayChange)}
                </p>
                <p className={`text-sm ${getChangeColor(portfolio.dayChange)}`}>
                  {portfolio.dayChangePercent >= 0 ? '+' : ''}{formatNumber(portfolio.dayChangePercent)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {marketSentiment && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Score</p>
                <p className="text-2xl font-bold text-warning">
                  {formatNumber(marketSentiment.score)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Market Sentiment</p>
                <p className="text-sm font-medium text-success">
                  {marketSentiment.sentiment}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
