import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrendingStocks() {
  const { data: stocks = [], isLoading } = useQuery({
    queryKey: ["/api/stocks"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-success" : "text-danger";
  };

  const getTrendingReason = (stock: any) => {
    if (Math.abs(stock.changePercent) > 3) return "High Volume";
    if (stock.changePercent > 2) return "Breakout";
    if (stock.changePercent < -2) return "Profit Booking";
    return "Momentum";
  };

  const getCompanyInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').slice(0, 5).toUpperCase();
  };

  const getCompanyBgColor = (symbol: string) => {
    const colors = ['bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-orange-100', 'bg-red-100'];
    const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getCompanyTextColor = (symbol: string) => {
    const colors = ['text-blue-600', 'text-green-600', 'text-purple-600', 'text-orange-600', 'text-red-600'];
    const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-fire text-primary mr-2"></i>
            Trending Stocks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort by absolute change percentage and take top 3
  const trendingStocks = stocks
    .sort((a: any, b: any) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <i className="fas fa-fire text-primary mr-2"></i>
          Trending Stocks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {trendingStocks.map((stock: any) => (
            <div key={stock.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${getCompanyBgColor(stock.symbol)} rounded-lg flex items-center justify-center`}>
                  <span className={`${getCompanyTextColor(stock.symbol)} font-semibold text-xs`}>
                    {getCompanyInitials(stock.name)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{stock.name}</p>
                  <p className="text-xs text-gray-600">{formatCurrency(stock.currentPrice)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${getChangeColor(stock.changePercent)}`}>
                  {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-600">{getTrendingReason(stock)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
