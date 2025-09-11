import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuditLogger } from "@/lib/security";
import { Shield, AlertTriangle, Activity, Trash2, Download } from "lucide-react";
import { format } from "date-fns";

interface AuditLog {
  timestamp: string;
  action: string;
  details?: any;
  userAgent: string;
  ip: string;
}

export default function SecurityDashboard() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState({
    totalLogs: 0,
    loginAttempts: 0,
    failedLogins: 0,
    blogActions: 0,
  });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    const allAuditLogs = AuditLogger.getLogs();
    
    // Filter out session restored logs
    const auditLogs = allAuditLogs.filter(log => 
      !log.action.includes('session_restored')
    );
    
    // Only show login attempts and blog-related events
    const filteredLogs = auditLogs.filter(log => 
      log.action.includes('login') || 
      log.action.includes('blog_post') || 
      log.action.includes('post_')
    );
    
    setLogs(filteredLogs);
    
    // Calculate stats
    const totalLogs = filteredLogs.length;
    const loginAttempts = filteredLogs.filter(log => 
      log.action.includes('login_attempt') || log.action.includes('login_success')
    ).length;
    const failedLogins = filteredLogs.filter(log => 
      log.action.includes('login_failed') || log.action.includes('login_error')
    ).length;
    const blogActions = filteredLogs.filter(log => 
      log.action.includes('blog_post')
    ).length;

    setStats({
      totalLogs,
      loginAttempts,
      failedLogins,
      blogActions,
    });
  };

  const clearLogs = () => {
    AuditLogger.clearLogs();
    loadLogs();
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('success') || action.includes('created')) {
      return 'bg-green-100 text-green-800';
    }
    if (action.includes('failed') || action.includes('error') || action.includes('blocked')) {
      return 'bg-red-100 text-red-800';
    }
    if (action.includes('attempt') || action.includes('initiated')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-blue-100 text-blue-800';
  };

  const getActionIcon = (action: string) => {
    if (action.includes('login')) {
      return <Shield className="h-4 w-4" />;
    }
    if (action.includes('blog')) {
      return <Activity className="h-4 w-4" />;
    }
    if (action.includes('failed') || action.includes('error')) {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <Activity className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Security Dashboard</h2>
          <p className="text-muted-foreground">Monitor system activity and security events</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportLogs} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
          <Button variant="outline" onClick={clearLogs} size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Logs
          </Button>
        </div>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLogs}</div>
            <p className="text-xs text-muted-foreground">All logged events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Login Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.loginAttempts}</div>
            <p className="text-xs text-muted-foreground">Total login attempts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failedLogins}</div>
            <p className="text-xs text-muted-foreground">Failed login attempts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Blog Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.blogActions}</div>
            <p className="text-xs text-muted-foreground">Blog-related events</p>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest security and system events</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No audit logs available</p>
              <p className="text-sm">System events will appear here</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getActionBadgeColor(log.action)}>
                        {log.action.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                      </span>
                    </div>
                    {log.details && (
                      <div className="text-sm text-muted-foreground">
                        {typeof log.details === 'object' ? (
                          <div className="space-y-1">
                            {Object.entries(log.details).map(([key, value]) => (
                              <div key={key} className="flex gap-2">
                                <span className="font-medium capitalize">{key}:</span>
                                <span className="break-all">
                                  {typeof value === 'string' ? value : JSON.stringify(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span>{String(log.details)}</span>
                        )}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      User Agent: {log.userAgent.substring(0, 80)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}