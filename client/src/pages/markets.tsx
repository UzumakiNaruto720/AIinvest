import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import NavigationHeader from "@/components/NavigationHeader";
import MobileMenu from "@/components/MobileMenu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function Markets() {
  const [activeTab, setActiveTab] = useState("stocks");

  const { data: stocks = [], isLoading: isLoadingStocks } = useQuery({
    queryKey: ["/api/stocks"],
  });

  const { data: forexPairs = [], isLoading: isLoadingForex } = useQuery({
    queryKey: ["/api/forex"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number, decimals = 2) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-success" : "text-danger";
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'bg-success/10 text-success';
    if (score >= 5) return 'bg-warning/10 text-warning';
    return 'bg-danger/10 text-danger';
  };

  const getCompanyInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').slice(0, 3).toUpperCase();
  };

  const getCompanyBgColor = (symbol: string) => {
    const colors = ['bg-blue-100', 'bg-green-100', 'bg-red-100', 'bg-purple-100', 'bg-yellow-100'];
    const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getCompanyTextColor = (symbol: string) => {
    const colors = ['text-blue-600', 'text-green-600', 'text-red-600', 'text-purple-600', 'text-yellow-600'];
    const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavigationHeader />
      <MobileMenu />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Markets</h1>
          <p className="text-gray-600">Track stocks and forex pairs in real-time</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stocks">Indian Stocks</TabsTrigger>
            <TabsTrigger value="forex">Forex Trading</TabsTrigger>
          </TabsList>

          <TabsContent value="stocks" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-chart-line text-primary mr-2"></i>
                  Indian Stock Market
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingStocks ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Score</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {stocks.map((stock: any) => (
                          <tr key={stock.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`w-10 h-10 ${getCompanyBgColor(stock.symbol)} rounded-lg flex items-center justify-center mr-3`}>
                                  <span className={`${getCompanyTextColor(stock.symbol)} font-semibold text-sm`}>
                                    {getCompanyInitials(stock.name)}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{stock.name}</div>
                                  <div className="text-sm text-gray-500">{stock.symbol} • {stock.exchange}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(stock.currentPrice)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-medium ${getChangeColor(stock.changeAmount)}`}>
                                {stock.changeAmount >= 0 ? '+' : ''}{formatCurrency(stock.changeAmount)} 
                                ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {stock.volume?.toLocaleString() || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={`${getScoreColor(stock.aiScore || 0)} px-2 py-1 text-sm font-medium`}>
                                {stock.aiScore?.toFixed(1) || 'N/A'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Button size="sm" variant="outline" className="text-primary hover:text-blue-700">
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forex" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-globe text-primary mr-2"></i>
                  Forex Trading Pairs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingForex ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pair</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">24h Range</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Score</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {forexPairs.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                              <div className="flex flex-col items-center">
                                <i className="fas fa-chart-line text-4xl text-gray-300 mb-2"></i>
                                <p>Forex data will be available soon</p>
                                <p className="text-sm">Connect with major currency pairs like USD/INR, EUR/USD</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          forexPairs.map((pair: any) => (
                            <tr key={pair.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                    <span className="text-green-600 font-semibold text-sm">
                                      {pair.baseCurrency.slice(0, 2)}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {pair.baseCurrency}/{pair.quoteCurrency}
                                    </div>
                                    <div className="text-sm text-gray-500">Major Pair</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatNumber(pair.currentRate, 4)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-sm font-medium ${getChangeColor(pair.changeAmount)}`}>
                                  {pair.changeAmount >= 0 ? '+' : ''}{formatNumber(pair.changeAmount, 4)} 
                                  ({pair.changePercent >= 0 ? '+' : ''}{pair.changePercent.toFixed(2)}%)
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {pair.low24h && pair.high24h ? 
                                  `${formatNumber(pair.low24h, 4)} - ${formatNumber(pair.high24h, 4)}` : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={`${getScoreColor(pair.aiScore || 0)} px-2 py-1 text-sm font-medium`}>
                                  {pair.aiScore?.toFixed(1) || 'N/A'}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Button size="sm" variant="outline" className="text-primary hover:text-blue-700">
                                  Trade
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}