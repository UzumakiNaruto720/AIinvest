import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Bell, User, LogOut } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function NavigationHeader() {
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: alerts = [] } = useQuery({
    queryKey: ["/api/alerts"],
    enabled: isAuthenticated,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return await apiRequest("PATCH", `/api/alerts/${alertId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
  });

  const unreadAlerts = alerts.filter((alert: any) => !alert.isRead);

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const linkClass = (path: string) => {
    return isActive(path) 
      ? "text-primary font-medium" 
      : "text-gray-600 hover:text-gray-900";
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <i className="fas fa-chart-line text-primary text-2xl"></i>
              <span className="text-xl font-bold text-gray-900">InvestAI</span>
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/" className={linkClass("/")}>Dashboard</Link>
              <Link href="/markets" className={linkClass("/markets")}>Markets</Link>
              <Link href="/portfolio" className={linkClass("/portfolio")}>Portfolio</Link>
              <Link href="/investments" className={linkClass("/investments")}>Investments</Link>
              <Link href="/news" className={linkClass("/news")}>News</Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:block relative">
              <Input 
                type="text" 
                placeholder="Search stocks..." 
                className="w-64 pr-10" 
              />
              <i className="fas fa-search absolute right-3 top-3 text-gray-400"></i>
            </div>
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadAlerts.length > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {unreadAlerts.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                {unreadAlerts.length === 0 ? (
                  <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
                ) : (
                  unreadAlerts.slice(0, 5).map((alert: any) => (
                    <DropdownMenuItem 
                      key={alert.id} 
                      className="flex flex-col items-start cursor-pointer hover:bg-gray-50"
                      onClick={() => markAsReadMutation.mutate(alert.id)}
                    >
                      <div className="font-medium">{alert.title}</div>
                      <div className="text-sm text-gray-500">{alert.message}</div>
                      <div className="text-xs text-blue-600 mt-1">Click to mark as read</div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Account Menu */}
            {isLoading ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    {user?.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt="Profile" 
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {user?.firstName?.[0] || user?.email?.[0] || "U"}
                        </span>
                      </div>
                    )}
                    <span className="hidden md:block">
                      {user?.firstName || user?.email?.split('@')[0] || "Account"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>
                    {user?.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={async () => {
                    try {
                      await fetch('/api/auth/logout', { method: 'POST' });
                      window.location.href = "/";
                    } catch (error) {
                      console.error('Logout failed:', error);
                    }
                  }}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={() => window.location.href = "/login"}
              >
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
