import { useQuery } from "@tanstack/react-query";
import NavigationHeader from "@/components/NavigationHeader";
import MobileMenu from "@/components/MobileMenu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export default function Portfolio() {
  const { data: portfolio, isLoading: isLoadingPortfolio } = useQuery({
    queryKey: ["/api/portfolio"],
  });

  const { data: holdings = [], isLoading: isLoadingHoldings } = useQuery({
    queryKey: ["/api/portfolio/holdings"],
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

  if (isLoadingPortfolio) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <NavigationHeader />
        <MobileMenu />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Mock holdings data since API endpoint doesn't exist yet
  const mockHoldings = [
    {
      id: "1",
      stock: { symbol: "TCS", name: "Tata Consultancy Services" },
      quantity: 10,
      averagePrice: 3400,
      currentValue: 35428,
      dayChange: 724.5,
      dayChangePercent: 2.1,
      holdingType: "stock"
    },
    {
      id: "2", 
      stock: { symbol: "INFY", name: "Infosys" },
      quantity: 15,
      averagePrice: 1420,
      currentValue: 21851,
      dayChange: 425,
      dayChangePercent: 1.98,
      holdingType: "stock"
    }
  ];

  const totalInvested = mockHoldings.reduce((sum, holding) => sum + (holding.quantity * holding.averagePrice), 0);
  const unrealizedPnL = portfolio ? portfolio.dayChange : 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavigationHeader />
      <MobileMenu />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
          <p className="text-gray-600">Track your investments and performance</p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {portfolio ? formatCurrency(portfolio.totalValue) : formatCurrency(0)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${getChangeColor(unrealizedPnL)}`}>
                    {unrealizedPnL >= 0 ? '+' : ''}{formatCurrency(unrealizedPnL)}
                  </p>
                  <p className={`text-sm ${getChangeColor(unrealizedPnL)}`}>
                    {portfolio ? (portfolio.dayChangePercent >= 0 ? '+' : '') + formatNumber(portfolio.dayChangePercent) + '%' : '0.00%'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Invested</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalInvested)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Capital</p>
                  <p className="text-sm font-medium text-gray-900">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Returns</p>
                  <p className="text-2xl font-bold text-success">
                    {formatCurrency((portfolio?.totalValue || 0) - totalInvested)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">P&L</p>
                  <p className="text-sm font-medium text-success">
                    +{formatNumber(((portfolio?.totalValue || 0) - totalInvested) / totalInvested * 100)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Holdings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockHoldings.length}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Assets</p>
                  <p className="text-sm font-medium text-gray-900">Stocks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Holdings Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <i className="fas fa-briefcase text-primary mr-2"></i>
                Your Holdings
              </CardTitle>
              <Button variant="outline" size="sm" className="text-primary hover:text-blue-700">
                + Add Investment
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingHoldings ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day Change</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mockHoldings.map((holding: any) => {
                      const allocation = (holding.currentValue / (portfolio?.totalValue || 1)) * 100;
                      return (
                        <tr key={holding.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`w-10 h-10 ${getCompanyBgColor(holding.stock.symbol)} rounded-lg flex items-center justify-center mr-3`}>
                                <span className={`${getCompanyTextColor(holding.stock.symbol)} font-semibold text-sm`}>
                                  {getCompanyInitials(holding.stock.name)}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{holding.stock.name}</div>
                                <div className="text-sm text-gray-500">{holding.stock.symbol}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {holding.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(holding.averagePrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(holding.currentValue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${getChangeColor(holding.dayChange)}`}>
                              {holding.dayChange >= 0 ? '+' : ''}{formatCurrency(holding.dayChange)} 
                              ({holding.dayChangePercent >= 0 ? '+' : ''}{holding.dayChangePercent.toFixed(2)}%)
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Progress value={allocation} className="w-12 h-2 mr-2" />
                              <span className="text-sm text-gray-600">{allocation.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" className="text-success hover:text-green-700">
                                Buy
                              </Button>
                              <Button size="sm" variant="outline" className="text-danger hover:text-red-700">
                                Sell
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Chart Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-chart-area text-primary mr-2"></i>
              Performance Chart
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <i className="fas fa-chart-line text-4xl text-gray-300 mb-2"></i>
                <p>Portfolio performance chart will be available soon</p>
                <p className="text-sm">Track your investment growth over time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}