import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Heart, Loader2, Mail, Lock } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

const Login = () => {
  const { t, dir } = useLanguage();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        if (field === 'email') fieldErrors[field] = t('invalidEmail');
        if (field === 'password') fieldErrors[field] = t('invalidPassword');
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        toast({
          variant: 'destructive',
          title: dir === 'rtl' ? 'خطأ' : 'Error',
          description: t('loginError'),
        });
      } else {
        toast({
          title: dir === 'rtl' ? 'نجاح' : 'Success',
          description: t('loginSuccess'),
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
        <Card className="w-full max-w-md glass-card animate-scale-in">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Heart className="h-12 w-12 text-primary fill-primary" />
            </div>
            <CardTitle className="text-2xl">{t('signIn')}</CardTitle>
            <CardDescription>
              {dir === 'rtl' 
                ? 'ادخل بياناتك للوصول إلى حسابك'
                : 'Enter your credentials to access your account'}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <div className="relative">
                  <Mail className={`absolute top-3 h-4 w-4 text-muted-foreground ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={dir === 'rtl' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                    value={formData.email}
                    onChange={handleChange}
                    className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} ${errors.email ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <div className="relative">
                  <Lock className={`absolute top-3 h-4 w-4 text-muted-foreground ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder={dir === 'rtl' ? 'أدخل كلمة المرور' : 'Enter your password'}
                    value={formData.password}
                    onChange={handleChange}
                    className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} ${errors.password ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {t('signIn')}
              </Button>
              
              <p className="text-sm text-muted-foreground text-center">
                {t('dontHaveAccount')}{' '}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  {t('signUp')}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default Login;
