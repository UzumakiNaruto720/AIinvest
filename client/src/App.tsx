import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Markets from "@/pages/markets";
import Portfolio from "@/pages/portfolio";
import News from "@/pages/news";
import Investments from "@/pages/investments";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import StockDetail from "@/components/StockDetail";
import { useAuth } from "@/hooks/useAuth";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/markets" component={Markets} />
          <Route path="/stocks/:stockId" component={StockDetail} />
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/investments" component={Investments} />
          <Route path="/news" component={News} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
