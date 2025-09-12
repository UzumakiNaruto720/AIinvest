import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PlusCircle, TrendingUp, TrendingDown, AlertTriangle, Target, Trash2 } from "lucide-react";

interface UserInvestment {
  id: string;
  investmentType: "stock" | "forex";
  quantity: number;
  investedAmount: number;
  investedCurrency: string;
  purchasePrice: number;
  purchaseDate: string;
  currentPrice?: number;
  currentValue?: number;
  profitLoss?: number;
  profitLossPercent?: number;
  stopLossPrice?: number;
  targetPrice?: number;
  alertsEnabled: boolean;
  stock?: {
    id: string;
    name: string;
    symbol: string;
    currentPrice: number;
  };
  forexPair?: {
    id: string;
    baseCurrency: string;
    quoteCurrency: string;
    currentRate: number;
  };
}

const CURRENCIES = [
  "INR", "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "HKD"
];

export default function InvestmentTracker() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: investments = [], isLoading } = useQuery<UserInvestment[]>({
    queryKey: ["/api/user-investments"],
  });

  const { data: stocks = [] } = useQuery({
    queryKey: ["/api/stocks"],
  });

  const { data: forexPairs = [] } = useQuery({
    queryKey: ["/api/forex"],
  });

  const createInvestmentMutation = useMutation({
    mutationFn: async (investment: any) => {
      const response = await apiRequest("POST", "/api/user-investments", investment);
      return response.json();
    },
    onSuccess: () => {
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/user-investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/investment-alerts"] });
      toast({
        title: "Investment Added",
        description: "Your investment has been successfully tracked.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add investment",
        variant: "destructive",
      });
    },
  });

  const deleteInvestmentMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/user-investments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-investments"] });
      toast({
        title: "Investment Removed",
        description: "Investment has been removed from tracking.",
      });
    },
  });

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProfitLossColor = (profitLoss: number) => {
    return profitLoss >= 0 ? "text-success" : "text-destructive";
  };

  const getSeverityColor = (percent: number) => {
    if (percent >= 10) return "text-success";
    if (percent >= 0) return "text-success";
    if (percent >= -5) return "text-warning";
    if (percent >= -10) return "text-orange-500";
    return "text-destructive";
  };

  const filteredInvestments = investments.filter((inv: UserInvestment) => {
    if (activeTab === "all") return true;
    if (activeTab === "stocks") return inv.investmentType === "stock";
    if (activeTab === "forex") return inv.investmentType === "forex";
    if (activeTab === "profitable") return (inv.profitLoss || 0) > 0;
    if (activeTab === "losing") return (inv.profitLoss || 0) < 0;
    return true;
  });

  const totalInvested = investments.reduce((sum: number, inv: UserInvestment) => sum + inv.investedAmount, 0);
  const totalCurrentValue = investments.reduce((sum: number, inv: UserInvestment) => sum + (inv.currentValue || inv.investedAmount), 0);
  const totalProfitLoss = totalCurrentValue - totalInvested;
  const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Investment Tracker
          </CardTitle>
          <p className="text-sm text-muted-foreground">Track your investments and get loss prevention alerts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Investment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Investment</DialogTitle>
            </DialogHeader>
            <AddInvestmentForm 
              stocks={stocks}
              forexPairs={forexPairs}
              onSubmit={(data) => createInvestmentMutation.mutate(data)}
              isLoading={createInvestmentMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {/* Portfolio Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold">{formatCurrency(totalInvested, "INR")}</div>
            <div className="text-sm text-muted-foreground">Total Invested</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{formatCurrency(totalCurrentValue, "INR")}</div>
            <div className="text-sm text-muted-foreground">Current Value</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getProfitLossColor(totalProfitLoss)}`}>
              {formatCurrency(totalProfitLoss, "INR")}
            </div>
            <div className="text-sm text-muted-foreground">Profit/Loss</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getSeverityColor(totalProfitLossPercent)}`}>
              {totalProfitLossPercent.toFixed(2)}%
            </div>
            <div className="text-sm text-muted-foreground">Returns</div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="stocks">Stocks</TabsTrigger>
            <TabsTrigger value="forex">Forex</TabsTrigger>
            <TabsTrigger value="profitable">Profitable</TabsTrigger>
            <TabsTrigger value="losing">Losing</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : filteredInvestments.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No investments found. Add your first investment to start tracking!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInvestments.map((investment: UserInvestment) => (
                  <InvestmentCard 
                    key={investment.id} 
                    investment={investment} 
                    onDelete={() => deleteInvestmentMutation.mutate(investment.id)}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    getProfitLossColor={getProfitLossColor}
                    getSeverityColor={getSeverityColor}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function AddInvestmentForm({ stocks, forexPairs, onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    investmentType: "stock",
    stockId: "",
    forexPairId: "",
    quantity: "",
    investedAmount: "",
    investedCurrency: "INR",
    purchasePrice: "",
    purchaseDate: new Date().toISOString().split('T')[0],
    stopLossPrice: "",
    targetPrice: "",
    alertsEnabled: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      quantity: parseFloat(formData.quantity),
      investedAmount: parseFloat(formData.investedAmount),
      purchasePrice: parseFloat(formData.purchasePrice),
      stopLossPrice: formData.stopLossPrice ? parseFloat(formData.stopLossPrice) : undefined,
      targetPrice: formData.targetPrice ? parseFloat(formData.targetPrice) : undefined,
      purchaseDate: new Date(formData.purchaseDate),
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="investmentType">Investment Type</Label>
          <Select value={formData.investmentType} onValueChange={(value) => setFormData({...formData, investmentType: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stock">Stock</SelectItem>
              <SelectItem value="forex">Forex</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.investmentType === "stock" ? (
          <div>
            <Label htmlFor="stockId">Select Stock</Label>
            <Select value={formData.stockId} onValueChange={(value) => setFormData({...formData, stockId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a stock" />
              </SelectTrigger>
              <SelectContent>
                {stocks.map((stock: any) => (
                  <SelectItem key={stock.id} value={stock.id}>
                    {stock.symbol} - {stock.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div>
            <Label htmlFor="forexPairId">Select Forex Pair</Label>
            <Select value={formData.forexPairId} onValueChange={(value) => setFormData({...formData, forexPairId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a forex pair" />
              </SelectTrigger>
              <SelectContent>
                {forexPairs.map((pair: any) => (
                  <SelectItem key={pair.id} value={pair.id}>
                    {pair.baseCurrency}/{pair.quoteCurrency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            step="0.01"
            value={formData.quantity}
            onChange={(e) => setFormData({...formData, quantity: e.target.value})}
            placeholder={formData.investmentType === "stock" ? "Number of shares" : "Units"}
            required
          />
        </div>
        <div>
          <Label htmlFor="purchasePrice">Purchase Price</Label>
          <Input
            id="purchasePrice"
            type="number"
            step="0.01"
            value={formData.purchasePrice}
            onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
            placeholder="Price per unit"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="investedAmount">Invested Amount</Label>
          <Input
            id="investedAmount"
            type="number"
            step="0.01"
            value={formData.investedAmount}
            onChange={(e) => setFormData({...formData, investedAmount: e.target.value})}
            placeholder="Total amount invested"
            required
          />
        </div>
        <div>
          <Label htmlFor="investedCurrency">Currency</Label>
          <Select value={formData.investedCurrency} onValueChange={(value) => setFormData({...formData, investedCurrency: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stopLossPrice">Stop Loss Price (Optional)</Label>
          <Input
            id="stopLossPrice"
            type="number"
            step="0.01"
            value={formData.stopLossPrice}
            onChange={(e) => setFormData({...formData, stopLossPrice: e.target.value})}
            placeholder="Stop loss trigger price"
          />
        </div>
        <div>
          <Label htmlFor="targetPrice">Target Price (Optional)</Label>
          <Input
            id="targetPrice"
            type="number"
            step="0.01"
            value={formData.targetPrice}
            onChange={(e) => setFormData({...formData, targetPrice: e.target.value})}
            placeholder="Target sell price"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="purchaseDate">Purchase Date</Label>
        <Input
          id="purchaseDate"
          type="date"
          value={formData.purchaseDate}
          onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Investment"}
      </Button>
    </form>
  );
}

function InvestmentCard({ investment, onDelete, formatCurrency, formatDate, getProfitLossColor, getSeverityColor }: any) {
  const assetName = investment.stock?.name || `${investment.forexPair?.baseCurrency}/${investment.forexPair?.quoteCurrency}`;
  const assetSymbol = investment.stock?.symbol || investment.forexPair?.baseCurrency;
  const profitLoss = investment.profitLoss || 0;
  const profitLossPercent = investment.profitLossPercent || 0;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold">{assetSymbol?.slice(0, 2)}</span>
            </div>
            <div>
              <h3 className="font-semibold">{assetName}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{investment.investmentType}</Badge>
                <span>{formatDate(investment.purchaseDate)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Quantity</div>
              <div className="font-medium">{investment.quantity}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Invested</div>
              <div className="font-medium">{formatCurrency(investment.investedAmount, investment.investedCurrency)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Current Value</div>
              <div className="font-medium">{formatCurrency(investment.currentValue || investment.investedAmount, investment.investedCurrency)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">P&L</div>
              <div className={`font-medium ${getProfitLossColor(profitLoss)}`}>
                {formatCurrency(profitLoss, investment.investedCurrency)} ({profitLossPercent.toFixed(2)}%)
              </div>
            </div>
          </div>

          {(investment.stopLossPrice || investment.targetPrice) && (
            <div className="flex items-center gap-4 mt-3 text-sm">
              {investment.stopLossPrice && (
                <div className="flex items-center gap-1 text-destructive">
                  <AlertTriangle className="h-3 w-3" />
                  Stop Loss: {formatCurrency(investment.stopLossPrice, investment.investedCurrency)}
                </div>
              )}
              {investment.targetPrice && (
                <div className="flex items-center gap-1 text-success">
                  <Target className="h-3 w-3" />
                  Target: {formatCurrency(investment.targetPrice, investment.investedCurrency)}
                </div>
              )}
            </div>
          )}
        </div>

        <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}