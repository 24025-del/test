import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCities } from '@/hooks/useCities';
import { Loader2, Check, X, Clock, Droplets, Calendar } from 'lucide-react';

interface DonationRequest {
  id: string;
  requester_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string | null;
  created_at: string;
  requester: {
    id: string;
    name: string;
    phone: string;
    email: string;
    city_id: string;
  };
}

const DonorDashboard = () => {
  const { t, dir, language } = useLanguage();
  const { profile, loading: authLoading, refreshProfile } = useAuth();
  const { cities } = useCities();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('donation_requests')
        .select(`
          *,
          requester:profiles!donation_requests_requester_id_fkey (
            id, name, phone, email, city_id
          )
        `)
        .eq('donor_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !profile) {
      navigate('/login');
    } else if (profile && profile.role !== 'donor') {
      navigate('/');
    } else if (profile) {
      fetchRequests();

      // Subscribe to real-time updates
      const channel = supabase
        .channel('donor-requests')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'donation_requests',
            filter: `donor_id=eq.${profile.id}`,
          },
          () => {
            fetchRequests();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile, authLoading]);

  const handleRequest = async (requestId: string, action: 'accepted' | 'rejected') => {
    setProcessingId(requestId);
    try {
      // Update request status
      const { error: updateError } = await supabase
        .from('donation_requests')
        .update({ status: action })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // If accepted, set donor unavailable and cooldown
      if (action === 'accepted' && profile) {
        const cooldownEnd = new Date();
        cooldownEnd.setDate(cooldownEnd.getDate() + 90);

        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            is_available: false,
            cooldown_end_date: cooldownEnd.toISOString(),
          })
          .eq('id', profile.id);

        if (profileError) throw profileError;
        await refreshProfile();
      }

      // Create notification for requester
      const request = requests.find((r) => r.id === requestId);
      if (request) {
        await supabase.from('notifications').insert({
          user_id: request.requester_id,
          title_en: action === 'accepted' ? 'Request Accepted!' : 'Request Rejected',
          title_ar: action === 'accepted' ? 'تم قبول الطلب!' : 'تم رفض الطلب',
          message_en: action === 'accepted'
            ? `Your blood request has been accepted by ${profile?.name}. Contact: ${profile?.phone}`
            : 'Your blood request has been rejected.',
          message_ar: action === 'accepted'
            ? `تم قبول طلب الدم الخاص بك من قبل ${profile?.name}. للتواصل: ${profile?.phone}`
            : 'تم رفض طلب الدم الخاص بك.',
          type: action === 'accepted' ? 'success' : 'info',
          related_request_id: requestId,
        });
      }

      toast({
        title: dir === 'rtl' ? 'نجاح' : 'Success',
        description: action === 'accepted' ? t('requestAccepted') : t('requestRejected'),
      });

      fetchRequests();
    } catch (err) {
      console.error('Error handling request:', err);
      toast({
        variant: 'destructive',
        title: dir === 'rtl' ? 'خطأ' : 'Error',
        description: t('genericError'),
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getCityName = (cityId: string) => {
    const city = cities.find((c) => c.id === cityId);
    return city ? (language === 'ar' ? city.name_ar : city.name_en) : '';
  };

  const getDaysRemaining = () => {
    if (!profile?.cooldown_end_date) return 0;
    const end = new Date(profile.cooldown_end_date);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('welcomeBack')}, {profile?.name}
          </h1>
          <div className="flex items-center gap-4">
            <Badge variant={profile?.is_available ? 'default' : 'secondary'} className="text-sm">
              <Droplets className="h-4 w-4 mr-1" />
              {profile?.blood_type}
            </Badge>
            {profile?.is_available ? (
              <Badge variant="outline" className="bg-success/10 text-success border-success">
                {t('available')}
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
                <Clock className="h-4 w-4 mr-1" />
                {t('unavailable')} - {getDaysRemaining()} {t('daysRemaining')}
              </Badge>
            )}
          </div>
        </div>

        {/* Cooldown Card */}
        {!profile?.is_available && (
          <Card className="mb-8 border-warning bg-warning/5">
            <CardContent className="flex items-center gap-4 p-6">
              <Calendar className="h-12 w-12 text-warning" />
              <div>
                <h3 className="font-semibold text-foreground">
                  {dir === 'rtl' ? 'فترة الانتظار' : 'Cooldown Period'}
                </h3>
                <p className="text-muted-foreground">
                  {dir === 'rtl'
                    ? `ستصبح متاحاً للتبرع بعد ${getDaysRemaining()} يوماً`
                    : `You'll be available to donate again in ${getDaysRemaining()} days`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Requests */}
        <Card>
          <CardHeader>
            <CardTitle>{t('incomingRequests')}</CardTitle>
            <CardDescription>
              {dir === 'rtl'
                ? 'طلبات التبرع الواردة من الباحثين عن الدم'
                : 'Incoming donation requests from blood seekers'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {t('noRequests')}
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <Card key={request.id} className="glass-card">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {request.requester.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {getCityName(request.requester.city_id)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(request.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                          </p>
                          {request.message && (
                            <p className="text-sm text-muted-foreground mt-2 italic">
                              "{request.message}"
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {request.status === 'pending' ? (
                            profile?.is_available ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleRequest(request.id, 'accepted')}
                                  disabled={processingId === request.id}
                                  className="bg-success hover:bg-success/90"
                                >
                                  {processingId === request.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Check className="h-4 w-4 mr-1" />
                                  )}
                                  {t('accept')}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRequest(request.id, 'rejected')}
                                  disabled={processingId === request.id}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  {t('reject')}
                                </Button>
                              </>
                            ) : (
                              <Badge variant="secondary">{t('unavailable')}</Badge>
                            )
                          ) : (
                            <Badge
                              variant={request.status === 'accepted' ? 'default' : 'destructive'}
                              className={request.status === 'accepted' ? 'bg-success' : ''}
                            >
                              {request.status === 'accepted' ? t('accepted') : t('rejected')}
                            </Badge>
                          )}
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

export default DonorDashboard;
