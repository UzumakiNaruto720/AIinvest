import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart3, Bell, Shield, Zap, Globe } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Investment
            <span className="text-primary"> Platform</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get smart recommendations for Indian stocks and international forex trading with 
            real-time market analysis, automated alerts, and comprehensive portfolio tracking.
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 px-8 py-3"
              onClick={() => window.location.href = "/login"}
            >
              Start Investing
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3">
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything you need to succeed
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary mb-4" />
                <CardTitle>AI Recommendations</CardTitle>
                <CardDescription>
                  Get intelligent buy/sell recommendations powered by advanced AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our AI analyzes market trends, company fundamentals, and technical indicators 
                  to provide actionable investment advice.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Real-time Analytics</CardTitle>
                <CardDescription>
                  Live market data and comprehensive portfolio performance tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Monitor your investments with real-time price updates, performance metrics, 
                  and detailed analytics dashboard.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Globe className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Forex Trading</CardTitle>
                <CardDescription>
                  Trade international currencies with optimal timing recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Access major currency pairs including USD/INR, EUR/USD, and GBP/INR 
                  with AI-powered trading signals.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Bell className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Smart Alerts</CardTitle>
                <CardDescription>
                  Never miss important market movements with automated notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get instant alerts for price targets, portfolio milestones, 
                  and critical market events.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Risk Management</CardTitle>
                <CardDescription>
                  Advanced risk assessment and portfolio optimization tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Protect your investments with intelligent risk scoring and 
                  automated stop-loss recommendations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Fast Execution</CardTitle>
                <CardDescription>
                  Lightning-fast order execution and market data updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Execute trades quickly with our optimized platform and 
                  stay ahead of market movements.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to start your investment journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of smart investors using AI to make better trading decisions.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="px-8 py-3"
            onClick={() => window.location.href = "/login"}
          >
            Get Started Today
          </Button>
        </div>
      </div>
    </div>
  );
}