import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Heart } from 'lucide-react';

export const Footer = () => {
  const { t, dir } = useLanguage();

  return (
    <footer className="bg-muted/50 border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Heart className="h-8 w-8 text-primary fill-primary" />
              <span className="text-xl font-bold text-foreground">
                {dir === 'rtl' ? 'بنك الدم' : 'BloodBank'}
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm">
              {dir === 'rtl' 
                ? 'منصة للربط بين المتبرعين بالدم والمحتاجين. انضم إلينا في إنقاذ الأرواح.'
                : 'A platform connecting blood donors with those in need. Join us in saving lives.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">
              {dir === 'rtl' ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">
              {dir === 'rtl' ? 'الحساب' : 'Account'}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('login')}
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('register')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BloodBank. {t('allRightsReserved')}.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            {t('madeWith')} <Heart className="h-4 w-4 text-primary fill-primary" /> {t('forHumanity')}
          </p>
        </div>
      </div>
    </footer>
  );
};
