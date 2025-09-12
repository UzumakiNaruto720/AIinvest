import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { ArrowLeft, TrendingUp, TrendingDown, Volume2, DollarSign, Calendar, Activity } from "lucide-react";

interface StockDetailProps {
  stockId?: string;
}

interface StockWithHistorical {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  changeAmount: number;
  changePercent: number;
  marketCap: number;
  peRatio: number;
  volume: number;
  aiScore: number;
  sector: string;
  exchange: string;
  historical: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}

const generateMockHistoricalData = (basePrice: number, period: string) => {
  const periods = {
    "1M": 30,
    "1Y": 365,
    "5Y": 365 * 5
  };
  
  const days = periods[period as keyof typeof periods] || 30;
  const data = [];
  let currentPrice = basePrice;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Generate realistic price movements
    const volatility = period === "1M" ? 0.02 : period === "1Y" ? 0.05 : 0.08;
    const change = (Math.random() - 0.5) * volatility;
    currentPrice = Math.max(currentPrice * (1 + change), 1);
    
    const open = currentPrice;
    const variation = currentPrice * 0.03;
    const high = Math.max(open + Math.random() * variation, open);
    const low = Math.min(open - Math.random() * variation, open);
    const close = low + Math.random() * (high - low);
    
    data.push({
      date: date.toISOString().split('T')[0],
      timestamp: date.getTime(),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      displayDate: period === "1M" ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) :
                   period === "1Y" ? date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) :
                   date.toLocaleDateString('en-US', { year: 'numeric' })
    });
    
    currentPrice = close;
  }
  
  return data;
};

const formatCurrency = (amount: number, currency = "INR") => {
  if (currency === "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency", 
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatVolume = (volume: number) => {
  if (volume >= 10000000) {
    return `${(volume / 10000000).toFixed(1)}Cr`;
  } else if (volume >= 100000) {
    return `${(volume / 100000).toFixed(1)}L`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  }
  return volume.toString();
};

const getCompanyBgColor = (symbol: string) => {
  const colors = [
    "bg-blue-100", "bg-green-100", "bg-purple-100", "bg-red-100", 
    "bg-yellow-100", "bg-indigo-100", "bg-pink-100", "bg-teal-100"
  ];
  const index = symbol.charCodeAt(0) % colors.length;
  return colors[index];
};

const getCompanyTextColor = (symbol: string) => {
  const colors = [
    "text-blue-600", "text-green-600", "text-purple-600", "text-red-600",
    "text-yellow-600", "text-indigo-600", "text-pink-600", "text-teal-600"
  ];
  const index = symbol.charCodeAt(0) % colors.length;
  return colors[index];
};

const getCompanyInitials = (name: string) => {
  return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
};

export default function StockDetail({ stockId: propStockId }: StockDetailProps) {
  const { stockId: paramStockId } = useParams();
  const [, setLocation] = useLocation();
  const stockId = propStockId || paramStockId;
  const [selectedPeriod, setSelectedPeriod] = useState("1M");

  const { data: stock, isLoading } = useQuery<StockWithHistorical>({
    queryKey: ['/api/stocks/detail', stockId],
    enabled: !!stockId
  });

  // Mock data for development - this will be replaced with real API data
  const mockStock: StockWithHistorical = {
    id: stockId || "1",
    symbol: "RELIANCE",
    name: "Reliance Industries Limited",
    currentPrice: 2847.50,
    changeAmount: 23.75,
    changePercent: 0.84,
    marketCap: 1925000,
    peRatio: 28.4,
    volume: 2847392,
    aiScore: 8.7,
    sector: "Oil & Gas",
    exchange: "NSE",
    historical: []
  };

  const displayStock = stock || mockStock;
  const historicalData = generateMockHistoricalData(displayStock.currentPrice, selectedPeriod);
  
  const isPositive = displayStock.changeAmount >= 0;
  const latestPrice = historicalData[historicalData.length - 1]?.close || displayStock.currentPrice;
  const periodReturn = ((latestPrice - historicalData[0]?.close) / historicalData[0]?.close * 100) || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading stock details...</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100">{data.displayDate}</p>
          <div className="space-y-1 mt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Open:</span> {formatCurrency(data.open)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">High:</span> {formatCurrency(data.high)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Low:</span> {formatCurrency(data.low)}
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Close: {formatCurrency(data.close)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Volume:</span> {formatVolume(data.volume)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/markets')}
              className="flex items-center gap-2"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Markets
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stock Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 ${getCompanyBgColor(displayStock.symbol)} rounded-xl flex items-center justify-center`}>
                <span className={`${getCompanyTextColor(displayStock.symbol)} font-bold text-xl`}>
                  {getCompanyInitials(displayStock.name)}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100" data-testid="text-stock-name">
                  {displayStock.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-medium text-gray-600 dark:text-gray-400" data-testid="text-stock-symbol">
                    {displayStock.symbol}
                  </span>
                  <Badge variant="secondary" data-testid="badge-exchange">{displayStock.exchange}</Badge>
                  <Badge variant="outline" data-testid="badge-sector">{displayStock.sector}</Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100" data-testid="text-current-price">
                {formatCurrency(displayStock.currentPrice)}
              </div>
              <div className={`flex items-center gap-1 mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`} data-testid="text-price-change">
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="font-medium">
                  {isPositive ? '+' : ''}{formatCurrency(displayStock.changeAmount)}
                  ({isPositive ? '+' : ''}{displayStock.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Market Cap</span>
              </div>
              <div className="font-medium text-gray-900 dark:text-gray-100" data-testid="text-market-cap">
                ₹{(displayStock.marketCap / 1000).toFixed(0)}K Cr
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-sm">P/E Ratio</span>
              </div>
              <div className="font-medium text-gray-900 dark:text-gray-100" data-testid="text-pe-ratio">
                {displayStock.peRatio}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
                <Volume2 className="w-4 h-4" />
                <span className="text-sm">Volume</span>
              </div>
              <div className="font-medium text-gray-900 dark:text-gray-100" data-testid="text-volume">
                {formatVolume(displayStock.volume)}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">AI Score</span>
              </div>
              <div className="font-medium text-gray-900 dark:text-gray-100" data-testid="text-ai-score">
                {displayStock.aiScore}/10
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{selectedPeriod} Return</span>
              </div>
              <div className={`font-medium ${periodReturn >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="text-period-return">
                {periodReturn >= 0 ? '+' : ''}{periodReturn.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Price Chart</CardTitle>
              <div className="flex gap-2">
                {['1M', '1Y', '5Y'].map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                    data-testid={`button-period-${period.toLowerCase()}`}
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="line" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="line" data-testid="tab-line-chart">Line Chart</TabsTrigger>
                <TabsTrigger value="area" data-testid="tab-area-chart">Area Chart</TabsTrigger>
              </TabsList>
              
              <TabsContent value="line" className="mt-6">
                <div className="h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="displayDate" 
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        domain={['dataMin * 0.95', 'dataMax * 1.05']}
                        tickFormatter={(value) => `₹${value.toFixed(0)}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="close" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6, fill: "#3b82f6" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="area" className="mt-6">
                <div className="h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="displayDate" 
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        domain={['dataMin * 0.95', 'dataMax * 1.05']}
                        tickFormatter={(value) => `₹${value.toFixed(0)}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="close" 
                        stroke="#3b82f6" 
                        fillOpacity={1} 
                        fill="url(#colorPrice)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}