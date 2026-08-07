import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'am';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.about': 'About Us',
    'nav.howToOrder': 'How to Order',
    'nav.packages': 'Packages',
    'nav.finder': 'Gift Finder',
    'nav.reviews': 'Reviews',
    'nav.cart': 'Cart',
    'nav.login': 'Login / Sign Up',
    'nav.profile': 'Profile',
    'nav.logout': 'Sign Out',
    'nav.admin': 'Admin Dashboard',
    'nav.orderStatus': 'Order Status',

    // Hero
    'hero.badge': 'Luxury Gift Experience',
    'hero.title': 'Bespoke Gifts for Every Milestone',
    'hero.subtitle': 'Handcrafted gift packages curated with elegance, premium sweets, fine glassware, and personalized messages.',
    'hero.exploreBtn': 'Explore Gift Packages',
    'hero.finderBtn': 'Smart Gift Assistant',
    'hero.stat1': 'Handcrafted Packages',
    'hero.stat2': 'Happy Recipients',
    'hero.stat3': 'On-Time Delivery Rate',

    // Gift Shop
    'shop.title': 'Curated Gift Collections',
    'shop.subtitle': 'Select a beautifully styled gift package crafted for special moments.',
    'shop.cat.all': 'All Gifts',
    'shop.cat.birthday': 'Birthday',
    'shop.cat.romance': 'Romance',
    'shop.cat.luxury': 'Luxury',
    'shop.cat.corporate': 'Corporate',
    'shop.cat.anniversary': 'Anniversary',
    'shop.search': 'Search gifts...',
    'shop.sort.default': 'Featured',
    'shop.sort.priceAsc': 'Price: Low to High',
    'shop.sort.priceDesc': 'Price: High to Low',
    'shop.addToCart': 'Add to Cart',
    'shop.added': 'Added to Cart!',
    'shop.viewDetails': 'Quick View',
    'shop.itemsIncluded': 'Items Included:',
    'shop.popularFor': 'Popular for:',

    // Gift Finder
    'finder.title': 'Smart Gift Assistant',
    'finder.subtitle': 'Answer 3 quick questions and let our AI recommend the perfect gift box for your special occasion.',
    'finder.step1': 'Who is this gift for?',
    'finder.step2': 'What is the occasion?',
    'finder.step3': 'What is your preferred budget?',
    'finder.findBtn': 'Find Perfect Gift',
    'finder.resultTitle': 'Recommended For You',
    'finder.resetBtn': 'Start Over',

    // Cart
    'cart.title': 'Your Cart',
    'cart.empty': 'Your gift cart is empty.',
    'cart.emptySubtitle': 'Browse our collection and add items to get started',
    'cart.returnShop': 'Return to Shop',
    'cart.tabCart': 'Cart',
    'cart.tabStatus': 'Order Status',
    'cart.subtotal': 'Subtotal',
    'cart.total': 'Total',
    'cart.wrapOption': 'Gift Wrapping Option',
    'cart.wrapStandard': 'Standard Gift Box (Included)',
    'cart.wrapLuxury': 'Luxury Ribbon & Velvet Box (+$7.00)',
    'cart.giftNote': 'Personalized Gift Message',
    'cart.giftNotePlaceholder': 'Write a warm message to be included inside the box...',
    'cart.recipientName': 'Recipient Name',
    'cart.recipientPlaceholder': 'Enter recipient full name',
    'cart.placeOrder': 'Complete & Place Order',
    'cart.authNoticeTitle': 'Sign up required to complete your order',
    'cart.authNoticeDesc': 'Please log in or create an account to finalize your order.',
    'cart.orderSuccess': 'Order Placed Successfully!',
    'cart.orderSuccessDesc': 'Thank you! Your order is currently being processed.',
    'cart.viewCart': 'View Cart',

    // Reviews
    'reviews.title': 'Loved by Gift Givers Everywhere',
    'reviews.guarantee1': 'Premium Packaging',
    'reviews.guarantee2': 'Same Day Dispatch',
    'reviews.guarantee3': '100% Satisfaction',

    // Footer
    'footer.desc': 'MBM Gifts delivers bespoke luxury gift boxes and hampers crafted for life\'s memorable celebrations.',
    'footer.rights': 'All rights reserved.',

    // Auth
    'auth.welcome': 'Welcome Back',
    'auth.create': 'Create Your Account',
    'auth.loginBtn': 'Log In',
    'auth.signupBtn': 'Sign Up',
  },
  am: {
    // Navbar
    'nav.home': 'መነሻ',
    'nav.about': 'ስለ እኛ',
    'nav.howToOrder': 'እንዴት ማዘዝ ይቻላል',
    'nav.packages': 'የስጦታ ስብስቦች',
    'nav.finder': 'ስጦታ ፈላጊ',
    'nav.reviews': 'አስተያየቶች',
    'nav.cart': 'ካርት',
    'nav.login': 'ግበሩ / ተመዝገቡ',
    'nav.profile': 'መገለጫ',
    'nav.logout': 'ውጣ',
    'nav.admin': 'አስተዳዳሪ',
    'nav.orderStatus': 'የትዕዛዝ ሁኔታ',

    // Hero
    'hero.badge': 'ልዩ የቅንጦት ስጦታዎች',
    'hero.title': 'ለእያንዳንዱ ልዩ ቀን የተዘጋጁ ስጦታዎች',
    'hero.subtitle': 'በጥንቃቄ የተዘጋጁ የስጦታ ሳጥኖች፣ ጣፋጭ ቸኮሌቶች፣ አበቦች እና ግላዊ መልዕክቶች።',
    'hero.exploreBtn': 'ስጦታዎችን ይመልከቱ',
    'hero.finderBtn': 'ዘመናዊ ስጦታ ፈላጊ',
    'hero.stat1': 'የተዘጋጁ ስጦታዎች',
    'hero.stat2': 'ደስተኛ ደንበኞች',
    'hero.stat3': 'በወቅቱ የማድረስ ምጣኔ',

    // Gift Shop
    'shop.title': 'የተመረጡ የስጦታ ስብስቦች',
    'shop.subtitle': 'ለልዩ ቀናትዎ በጥንቃቄ የተዘጋጁ የስጦታ ሳጥኖችን ይምረጡ።',
    'shop.cat.all': 'ሁሉም ስጦታዎች',
    'shop.cat.birthday': 'ልደት',
    'shop.cat.romance': 'ፍቅር',
    'shop.cat.luxury': 'ልዩ ቅንጦት',
    'shop.cat.corporate': 'የድርጅት',
    'shop.cat.anniversary': 'የጋብቻ አመት',
    'shop.search': 'ስጦታ ይፈልጉ...',
    'shop.sort.default': 'ተመራጭ',
    'shop.sort.priceAsc': 'ዋጋ፡ ከአነስተኛ ወደ ከፍተኛ',
    'shop.sort.priceDesc': 'ዋጋ፡ ከከፍተኛ ወደ አነስተኛ',
    'shop.addToCart': 'ወደ ካርት ጨምር',
    'shop.added': 'ወደ ካርት ተጨምሯል!',
    'shop.viewDetails': 'በፍጥነት ይመልከቱ',
    'shop.itemsIncluded': 'የያዘው እቃዎች፡',
    'shop.popularFor': 'የሚመረጥበት፡',

    // Gift Finder
    'finder.title': 'ዘመናዊ ስጦታ ፈላጊ',
    'finder.subtitle': '3 ፈጣን ጥያቄዎችን ይመልሱ እና ለእርስዎ ተስማሚ የሆነውን የስጦታ ሳጥን እንጠቁምዎት።',
    'finder.step1': 'ስጦታው ለማን ነው?',
    'finder.step2': 'ምክንያቱ ምንድን ነው?',
    'finder.step3': 'የሚመርጡት በጀት ስንት ነው?',
    'finder.findBtn': 'ስጦታ ፈልግ',
    'finder.resultTitle': 'ለእርስዎ የተመረጠ',
    'finder.resetBtn': 'እንደገና ጀምር',

    // Cart
    'cart.title': 'የእርስዎ ካርት',
    'cart.empty': 'የስጦታ ካርትዎ ባዶ ነው።',
    'cart.emptySubtitle': 'እቃዎችን ለመጨመር የስጦታ ስብስቦቻችንን ይመልከቱ',
    'cart.returnShop': 'ወደ ሱቅ ተመለስ',
    'cart.tabCart': 'ካርት',
    'cart.tabStatus': 'የትዕዛዝ ሁኔታ',
    'cart.subtotal': 'አጠቃላይ ዋጋ',
    'cart.total': 'ጠቅላላ',
    'cart.wrapOption': 'የስጦታ ማሸጊያ አማራጭ',
    'cart.wrapStandard': 'መደበኛ የስጦታ ሳጥን (የተካተተ)',
    'cart.wrapLuxury': 'ልዩ የቬልቬት ማሸጊያ (+ $7.00)',
    'cart.giftNote': 'የግል የስጦታ መልዕክት',
    'cart.giftNotePlaceholder': 'በሳጥኑ ውስጥ የሚካተት መልዕክት ይጻፉ...',
    'cart.recipientName': 'የተቀባይ ስም',
    'cart.recipientPlaceholder': 'የተቀባዩን ሙሉ ስም ይጻፉ',
    'cart.placeOrder': 'ትዕዛዝ አጠናቅቅ',
    'cart.authNoticeTitle': 'ትዕዛዝ ለማጠናቀቅ መመዝገብ ያስፈልጋል',
    'cart.authNoticeDesc': 'እባክዎን ይግቡ ወይም አዲስ መለያ ይክፈቱ።',
    'cart.orderSuccess': 'ትዕዛዝዎ በተሳካ ሁኔታ ተልኳል!',
    'cart.orderSuccessDesc': 'እናመሰግናለን! ትዕዛዝዎ በዝግጅት ላይ ይገኛል።',
    'cart.viewCart': 'ካርት ይመልከቱ',

    // Reviews
    'reviews.title': 'በደንበኞቻችን የተወደደ',
    'reviews.guarantee1': 'ምርጥ ማሸጊያ',
    'reviews.guarantee2': 'በፍጥነት ማድረስ',
    'reviews.guarantee3': '100% የእርካታ ዋስትና',

    // Footer
    'footer.desc': 'MBM Gifts ለሕይወትዎ የማይረሱ ደስታዎች በጥንቃቄ የተዘጋጁ የስጦታ ሳጥኖችን ያቀርባል።',
    'footer.rights': 'መብቱ በህግ የተጠበቀ ነው።',

    // Auth
    'auth.welcome': 'እንኳን ደህና መጡ',
    'auth.create': 'አዲስ መለያ ይክፈቱ',
    'auth.loginBtn': 'ግቡ',
    'auth.signupBtn': 'ተመዝገቡ',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('mbm_gifts_lang');
      return (saved === 'am' || saved === 'en') ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('mbm_gifts_lang', newLang);
    } catch (e) {
      console.error('Failed to save language preference:', e);
    }
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
