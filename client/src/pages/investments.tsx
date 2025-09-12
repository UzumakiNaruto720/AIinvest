import NavigationHeader from "@/components/NavigationHeader";
import MobileMenu from "@/components/MobileMenu";
import InvestmentTracker from "@/components/InvestmentTracker";
import InvestmentAlerts from "@/components/InvestmentAlerts";

export default function Investments() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <NavigationHeader />
      <MobileMenu />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Investment Tracker</h1>
          <p className="text-gray-600">Track your investments with multi-currency support and real-time loss prevention alerts</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <InvestmentTracker />
          </div>
          
          <div>
            <InvestmentAlerts />
          </div>
        </div>

        {/* Investment Tips */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Investment Tips & Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-primary mb-2">🛡️ Loss Prevention Alerts</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Automatic alerts when investments drop 5%, 10%, or 15%</li>
                <li>• Stop-loss price notifications</li>
                <li>• Target price achievement alerts</li>
                <li>• AI-powered suggestions for risk management</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-primary mb-2">💰 Multi-Currency Support</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Track investments in any currency (INR, USD, EUR, etc.)</li>
                <li>• Real-time profit/loss calculations</li>
                <li>• Support for both stocks and forex trading</li>
                <li>• Comprehensive portfolio overview</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-primary mb-2">📊 Smart Analytics</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real-time performance tracking</li>
                <li>• Profit/loss percentage calculations</li>
                <li>• Investment timeline and history</li>
                <li>• Filter by investment type and performance</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-primary mb-2">⚡ Smart Suggestions</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• AI-powered buy/sell recommendations</li>
                <li>• Risk assessment and warnings</li>
                <li>• Optimal exit point suggestions</li>
                <li>• Portfolio diversification tips</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <footer className="mt-8 bg-white rounded-lg shadow p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <i className="fas fa-exclamation-triangle text-yellow-600 mr-2 mt-0.5"></i>
              <div>
                <p className="font-semibold text-yellow-800 mb-1">Investment Disclaimer</p>
                <p className="text-yellow-700 text-sm">Investment tracking and alerts are for informational purposes only. All investment decisions should be made after thorough research and consultation with qualified financial advisors. Past performance does not guarantee future results. Invest responsibly and only with money you can afford to lose.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}