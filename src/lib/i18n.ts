export type Language = 'en' | 'ar';

export const translations = {
  en: {
    // Navigation
    home: 'Home',
    about: 'About',
    contact: 'Contact Us',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    dashboard: 'Dashboard',
    
    // Home page
    heroTitle: 'Save Lives, Donate Blood',
    heroSubtitle: 'Join our community of blood donors and help save lives in your city',
    registerButton: 'Register as Donor or Requester',
    loginButton: 'Login to Your Account',
    
    // Features
    feature1Title: 'Quick Registration',
    feature1Desc: 'Register in minutes and start saving lives',
    feature2Title: 'Find Donors',
    feature2Desc: 'Search for compatible blood donors in your area',
    feature3Title: 'Real-time Notifications',
    feature3Desc: 'Get instant updates on donation requests',
    
    // Auth
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    name: 'Full Name',
    phone: 'Phone Number',
    city: 'City',
    bloodType: 'Blood Type',
    nni: 'National ID (NNI)',
    selectRole: 'Select Your Role',
    donor: 'Blood Donor',
    requester: 'Blood Requester',
    donorDesc: 'I want to donate blood and help save lives',
    requesterDesc: 'I need to find blood donors',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    signIn: 'Sign In',
    signUp: 'Sign Up',
    
    // Dashboard
    welcomeBack: 'Welcome back',
    myRequests: 'My Requests',
    incomingRequests: 'Incoming Requests',
    searchDonors: 'Search Donors',
    allBloodTypes: 'All Blood Types',
    search: 'Search',
    sendRequest: 'Send Request',
    requestSent: 'Request Sent',
    accept: 'Accept',
    reject: 'Reject',
    accepted: 'Accepted',
    rejected: 'Rejected',
    pending: 'Pending',
    noRequests: 'No requests yet',
    noDonorsFound: 'No donors found',
    available: 'Available',
    unavailable: 'On Cooldown',
    daysRemaining: 'days remaining',
    
    // Notifications
    notifications: 'Notifications',
    noNotifications: 'No notifications',
    markAsRead: 'Mark as read',
    
    // Contact
    contactTitle: 'Get in Touch',
    contactSubtitle: 'Have questions? We\'d love to hear from you',
    yourName: 'Your Name',
    yourEmail: 'Your Email',
    message: 'Message',
    sendMessage: 'Send Message',
    messageSent: 'Message sent successfully!',
    
    // About
    aboutTitle: 'About Blood Donation',
    aboutSubtitle: 'Understanding the importance of blood donation',
    whyDonate: 'Why Donate Blood?',
    benefit1: 'Save up to 3 lives with a single donation',
    benefit2: 'Blood is always needed for emergencies and surgeries',
    benefit3: 'Regular donation helps maintain your health',
    benefit4: 'Join a community of life-savers',
    
    // Admin
    adminDashboard: 'Admin Dashboard',
    allUsers: 'All Users',
    contactMessages: 'Contact Messages',
    broadcastRequest: 'Broadcast Request',
    block: 'Block',
    unblock: 'Unblock',
    blocked: 'Blocked',
    active: 'Active',
    filterByName: 'Filter by name...',
    filterByEmail: 'Filter by email...',
    sendBroadcast: 'Send Broadcast',
    unreadMessages: 'unread messages',
    
    // Validation
    invalidEmail: 'Please enter a valid email',
    invalidPhone: 'Please enter a valid phone number',
    invalidPassword: 'Password must be at least 4 characters',
    invalidNNI: 'NNI must be exactly 10 digits',
    emailExists: 'This email is already registered',
    phoneExists: 'This phone number is already registered',
    requiredField: 'This field is required',
    passwordMismatch: 'Passwords do not match',
    
    // Success messages
    registrationSuccess: 'Registration successful! Welcome to our community.',
    loginSuccess: 'Login successful!',
    requestSentSuccess: 'Request sent successfully!',
    requestAccepted: 'Request accepted! Donor info revealed.',
    requestRejected: 'Request rejected.',
    
    // Error messages
    loginError: 'Invalid email or password',
    genericError: 'Something went wrong. Please try again.',
    
    // Footer
    allRightsReserved: 'All rights reserved',
    madeWith: 'Made with',
    forHumanity: 'for humanity',
  },
  ar: {
    // Navigation
    home: 'الرئيسية',
    about: 'حول',
    contact: 'اتصل بنا',
    login: 'تسجيل الدخول',
    register: 'التسجيل',
    logout: 'تسجيل الخروج',
    dashboard: 'لوحة التحكم',
    
    // Home page
    heroTitle: 'أنقذ حياة، تبرع بالدم',
    heroSubtitle: 'انضم إلى مجتمعنا من المتبرعين بالدم وساعد في إنقاذ الأرواح في مدينتك',
    registerButton: 'سجل كمتبرع أو طالب دم',
    loginButton: 'تسجيل الدخول إلى حسابك',
    
    // Features
    feature1Title: 'تسجيل سريع',
    feature1Desc: 'سجل في دقائق وابدأ في إنقاذ الأرواح',
    feature2Title: 'ابحث عن المتبرعين',
    feature2Desc: 'ابحث عن المتبرعين المتوافقين في منطقتك',
    feature3Title: 'إشعارات فورية',
    feature3Desc: 'احصل على تحديثات فورية حول طلبات التبرع',
    
    // Auth
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    name: 'الاسم الكامل',
    phone: 'رقم الهاتف',
    city: 'المدينة',
    bloodType: 'فصيلة الدم',
    nni: 'رقم التعريف الوطني',
    selectRole: 'اختر دورك',
    donor: 'متبرع بالدم',
    requester: 'طالب دم',
    donorDesc: 'أريد التبرع بالدم والمساعدة في إنقاذ الأرواح',
    requesterDesc: 'أحتاج إلى إيجاد متبرعين بالدم',
    createAccount: 'إنشاء حساب',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    dontHaveAccount: 'ليس لديك حساب؟',
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    
    // Dashboard
    welcomeBack: 'مرحباً بعودتك',
    myRequests: 'طلباتي',
    incomingRequests: 'الطلبات الواردة',
    searchDonors: 'البحث عن متبرعين',
    allBloodTypes: 'جميع فصائل الدم',
    search: 'بحث',
    sendRequest: 'إرسال طلب',
    requestSent: 'تم إرسال الطلب',
    accept: 'قبول',
    reject: 'رفض',
    accepted: 'مقبول',
    rejected: 'مرفوض',
    pending: 'قيد الانتظار',
    noRequests: 'لا توجد طلبات حتى الآن',
    noDonorsFound: 'لم يتم العثور على متبرعين',
    available: 'متاح',
    unavailable: 'في فترة انتظار',
    daysRemaining: 'أيام متبقية',
    
    // Notifications
    notifications: 'الإشعارات',
    noNotifications: 'لا توجد إشعارات',
    markAsRead: 'تحديد كمقروء',
    
    // Contact
    contactTitle: 'تواصل معنا',
    contactSubtitle: 'لديك أسئلة؟ يسعدنا سماعك',
    yourName: 'اسمك',
    yourEmail: 'بريدك الإلكتروني',
    message: 'الرسالة',
    sendMessage: 'إرسال الرسالة',
    messageSent: 'تم إرسال الرسالة بنجاح!',
    
    // About
    aboutTitle: 'حول التبرع بالدم',
    aboutSubtitle: 'فهم أهمية التبرع بالدم',
    whyDonate: 'لماذا تتبرع بالدم؟',
    benefit1: 'أنقذ ما يصل إلى 3 أرواح بتبرع واحد',
    benefit2: 'الدم مطلوب دائماً للطوارئ والعمليات الجراحية',
    benefit3: 'التبرع المنتظم يساعد في الحفاظ على صحتك',
    benefit4: 'انضم إلى مجتمع من منقذي الأرواح',
    
    // Admin
    adminDashboard: 'لوحة تحكم المسؤول',
    allUsers: 'جميع المستخدمين',
    contactMessages: 'رسائل الاتصال',
    broadcastRequest: 'طلب بث عام',
    block: 'حظر',
    unblock: 'إلغاء الحظر',
    blocked: 'محظور',
    active: 'نشط',
    filterByName: 'تصفية حسب الاسم...',
    filterByEmail: 'تصفية حسب البريد الإلكتروني...',
    sendBroadcast: 'إرسال البث',
    unreadMessages: 'رسائل غير مقروءة',
    
    // Validation
    invalidEmail: 'يرجى إدخال بريد إلكتروني صالح',
    invalidPhone: 'يرجى إدخال رقم هاتف صالح',
    invalidPassword: 'يجب أن تكون كلمة المرور 4 أحرف على الأقل',
    invalidNNI: 'يجب أن يكون رقم التعريف الوطني 10 أرقام بالضبط',
    emailExists: 'هذا البريد الإلكتروني مسجل بالفعل',
    phoneExists: 'رقم الهاتف هذا مسجل بالفعل',
    requiredField: 'هذا الحقل مطلوب',
    passwordMismatch: 'كلمتا المرور غير متطابقتين',
    
    // Success messages
    registrationSuccess: 'تم التسجيل بنجاح! مرحباً بك في مجتمعنا.',
    loginSuccess: 'تم تسجيل الدخول بنجاح!',
    requestSentSuccess: 'تم إرسال الطلب بنجاح!',
    requestAccepted: 'تم قبول الطلب! تم الكشف عن معلومات المتبرع.',
    requestRejected: 'تم رفض الطلب.',
    
    // Error messages
    loginError: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    genericError: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
    
    // Footer
    allRightsReserved: 'جميع الحقوق محفوظة',
    madeWith: 'صنع بـ',
    forHumanity: 'من أجل الإنسانية',
  },
};

export type TranslationKey = keyof typeof translations.en;

export const useTranslation = (language: Language) => {
  return (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };
};
