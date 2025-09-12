import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AIRecommendations() {
  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ["/api/recommendations"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'bg-success/10 text-success';
      case 'SELL': return 'bg-danger/10 text-danger';
      case 'HOLD': return 'bg-warning/10 text-warning';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'BUY': return 'fas fa-arrow-up text-success';
      case 'SELL': return 'fas fa-arrow-down text-danger';
      case 'HOLD': return 'fas fa-equals text-warning';
      default: return 'fas fa-minus text-gray-500';
    }
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-robot text-primary mr-2"></i>
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <Skeleton className="h-12 w-full mb-3" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <i className="fas fa-robot text-primary mr-2"></i>
            AI Recommendations
          </CardTitle>
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec: any) => (
            <div key={rec.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${getCompanyBgColor(rec.stock.symbol)} rounded-lg flex items-center justify-center`}>
                    <span className={`${getCompanyTextColor(rec.stock.symbol)} font-semibold text-sm`}>
                      {getCompanyInitials(rec.stock.name)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{rec.stock.name}</h3>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(rec.stock.currentPrice)} 
                      <span className={rec.stock.changePercent >= 0 ? 'text-success ml-1' : 'text-danger ml-1'}>
                        ({rec.stock.changePercent >= 0 ? '+' : ''}{rec.stock.changePercent.toFixed(1)}%)
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={`${getActionColor(rec.action)} px-3 py-1 text-sm font-medium`}>
                    {rec.action}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">Score: {rec.score.toFixed(1)}/10</p>
                </div>
              </div>
              <div className="text-sm text-gray-700">
                <p className="mb-2">
                  <strong>AI Analysis:</strong> {rec.analysis}
                </p>
                <div className="flex items-center space-x-4">
                  {rec.targetPrice && (
                    <span className="flex items-center">
                      <i className={getActionIcon(rec.action) + ' mr-1'}></i>
                      Target: {formatCurrency(rec.targetPrice)}
                    </span>
                  )}
                  {rec.stopLoss && (
                    <span className="flex items-center">
                      <i className="fas fa-shield-alt text-gray-500 mr-1"></i>
                      Stop Loss: {formatCurrency(rec.stopLoss)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
