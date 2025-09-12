import { useQuery } from "@tanstack/react-query";
import NavigationHeader from "@/components/NavigationHeader";
import MobileMenu from "@/components/MobileMenu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function News() {
  const { data: news = [], isLoading } = useQuery({
    queryKey: ["/api/news"],
  });

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const publishedDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'bg-success/10 text-success border-success/20';
      case 'negative': return 'bg-danger/10 text-danger border-danger/20';
      case 'neutral': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'fas fa-arrow-up';
      case 'negative': return 'fas fa-arrow-down';
      case 'neutral': return 'fas fa-minus';
      default: return 'fas fa-info-circle';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source?.toLowerCase()) {
      case 'economic times': return 'fas fa-newspaper text-blue-600';
      case 'business standard': return 'fas fa-chart-line text-green-600';
      case 'mint': return 'fas fa-coins text-orange-600';
      default: return 'fas fa-globe text-gray-600';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavigationHeader />
      <MobileMenu />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Market News</h1>
          <p className="text-gray-600">Stay updated with the latest market developments</p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <Input 
                  placeholder="Search news articles..." 
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">All News</Button>
                <Button variant="outline" size="sm">Stocks</Button>
                <Button variant="outline" size="sm">Economy</Button>
                <Button variant="outline" size="sm">Technology</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* News Articles */}
        <div className="space-y-6">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Skeleton className="w-20 h-20 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            news.map((article: any, index: number) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* News Source Icon */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className={`${getSourceIcon(article.source)} text-2xl`}></i>
                    </div>
                    
                    {/* News Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h2 className="text-lg font-semibold text-gray-900 leading-tight">
                          {article.headline}
                        </h2>
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge className={`${getSentimentColor(article.sentiment)} border px-2 py-1 text-xs`}>
                            <i className={`${getSentimentIcon(article.sentiment)} mr-1`}></i>
                            {article.sentiment || 'Neutral'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center">
                          <i className="fas fa-building mr-1"></i>
                          {article.source}
                        </span>
                        <span className="flex items-center">
                          <i className="fas fa-clock mr-1"></i>
                          {formatTimeAgo(article.publishedAt)}
                        </span>
                        <span className="flex items-center">
                          <i className="fas fa-chart-bar mr-1"></i>
                          {article.sentimentScore || 50}% Bullish
                        </span>
                      </div>
                      
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {article.summary}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" className="text-primary hover:text-blue-700">
                            <i className="fas fa-external-link-alt mr-1"></i>
                            Read Full Article
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                            <i className="fas fa-bookmark mr-1"></i>
                            Save
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                            <i className="fas fa-share mr-1"></i>
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <Button variant="outline" className="px-8">
            Load More Articles
          </Button>
        </div>

        {/* AI News Insights */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-robot text-primary mr-2"></i>
              AI Market Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <i className="fas fa-lightbulb text-blue-600 mr-3 mt-1"></i>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Today's Key Takeaways</h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• IT sector showing strong momentum with positive earnings surprises</li>
                    <li>• RBI's policy stance remains supportive for equity markets</li>
                    <li>• Foreign institutional investors turning bullish on Indian markets</li>
                    <li>• Banking sector facing regulatory headwinds but fundamentals remain strong</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}