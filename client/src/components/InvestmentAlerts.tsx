import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AlertTriangle, CheckCircle, TrendingDown, TrendingUp, Target, X } from "lucide-react";

interface InvestmentAlert {
  id: string;
  investmentId: string;
  alertType: string;
  title: string;
  message: string;
  severity: string;
  isRead: boolean;
  actionRequired: boolean;
  suggestionType?: string;
  createdAt: string;
}

export default function InvestmentAlerts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery<InvestmentAlert[]>({
    queryKey: ["/api/investment-alerts"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (alertId: string) => {
      await apiRequest("PATCH", `/api/investment-alerts/${alertId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investment-alerts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark alert as read",
        variant: "destructive",
      });
    },
  });

  const unreadAlerts = alerts.filter((alert: InvestmentAlert) => !alert.isRead);
  const actionRequiredAlerts = alerts.filter((alert: InvestmentAlert) => alert.actionRequired && !alert.isRead);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "danger":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-success" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "danger":
        return "border-destructive bg-destructive/5";
      case "warning":
        return "border-warning bg-warning/5";
      case "success":
        return "border-success bg-success/5";
      default:
        return "border-muted";
    }
  };

  const getSuggestionIcon = (suggestionType?: string) => {
    switch (suggestionType) {
      case "sell":
        return <TrendingDown className="h-3 w-3" />;
      case "buy_more":
        return <TrendingUp className="h-3 w-3" />;
      case "set_stop_loss":
        return <Target className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Investment Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
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
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Investment Alerts
            {unreadAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadAlerts.length}
              </Badge>
            )}
          </CardTitle>
        </div>
        {actionRequiredAlerts.length > 0 && (
          <div className="text-sm text-destructive font-medium">
            {actionRequiredAlerts.length} alert(s) require immediate attention
          </div>
        )}
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No investment alerts. Your investments are looking good!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {alerts.map((alert: InvestmentAlert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)} ${
                  alert.isRead ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getSeverityIcon(alert.severity)}
                      <h4 className="font-medium text-sm">{alert.title}</h4>
                      {alert.actionRequired && !alert.isRead && (
                        <Badge variant="destructive" className="text-xs">
                          Action Required
                        </Badge>
                      )}
                      {alert.suggestionType && (
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          {getSuggestionIcon(alert.suggestionType)}
                          {alert.suggestionType.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(alert.createdAt)}</span>
                      <Badge variant="outline" className="text-xs">
                        {alert.alertType.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  {!alert.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsReadMutation.mutate(alert.id)}
                      disabled={markAsReadMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}