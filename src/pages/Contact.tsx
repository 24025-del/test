import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, User, MessageSquare, Loader2, MapPin, Phone, Clock } from 'lucide-react';
import { z } from 'zod';

const Contact = () => {
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = t('requiredField');
    if (!formData.email.trim() || !z.string().email().safeParse(formData.email).success) {
      newErrors.email = t('invalidEmail');
    }
    if (!formData.message.trim()) newErrors.message = t('requiredField');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
      });

      if (error) throw error;

      toast({
        title: dir === 'rtl' ? 'نجاح' : 'Success',
        description: t('messageSent'),
      });
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Error sending message:', err);
      toast({
        variant: 'destructive',
        title: dir === 'rtl' ? 'خطأ' : 'Error',
        description: t('genericError'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {t('contactTitle')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('contactSubtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('sendMessage')}</CardTitle>
                <CardDescription>
                  {dir === 'rtl'
                    ? 'املأ النموذج أدناه وسنرد عليك في أقرب وقت'
                    : 'Fill out the form below and we\'ll get back to you shortly'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('yourName')}</Label>
                    <div className="relative">
                      <User className={`absolute top-3 h-4 w-4 text-muted-foreground ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} ${errors.name ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t('yourEmail')}</Label>
                    <div className="relative">
                      <Mail className={`absolute top-3 h-4 w-4 text-muted-foreground ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} ${errors.email ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t('message')}</Label>
                    <div className="relative">
                      <MessageSquare className={`absolute top-3 h-4 w-4 text-muted-foreground ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                      <Textarea
                        id="message"
                        name="message"
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} ${errors.message ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {t('sendMessage')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="glass-card">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {dir === 'rtl' ? 'العنوان' : 'Address'}
                    </h3>
                    <p className="text-muted-foreground">
                      {dir === 'rtl' ? 'نواكشوط، موريتانيا' : 'Nouakchott, Mauritania'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {dir === 'rtl' ? 'الهاتف' : 'Phone'}
                    </h3>
                    <p className="text-muted-foreground" dir="ltr">+222 XX XX XX XX</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {dir === 'rtl' ? 'البريد الإلكتروني' : 'Email'}
                    </h3>
                    <p className="text-muted-foreground">contact@bloodbank.mr</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {dir === 'rtl' ? 'ساعات العمل' : 'Working Hours'}
                    </h3>
                    <p className="text-muted-foreground">
                      {dir === 'rtl' ? '24/7 دعم متواصل' : '24/7 Support Available'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
