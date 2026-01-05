import { useLanguage } from '@/contexts/LanguageContext';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Users, Clock, Award, Droplets, Activity } from 'lucide-react';

const About = () => {
  const { t, dir } = useLanguage();

  const benefits = [
    {
      icon: Heart,
      title: t('benefit1'),
    },
    {
      icon: Activity,
      title: t('benefit2'),
    },
    {
      icon: Clock,
      title: t('benefit3'),
    },
    {
      icon: Users,
      title: t('benefit4'),
    },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Droplets className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {t('aboutTitle')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('aboutSubtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Why Donate */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            {t('whyDonate')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="glass-card hover:shadow-lg transition-all duration-300">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="h-7 w-7 text-primary" />
                  </div>
                  <p className="text-foreground font-medium">{benefit.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                {dir === 'rtl' ? 'عن منصتنا' : 'About Our Platform'}
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  {dir === 'rtl'
                    ? 'منصتنا هي جسر يربط بين المتبرعين بالدم والمحتاجين. نحن نؤمن بأن كل قطرة دم يمكن أن تحدث فرقاً في حياة شخص ما.'
                    : 'Our platform is a bridge connecting blood donors with those in need. We believe that every drop of blood can make a difference in someone\'s life.'}
                </p>
                <p>
                  {dir === 'rtl'
                    ? 'نوفر نظاماً سهلاً وآمناً للتسجيل والبحث عن المتبرعين، مع إشعارات فورية لضمان التواصل السريع والفعال.'
                    : 'We provide an easy and secure system for registration and donor search, with instant notifications to ensure quick and effective communication.'}
                </p>
                <p>
                  {dir === 'rtl'
                    ? 'انضم إلينا اليوم وكن جزءاً من مجتمع منقذي الأرواح. معاً يمكننا إحداث تغيير حقيقي.'
                    : 'Join us today and be part of the life-saving community. Together, we can make a real difference.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Heart, value: '1000+', label: dir === 'rtl' ? 'متبرع' : 'Donors' },
                { icon: Users, value: '500+', label: dir === 'rtl' ? 'محتاج' : 'Recipients' },
                { icon: Clock, value: '24/7', label: dir === 'rtl' ? 'متاح' : 'Available' },
                { icon: Award, value: '100%', label: dir === 'rtl' ? 'مجاني' : 'Free' },
              ].map((stat, index) => (
                <Card key={index} className="glass-card text-center p-6">
                  <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blood Types Info */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            {dir === 'rtl' ? 'فصائل الدم وتوافقها' : 'Blood Types Compatibility'}
          </h2>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-4 max-w-3xl mx-auto">
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
              <div
                key={type}
                className="aspect-square rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
              >
                {type}
              </div>
            ))}
          </div>

          <p className="text-center text-muted-foreground mt-8 max-w-2xl mx-auto">
            {dir === 'rtl'
              ? 'O- هو المتبرع العالمي ويمكنه التبرع لجميع فصائل الدم. AB+ هو المستقبل العالمي ويمكنه استقبال الدم من جميع الفصائل.'
              : 'O- is the universal donor and can donate to all blood types. AB+ is the universal recipient and can receive blood from all types.'}
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default About;
