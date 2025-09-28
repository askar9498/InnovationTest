export interface MessageModel {
  user: number
  type: 'in' | 'out'
  text: string
  time: string
  template?: boolean
}

const defaultMessages: Array<MessageModel> = [
  {
    user: 4,
    type: 'in',
    text: 'سلام، آیا می‌توانید در مورد فراخوان جدید توضیح دهید؟',
    time: '۲ دقیقه پیش',
  },
  {
    user: 2,
    type: 'out',
    text: 'بله، فراخوان جدید در حوزه هوش مصنوعی منتشر شده است. مهلت ارسال پروپوزال تا پایان هفته است.',
    time: '۵ دقیقه پیش',
  },
  {
    user: 4,
    type: 'in',
    text: 'متوجه شدم! آیا می‌توانم چند سوال در مورد شرایط شرکت بپرسم؟',
    time: '۱ ساعت پیش',
  },
  {
    user: 2,
    type: 'out',
    text: 'بله حتما، من آماده پاسخگویی به سوالات شما هستم.',
    time: '۲ ساعت پیش',
  },
  {
    user: 4,
    type: 'in',
    text: 'آیا می‌توانم نمونه پروپوزال‌های قبلی را مشاهده کنم؟ لینک دسترسی: <a href="https://example.com">مشاهده نمونه‌ها</a>',
    time: '۳ ساعت پیش',
  },
  {
    user: 2,
    type: 'out',
    text: 'بله، در بخش مستندات سایت می‌توانید نمونه پروپوزال‌های موفق را مشاهده کنید.',
    time: '۴ ساعت پیش',
  },
  {
    user: 4,
    type: 'in',
    text: 'آیا امکان مشاوره حضوری برای ارائه پروپوزال وجود دارد؟',
    time: '۵ ساعت پیش',
  },
  {
    template: true,
    user: 2,
    type: 'out',
    text: '',
    time: 'همین الان',
  },
  {
    template: true,
    user: 4,
    type: 'in',
    text: 'ممنون از راهنمایی‌های شما. من آماده ارسال پروپوزال هستم.',
    time: 'همین الان',
  },
]

export interface UserInfoModel {
  initials?: {label: string; state: 'warning' | 'danger' | 'primary' | 'success' | 'info'}
  name: string
  avatar?: string
  email: string
  position: string
  online: boolean
}

const defaultUserInfos: Array<UserInfoModel> = [
  {
    name: 'علی محمدی',
    avatar: 'avatars/300-6.jpg',
    email: 'ali.mohammadi@example.com',
    position: 'مدیر پروژه',
    online: false,
  },
  {
    name: 'مریم احمدی',
    initials: {label: 'م', state: 'danger'},
    email: 'maryam.ahmadi@example.com',
    position: 'کارشناس ارشد',
    online: true,
  },
  {
    name: 'رضا کریمی',
    avatar: 'avatars/300-1.jpg',
    email: 'reza.karimi@example.com',
    position: 'مهندس نرم‌افزار',
    online: false,
  },
  {
    name: 'سارا حسینی',
    avatar: 'avatars/300-5.jpg',
    email: 'sara.hosseini@example.com',
    position: 'توسعه‌دهنده',
    online: false,
  },
  {
    name: 'محمد رضایی',
    avatar: 'avatars/300-25.jpg',
    email: 'mohammad.rezaei@example.com',
    position: 'طراح رابط کاربری',
    online: false,
  },
  {
    name: 'نازنین محمدی',
    initials: {label: 'ن', state: 'warning'},
    email: 'nazanin.mohammadi@example.com',
    position: 'مدیر بازاریابی',
    online: true,
  },
  {
    name: 'امیر حسینی',
    avatar: 'avatars/300-9.jpg',
    email: 'amir.hosseini@example.com',
    position: 'معمار نرم‌افزار',
    online: false,
  },
  {
    name: 'زهرا کریمی',
    initials: {label: 'ز', state: 'danger'},
    email: 'zahra.karimi@example.com',
    position: 'مدیر سیستم',
    online: true,
  },
  {
    name: 'نوید رضایی',
    initials: {label: 'ن', state: 'primary'},
    email: 'navid.rezaei@example.com',
    position: 'مدیر حساب',
    online: true,
  },
  {
    name: 'دانیال محمدی',
    avatar: 'avatars/300-23.jpg',
    email: 'danial.mohammadi@example.com',
    position: 'طراح وب',
    online: false,
  },
]

const messageFromClient: MessageModel = {
  user: 4,
  type: 'in',
  text: 'ممنون از راهنمایی‌های شما در مورد پروپوزال!',
  time: 'همین الان',
}

export interface AlertModel {
  title: string
  description: string
  time: string
  icon: string
  state: 'primary' | 'danger' | 'warning' | 'success' | 'info'
}

const defaultAlerts: Array<AlertModel> = [
  {
    title: 'فراخوان هوش مصنوعی',
    description: 'مرحله اول توسعه',
    time: '۱ ساعت',
    icon: 'technology-2',
    state: 'primary',
  },
  {
    title: 'مستندات محرمانه',
    description: 'اسناد محرمانه کارکنان',
    time: '۲ ساعت',
    icon: 'information-5',
    state: 'danger',
  },
  {
    title: 'پروفایل‌های سازمانی',
    description: 'پروفایل‌های کارکنان',
    time: '۵ ساعت',
    icon: 'map001',
    state: 'warning',
  },
  {
    title: 'فراخوان جدید',
    description: 'قالب جدید مدیریت',
    time: '۲ روز',
    icon: 'cloud-change',
    state: 'success',
  },
  {
    title: 'جلسه توجیهی',
    description: 'به‌روزرسانی وضعیت پروژه',
    time: '۲۱ دی',
    icon: 'compass',
    state: 'primary',
  },
  {
    title: 'دارایی‌های تبلیغاتی',
    description: 'مجموعه تصاویر بنر',
    time: '۲۱ دی',
    icon: 'graph-3',
    state: 'info',
  },
  {
    title: 'آیکون‌ها',
    description: 'مجموعه آیکون‌های SVG',
    time: '۲۰ اسفند',
    icon: 'color-swatch',
    state: 'warning',
  },
]

export interface LogModel {
  code: string
  state: 'success' | 'danger' | 'warning'
  message: string
  time: string
}

const defaultLogs: Array<LogModel> = [
  {code: '۲۰۰ موفق', state: 'success', message: 'پروپوزال جدید', time: 'همین الان'},
  {code: '۵۰۰ خطا', state: 'danger', message: 'کاربر جدید', time: '۲ ساعت'},
  {code: '۲۰۰ موفق', state: 'success', message: 'پرداخت', time: '۵ ساعت'},
  {code: '۳۰۰ هشدار', state: 'warning', message: 'جستجو', time: '۲ روز'},
  {code: '۲۰۰ موفق', state: 'success', message: 'اتصال API', time: '۱ هفته'},
  {code: '۲۰۰ موفق', state: 'success', message: 'بازیابی پایگاه داده', time: '۵ اسفند'},
  {code: '۳۰۰ هشدار', state: 'warning', message: 'به‌روزرسانی سیستم', time: '۱۵ اردیبهشت'},
  {code: '۳۰۰ هشدار', state: 'warning', message: 'به‌روزرسانی سرور', time: '۳ فروردین'},
  {code: '۳۰۰ هشدار', state: 'warning', message: 'بازگشت API', time: '۳۰ خرداد'},
  {code: '۵۰۰ خطا', state: 'danger', message: 'فرآیند بازپرداخت', time: '۱۰ تیر'},
  {code: '۵۰۰ خطا', state: 'danger', message: 'فرآیند برداشت', time: '۱۰ شهریور'},
  {code: '۵۰۰ خطا', state: 'danger', message: 'وظایف ایمیل', time: '۱۰ آذر'},
]

export {defaultMessages, defaultUserInfos, defaultAlerts, defaultLogs, messageFromClient}
