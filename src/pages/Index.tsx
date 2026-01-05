import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Users, Bell, ArrowRight, Droplets } from 'lucide-react';

const Index = () => {
  const { t, dir } = useLanguage();

  const features = [
    {
      icon: Users,
      title: t('feature1Title'),
      description: t('feature1Desc'),
    },
    {
      icon: Droplets,
      title: t('feature2Title'),
      description: t('feature2Desc'),
    },
    {
      icon: Bell,
      title: t('feature3Title'),
      description: t('feature3Desc'),
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 hero-gradient opacity-95" />
        
        {/* Animated Blood Drops */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            >
              <Droplets 
                className="text-primary-foreground/20" 
                style={{ width: `${30 + i * 10}px`, height: `${30 + i * 10}px` }}
              />
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Logo Animation */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <Heart className="h-24 w-24 text-primary-foreground fill-primary-foreground animate-pulse-glow" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary font-bold text-2xl">
                  +
                </span>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 animate-fade-up">
              {t('heroTitle')}
            </h1>
            
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              {t('heroSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                asChild
              >
                <Link to="/register">
                  {t('registerButton')}
                  <ArrowRight className={`h-5 w-5 ${dir === 'rtl' ? 'mr-2 rotate-180' : 'ml-2'}`} />
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link to="/login">
                  {t('loginButton')}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Wave Bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
              fill="hsl(var(--background))"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {dir === 'rtl' ? 'لماذا تختارنا؟' : 'Why Choose Us?'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {dir === 'rtl' 
                ? 'منصة سهلة وفعالة لربط المتبرعين بالمحتاجين'
                : 'An easy and efficient platform connecting donors with those in need'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group glass-card hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '1000+', label: dir === 'rtl' ? 'متبرع مسجل' : 'Registered Donors' },
              { value: '500+', label: dir === 'rtl' ? 'حياة أُنقذت' : 'Lives Saved' },
              { value: '10+', label: dir === 'rtl' ? 'مدينة' : 'Cities' },
              { value: '24/7', label: dir === 'rtl' ? 'دعم متواصل' : 'Support' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <Card className="warm-gradient p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              {dir === 'rtl' ? 'كن جزءاً من الحل' : 'Be Part of the Solution'}
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              {dir === 'rtl'
                ? 'كل تبرع بالدم يمكن أن ينقذ ما يصل إلى 3 أرواح. سجل اليوم وكن بطلاً.'
                : 'Every blood donation can save up to 3 lives. Register today and become a hero.'}
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8"
              asChild
            >
              <Link to="/register">
                {t('registerButton')}
                <Heart className={`h-5 w-5 ${dir === 'rtl' ? 'mr-2' : 'ml-2'} fill-current`} />
              </Link>
            </Button>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
