import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCities } from '@/hooks/useCities';
import { Loader2, Search, Send, Droplets, MapPin, Phone, Mail, Clock } from 'lucide-react';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

interface Donor {
  id: string;
  name: string;
  phone: string;
  email: string;
  city_id: string;
  blood_type: string;
  is_available: boolean;
}

interface DonationRequest {
  id: string;
  donor_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  donor: {
    id: string;
    name: string;
    phone: string;
    email: string;
    city_id: string;
    blood_type: string;
  };
}

const RequesterDashboard = () => {
  const { t, dir, language } = useLanguage();
  const { profile, loading: authLoading } = useAuth();
  const { cities } = useCities();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [donors, setDonors] = useState<Donor[]>([]);
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  // Search filters
  const [cityFilter, setCityFilter] = useState<string>('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState<string>('');

  const fetchRequests = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('donation_requests')
        .select(`
          *,
          donor:profiles!donation_requests_donor_id_fkey (
            id, name, phone, email, city_id, blood_type
          )
        `)
        .eq('requester_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
      
      // Track which donors already have pending requests
      const pending = new Set(data?.filter(r => r.status === 'pending').map(r => r.donor_id) || []);
      setSentRequests(pending);
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };

  const searchDonors = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'donor')
        .eq('is_blocked', false)
        .eq('is_available', true);

      if (cityFilter) {
        query = query.eq('city_id', cityFilter);
      }
      if (bloodTypeFilter && bloodTypeFilter !== 'all') {
        query = query.eq('blood_type', bloodTypeFilter as any);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDonors(data || []);
    } catch (err) {
      console.error('Error searching donors:', err);
      toast({
        variant: 'destructive',
        title: dir === 'rtl' ? 'خطأ' : 'Error',
        description: t('genericError'),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !profile) {
      navigate('/login');
    } else if (profile && profile.role !== 'requester') {
      navigate('/');
    } else if (profile) {
      fetchRequests();

      // Subscribe to real-time updates
      const channel = supabase
        .channel('requester-requests')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'donation_requests',
            filter: `requester_id=eq.${profile.id}`,
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

  const sendRequest = async (donorId: string) => {
    if (!profile) return;

    setSendingTo(donorId);
    try {
      // Create donation request
      const { error: requestError } = await supabase.from('donation_requests').insert({
        requester_id: profile.id,
        donor_id: donorId,
        status: 'pending',
      });

      if (requestError) throw requestError;

      // Create notification for donor
      await supabase.from('notifications').insert({
        user_id: donorId,
        title_en: 'New Blood Request',
        title_ar: 'طلب دم جديد',
        message_en: `${profile.name} is requesting blood donation. Please review and respond.`,
        message_ar: `${profile.name} يطلب تبرعاً بالدم. يرجى المراجعة والرد.`,
        type: 'request',
      });

      setSentRequests((prev) => new Set(prev).add(donorId));
      toast({
        title: dir === 'rtl' ? 'نجاح' : 'Success',
        description: t('requestSentSuccess'),
      });
      fetchRequests();
    } catch (err) {
      console.error('Error sending request:', err);
      toast({
        variant: 'destructive',
        title: dir === 'rtl' ? 'خطأ' : 'Error',
        description: t('genericError'),
      });
    } finally {
      setSendingTo(null);
    }
  };

  const getCityName = (cityId: string) => {
    const city = cities.find((c) => c.id === cityId);
    return city ? (language === 'ar' ? city.name_ar : city.name_en) : '';
  };

  if (authLoading) {
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
        </div>

        <Tabs defaultValue="search" className="space-y-6">
          <TabsList>
            <TabsTrigger value="search">{t('searchDonors')}</TabsTrigger>
            <TabsTrigger value="requests">{t('myRequests')}</TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle>{t('searchDonors')}</CardTitle>
                <CardDescription>
                  {dir === 'rtl'
                    ? 'ابحث عن متبرعين حسب المدينة وفصيلة الدم'
                    : 'Search for donors by city and blood type'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select value={cityFilter} onValueChange={setCityFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder={t('city')} />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {language === 'ar' ? city.name_ar : city.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <Droplets className="h-4 w-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder={t('bloodType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allBloodTypes')}</SelectItem>
                      {BLOOD_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button onClick={searchDonors} disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    {t('search')}
                  </Button>
                </div>

                {/* Results */}
                {donors.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    {loading ? (
                      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    ) : (
                      t('noDonorsFound')
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {donors.map((donor) => (
                      <Card key={donor.id} className="glass-card">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-foreground">{donor.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {getCityName(donor.city_id)}
                              </p>
                            </div>
                            <Badge variant="default" className="text-lg">
                              {donor.blood_type}
                            </Badge>
                          </div>

                          <Button
                            className="w-full"
                            onClick={() => sendRequest(donor.id)}
                            disabled={sendingTo === donor.id || sentRequests.has(donor.id)}
                            variant={sentRequests.has(donor.id) ? 'secondary' : 'default'}
                          >
                            {sendingTo === donor.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Send className="h-4 w-4 mr-2" />
                            )}
                            {sentRequests.has(donor.id) ? t('requestSent') : t('sendRequest')}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Requests Tab */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>{t('myRequests')}</CardTitle>
                <CardDescription>
                  {dir === 'rtl'
                    ? 'تتبع حالة طلباتك للمتبرعين'
                    : 'Track the status of your requests to donors'}
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
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-foreground">
                                  {request.donor.name}
                                </h4>
                                <Badge>{request.donor.blood_type}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {getCityName(request.donor.city_id)}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {new Date(request.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                              </p>

                              {/* Show donor contact if accepted */}
                              {request.status === 'accepted' && (
                                <div className="mt-3 p-3 bg-success/10 rounded-lg border border-success/20">
                                  <p className="text-sm font-medium text-success mb-2">
                                    {dir === 'rtl' ? 'معلومات الاتصال' : 'Contact Information'}
                                  </p>
                                  <div className="space-y-1 text-sm">
                                    <p className="flex items-center gap-2">
                                      <Phone className="h-4 w-4" />
                                      {request.donor.phone}
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <Mail className="h-4 w-4" />
                                      {request.donor.email}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            <Badge
                              variant={
                                request.status === 'accepted'
                                  ? 'default'
                                  : request.status === 'rejected'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                              className={request.status === 'accepted' ? 'bg-success' : ''}
                            >
                              {request.status === 'pending'
                                ? t('pending')
                                : request.status === 'accepted'
                                ? t('accepted')
                                : t('rejected')}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default RequesterDashboard;
