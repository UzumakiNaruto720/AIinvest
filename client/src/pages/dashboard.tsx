import NavigationHeader from "@/components/NavigationHeader";
import MobileMenu from "@/components/MobileMenu";
import MarketOverview from "@/components/MarketOverview";
import AIRecommendations from "@/components/AIRecommendations";
import Watchlist from "@/components/Watchlist";
import MarketNews from "@/components/MarketNews";
import TrendingStocks from "@/components/TrendingStocks";
import QuickAlerts from "@/components/QuickAlerts";

export default function Dashboard() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <NavigationHeader />
      <MobileMenu />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <MarketOverview />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AIRecommendations />
            <Watchlist />
          </div>
          
          <div className="space-y-6">
            <MarketNews />
            <TrendingStocks />
            <QuickAlerts />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 bg-white rounded-lg shadow p-6">
          <div className="text-center text-sm text-gray-600">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <i className="fas fa-exclamation-triangle text-yellow-600 mr-2 mt-0.5"></i>
                <div className="text-left">
                  <p className="font-semibold text-yellow-800 mb-1">Investment Disclaimer</p>
                  <p className="text-yellow-700 text-sm">All recommendations and analysis provided by InvestAI are for informational purposes only and should not be considered as financial advice. Stock investments carry risk of capital loss. Please consult with a qualified financial advisor before making investment decisions. Past performance does not guarantee future results.</p>
                </div>
              </div>
            </div>
            <p>&copy; 2024 InvestAI. All rights reserved. | <a href="#" className="text-primary hover:underline">Terms of Service</a> | <a href="#" className="text-primary hover:underline">Privacy Policy</a></p>
          </div>
        </footer>
      </div>
    </div>
  );
}
