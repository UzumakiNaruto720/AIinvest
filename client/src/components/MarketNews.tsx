import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function MarketNews() {
  const { data: news = [], isLoading } = useQuery({
    queryKey: ["/api/news"],
  });

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const publishedDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours === 1) return "1 hour ago";
    return `${diffInHours} hours ago`;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'bg-success/10 text-success';
      case 'negative': return 'bg-danger/10 text-danger';
      case 'neutral': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-newspaper text-primary mr-2"></i>
            Market News
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-32 mb-2" />
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-4 w-24" />
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
        <CardTitle className="flex items-center">
          <i className="fas fa-newspaper text-primary mr-2"></i>
          Market News
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {news.map((item: any, index: number) => (
            <article key={item.id} className={index < news.length - 1 ? "border-b border-gray-200 pb-4" : ""}>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                {item.headline}
              </h3>
              <p className="text-xs text-gray-600 mb-2">
                {item.source} • {formatTimeAgo(item.publishedAt)}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                {item.summary}
              </p>
              <div className="flex items-center mt-2">
                <Badge className={`${getSentimentColor(item.sentiment)} px-2 py-1 text-xs mr-2`}>
                  {item.sentiment || 'Neutral'}
                </Badge>
                <span className="text-xs text-gray-500">
                  AI Sentiment: {item.sentimentScore || 50}% Bullish
                </span>
              </div>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
