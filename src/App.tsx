import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { GiftShopBody } from './components/GiftShopBody';
import { AboutUsPage } from './components/AboutUsPage';
import { HowToOrderPage } from './components/HowToOrderPage';
import { GiftFinder } from './components/GiftFinder';
import { Reviews } from './components/Reviews';
import { CartPage } from './components/CartPage';
import { CheckoutPaymentPage } from './components/CheckoutPaymentPage';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { LoginPage } from './components/LoginPage';
import { AccessDeniedView } from './components/AccessDeniedView';
import { PackageDetailPage } from './components/PackageDetailPage';
import { MyOrdersPage } from './components/MyOrdersPage';
import { ProfilePage } from './components/ProfilePage';
import { supabase } from './lib/supabase';
import { CartItem, CartItemPrepared, CartItemCustom, Order, OrderStatus } from './types/cart';
import {
  PreparedPackage,
  CustomBoxOption,
  GiftCategory,
  GiftBoxStyle,
  getStoredPackages,
  saveStoredPackages,
  deleteStoredPackage,
  getStoredCustomItems,
  saveStoredCustomItems,
  deleteStoredCustomItem,
  getStoredCategories,
  saveStoredCategories,
  deleteStoredCategory,
  getStoredGiftBoxes,
  saveStoredGiftBoxes,
  deleteStoredGiftBox,
  getStoredOrders,
  saveSingleOrder,
  updateOrderStatusInDb,
  seedInitialData,
} from './data/giftsData';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<'admin' | 'customer' | null>(null);
  const [isCheckingRole, setIsCheckingRole] = useState<boolean>(true);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);

  // Cart persistence
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('mbm_gifts_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [customizerPackage, setCustomizerPackage] = useState<PreparedPackage | null>(null);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(() => {
    try {
      const saved = localStorage.getItem('mbm_pending_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Dynamic state loaded from localStorage / Supabase defaults
  const [packages, setPackages] = useState<PreparedPackage[]>([]);
  const [customItems, setCustomItems] = useState<CustomBoxOption[]>([]);
  const [categories, setCategories] = useState<GiftCategory[]>([]);
  const [giftBoxes, setGiftBoxes] = useState<GiftBoxStyle[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Listen to popstate for SPA routing
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mbm_gifts_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  useEffect(() => {
    // Handle OAuth callback from URL hash
    const handleOAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      
      if (accessToken) {
        console.log('🔐 OAuth callback detected, processing...');
        // OAuth callback detected - let Supabase handle it
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          console.log('✅ Session retrieved:', data.session.user.email);
          setSession(data.session);
          localStorage.removeItem('mbm_demo_session');
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }
      }
    };

    handleOAuthCallback();

    // Supabase auth setup - prioritize real Supabase sessions
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        console.log('✅ Existing session found:', data.session.user.email);
        setSession(data.session);
        // Clear any demo sessions when real auth exists
        localStorage.removeItem('mbm_demo_session');
      } else {
        console.log('❌ No session found');
      }
    }).catch((err) => {
      console.error('❌ Session error:', err);
      // Only use demo session if Supabase completely fails
      const demo = localStorage.getItem('mbm_demo_session');
      if (demo) {
        try { 
          setSession(JSON.parse(demo)); 
        } catch {}
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email);
      if (session) {
        setSession(session);
        // Clear demo session when real auth comes in
        localStorage.removeItem('mbm_demo_session');
        if (pendingPath) {
          navigateTo(pendingPath);
        }
      } else {
        setSession(null);
      }
    });

    // Fetch data from Supabase
    const loadData = async () => {
      // First, seed initial data if database is empty
      await seedInitialData();
      
      // Then load data
      const [pkgs, items, ords, cats, boxes] = await Promise.all([
        getStoredPackages(),
        getStoredCustomItems(),
        getStoredOrders(),
        getStoredCategories(),
        getStoredGiftBoxes(),
      ]);
      setPackages(pkgs);
      setCustomItems(items);
      setOrders(ords);
      setCategories(cats);
      setGiftBoxes(boxes);
    };
    
    loadData();

    return () => subscription.unsubscribe();
  }, [pendingPath]);

  // Fetch user role directly from Supabase profiles or session metadata
  useEffect(() => {
    let isMounted = true;
    const resolveRole = async () => {
      if (!session?.user?.id) {
        if (isMounted) {
          setUserRole(null);
          setIsCheckingRole(false);
        }
        return;
      }

      setIsCheckingRole(true);

      const cachedRole = localStorage.getItem(`mbm_user_role_${session.user.id}`) || localStorage.getItem('mbm_global_role');
      if (cachedRole === 'admin' && isMounted) {
        setUserRole('admin');
      }

      try {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (data?.role && isMounted) {
          setUserRole(data.role as 'admin' | 'customer');
          localStorage.setItem(`mbm_user_role_${session.user.id}`, data.role);
          localStorage.setItem('mbm_global_role', data.role);
          setIsCheckingRole(false);
          return;
        }
      } catch (err) {
        console.warn('Could not query profiles for user role:', err);
      }

      const metaRole = session?.user?.user_metadata?.role;
      const finalRole = (cachedRole || metaRole || 'customer') as 'admin' | 'customer';
      if (isMounted) {
        setUserRole(finalRole);
        setIsCheckingRole(false);
      }
    };

    resolveRole();
    return () => {
      isMounted = false;
    };
  }, [session]);

  // Strict Route Locking Enforcement:
  // Admins ONLY see Admin Dashboard (/admin). Customer pages are locked for Admin.
  useEffect(() => {
    if (isCheckingRole || !session) return;

    if (userRole === 'admin' && currentPath !== '/admin') {
      console.log('🔒 Admin account active. Locking customer pages & redirecting to /admin portal...');
      navigateTo('/admin');
    }
  }, [session, userRole, isCheckingRole, currentPath]);

  // Save & Delete Packages update
  const handleSavePackages = async (updatedPkgs: PreparedPackage[]) => {
    const prev = [...packages];
    setPackages(updatedPkgs);
    try {
      await saveStoredPackages(updatedPkgs);
    } catch (err: any) {
      alert('Database Save Failed (Packages): ' + (err.message || 'Please ensure you have Admin permissions in Supabase.'));
      setPackages(prev);
    }
  };

  const handleDeletePackage = async (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
    await deleteStoredPackage(id);
  };

  // Save & Delete Custom Items update
  const handleSaveCustomItems = async (updatedItems: CustomBoxOption[]) => {
    const prev = [...customItems];
    setCustomItems(updatedItems);
    try {
      await saveStoredCustomItems(updatedItems);
    } catch (err: any) {
      alert('Database Save Failed (Single Items): ' + (err.message || 'Please ensure you have Admin permissions in Supabase.'));
      setCustomItems(prev);
    }
  };

  const handleDeleteCustomItem = async (id: string) => {
    setCustomItems((prev) => prev.filter((i) => i.id !== id));
    await deleteStoredCustomItem(id);
  };

  // Save & Delete Categories update
  const handleSaveCategories = async (updatedCategories: GiftCategory[]) => {
    const prev = [...categories];
    setCategories(updatedCategories);
    try {
      await saveStoredCategories(updatedCategories);
    } catch (err: any) {
      alert('Database Save Failed (Categories): ' + (err.message || 'Please ensure you have Admin permissions in Supabase.'));
      setCategories(prev);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    await deleteStoredCategory(id);
  };

  // Save & Delete Gift Boxes update
  const handleSaveGiftBoxes = async (updatedBoxes: GiftBoxStyle[]) => {
    const prev = [...giftBoxes];
    setGiftBoxes(updatedBoxes);
    try {
      await saveStoredGiftBoxes(updatedBoxes);
    } catch (err: any) {
      alert('Database Save Failed (Gift Boxes): ' + (err.message || 'Please ensure you have Admin permissions in Supabase.'));
      setGiftBoxes(prev);
    }
  };

  const handleDeleteGiftBox = async (id: string) => {
    setGiftBoxes((prev) => prev.filter((b) => b.id !== id));
    await deleteStoredGiftBox(id);
  };

  // Update Order Status directly in DB
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    console.log('📝 Updating order status:', orderId, '→', newStatus);
    try {
      await updateOrderStatusInDb(orderId, newStatus);
      const freshOrders = await getStoredOrders();
      setOrders(freshOrders);
      console.log('✅ Order status updated in database successfully');
    } catch (err) {
      console.error('❌ Failed to update order status in database:', err);
      alert('Failed to update status in database: ' + (err as Error).message);
    }
  };

  // Create new order on Checkout completion (goes to payment first)
  const handleNewOrderCreated = (newOrder: Order) => {
    setPendingOrder(newOrder);
    try {
      localStorage.setItem('mbm_pending_order', JSON.stringify(newOrder));
    } catch {}
    navigateTo('/checkout/payment');
  };

  // Finalize order after payment directly to DB
  const handlePaymentSubmitted = async (
    receiptUrl: string,
    paymentMethod: string,
    chapaTxRef?: string,
    paymentStatus?: 'PAID' | 'PENDING_PAYMENT'
  ) => {
    if (pendingOrder) {
      console.log('💾 Saving finalized order to database:', pendingOrder.id);
      
      // Update order with payment receipt, method, and transaction reference
      const finalizedOrder: Order = {
        ...pendingOrder,
        paymentReceiptUrl: receiptUrl,
        paymentMethod: paymentMethod,
        chapaTxRef: chapaTxRef || pendingOrder.chapaTxRef,
        paymentStatus: paymentStatus || 'PAID',
        status: paymentStatus === 'PAID' ? 'Processing' : 'Pending',
      };
      
      try {
        await saveSingleOrder(finalizedOrder);
        console.log('✅ Order saved to database successfully with Chapa reference:', finalizedOrder.id);
        
        // Fetch fresh orders directly from DB
        const freshOrders = await getStoredOrders();
        setOrders(freshOrders);
        
        // Clear cart & pending order state upon successful DB save
        setCartItems([]);
        setPendingOrder(null);
        localStorage.removeItem('mbm_pending_order');
        localStorage.removeItem('mbm_gifts_cart');
        
        // Navigate directly to My Orders page where the full order detail is saved
        navigateTo('/my-orders');
      } catch (err: any) {
        console.error('❌ Failed to save order to database:', err);
        alert('Database Order Save Error: ' + (err?.message || 'Could not save order to database. Please check Supabase configuration or try again.'));
      }
    }
  };

  // Add prepared package to cart
  const handleAddToCartPrepared = (pkg: PreparedPackage, customNote?: string) => {
    const existingIndex = cartItems.findIndex(
      (item) => item.type === 'package' && item.package.id === pkg.id && item.customNote === customNote
    );

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      setCartItems(updated);
    } else {
      const newItem: CartItemPrepared = {
        id: `cart-pkg-${Date.now()}-${Math.random()}`,
        type: 'package',
        package: pkg,
        quantity: 1,
        customNote,
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const handleNavigateToCart = () => {
    navigateTo('/cart');
  };

  // Add custom built box to cart
  const handleAddToCartCustom = (customBox: {
    boxStyle: CustomBoxOption;
    selectedItems: CustomBoxOption[];
    cardMessage: string;
    ribbonColor: string;
    totalPrice: number;
  }) => {
    const newItem: CartItemCustom = {
      id: `cart-custom-${Date.now()}-${Math.random()}`,
      type: 'custom',
      boxStyle: customBox.boxStyle,
      selectedItems: customBox.selectedItems,
      cardMessage: customBox.cardMessage,
      ribbonColor: customBox.ribbonColor,
      quantity: 1,
      totalPrice: customBox.totalPrice,
    };
    setCartItems([...cartItems, newItem]);
    
    // Auto navigate to cart when a custom box is completed
    handleNavigateToCart();
  };

  // Quantity updates
  const handleUpdateQuantity = (id: string, delta: number) => {
    const updated = cartItems
      .map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];

    setCartItems(updated);
  };

  // Remove item
  const handleRemoveItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  // Scroll to section
  const handleExplorePackages = () => {
    if (currentPath !== '/') {
      navigateTo('/');
      setTimeout(() => {
        const el = document.getElementById('shop-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('shop-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenCustomizer = (pkg?: PreparedPackage) => {
    if (pkg) {
      setCustomizerPackage(pkg);
    }
    if (currentPath !== '/') {
      navigateTo('/');
      setTimeout(() => {
        const el = document.getElementById('shop-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('shop-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (currentPath === '/admin') {
    if (!session) {
      window.location.href = '/login?redirect=/admin';
      return null;
    }

    const currentRole = userRole || 
                        session?.user?.user_metadata?.role || 
                        localStorage.getItem(`mbm_user_role_${session.user?.id}`) || 
                        localStorage.getItem('mbm_global_role') || 
                        'customer';

    if (currentRole !== 'admin') {
      return (
        <AccessDeniedView
          session={session}
          onNavigate={navigateTo}
          onPromoteToAdmin={async () => {
            if (session?.user?.id) {
              localStorage.setItem(`mbm_user_role_${session.user.id}`, 'admin');
              localStorage.setItem('mbm_global_role', 'admin');
              try {
                await supabase.from('profiles').update({ role: 'admin' }).eq('id', session.user.id);
              } catch {}
              setUserRole('admin');
            }
            navigateTo('/admin');
          }}
        />
      );
    }

    return (
      <div className="min-h-screen w-full bg-[#1f0305] text-white font-inter">
        <AdminDashboard
          isOpen={true}
          onClose={async () => {
            await supabase.auth.signOut();
            localStorage.removeItem('mbm_global_role');
            if (session?.user?.id) {
              localStorage.removeItem(`mbm_user_role_${session.user.id}`);
            }
            window.location.href = '/login';
          }}
          packages={packages}
          customItems={customItems}
          categories={categories}
          giftBoxes={giftBoxes}
          orders={orders}
          onSavePackages={handleSavePackages}
          onDeletePackage={handleDeletePackage}
          onSaveCustomItems={handleSaveCustomItems}
          onDeleteCustomItem={handleDeleteCustomItem}
          onSaveCategories={handleSaveCategories}
          onDeleteCategory={handleDeleteCategory}
          onSaveGiftBoxes={handleSaveGiftBoxes}
          onDeleteGiftBox={handleDeleteGiftBox}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onCreateOrder={handleNewOrderCreated}
          session={session}
        />
      </div>
    );
  }

  if (currentPath.startsWith('/login')) {
    if (session) {
      const searchParams = new URLSearchParams(window.location.search);
      const redirectPath = searchParams.get('redirect') || '/';
      navigateTo(redirectPath);
      return null;
    }
    return <LoginPage />;
  }

  if (currentPath === '/checkout/payment') {
    if (!pendingOrder) {
      navigateTo('/cart');
      return null;
    }
    return (
      <CheckoutPaymentPage
        order={pendingOrder}
        onPaymentSubmitted={handlePaymentSubmitted}
        onBack={() => navigateTo('/cart')}
        onNavigate={navigateTo}
      />
    );
  }

  if (currentPath === '/cart' || currentPath.startsWith('/cart')) {
    return (
      <CartPage
        session={session}
        items={cartItems}
        orders={orders}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCartItems([])}
        onOrderCreated={handleNewOrderCreated}
        onNavigate={navigateTo}
      />
    );
  }

  if (currentPath === '/profile') {
    if (!session) {
      window.location.href = '/login?redirect=/profile';
      return null;
    }
    return (
      <ProfilePage
        session={session}
        onNavigate={navigateTo}
      />
    );
  }

  if (currentPath === '/my-orders' || currentPath === '/orders') {
    return (
      <MyOrdersPage
        orders={orders}
        session={session}
        onNavigate={navigateTo}
      />
    );
  }

  if (currentPath === '/about') {
    return (
      <AboutUsPage
        session={session}
        cartItems={cartItems}
        onOpenCart={handleNavigateToCart}
        onNavigateToLogin={() => navigateTo('/login')}
        onNavigate={navigateTo}
      />
    );
  }

  if (currentPath === '/how-to-order') {
    return (
      <HowToOrderPage
        session={session}
        cartItems={cartItems}
        onOpenCart={handleNavigateToCart}
        onNavigateToLogin={() => navigateTo('/login')}
        onNavigate={navigateTo}
      />
    );
  }

  if (currentPath.startsWith('/package/')) {
    const pkgId = currentPath.replace('/package/', '');
    const pkgData = packages.find((p) => p.id === pkgId) || packages[0];

    if (pkgData) {
      return (
        <PackageDetailPage
          packageData={pkgData}
          allPackages={packages}
          session={session}
          cartItems={cartItems}
          onOpenCart={handleNavigateToCart}
          onNavigateToLogin={() => navigateTo('/login')}
          onNavigateToPackage={(id) => navigateTo(`/package/${id}`)}
          onNavigateHome={() => navigateTo('/')}
          onAddToCartPrepared={handleAddToCartPrepared}
        />
      );
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#8c1119] text-white font-inter selection:bg-amber-400 selection:text-[#8c1119]">
      {/* Top Navbar */}
      <Navbar
        session={session}
        cartItems={cartItems}
        onOpenCart={handleNavigateToCart}
        onNavigateToLogin={() => navigateTo('/login')}
        onNavigate={navigateTo}
      />

      {/* Hero Section */}
      <Hero
        onExplorePackages={handleExplorePackages}
      />

      {/* Unified Gift Shop Body Section */}
      <GiftShopBody
        categories={categories}
        giftBoxes={giftBoxes}
        packages={packages}
        customItems={customItems}
        onAddToCartPrepared={handleAddToCartPrepared}
        onAddToCartCustom={handleAddToCartCustom}
        onViewPackageDetail={(id) => navigateTo(`/package/${id}`)}
      />

      {/* Smart Gift Assistant Finder */}
      <GiftFinder packages={packages} onAddToCart={handleAddToCartPrepared} />

      {/* Customer Reviews & Quality Guarantees */}
      <Reviews />

      {/* Footer */}
      <Footer />
    </div>
  );
}
