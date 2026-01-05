import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCities } from '@/hooks/useCities';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Heart, Loader2, User, Mail, Phone, Lock, Droplets, MapPin, CreditCard } from 'lucide-react';
import { z } from 'zod';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const Register = () => {
  const { t, dir, language } = useLanguage();
  const { signUp } = useAuth();
  const { cities } = useCities();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [role, setRole] = useState<'donor' | 'requester' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city_id: '',
    blood_type: '',
    nni: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = t('requiredField');
    if (!formData.email.trim() || !z.string().email().safeParse(formData.email).success) {
      newErrors.email = t('invalidEmail');
    }
    if (!formData.phone.trim()) newErrors.phone = t('requiredField');
    if (formData.password.length < 4) newErrors.password = t('invalidPassword');
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwordMismatch');
    }
    if (!formData.city_id) newErrors.city_id = t('requiredField');

    if (role === 'donor') {
      if (!formData.blood_type) newErrors.blood_type = t('requiredField');
      if (!formData.nni || formData.nni.length !== 10 || !/^\d+$/.test(formData.nni)) {
        newErrors.nni = t('invalidNNI');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!role) {
      toast({
        variant: 'destructive',
        title: dir === 'rtl' ? 'خطأ' : 'Error',
        description: dir === 'rtl' ? 'يرجى اختيار دورك' : 'Please select your role',
      });
      return;
    }

    if (!validate()) return;

    setLoading(true);
    try {
      const metadata = {
        name: formData.name,
        phone: formData.phone,
        role,
        city_id: formData.city_id,
        ...(role === 'donor' && {
          blood_type: formData.blood_type,
          nni: formData.nni,
        }),
      };

      const { error } = await signUp(formData.email, formData.password, metadata);
      
      if (error) {
        let errorMessage = t('genericError');
        if (error.message.includes('already registered')) {
          errorMessage = t('emailExists');
        }
        toast({
          variant: 'destructive',
          title: dir === 'rtl' ? 'خطأ' : 'Error',
          description: errorMessage,
        });
      } else {
        toast({
          title: dir === 'rtl' ? 'نجاح' : 'Success',
          description: t('registrationSuccess'),
        });
        navigate('/');
      }
    } catch (err) {
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
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-lg glass-card animate-scale-in">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Heart className="h-12 w-12 text-primary fill-primary" />
            </div>
            <CardTitle className="text-2xl">{t('createAccount')}</CardTitle>
            <CardDescription>{t('selectRole')}</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Role Selection */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('donor')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    role === 'donor'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Droplets className={`h-8 w-8 mx-auto mb-2 ${role === 'donor' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="font-medium">{t('donor')}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t('donorDesc')}</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('requester')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    role === 'requester'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <User className={`h-8 w-8 mx-auto mb-2 ${role === 'requester' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="font-medium">{t('requester')}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t('requesterDesc')}</div>
                </button>
              </div>

              {role && (
                <div className="space-y-4 animate-slide-up">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('name')}</Label>
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

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>
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

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('phone')}</Label>
                    <div className="relative">
                      <Phone className={`absolute top-3 h-4 w-4 text-muted-foreground ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} ${errors.phone ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <Label>{t('city')}</Label>
                    <Select value={formData.city_id} onValueChange={(v) => handleSelectChange('city_id', v)}>
                      <SelectTrigger className={errors.city_id ? 'border-destructive' : ''}>
                        <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                        <SelectValue placeholder={dir === 'rtl' ? 'اختر مدينتك' : 'Select your city'} />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.id}>
                            {language === 'ar' ? city.name_ar : city.name_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.city_id && <p className="text-sm text-destructive">{errors.city_id}</p>}
                  </div>

                  {/* Donor-specific fields */}
                  {role === 'donor' && (
                    <>
                      <div className="space-y-2">
                        <Label>{t('bloodType')}</Label>
                        <Select value={formData.blood_type} onValueChange={(v) => handleSelectChange('blood_type', v)}>
                          <SelectTrigger className={errors.blood_type ? 'border-destructive' : ''}>
                            <Droplets className="h-4 w-4 text-muted-foreground mr-2" />
                            <SelectValue placeholder={dir === 'rtl' ? 'اختر فصيلة دمك' : 'Select blood type'} />
                          </SelectTrigger>
                          <SelectContent>
                            {BLOOD_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.blood_type && <p className="text-sm text-destructive">{errors.blood_type}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nni">{t('nni')}</Label>
                        <div className="relative">
                          <CreditCard className={`absolute top-3 h-4 w-4 text-muted-foreground ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                          <Input
                            id="nni"
                            name="nni"
                            maxLength={10}
                            value={formData.nni}
                            onChange={handleChange}
                            placeholder="1234567890"
                            className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} ${errors.nni ? 'border-destructive' : ''}`}
                          />
                        </div>
                        {errors.nni && <p className="text-sm text-destructive">{errors.nni}</p>}
                      </div>
                    </>
                  )}

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('password')}</Label>
                    <div className="relative">
                      <Lock className={`absolute top-3 h-4 w-4 text-muted-foreground ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} ${errors.password ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                    <div className="relative">
                      <Lock className={`absolute top-3 h-4 w-4 text-muted-foreground ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} ${errors.confirmPassword ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading || !role}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {t('createAccount')}
              </Button>
              
              <p className="text-sm text-muted-foreground text-center">
                {t('alreadyHaveAccount')}{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  {t('signIn')}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default Register;
