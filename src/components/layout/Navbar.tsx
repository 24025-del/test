import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Heart, Menu, X, Bell, User, LogOut } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

export const Navbar = () => {
  const { t, dir } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { unreadCount } = useNotifications();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!profile) return '/dashboard';
    switch (profile.role) {
      case 'admin':
        return '/admin';
      case 'donor':
        return '/donor-dashboard';
      case 'requester':
        return '/requester-dashboard';
      default:
        return '/dashboard';
    }
  };

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Heart className="h-8 w-8 text-primary fill-primary group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse-glow" />
            </div>
            <span className="text-xl font-bold text-foreground">
              {dir === 'rtl' ? 'بنك الدم' : 'BloodBank'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageToggle />
            
            {user ? (
              <>
                {/* Notifications */}
                <Link to="/notifications" className="relative">
                  <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={dir === 'rtl' ? 'start' : 'end'}>
                    <DropdownMenuItem className="font-medium">
                      {profile?.name}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={getDashboardLink()}>{t('dashboard')}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">{t('login')}</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">{t('register')}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-up">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <LanguageToggle />
                {user ? (
                  <>
                    <Button variant="outline" asChild className="flex-1">
                      <Link to={getDashboardLink()} onClick={() => setMobileMenuOpen(false)}>
                        {t('dashboard')}
                      </Link>
                    </Button>
                    <Button variant="destructive" onClick={handleSignOut} className="flex-1">
                      {t('logout')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild className="flex-1">
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>{t('login')}</Link>
                    </Button>
                    <Button asChild className="flex-1">
                      <Link to="/register" onClick={() => setMobileMenuOpen(false)}>{t('register')}</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
