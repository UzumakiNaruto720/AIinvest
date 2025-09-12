import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function QuickAlerts() {
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["/api/alerts"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: (alertId: string) => apiRequest("PATCH", `/api/alerts/${alertId}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price_alert': return 'fas fa-exclamation-triangle text-warning';
      case 'portfolio_milestone': return 'fas fa-arrow-up text-success';
      case 'ai_recommendation': return 'fas fa-robot text-primary';
      default: return 'fas fa-info-circle text-blue-500';
    }
  };

  const getAlertBgColor = (severity: string) => {
    switch (severity) {
      case 'warning': return 'bg-warning/10 border border-warning/20';
      case 'success': return 'bg-success/10 border border-success/20';
      case 'danger': return 'bg-danger/10 border border-danger/20';
      case 'info': 
      default: return 'bg-primary/10 border border-primary/20';
    }
  };

  const handleAlertClick = (alert: any) => {
    if (!alert.isRead) {
      markAsReadMutation.mutate(alert.id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-bell text-primary mr-2"></i>
            Active Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeAlerts = alerts.slice(0, 3); // Show only top 3 alerts

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <i className="fas fa-bell text-primary mr-2"></i>
          Active Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeAlerts.map((alert: any) => (
            <div 
              key={alert.id} 
              className={`${getAlertBgColor(alert.severity)} rounded-lg p-3 cursor-pointer hover:opacity-80 transition-opacity`}
              onClick={() => handleAlertClick(alert)}
            >
              <div className="flex items-center">
                <i className={`${getAlertIcon(alert.type)} mr-2`}></i>
                <div>
                  <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                  <p className="text-xs text-gray-600">{alert.message}</p>
                </div>
                {!alert.isRead && (
                  <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
