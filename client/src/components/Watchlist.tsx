import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function Watchlist() {
  const { toast } = useToast();
  const { data: watchlist = [], isLoading } = useQuery({
    queryKey: ["/api/watchlist"],
  });

  const buyMutation = useMutation({
    mutationFn: (stockId: string) => apiRequest("POST", "/api/trades/buy", { stockId, quantity: 1 }),
    onSuccess: (response) => {
      const data = response.json();
      toast({
        title: "Buy Order Placed",
        description: "Your buy order has been placed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to place buy order.",
        variant: "destructive",
      });
    },
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

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'bg-success/10 text-success';
    if (score >= 5) return 'bg-warning/10 text-warning';
    return 'bg-danger/10 text-danger';
  };

  const getActionButton = (score: number, stockId: string) => {
    if (score >= 7) {
      return (
        <Button 
          size="sm" 
          className="bg-success text-white hover:bg-success/90"
          onClick={() => buyMutation.mutate(stockId)}
          disabled={buyMutation.isPending}
        >
          Buy
        </Button>
      );
    }
    return (
      <Button 
        size="sm" 
        variant="secondary"
        className="bg-gray-200 text-gray-700 hover:bg-gray-300"
      >
        Hold
      </Button>
    );
  };

  const getCompanyInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').slice(0, 4).toUpperCase();
  };

  const getCompanyBgColor = (symbol: string) => {
    const colors = ['bg-purple-100', 'bg-orange-100', 'bg-blue-100', 'bg-green-100'];
    const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getCompanyTextColor = (symbol: string) => {
    const colors = ['text-purple-600', 'text-orange-600', 'text-blue-600', 'text-green-600'];
    const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Watchlist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
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
          <CardTitle>Your Watchlist</CardTitle>
          <Button variant="outline" size="sm" className="text-primary hover:text-blue-700">
            + Add Stock
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {watchlist.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 ${getCompanyBgColor(item.stock.symbol)} rounded-lg flex items-center justify-center mr-3`}>
                        <span className={`${getCompanyTextColor(item.stock.symbol)} font-semibold text-xs`}>
                          {getCompanyInitials(item.stock.name)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.stock.name}</div>
                        <div className="text-sm text-gray-500">{item.stock.exchange}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(item.stock.currentPrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getChangeColor(item.stock.changeAmount)}`}>
                      {item.stock.changeAmount >= 0 ? '+' : ''}{formatCurrency(item.stock.changeAmount)} 
                      ({item.stock.changePercent >= 0 ? '+' : ''}{item.stock.changePercent.toFixed(2)}%)
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={`${getScoreColor(item.stock.aiScore)} px-2 py-1 text-sm font-medium`}>
                      {item.stock.aiScore?.toFixed(1) || 'N/A'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getActionButton(item.stock.aiScore || 0, item.stock.id)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
