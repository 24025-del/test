import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bell, BellOff, Check, CheckCheck, Info, AlertCircle, Megaphone } from 'lucide-react';
import { useEffect } from 'react';

const Notifications = () => {
  const { t, dir, language } = useLanguage();
  const { profile, loading: authLoading } = useAuth();
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !profile) {
      navigate('/login');
    }
  }, [profile, authLoading, navigate]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="h-5 w-5 text-success" />;
      case 'request':
        return <AlertCircle className="h-5 w-5 text-primary" />;
      case 'broadcast':
        return <Megaphone className="h-5 w-5 text-warning" />;
      default:
        return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  {t('notifications')}
                  {unreadCount > 0 && (
                    <Badge variant="destructive">{unreadCount}</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {dir === 'rtl'
                    ? 'جميع الإشعارات والتحديثات الخاصة بك'
                    : 'All your notifications and updates'}
                </CardDescription>
              </div>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  {dir === 'rtl' ? 'تحديد الكل كمقروء' : 'Mark all read'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t('noNotifications')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`glass-card transition-all cursor-pointer hover:shadow-md ${
                      !notification.is_read ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">
                              {language === 'ar' ? notification.title_ar : notification.title_en}
                            </h4>
                            {!notification.is_read && (
                              <Badge variant="default" className="text-xs">
                                {dir === 'rtl' ? 'جديد' : 'New'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {language === 'ar' ? notification.message_ar : notification.message_en}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(notification.created_at).toLocaleDateString(
                              language === 'ar' ? 'ar-SA' : 'en-US',
                              { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Notifications;
