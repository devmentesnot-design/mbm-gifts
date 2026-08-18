import React, { useState, useEffect } from 'react';
import { PreparedPackage, CustomBoxOption, GiftCategory, GiftBoxStyle, DEFAULT_CATEGORIES, DEFAULT_GIFT_BOXES, PackageItemDetail, getStoredCategories, saveStoredCategories, deleteStoredCategory, getStoredGiftBoxes, saveStoredGiftBoxes, deleteStoredGiftBox, deleteStoredPackage, deleteStoredCustomItem } from '../data/giftsData';
import { Order, OrderStatus } from '../types/cart';
import { uploadToCloudinary } from '../utils/cloudinary';
import { DatabaseDebug } from './DatabaseDebug';
import {
  X,
  Package,
  Plus,
  Edit2,
  Trash2,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Users,
  Search,
  Check,
  Sparkles,
  LayoutDashboard,
  Clock,
  Eye,
  Gift,
  Phone,
  MapPin,
  FolderTree,
  Box,
  Upload,
  ArrowLeft,
  ChevronRight,
  Menu,
  Image as ImageIcon,
  Tag,
  CheckCircle2,
  Layers,
  Loader2,
  AlertCircle,
  LogOut
} from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  packages: PreparedPackage[];
  customItems: CustomBoxOption[];
  categories?: GiftCategory[];
  giftBoxes?: GiftBoxStyle[];
  orders: Order[];
  onSavePackages: (pkgs: PreparedPackage[]) => void;
  onDeletePackage?: (id: string) => void;
  onSaveCustomItems: (items: CustomBoxOption[]) => void;
  onDeleteCustomItem?: (id: string) => void;
  onSaveCategories?: (categories: GiftCategory[]) => void;
  onDeleteCategory?: (id: string) => void;
  onSaveGiftBoxes?: (boxes: GiftBoxStyle[]) => void;
  onDeleteGiftBox?: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onCreateOrder?: (order: Order) => void;
  session?: any; // Add session prop for debug component
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  packages,
  customItems,
  categories,
  giftBoxes,
  orders,
  onSavePackages,
  onDeletePackage,
  onSaveCustomItems,
  onDeleteCustomItem,
  onSaveCategories,
  onDeleteCategory,
  onSaveGiftBoxes,
  onDeleteGiftBox,
  onUpdateOrderStatus,
  onCreateOrder,
  session,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'packages' | 'customItems' | 'categories' | 'giftBoxes' | 'customers'>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleCloudinaryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadToCloudinary(file);
      onSuccess(url);
    } catch (err: any) {
      alert(`Cloudinary Upload Warning: ${err?.message || 'Upload failed'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  // Categories & Gift Boxes State
  const [categoriesList, setCategoriesList] = useState<GiftCategory[]>(categories || DEFAULT_CATEGORIES);
  const [giftBoxesList, setGiftBoxesList] = useState<GiftBoxStyle[]>(giftBoxes || DEFAULT_GIFT_BOXES);

  useEffect(() => {
    if (categories && categories.length > 0) {
      setCategoriesList(categories);
    } else {
      getStoredCategories().then(cats => {
        if (cats && cats.length > 0) setCategoriesList(cats);
      });
    }
  }, [categories]);

  // Track locally deleted box IDs so the prop sync never restores them
  const deletedBoxIds = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    if (giftBoxes && giftBoxes.length > 0) {
      // Filter out any IDs that were deleted locally (in case prop updates slightly behind DB)
      const filtered = giftBoxes.filter((b) => !deletedBoxIds.current.has(b.id));
      setGiftBoxesList(filtered);
    } else if (!giftBoxes || giftBoxes.length === 0) {
      // Only do a DB fetch if we have NO deleted IDs pending — otherwise keep current list
      if (deletedBoxIds.current.size === 0) {
        getStoredGiftBoxes().then(boxes => {
          if (boxes && boxes.length > 0) setGiftBoxesList(boxes);
        });
      }
    }
  }, [giftBoxes]);

  const updateCategoriesList = (newList: GiftCategory[]) => {
    setCategoriesList(newList);
    if (onSaveCategories) {
      onSaveCategories(newList);
    } else {
      saveStoredCategories(newList);
    }
  };

  const updateGiftBoxesList = (newList: GiftBoxStyle[]) => {
    setGiftBoxesList(newList);
    if (onSaveGiftBoxes) {
      onSaveGiftBoxes(newList);
    } else {
      saveStoredGiftBoxes(newList);
    }
  };

  // Order Search & Filter State
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Package Search & Detailed Modal State
  const [pkgSearchTerm, setPkgSearchTerm] = useState('');
  const [pkgCategoryFilter, setPkgCategoryFilter] = useState<string>('all');
  const [pkgModalOpen, setPkgModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<PreparedPackage | null>(null);
  const [pkgForm, setPkgForm] = useState({
    name: '',
    category: 'Luxury',
    price: '',
    price_usd: '',
    shortDesc: '',
    popularFor: 'Anniversaries & Special Celebrations',
    image: '',
    badge: 'BEST SELLER',
  });
  // Sub-items inside the package detailed form
  const [pkgSubItems, setPkgSubItems] = useState<PackageItemDetail[]>([]);

  // Single Custom Item Search & Modal State
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [itemCategoryFilter, setItemCategoryFilter] = useState<string>('all');
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomBoxOption | null>(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    category: 'Sweets & Chocolates',
    price: '',
    price_usd: '',
    description: '',
    image: '',
  });

  // Category Modal & Sub-navbar Filter State
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [categoryTypeFilter, setCategoryTypeFilter] = useState<string>('all');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<GiftCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState<{
    name: string;
    slug: string;
    description: string;
    type: 'package' | 'custom_item' | 'both';
  }>({
    name: '',
    slug: '',
    description: '',
    type: 'package',
  });

  // Gift Box Modal State
  const [boxModalOpen, setBoxModalOpen] = useState(false);
  const [editingBox, setEditingBox] = useState<GiftBoxStyle | null>(null);
  const [boxForm, setBoxForm] = useState({
    name: '',
    dimensions: '',
    price: '',
    price_usd: '',
    color: '',
    image: '',
    description: '',
  });

  // Manual Order Creation Modal State
  const [createOrderModalOpen, setCreateOrderModalOpen] = useState(false);
  const [orderCustomer, setOrderCustomer] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Addis Ababa',
    zipCode: '1000',
  });
  const [selectedOrderPackages, setSelectedOrderPackages] = useState<{ pkg: PreparedPackage; qty: number }[]>([]);
  const [selectedOrderCustomItems, setSelectedOrderCustomItems] = useState<CustomBoxOption[]>([]);
  const [orderNote, setOrderNote] = useState('');

  if (!isOpen) return null;

  // Helper for FileReader File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setField: (dataUrl: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setField(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper Analytics — ETB (Birr) & USD (Dollar) calculated separately
  const etbOrders = orders.filter((o) => o.currency !== 'USD' && o.buyerMarket !== 'INTERNATIONAL');
  const usdOrders = orders.filter((o) => o.currency === 'USD' || o.buyerMarket === 'INTERNATIONAL');

  const totalRevenueETB = etbOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalRevenueUSD = usdOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const totalOrdersCount = orders.length;
  const avgOrderValueETB = etbOrders.length > 0 ? totalRevenueETB / etbOrders.length : 0;
  const avgOrderValueUSD = usdOrders.length > 0 ? totalRevenueUSD / usdOrders.length : 0;
  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;

  // Filtered Categories by Usage
  const packageCategories = categoriesList.filter((c) => !c.type || c.type === 'package' || c.type === 'both');
  const customItemCategories = categoriesList.filter((c) => !c.type || c.type === 'custom_item' || c.type === 'both');

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      o.customer.email.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      o.customer.phone.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      o.customer.address.toLowerCase().includes(orderSearchTerm.toLowerCase());
    const matchesStatus = orderStatusFilter === 'all' || o.status.toLowerCase() === orderStatusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Customer List (Derived from Orders) — with separate ETB and USD tracking
  const customersMap = new Map<string, {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    totalOrders: number;
    totalSpentETB: number;
    totalSpentUSD: number;
    latestOrderDate: string;
  }>();

  orders.forEach((o) => {
    const key = o.customer.email || o.customer.phone || o.customer.fullName;
    const isUSD = o.currency === 'USD' || o.buyerMarket === 'INTERNATIONAL';
    const existing = customersMap.get(key);
    if (existing) {
      existing.totalOrders += 1;
      if (isUSD) {
        existing.totalSpentUSD += (o.total || 0);
      } else {
        existing.totalSpentETB += (o.total || 0);
      }
    } else {
      customersMap.set(key, {
        fullName: o.customer.fullName,
        email: o.customer.email,
        phone: o.customer.phone || 'N/A',
        address: o.customer.address || 'N/A',
        totalOrders: 1,
        totalSpentETB: isUSD ? 0 : (o.total || 0),
        totalSpentUSD: isUSD ? (o.total || 0) : 0,
        latestOrderDate: o.createdAt,
      });
    }
  });

  const customersList = Array.from(customersMap.values());

  // Handle Category CRUD
  const handleOpenCategoryModal = (cat?: GiftCategory) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        type: cat.type || 'both',
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        slug: '',
        description: '',
        type: 'package',
      });
    }
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name) return;

    if (editingCategory) {
      updateCategoriesList(
        categoriesList.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                name: categoryForm.name,
                slug: categoryForm.slug || categoryForm.name.toLowerCase().replace(/\s+/g, '-'),
                description: categoryForm.description,
                type: categoryForm.type,
              }
            : c
        )
      );
    } else {
      const newCat: GiftCategory = {
        id: `cat-${Date.now()}`,
        name: categoryForm.name,
        slug: categoryForm.slug || categoryForm.name.toLowerCase().replace(/\s+/g, '-'),
        description: categoryForm.description,
        type: categoryForm.type,
      };
      updateCategoriesList([...categoriesList, newCat]);
    }
    setCategoryModalOpen(false);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      const newList = categoriesList.filter((c) => c.id !== id);
      setCategoriesList(newList);
      if (onDeleteCategory) {
        onDeleteCategory(id);
      } else {
        updateCategoriesList(newList);
        deleteStoredCategory(id);
      }
    }
  };

  // Handle Gift Box CRUD
  const handleOpenBoxModal = (box?: GiftBoxStyle) => {
    if (box) {
      setEditingBox(box);
      setBoxForm({
        name: box.name,
        dimensions: box.dimensions,
        price: box.price.toString(),
        price_usd: box.price_usd != null ? box.price_usd.toString() : '',
        color: box.color,
        image: box.image,
        description: box.description,
      });
    } else {
      setEditingBox(null);
      setBoxForm({
        name: '',
        dimensions: '12" x 10" x 5"',
        price: '0',
        price_usd: '0',
        color: 'Red Velvet',
        image: '',
        description: '',
      });
    }
    setBoxModalOpen(true);
  };

  const handleSaveBox = (e: React.FormEvent) => {
    e.preventDefault();
    if (!boxForm.name) return;

    if (editingBox) {
      updateGiftBoxesList(
        giftBoxesList.map((b) =>
          b.id === editingBox.id
            ? {
                ...b,
                name: boxForm.name,
                dimensions: boxForm.dimensions,
                price: parseFloat(boxForm.price) || 0,
                price_usd: boxForm.price_usd ? parseFloat(boxForm.price_usd) : undefined,
                color: boxForm.color,
                image: boxForm.image,
                description: boxForm.description,
              }
            : b
        )
      );
    } else {
      const newBox: GiftBoxStyle = {
        id: `box-${Date.now()}`,
        name: boxForm.name,
        dimensions: boxForm.dimensions || '12" x 10" x 5"',
        price: parseFloat(boxForm.price) || 0,
        price_usd: boxForm.price_usd ? parseFloat(boxForm.price_usd) : undefined,
        color: boxForm.color || 'Custom',
        image: boxForm.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=400&auto=format&fit=crop',
        description: boxForm.description,
      };
      updateGiftBoxesList([...giftBoxesList, newBox]);
    }
    setBoxModalOpen(false);
  };

  const handleDeleteBox = (id: string) => {
    if (confirm('Are you sure you want to delete this gift box style?')) {
      // Track this ID so the prop-sync useEffect doesn't restore it
      deletedBoxIds.current.add(id);
      const newList = giftBoxesList.filter((b) => b.id !== id);
      setGiftBoxesList(newList);
      if (onDeleteGiftBox) {
        onDeleteGiftBox(id);
      } else {
        updateGiftBoxesList(newList);
        deleteStoredGiftBox(id);
      }
    }
  };

  // Handle Ready-Made Package CRUD
  const handleOpenPkgModal = (pkg?: PreparedPackage) => {
    if (pkg) {
      setEditingPkg(pkg);
      setPkgForm({
        name: pkg.name,
        category: pkg.category,
        price: pkg.price.toString(),
        price_usd: pkg.price_usd != null ? pkg.price_usd.toString() : '',
        shortDesc: pkg.shortDesc,
        popularFor: pkg.popularFor || 'Anniversaries & Special Celebrations',
        image: pkg.image,
        badge: pkg.badge || '',
      });

      // Load existing detailed items if available, or convert string array
      if (pkg.itemsIncludedDetailed && pkg.itemsIncludedDetailed.length > 0) {
        setPkgSubItems([...pkg.itemsIncludedDetailed]);
      } else {
        const initialDetails: PackageItemDetail[] = pkg.itemsIncluded.map((name) => ({
          name,
          description: 'Handcrafted luxury component included inside package.',
          image: pkg.image,
        }));
        setPkgSubItems(initialDetails);
      }
    } else {
      setEditingPkg(null);
      const defaultCategory = packageCategories.length > 0 ? packageCategories[0].name : 'Luxury';
      setPkgForm({
        name: '',
        category: defaultCategory,
        price: '',
        price_usd: '',
        shortDesc: '',
        popularFor: 'Anniversaries & Special Celebrations',
        image: '',
        badge: 'BEST SELLER',
      });
      setPkgSubItems([]);
    }
    setPkgModalOpen(true);
  };

  const handleAddSubItemToPackage = () => {
    setPkgSubItems([
      ...pkgSubItems,
      {
        name: '',
        description: '',
        image: '',
      },
    ]);
  };

  const handleUpdateSubItem = (index: number, field: keyof PackageItemDetail, value: string) => {
    const updated = [...pkgSubItems];
    updated[index] = { ...updated[index], [field]: value };
    setPkgSubItems(updated);
  };

  const handleRemoveSubItem = (index: number) => {
    setPkgSubItems(pkgSubItems.filter((_, idx) => idx !== index));
  };

  const handleSavePkgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgForm.name || !pkgForm.price) return;

    const itemsNamesArray = pkgSubItems.map((item) => item.name || 'Luxury Gift Item').filter(Boolean);

    if (editingPkg) {
      const updated = packages.map((p) =>
        p.id === editingPkg.id
          ? {
              ...p,
              name: pkgForm.name,
              category: pkgForm.category,
              price: parseFloat(pkgForm.price),
              price_usd: pkgForm.price_usd ? parseFloat(pkgForm.price_usd) : undefined,
              shortDesc: pkgForm.shortDesc,
              popularFor: pkgForm.popularFor,
              image: pkgForm.image || p.image,
              badge: pkgForm.badge || undefined,
              itemsIncluded: itemsNamesArray,
              itemsIncludedDetailed: pkgSubItems,
            }
          : p
      );
      onSavePackages(updated);
    } else {
      const newPkg: PreparedPackage = {
        id: `pkg-${Date.now()}`,
        name: pkgForm.name,
        category: pkgForm.category,
        price: parseFloat(pkgForm.price),
        price_usd: pkgForm.price_usd ? parseFloat(pkgForm.price_usd) : undefined,
        rating: 5.0,
        reviewsCount: 1,
        shortDesc: pkgForm.shortDesc,
        image: pkgForm.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=400&auto=format&fit=crop',
        badge: pkgForm.badge || 'NEW',
        itemsIncluded: itemsNamesArray,
        itemsIncludedDetailed: pkgSubItems,
        popularFor: pkgForm.popularFor,
      };
      onSavePackages([newPkg, ...packages]);
    }
    setPkgModalOpen(false);
  };

  const handleDeletePkg = (id: string) => {
    if (confirm('Delete this prepared gift package?')) {
      if (onDeletePackage) {
        onDeletePackage(id);
      } else {
        onSavePackages(packages.filter((p) => p.id !== id));
        deleteStoredPackage(id);
      }
    }
  };

  // Handle Custom Item CRUD
  const handleOpenItemModal = (item?: CustomBoxOption) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        category: item.category,
        price: item.price.toString(),
        price_usd: item.price_usd != null ? item.price_usd.toString() : '',
        description: item.description,
        image: item.image,
      });
    } else {
      setEditingItem(null);
      const defaultCategory = customItemCategories.length > 0 ? customItemCategories[0].name : 'Sweets & Chocolates';
      setItemForm({
        name: '',
        category: defaultCategory,
        price: '',
        price_usd: '',
        description: '',
        image: '',
      });
    }
    setItemModalOpen(true);
  };

  const handleSaveItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name || !itemForm.price) return;

    if (editingItem) {
      const updated = customItems.map((i) =>
        i.id === editingItem.id
          ? {
              ...i,
              name: itemForm.name,
              category: itemForm.category,
              price: parseFloat(itemForm.price),
              price_usd: itemForm.price_usd ? parseFloat(itemForm.price_usd) : undefined,
              description: itemForm.description,
              image: itemForm.image || i.image,
            }
          : i
      );
      onSaveCustomItems(updated);
    } else {
      const newItem: CustomBoxOption = {
        id: `item-${Date.now()}`,
        name: itemForm.name,
        category: itemForm.category,
        price: parseFloat(itemForm.price),
        price_usd: itemForm.price_usd ? parseFloat(itemForm.price_usd) : undefined,
        description: itemForm.description,
        image: itemForm.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=400&auto=format&fit=crop',
      };
      onSaveCustomItems([...customItems, newItem]);
    }
    setItemModalOpen(false);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Delete this item option?')) {
      if (onDeleteCustomItem) {
        onDeleteCustomItem(id);
      } else {
        onSaveCustomItems(customItems.filter((i) => i.id !== id));
        deleteStoredCustomItem(id);
      }
    }
  };

  // Manual Order Submission
  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCustomer.fullName || !orderCustomer.email || !orderCustomer.phone) {
      alert('Please fill customer Name, Email, and Phone.');
      return;
    }

    const orderItems: any[] = [];
    let subtotal = 0;

    selectedOrderPackages.forEach(({ pkg, qty }) => {
      orderItems.push({
        id: `item-pkg-${pkg.id}`,
        type: 'package',
        package: pkg,
        quantity: qty,
      });
      subtotal += pkg.price * qty;
    });

    if (selectedOrderCustomItems.length > 0) {
      const boxTotal = selectedOrderCustomItems.reduce((acc, i) => acc + i.price, 0);
      orderItems.push({
        id: `item-custom-${Date.now()}`,
        type: 'custom',
        boxStyle: giftBoxesList[0],
        selectedItems: selectedOrderCustomItems,
        cardMessage: orderNote,
        ribbonColor: 'Gold Satin Ribbon',
        quantity: 1,
        totalPrice: boxTotal,
      });
      subtotal += boxTotal;
    }

    if (orderItems.length === 0) {
      alert('Please select at least one package or single item for this order.');
      return;
    }

    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'Pending',
      customer: {
        fullName: orderCustomer.fullName,
        email: orderCustomer.email,
        phone: orderCustomer.phone,
        address: orderCustomer.address,
        city: orderCustomer.city,
        zipCode: orderCustomer.zipCode,
        giftRecipientName: orderCustomer.fullName,
        giftMessage: orderNote,
      },
      items: orderItems,
      subtotal: subtotal,
      shipping: 0,
      total: subtotal,
      paymentMethod: 'Manual Admin Created',
    };

    if (onCreateOrder) {
      onCreateOrder(newOrder);
    }
    setCreateOrderModalOpen(false);
    setSelectedOrderPackages([]);
    setSelectedOrderCustomItems([]);
    setOrderNote('');
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag, badge: pendingOrdersCount ? `${pendingOrdersCount} new` : null },
    { id: 'packages', label: `Ready-made Packages (${packages.length})`, icon: Package },
    { id: 'customItems', label: `Single Items (${customItems.length})`, icon: Gift },
    { id: 'categories', label: `Categories (${categoriesList.length})`, icon: FolderTree },
    { id: 'giftBoxes', label: `Gift Box Styles (${giftBoxesList.length})`, icon: Box },
    { id: 'customers', label: `Customer Directory (${customersList.length})`, icon: Users },
  ];

  return (
    <div className="min-h-screen w-full bg-[#180305] text-white flex flex-col font-inter selection:bg-amber-400 selection:text-[#8c1119]">
      {/* Top Navbar Header */}
      <header className="h-16 border-b border-white/10 bg-[#240407] px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40 shadow-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="lg:hidden p-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center py-1">
            <img
              src="/logo.png"
              alt="MBM Gifts Admin"
              referrerPolicy="no-referrer"
              className="h-14 sm:h-16 w-auto object-contain drop-shadow-xl"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 hover:border-red-400 text-red-300 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
            title="Sign out of Admin Portal"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>

          <div className="flex items-center gap-2 border-l border-white/10 pl-4">
            <div className="w-8 h-8 rounded-full bg-amber-400 text-[#8c1119] font-bold flex items-center justify-center text-xs">
              AD
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-bold text-white">Administrator</div>
              <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Connected
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-[#200306] border-r border-white/10 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 space-y-1 overflow-y-auto">
            <div className="px-3 py-2 text-[10px] uppercase tracking-widest font-bold text-amber-300/80">
              Management Menu
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-[#8c1119] shadow-lg font-bold'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#8c1119]' : 'text-amber-300'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-emerald-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-white/10 bg-black/20 text-xs text-white/50 space-y-1">
            <div className="font-semibold text-white/70">MBM Admin Suite v2.5</div>
            <div>Category Engine & Detail Forms Enabled</div>
          </div>
        </aside>

        {/* Backdrop for mobile drawer */}
        {isMobileSidebarOpen && (
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          />
        )}

        {/* Right Content Panel */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Database Status Alert */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-2xl p-4 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-blue-200 uppercase tracking-wider">
                        Database Integration Status
                      </h3>
                      <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                        Hybrid Mode
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-white/80">Authentication: <span className="text-emerald-300 font-semibold">Supabase Connected</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-white/80">Profiles: <span className="text-emerald-300 font-semibold">Supabase Connected</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span className="text-white/80">Packages: <span className="text-amber-300 font-semibold">Now Supabase First!</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span className="text-white/80">Orders: <span className="text-amber-300 font-semibold">Now Supabase First!</span></span>
                      </div>
                    </div>
                    <p className="text-[11px] text-blue-200/70 leading-relaxed mt-2">
                      <strong>Updated:</strong> All data operations now save ONLY to Supabase (no localStorage backup). 
                      Check browser console for "✅ Saved to Supabase successfully" messages!
                    </p>
                  </div>
                </div>
              </div>

              {/* Database Debug Panel */}
              <DatabaseDebug session={session} />

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-podium text-2xl sm:text-3xl uppercase font-bold text-white tracking-wide">
                    Executive Dashboard Overview
                  </h2>
                  <p className="text-white/60 text-xs font-inter mt-1">
                    Real-time sales, order volumes, customer statistics, and inventory control.
                  </p>
                </div>
                <button
                  onClick={() => setCreateOrderModalOpen(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Manual Order</span>
                </button>
              </div>

              {/* Stats Cards — Dollar and Birr calculated separately */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#2e0508] border border-white/10 rounded-2xl p-5 flex items-start justify-between shadow-lg">
                  <div>
                    <span className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Total Revenue</span>
                    <div className="mt-1.5 space-y-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-podium text-xl sm:text-2xl text-amber-300 font-bold">
                          {totalRevenueETB.toLocaleString()}
                        </span>
                        <span className="text-xs text-amber-300/80 font-bold">ETB (ብር)</span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-podium text-base sm:text-lg text-emerald-400 font-bold">
                          ${totalRevenueUSD.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-emerald-400/80 font-bold">USD ($)</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 flex-shrink-0">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-[#2e0508] border border-white/10 rounded-2xl p-5 flex items-start justify-between shadow-lg">
                  <div>
                    <span className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Total Orders</span>
                    <div className="font-podium text-2xl sm:text-3xl text-white font-bold mt-1">
                      {totalOrdersCount}
                    </div>
                    <div className="text-[10px] text-white/60 font-semibold mt-1 flex items-center gap-1.5">
                      <span className="text-amber-300">{etbOrders.length} ETB</span>
                      <span>•</span>
                      <span className="text-emerald-400">{usdOrders.length} USD</span>
                    </div>
                    <span className="text-[10px] text-amber-300/90 font-medium block mt-0.5">
                      {pendingOrdersCount} Pending Confirmation
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 flex-shrink-0">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-[#2e0508] border border-white/10 rounded-2xl p-5 flex items-start justify-between shadow-lg">
                  <div>
                    <span className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Average Order Value</span>
                    <div className="mt-1.5 space-y-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-podium text-lg sm:text-xl text-amber-300 font-bold">
                          {avgOrderValueETB.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-xs text-amber-300/80 font-bold">ETB</span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-podium text-sm sm:text-base text-emerald-400 font-bold">
                          ${avgOrderValueUSD.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-emerald-400/80 font-bold">USD</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 flex-shrink-0">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-[#2e0508] border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Active Customers</span>
                    <div className="font-podium text-2xl sm:text-3xl text-white font-bold mt-1">
                      {customersList.length}
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">Registered in Database</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-[#2e0508] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-podium text-lg uppercase font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-300" /> Recent Customer Orders
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-amber-300 hover:underline text-xs font-semibold flex items-center gap-1"
                  >
                    View All Orders ({orders.length}) <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-inter text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-white/50 uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-3">Order ID</th>
                        <th className="py-3 px-3">Customer Contact</th>
                        <th className="py-3 px-3">Location</th>
                        <th className="py-3 px-3">Amount</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-3 font-bold text-amber-300">{ord.id}</td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-white">{ord.customer.fullName}</div>
                            <div className="text-[11px] text-white/60 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-amber-300" /> {ord.customer.phone || 'No phone'}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-white/80 max-w-[180px] truncate">
                            <div className="flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 text-amber-300 flex-shrink-0" />
                              <span className="truncate">{ord.customer.address}, {ord.customer.city}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-bold text-amber-300">
                            {ord.currency === 'USD' || ord.buyerMarket === 'INTERNATIONAL'
                              ? `$${ord.total.toFixed(2)} USD`
                              : `${ord.total.toLocaleString()} ብር`}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                ord.status === 'Pending'
                                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                                  : ord.status === 'Delivered'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => setSelectedOrderDetails(ord)}
                              className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-amber-300 font-bold text-[11px]"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-white/40">
                            No orders placed yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-podium text-2xl sm:text-3xl uppercase font-bold text-white tracking-wide">
                    Orders Management ({orders.length})
                  </h2>
                  <p className="text-white/60 text-xs font-inter mt-1">
                    Review orders, inspect customer phone numbers and delivery addresses, and update status.
                  </p>
                </div>
                <button
                  onClick={() => setCreateOrderModalOpen(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create Manual Order</span>
                </button>
              </div>

              {/* Filters */}
              <div className="bg-[#2e0508] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-lg">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search by ID, name, phone, address..."
                    value={orderSearchTerm}
                    onChange={(e) => setOrderSearchTerm(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  {['all', 'pending', 'delivered', 'cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap ${
                        orderStatusFilter === st
                          ? 'bg-amber-400 border-amber-400 text-[#8c1119]'
                          : 'bg-black/20 border-white/10 text-white/70 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-[#2e0508] border border-white/10 rounded-2xl p-6 shadow-xl overflow-x-auto">
                <table className="w-full text-left font-inter text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Order ID</th>
                      <th className="py-3 px-3">Customer & Contact</th>
                      <th className="py-3 px-3">Delivery Location</th>
                      <th className="py-3 px-3">Items</th>
                      <th className="py-3 px-3">Total</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 px-3 font-bold text-amber-300">{ord.id}</td>
                        <td className="py-4 px-3">
                          <div className="font-bold text-white">{ord.customer.fullName}</div>
                          <div className="text-[11px] text-amber-300/90 font-medium flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3 h-3 text-amber-300" />
                            <span>{ord.customer.phone || 'No phone provided'}</span>
                          </div>
                          <div className="text-[11px] text-white/50">{ord.customer.email}</div>
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex items-start gap-1.5 text-white/80 max-w-xs">
                            <MapPin className="w-3.5 h-3.5 text-amber-300 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-semibold">{ord.customer.address}</div>
                              <div className="text-[10px] text-white/50">{ord.customer.city}, {ord.customer.zipCode}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-3 text-white/80 font-medium">
                          {ord.items.length} item{ord.items.length !== 1 ? 's' : ''}
                        </td>
                        <td className="py-4 px-3">
                          <div className="font-bold text-amber-300 text-sm">
                            {ord.currency === 'USD' || ord.buyerMarket === 'INTERNATIONAL'
                              ? `$${ord.total.toFixed(2)} USD`
                              : `${ord.total.toLocaleString()} ብር`}
                          </div>
                          <span className="text-[10px] text-white/50 block">
                            {ord.buyerMarket === 'INTERNATIONAL' ? '🌍 Diaspora' : '🇪🇹 Local'}
                          </span>
                        </td>
                        <td className="py-4 px-3">
                          <select
                            value={ord.status}
                            onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                            className="bg-black/50 border border-white/20 rounded px-2 py-1 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-4 px-3 text-right">
                          <button
                            onClick={() => setSelectedOrderDetails(ord)}
                            className="px-3.5 py-1.5 rounded-lg bg-amber-400/10 border border-amber-400/30 hover:border-amber-400 text-amber-300 font-bold text-xs"
                          >
                            Full Details
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-white/40">
                          No orders matched your search filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: READY-MADE PACKAGES WITH CATEGORY NAV BAR */}
          {activeTab === 'packages' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-podium text-2xl sm:text-3xl uppercase font-bold text-white tracking-wide">
                    Ready-made Gift Packages ({packages.length})
                  </h2>
                  <p className="text-white/60 text-xs font-inter mt-1">
                    Manage curated gift bundles, dynamic package categories, and upload separate images & descriptions for each item inside.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenPkgModal()}
                  className="bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create Ready-made Package</span>
                </button>
              </div>

              {/* Category Sub-Navbar for Packages */}
              <div className="bg-[#2a0508]/80 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-thin">
                  <button
                    onClick={() => setPkgCategoryFilter('all')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold font-inter whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                      pkgCategoryFilter === 'all'
                        ? 'bg-amber-400 text-[#8c1119] shadow-lg scale-105 font-extrabold'
                        : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10'
                    }`}
                  >
                    <span>All Packages</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${pkgCategoryFilter === 'all' ? 'bg-[#8c1119] text-amber-300' : 'bg-black/40 text-white/70'}`}>
                      {packages.length}
                    </span>
                  </button>

                  {packageCategories.map((cat) => {
                    const count = packages.filter((p) => p.category?.toLowerCase() === cat.name.toLowerCase()).length;
                    const isActive = pkgCategoryFilter.toLowerCase() === cat.name.toLowerCase();
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setPkgCategoryFilter(cat.name)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold font-inter whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                          isActive
                            ? 'bg-amber-400 text-[#8c1119] shadow-lg scale-105 font-extrabold'
                            : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-[#8c1119] text-amber-300' : 'bg-black/40 text-white/70'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="relative min-w-[220px]">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-white/40" />
                  <input
                    type="text"
                    value={pkgSearchTerm}
                    onChange={(e) => setPkgSearchTerm(e.target.value)}
                    placeholder="Search packages..."
                    className="w-full bg-black/40 border border-white/20 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Packages Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {packages
                  .filter((pkg) => {
                    const matchesCategory = pkgCategoryFilter === 'all' || pkg.category?.toLowerCase() === pkgCategoryFilter.toLowerCase();
                    const matchesSearch = !pkgSearchTerm || pkg.name.toLowerCase().includes(pkgSearchTerm.toLowerCase()) || pkg.shortDesc?.toLowerCase().includes(pkgSearchTerm.toLowerCase());
                    return matchesCategory && matchesSearch;
                  })
                  .map((pkg) => (
                    <div
                      key={pkg.id}
                      className="bg-[#2e0508] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl group"
                    >
                      <div className="relative h-44 bg-black/40 overflow-hidden">
                        <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {pkg.badge && (
                          <span className="absolute top-3 left-3 bg-amber-400 text-[#8c1119] text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full shadow">
                            {pkg.badge}
                          </span>
                        )}
                        <span className="absolute bottom-3 right-3 bg-black/80 text-amber-300 border border-white/20 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {pkg.itemsIncludedDetailed?.length || pkg.itemsIncluded.length} Items Inside
                        </span>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] text-amber-300 font-bold uppercase">{pkg.category}</div>
                          <h3 className="font-podium text-lg uppercase font-bold text-white mt-1">{pkg.name}</h3>
                          <p className="text-white/60 text-xs font-inter line-clamp-2 mt-1">{pkg.shortDesc}</p>
                        </div>

                        <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                          <span className="font-bold text-amber-300 text-lg">${pkg.price.toFixed(2)}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenPkgModal(pkg)}
                              className="p-2 rounded-lg bg-white/10 hover:bg-amber-400 hover:text-[#8c1119] text-white transition-colors cursor-pointer"
                              title="Edit Package & Internal Items"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePkg(pkg.id)}
                              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white transition-colors cursor-pointer"
                              title="Delete Package"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 4: SINGLE CUSTOM ITEMS WITH CATEGORY NAV BAR */}
          {activeTab === 'customItems' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-podium text-2xl sm:text-3xl uppercase font-bold text-white tracking-wide">
                    Single Custom Gift Items ({customItems.length})
                  </h2>
                  <p className="text-white/60 text-xs font-inter mt-1">
                    Upload and manage individual item options for custom box builders, categorized using your Category Menu.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenItemModal()}
                  className="bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Single Item</span>
                </button>
              </div>

              {/* Category Sub-Navbar for Single Items */}
              <div className="bg-[#2a0508]/80 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-thin">
                  <button
                    onClick={() => setItemCategoryFilter('all')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold font-inter whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                      itemCategoryFilter === 'all'
                        ? 'bg-amber-400 text-[#8c1119] shadow-lg scale-105 font-extrabold'
                        : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10'
                    }`}
                  >
                    <span>All Items</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${itemCategoryFilter === 'all' ? 'bg-[#8c1119] text-amber-300' : 'bg-black/40 text-white/70'}`}>
                      {customItems.length}
                    </span>
                  </button>

                  {customItemCategories.map((cat) => {
                    const count = customItems.filter((i) => i.category?.toLowerCase() === cat.name.toLowerCase()).length;
                    const isActive = itemCategoryFilter.toLowerCase() === cat.name.toLowerCase();
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setItemCategoryFilter(cat.name)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold font-inter whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                          isActive
                            ? 'bg-amber-400 text-[#8c1119] shadow-lg scale-105 font-extrabold'
                            : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-[#8c1119] text-amber-300' : 'bg-black/40 text-white/70'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="relative min-w-[220px]">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-white/40" />
                  <input
                    type="text"
                    value={itemSearchTerm}
                    onChange={(e) => setItemSearchTerm(e.target.value)}
                    placeholder="Search custom items..."
                    className="w-full bg-black/40 border border-white/20 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {customItems
                  .filter((item) => {
                    const matchesCategory = itemCategoryFilter === 'all' || item.category?.toLowerCase() === itemCategoryFilter.toLowerCase();
                    const matchesSearch = !itemSearchTerm || item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()) || item.description?.toLowerCase().includes(itemSearchTerm.toLowerCase());
                    return matchesCategory && matchesSearch;
                  })
                  .map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#2e0508] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl group"
                    >
                      <div className="relative h-40 bg-black/40 overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute top-3 left-3 bg-black/80 border border-white/20 text-amber-300 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                          {item.category}
                        </span>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-podium text-base uppercase font-bold text-white">{item.name}</h3>
                          <p className="text-white/60 text-xs font-inter line-clamp-2 mt-1">{item.description}</p>
                        </div>

                        <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                          <span className="font-bold text-amber-300 text-lg">${item.price.toFixed(2)}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenItemModal(item)}
                              className="p-2 rounded-lg bg-white/10 hover:bg-amber-400 hover:text-[#8c1119] text-white transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 5: CATEGORIES MENU WITH TYPE NAV BAR */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-podium text-2xl sm:text-3xl uppercase font-bold text-white tracking-wide">
                    Master Categories Menu ({categoriesList.length})
                  </h2>
                  <p className="text-white/60 text-xs font-inter mt-1">
                    Create store categories and specify whether they apply to Ready-Made Gift Packages, Single Items, or Both. Newly added categories automatically populate product forms.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenCategoryModal()}
                  className="bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create Category</span>
                </button>
              </div>

              {/* Sub-Navbar for Master Categories */}
              <div className="bg-[#2a0508]/80 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-thin">
                  {[
                    { id: 'all', label: 'All Categories', count: categoriesList.length },
                    { id: 'package', label: 'Ready-Made Packages', count: categoriesList.filter((c) => c.type === 'package').length },
                    { id: 'custom_item', label: 'Single Items', count: categoriesList.filter((c) => c.type === 'custom_item').length },
                    { id: 'both', label: 'Universal (Both)', count: categoriesList.filter((c) => c.type === 'both' || !c.type).length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setCategoryTypeFilter(tab.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold font-inter whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                        categoryTypeFilter === tab.id
                          ? 'bg-amber-400 text-[#8c1119] shadow-lg scale-105 font-extrabold'
                          : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${categoryTypeFilter === tab.id ? 'bg-[#8c1119] text-amber-300' : 'bg-black/40 text-white/70'}`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[220px]">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-white/40" />
                  <input
                    type="text"
                    value={categorySearchTerm}
                    onChange={(e) => setCategorySearchTerm(e.target.value)}
                    placeholder="Search categories..."
                    className="w-full bg-black/40 border border-white/20 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Categories Display Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {categoriesList
                  .filter((cat) => {
                    const matchesType = categoryTypeFilter === 'all' || cat.type === categoryTypeFilter || (categoryTypeFilter === 'both' && (!cat.type || cat.type === 'both'));
                    const matchesSearch = !categorySearchTerm || cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) || cat.description?.toLowerCase().includes(categorySearchTerm.toLowerCase());
                    return matchesType && matchesSearch;
                  })
                  .map((cat) => (
                    <div
                      key={cat.id}
                      className="bg-[#2e0508] border border-white/10 rounded-2xl overflow-hidden p-5 flex flex-col justify-between shadow-xl"
                    >
                      <div>
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 flex-shrink-0">
                            <FolderTree className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-podium text-lg uppercase font-bold text-white">{cat.name}</h3>
                            </div>
                            <span className="text-[10px] text-amber-300/80 font-mono font-bold block mt-0.5">/{cat.slug}</span>
                            <p className="text-white/60 text-xs font-inter mt-1 leading-snug">{cat.description}</p>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-white/50">Applies To:</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            cat.type === 'package'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : cat.type === 'custom_item'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              : 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                          }`}>
                            {cat.type === 'package' ? 'Ready-made Packages' : cat.type === 'custom_item' ? 'Single Custom Items' : 'Universal (Packages & Items)'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenCategoryModal(cat)}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-amber-400 hover:text-[#8c1119] text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 6: GIFT BOX STYLES */}
          {activeTab === 'giftBoxes' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-podium text-2xl sm:text-3xl uppercase font-bold text-white tracking-wide">
                    Gift Box Styles ({giftBoxesList.length})
                  </h2>
                  <p className="text-white/60 text-xs font-inter mt-1">
                    Manage physical box containers, velvet hampers, cedar chests, and outer dimensions.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenBoxModal()}
                  className="bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Box Style</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {giftBoxesList.map((box) => (
                  <div
                    key={box.id}
                    className="bg-[#2e0508] border border-white/10 rounded-2xl overflow-hidden p-5 flex flex-col justify-between shadow-xl"
                  >
                    <div>
                      <div className="h-40 rounded-xl overflow-hidden bg-black/40 mb-4 border border-white/10">
                        <img src={box.image} alt={box.name} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="font-podium text-lg uppercase font-bold text-white">{box.name}</h3>
                      <div className="text-xs text-amber-300 font-bold mt-1">
                        {box.dimensions} • {box.color}
                      </div>
                      <p className="text-white/60 text-xs font-inter mt-2 line-clamp-2">{box.description}</p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="font-bold text-amber-300 text-lg">
                        {box.price === 0 ? 'Complimentary' : `+$${box.price.toFixed(2)}`}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenBoxModal(box)}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-amber-400 hover:text-[#8c1119] text-white text-xs font-bold transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBox(box.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white text-xs font-bold transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: CUSTOMER DIRECTORY */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-podium text-2xl sm:text-3xl uppercase font-bold text-white tracking-wide">
                  Customer Directory ({customersList.length})
                </h2>
                <p className="text-white/60 text-xs font-inter mt-1">
                  Aggregated directory of all customers who have placed orders, complete with phone numbers and delivery locations.
                </p>
              </div>

              <div className="bg-[#2e0508] border border-white/10 rounded-2xl p-6 shadow-xl overflow-x-auto">
                <table className="w-full text-left font-inter text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Customer Name</th>
                      <th className="py-3 px-3">Phone Number</th>
                      <th className="py-3 px-3">Email Address</th>
                      <th className="py-3 px-3">Delivery Address</th>
                      <th className="py-3 px-3">Total Orders</th>
                      <th className="py-3 px-3 text-right">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {customersList.map((c, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 px-3 font-bold text-white">{c.fullName}</td>
                        <td className="py-4 px-3 font-semibold text-amber-300">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-amber-300" />
                            <span>{c.phone}</span>
                          </div>
                        </td>
                        <td className="py-4 px-3 text-white/70">{c.email}</td>
                        <td className="py-4 px-3 text-white/80">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
                            <span>{c.address}</span>
                          </div>
                        </td>
                        <td className="py-4 px-3 font-bold text-white">{c.totalOrders} order{c.totalOrders !== 1 ? 's' : ''}</td>
                        <td className="py-4 px-3 text-right font-bold text-xs space-y-0.5">
                          {c.totalSpentETB > 0 && (
                            <div className="text-amber-300 font-bold text-sm">
                              {c.totalSpentETB.toLocaleString()} <span className="text-[10px] text-amber-300/80 font-normal">ብር</span>
                            </div>
                          )}
                          {c.totalSpentUSD > 0 && (
                            <div className="text-emerald-400 font-bold text-sm">
                              ${c.totalSpentUSD.toFixed(2)} <span className="text-[10px] text-emerald-400/80 font-normal">USD</span>
                            </div>
                          )}
                          {c.totalSpentETB === 0 && c.totalSpentUSD === 0 && (
                            <div className="text-white/40">0 ብር</div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {customersList.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-white/40">
                          No customer records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CATEGORY CREATION / EDIT MODAL */}
      {/* ========================================================================= */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-inter">
          <div className="bg-[#2c0407] border border-amber-400/40 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl animate-scale-in">
            <button
              onClick={() => setCategoryModalOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-full bg-black/40 hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-podium text-xl uppercase font-bold text-white mb-1">
              {editingCategory ? 'Edit Store Category' : 'Create New Master Category'}
            </h3>
            <p className="text-white/60 text-xs mb-5">
              Specify category type to automatically link it with Ready-Made Packages or Single Custom Items.
            </p>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-amber-300 font-bold mb-1">
                  Category Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCategoryForm({
                      ...categoryForm,
                      name: val,
                      slug: val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-0-]/g, ''),
                    });
                  }}
                  placeholder="e.g. Anniversary Luxe or Artisan Chocolates"
                  className="w-full bg-black/50 border border-white/20 rounded-lg p-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-amber-300 font-bold mb-1">
                  Category Usage / Applies To <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCategoryForm({ ...categoryForm, type: 'package' })}
                    className={`p-2.5 rounded-lg border text-xs font-bold text-center transition-all ${
                      categoryForm.type === 'package'
                        ? 'bg-amber-400 text-[#8c1119] border-amber-400'
                        : 'bg-black/30 border-white/20 text-white/70 hover:text-white'
                    }`}
                  >
                    Ready-made Packages
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategoryForm({ ...categoryForm, type: 'custom_item' })}
                    className={`p-2.5 rounded-lg border text-xs font-bold text-center transition-all ${
                      categoryForm.type === 'custom_item'
                        ? 'bg-amber-400 text-[#8c1119] border-amber-400'
                        : 'bg-black/30 border-white/20 text-white/70 hover:text-white'
                    }`}
                  >
                    Single Custom Items
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategoryForm({ ...categoryForm, type: 'both' })}
                    className={`p-2.5 rounded-lg border text-xs font-bold text-center transition-all ${
                      categoryForm.type === 'both'
                        ? 'bg-amber-400 text-[#8c1119] border-amber-400'
                        : 'bg-black/30 border-white/20 text-white/70 hover:text-white'
                    }`}
                  >
                    Both (Universal)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-amber-300 font-bold mb-1">URL Slug</label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  placeholder="e.g. anniversary-luxe"
                  className="w-full bg-black/50 border border-white/20 rounded-lg p-2.5 text-sm text-white/80 font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-amber-300 font-bold mb-1">Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Brief overview describing this gift category..."
                  className="w-full bg-black/50 border border-white/20 rounded-lg p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none h-20 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#8c1119] text-xs font-bold uppercase tracking-wider shadow"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: READY-MADE GIFT PACKAGE DETAILED FORM & SUB-ITEM IMAGE BUILDER */}
      {/* ========================================================================= */}
      {pkgModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-inter">
          <div className="bg-[#2c0407] border border-amber-400/40 rounded-2xl max-w-4xl w-full p-6 sm:p-8 relative shadow-2xl animate-scale-in my-auto max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setPkgModalOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-full bg-black/40 hover:bg-white/10 z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="font-podium text-2xl uppercase font-bold text-white mb-1">
              {editingPkg ? 'Edit Ready-made Package Details' : 'Create New Ready-made Gift Package'}
            </h3>
            <p className="text-white/60 text-xs mb-6">
              Configure package information, pick category from Category Menu, and upload separate descriptions & images for EACH item included inside.
            </p>

            <form onSubmit={handleSavePkgSubmit} className="space-y-6">
              {/* SECTION 1: Core Package Details */}
              <div className="bg-black/30 border border-white/10 rounded-xl p-5 space-y-4">
                <h4 className="text-xs uppercase tracking-widest text-amber-300 font-bold border-b border-white/10 pb-2 flex items-center gap-2">
                  <Package className="w-4 h-4" /> 1. Core Package Information
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-amber-300 font-bold mb-1">
                      Package Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={pkgForm.name}
                      onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
                      placeholder="e.g. The Royal Crimson Luxury Box"
                      className="w-full bg-black/50 border border-white/20 rounded-lg p-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-amber-300 font-bold mb-1">
                      Category (From Category Menu) <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={pkgForm.category}
                      onChange={(e) => setPkgForm({ ...pkgForm, category: e.target.value })}
                      className="w-full bg-black/50 border border-white/20 rounded-lg p-2.5 text-sm text-amber-300 font-bold focus:border-amber-400 focus:outline-none"
                    >
                      {packageCategories.map((c) => (
                        <option key={c.id} value={c.name} className="bg-[#2c0407] text-white">
                          {c.name}
                        </option>
                      ))}
                      {/* Fallback option if custom text */}
                      {!packageCategories.some((c) => c.name === pkgForm.category) && (
                        <option value={pkgForm.category} className="bg-[#2c0407] text-white">
                          {pkgForm.category}
                        </option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-amber-300 font-bold mb-1">
                      Local Price (ETB / ብር) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={pkgForm.price}
                      onChange={(e) => setPkgForm({ ...pkgForm, price: e.target.value })}
                      placeholder="e.g. 2500"
                      className="w-full bg-black/50 border border-white/20 rounded-lg p-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-amber-300 font-bold mb-1">
                      International Price ($ USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={pkgForm.price_usd}
                      onChange={(e) => setPkgForm({ ...pkgForm, price_usd: e.target.value })}
                      placeholder="e.g. 45.00"
                      className="w-full bg-black/50 border border-white/20 rounded-lg p-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-amber-300 font-bold mb-1">Badge Tag</label>
                    <input
                      type="text"
                      value={pkgForm.badge}
                      onChange={(e) => setPkgForm({ ...pkgForm, badge: e.target.value })}
                      placeholder="e.g. BEST SELLER, POPULAR"
                      className="w-full bg-black/50 border border-white/20 rounded-lg p-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-amber-300 font-bold mb-1">Popular For</label>
                    <input
                      type="text"
                      value={pkgForm.popularFor}
                      onChange={(e) => setPkgForm({ ...pkgForm, popularFor: e.target.value })}
                      placeholder="e.g. Anniversaries & Celebrations"
                      className="w-full bg-black/50 border border-white/20 rounded-lg p-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase text-amber-300 font-bold mb-1">Package Overview Description</label>
                  <textarea
                    value={pkgForm.shortDesc}
                    onChange={(e) => setPkgForm({ ...pkgForm, shortDesc: e.target.value })}
                    placeholder="Provide a compelling luxury summary of this complete gift box bundle..."
                    className="w-full bg-black/50 border border-white/20 rounded-lg p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none h-20 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase text-amber-300 font-bold mb-1">Main Package Hero Image</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pkgForm.image}
                      onChange={(e) => setPkgForm({ ...pkgForm, image: e.target.value })}
                      placeholder="Cloudinary image URL or paste link..."
                      className="flex-1 bg-black/50 border border-white/20 rounded-lg p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                    <label className="bg-amber-400 hover:bg-amber-300 text-[#8c1119] px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all">
                      {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span>Cloudinary Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleCloudinaryUpload(e, (url) => setPkgForm({ ...pkgForm, image: url }))}
                      />
                    </label>
                  </div>
                  {pkgForm.image && (
                    <div className="mt-2 h-28 rounded-lg overflow-hidden border border-white/20 bg-black/40 max-w-xs">
                      <img src={pkgForm.image} alt="Package Hero Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 2: Detailed Sub-Items Manager (Individual Images & Descriptions) */}
              <div className="bg-black/30 border border-white/10 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-amber-300 font-bold flex items-center gap-2">
                      <Layers className="w-4 h-4" /> 2. Items Included Inside ({pkgSubItems.length} Sub-Items)
                    </h4>
                    <p className="text-[11px] text-white/50">
                      Upload individual photos and enter detailed descriptions for each item inside this package.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSubItemToPackage}
                    className="bg-amber-400 hover:bg-amber-300 text-[#8c1119] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {pkgSubItems.map((subItem, index) => (
                    <div
                      key={index}
                      className="bg-black/40 border border-white/15 rounded-xl p-4 relative space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/30">
                          Included Item #{index + 1}
                        </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubItem(index)}
                            className="text-red-400 hover:text-red-200 text-xs font-bold flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase text-white/70 font-bold mb-1">
                            Item Name <span className="text-red-400">*</span>
                          </label>
                          <select
                            required
                            value={subItem.name}
                            onChange={(e) => {
                              const selectedItem = customItems.find(item => item.name === e.target.value);
                              if (selectedItem) {
                                handleUpdateSubItem(index, 'name', selectedItem.name);
                                handleUpdateSubItem(index, 'image', selectedItem.image);
                                handleUpdateSubItem(index, 'description', selectedItem.description);
                              } else {
                                handleUpdateSubItem(index, 'name', e.target.value);
                              }
                            }}
                            className="w-full bg-black/60 border border-white/20 rounded-lg p-2 text-xs text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                          >
                            <option value="">-- Select from Single Items --</option>
                            {customItems.map((item) => (
                              <option key={item.id} value={item.name}>
                                {item.name}
                              </option>
                            ))}
                            <option value="__custom__">+ Enter Custom Item Name</option>
                          </select>
                          {subItem.name === '__custom__' && (
                            <input
                              type="text"
                              placeholder="Enter custom item name..."
                              className="w-full bg-black/60 border border-amber-400/40 rounded-lg p-2 text-xs text-white focus:border-amber-400 focus:outline-none mt-2"
                              onChange={(e) => handleUpdateSubItem(index, 'name', e.target.value)}
                            />
                          )}
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase text-white/70 font-bold mb-1">
                            Item Image (Upload or URL)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={subItem.image}
                              onChange={(e) => handleUpdateSubItem(index, 'image', e.target.value)}
                              placeholder="Image URL..."
                              className="flex-1 bg-black/60 border border-white/20 rounded-lg p-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                            />
                            <label className="bg-amber-400 hover:bg-amber-300 text-[#8c1119] px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow transition-all">
                              {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                              <span className="text-[10px]">Cloudinary</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleCloudinaryUpload(e, (url) => handleUpdateSubItem(index, 'image', url))
                                }
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        {subItem.image && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/20 bg-black/50 flex-shrink-0">
                            <img src={subItem.image} alt={subItem.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <label className="block text-[10px] uppercase text-white/70 font-bold mb-1">
                            Detailed Description
                          </label>
                          <input
                            type="text"
                            value={subItem.description}
                            onChange={(e) => handleUpdateSubItem(index, 'description', e.target.value)}
                            placeholder="e.g. Hand-poured 100% soy wax infused with French lavender essential oil."
                            className="w-full bg-black/60 border border-white/20 rounded-lg p-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPkgModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#8c1119] text-xs font-bold uppercase tracking-wider shadow-lg"
                >
                  Save Package & Detailed Items
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: SINGLE CUSTOM ITEM CREATION / EDIT MODAL */}
      {/* ========================================================================= */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-inter">
          <div className="bg-[#2c0407] border border-amber-400/40 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl animate-scale-in">
            <button
              onClick={() => setItemModalOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-full bg-black/40 hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-podium text-xl uppercase font-bold text-white mb-1">
              {editingItem ? 'Edit Single Custom Item' : 'Add Single Custom Gift Component'}
            </h3>
            <p className="text-white/60 text-xs mb-5">
              Add individual items that customers can select inside the custom box builder.
            </p>

            <form onSubmit={handleSaveItemSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-amber-300 font-bold mb-1">
                  Item Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="e.g. Artisan Swiss Truffles"
                  className="w-full bg-black/50 border border-white/20 rounded-lg p-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs uppercase text-amber-300 font-bold mb-1">
                    Category (From Category Menu) <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                    className="w-full bg-black/50 border border-white/20 rounded-lg p-2.5 text-xs text-amber-300 font-bold focus:border-amber-400 focus:outline-none"
                  >
                    {customItemCategories.map((c) => (
                      <option key={c.id} value={c.name} className="bg-[#2c0407] text-white">
                        {c.name}
                      </option>
                    ))}
                    {!customItemCategories.some((c) => c.name === itemForm.category) && (
                      <option value={itemForm.category} className="bg-[#2c0407] text-white">
                        {itemForm.category}
                      </option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase text-amber-300 font-bold mb-1">
                    Local Price (ETB / ብር) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    placeholder="e.g. 850"
                    className="w-full bg-black/50 border border-white/20 rounded-lg p-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase text-amber-300 font-bold mb-1">
                    International Price ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemForm.price_usd}
                    onChange={(e) => setItemForm({ ...itemForm, price_usd: e.target.value })}
                    placeholder="e.g. 15.00"
                    className="w-full bg-black/50 border border-white/20 rounded-lg p-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-amber-300 font-bold mb-1">Description</label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  placeholder="Detailed description of this custom item option..."
                  className="w-full bg-black/50 border border-white/20 rounded-lg p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-amber-300 font-bold mb-1">Item Image</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={itemForm.image}
                    onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-black/50 border border-white/20 rounded-lg p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                  <label className="bg-amber-400 hover:bg-amber-300 text-[#8c1119] px-3 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow transition-all">
                    {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>Cloudinary</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleCloudinaryUpload(e, (url) => setItemForm({ ...itemForm, image: url }))}
                    />
                  </label>
                </div>
                {itemForm.image && (
                  <div className="mt-2 h-20 rounded-lg overflow-hidden border border-white/20 bg-black/40">
                    <img src={itemForm.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setItemModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#8c1119] text-xs font-bold uppercase tracking-wider shadow"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: GIFT BOX STYLE CREATION / EDIT MODAL */}
      {/* ========================================================================= */}
      {boxModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-inter">
          <div className="bg-[#2c0407] border border-amber-400/40 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl animate-scale-in">
            <button
              onClick={() => setBoxModalOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-full bg-black/40 hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-podium text-xl uppercase font-bold text-white mb-1">
              {editingBox ? 'Edit Gift Box Style' : 'Add Gift Box Style'}
            </h3>
            <p className="text-white/60 text-xs mb-5">
              Define physical container dimensions, ribbon material, and box prices.
            </p>

            <form onSubmit={handleSaveBox} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-amber-300 font-bold mb-1">Box Style Title</label>
                <input
                  type="text"
                  required
                  value={boxForm.name}
                  onChange={(e) => setBoxForm({ ...boxForm, name: e.target.value })}
                  placeholder="e.g. Signature Velvet Keepsake Box"
                  className="w-full bg-black/50 border border-white/20 rounded-lg p-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs uppercase text-amber-300 font-bold mb-1">Dimensions</label>
                  <input
                    type="text"
                    value={boxForm.dimensions}
                    onChange={(e) => setBoxForm({ ...boxForm, dimensions: e.target.value })}
                    placeholder="12 x 10 x 5"
                    className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-amber-300 font-bold mb-1">Color / Finish</label>
                  <input
                    type="text"
                    value={boxForm.color}
                    onChange={(e) => setBoxForm({ ...boxForm, color: e.target.value })}
                    placeholder="Crimson Red"
                    className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs uppercase text-amber-300 font-bold mb-1">Local Price (ETB)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={boxForm.price}
                    onChange={(e) => setBoxForm({ ...boxForm, price: e.target.value })}
                    placeholder="0 for free"
                    className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-amber-300 font-bold mb-1">International ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={boxForm.price_usd}
                    onChange={(e) => setBoxForm({ ...boxForm, price_usd: e.target.value })}
                    placeholder="0 for free"
                    className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-amber-300 font-bold mb-1">Description</label>
                <textarea
                  value={boxForm.description}
                  onChange={(e) => setBoxForm({ ...boxForm, description: e.target.value })}
                  placeholder="Description of box material, lining, and latch..."
                  className="w-full bg-black/50 border border-white/20 rounded-lg p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-amber-300 font-bold mb-1">Box Photo</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={boxForm.image}
                    onChange={(e) => setBoxForm({ ...boxForm, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-black/50 border border-white/20 rounded-lg p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                  <label className="bg-amber-400 hover:bg-amber-300 text-[#8c1119] px-3 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow transition-all">
                    {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>Cloudinary</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleCloudinaryUpload(e, (url) => setBoxForm({ ...boxForm, image: url }))}
                    />
                  </label>
                </div>
                {boxForm.image && (
                  <div className="mt-2 h-20 rounded-lg overflow-hidden border border-white/20 bg-black/40">
                    <img src={boxForm.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBoxModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#8c1119] text-xs font-bold uppercase tracking-wider shadow"
                >
                  Save Gift Box
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: MANUAL ORDER CREATION FORM */}
      {/* ========================================================================= */}
      {createOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-inter">
          <div className="bg-[#2c0407] border border-amber-400/40 rounded-2xl max-w-3xl w-full p-6 sm:p-8 relative shadow-2xl animate-scale-in my-auto max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setCreateOrderModalOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-full bg-black/40 hover:bg-white/10 z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="font-podium text-2xl uppercase font-bold text-white mb-1">
              Create Manual Customer Order
            </h3>
            <p className="text-white/60 text-xs mb-6">
              Enter customer contact information, phone, delivery location, and select packages or custom gift items.
            </p>

            <form onSubmit={handleCreateOrderSubmit} className="space-y-6">
              {/* Customer Info */}
              <div className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-3">
                <h4 className="text-xs uppercase text-amber-300 font-bold tracking-wider">Customer & Delivery Info</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase text-white/70 font-bold mb-1">Customer Name *</label>
                    <input
                      type="text"
                      required
                      value={orderCustomer.fullName}
                      onChange={(e) => setOrderCustomer({ ...orderCustomer, fullName: e.target.value })}
                      placeholder="e.g. Marcus Vance"
                      className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-white/70 font-bold mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={orderCustomer.phone}
                      onChange={(e) => setOrderCustomer({ ...orderCustomer, phone: e.target.value })}
                      placeholder="+251 911 234 567"
                      className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-white/70 font-bold mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={orderCustomer.email}
                      onChange={(e) => setOrderCustomer({ ...orderCustomer, email: e.target.value })}
                      placeholder="customer@example.com"
                      className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase text-white/70 font-bold mb-1">Delivery Address *</label>
                    <input
                      type="text"
                      required
                      value={orderCustomer.address}
                      onChange={(e) => setOrderCustomer({ ...orderCustomer, address: e.target.value })}
                      placeholder="Bole Sub-city, House #104"
                      className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-white/70 font-bold mb-1">City</label>
                    <input
                      type="text"
                      value={orderCustomer.city}
                      onChange={(e) => setOrderCustomer({ ...orderCustomer, city: e.target.value })}
                      placeholder="Addis Ababa"
                      className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Order Packages Selector */}
              <div className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-3">
                <h4 className="text-xs uppercase text-amber-300 font-bold tracking-wider">Select Ready-made Packages</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {packages.map((pkg) => {
                    const existing = selectedOrderPackages.find((p) => p.pkg.id === pkg.id);
                    const isSelected = !!existing;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedOrderPackages(selectedOrderPackages.filter((p) => p.pkg.id !== pkg.id));
                          } else {
                            setSelectedOrderPackages([...selectedOrderPackages, { pkg, qty: 1 }]);
                          }
                        }}
                        className={`p-3 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                            : 'bg-black/40 border-white/15 text-white/80 hover:border-white/30'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="truncate">{pkg.name}</div>
                          <div className="text-[10px] text-white/50">${pkg.price.toFixed(2)}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-300 flex-shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateOrderModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#8c1119] text-xs font-bold uppercase tracking-wider shadow-lg"
                >
                  Create & Record Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: ORDER FULL DETAILS INSPECTION MODAL */}
      {/* ========================================================================= */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-inter">
          <div className="bg-[#2c0407] border border-amber-400/40 rounded-2xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl animate-scale-in my-auto max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrderDetails(null)}
              className="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-full bg-black/40 hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/15 pb-4 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-podium text-xl uppercase font-bold text-white">
                  Order Inspection: {selectedOrderDetails.id}
                </h3>
                <span className="text-xs text-white/60 font-mono">Placed on {selectedOrderDetails.createdAt}</span>
              </div>
            </div>

            <div className="space-y-5 text-xs">
              {/* Customer & Delivery Contact */}
              <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-2">
                <div className="text-[10px] text-amber-300 font-bold uppercase tracking-widest">Customer & Delivery Information</div>
                <div className="text-sm font-bold text-white">{selectedOrderDetails.customer.fullName}</div>
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <Phone className="w-4 h-4 text-amber-300" />
                  <span>Phone: {selectedOrderDetails.customer.phone || 'Not provided'}</span>
                </div>
                <div className="text-white/80">Email: {selectedOrderDetails.customer.email}</div>
                <div className="flex items-start gap-1.5 text-white/90 pt-1">
                  <MapPin className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">{selectedOrderDetails.customer.address}</span>, {selectedOrderDetails.customer.city}
                  </div>
                </div>
              </div>

              {/* Gift Note Section - if any gift fields present */}
              {(selectedOrderDetails.customer.giftRecipientName || selectedOrderDetails.customer.giftSenderName || selectedOrderDetails.customer.giftMessage) && (
                <div className="bg-amber-400/5 border border-amber-400/30 rounded-xl p-4 space-y-2">
                  <div className="text-[10px] text-amber-300 font-bold uppercase tracking-widest">Gift Note Details</div>
                  {selectedOrderDetails.customer.giftRecipientName && (
                    <div className="text-white/90">
                      <span className="text-white/60">To: </span>
                      <span className="font-semibold">{selectedOrderDetails.customer.giftRecipientName}</span>
                    </div>
                  )}
                  {selectedOrderDetails.customer.giftSenderName && (
                    <div className="text-white/90">
                      <span className="text-white/60">From: </span>
                      <span className="font-semibold">{selectedOrderDetails.customer.giftSenderName}</span>
                    </div>
                  )}
                  {selectedOrderDetails.customer.giftMessage && (
                    <div className="bg-black/30 border border-amber-400/20 rounded-lg p-3 text-amber-200 mt-2 italic">
                      "{selectedOrderDetails.customer.giftMessage}"
                    </div>
                  )}
                </div>
              )}

              {/* Gift Box Selection - if present */}
              {selectedOrderDetails.giftBoxStyle && (
                <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-2">
                  <div className="text-[10px] text-amber-300 font-bold uppercase tracking-widest">Gift Box Selection</div>
                  <div className="flex items-center justify-between">
                    <div className="text-white font-semibold">{selectedOrderDetails.giftBoxStyle}</div>
                    <div className="text-amber-300 font-bold">
                      {selectedOrderDetails.giftBoxPrice
                        ? `+${selectedOrderDetails.currency === 'USD' ? '$' : ''}${selectedOrderDetails.giftBoxPrice.toFixed(2)} ${selectedOrderDetails.currency || 'ETB'}`
                        : 'Free'}
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items Breakdown */}
              <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
                <div className="text-[10px] text-amber-300 font-bold uppercase tracking-widest">Items Purchased</div>
                <div className="divide-y divide-white/10">
                  {selectedOrderDetails.items.map((it: any, idx: number) => {
                    const isUsd = selectedOrderDetails.currency === 'USD' || selectedOrderDetails.buyerMarket === 'INTERNATIONAL';
                    let itemPrice = 0;
                    if (it.package) {
                      itemPrice = isUsd && it.package.price_usd != null && it.package.price_usd > 0
                        ? it.package.price_usd
                        : (isUsd ? Math.round((it.package.price / 120) * 100) / 100 : it.package.price);
                    } else {
                      itemPrice = it.totalPrice || 0;
                    }
                    return (
                      <div key={idx} className="py-2.5 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white">
                            {it.package ? it.package.name : `Custom Box (${it.selectedItems?.length || 0} items)`}
                          </div>
                          <div className="text-[11px] text-white/60">Qty: {it.quantity}</div>
                        </div>
                        <div className="font-bold text-amber-300">
                          {isUsd ? `$${(itemPrice * it.quantity).toFixed(2)} USD` : `${(itemPrice * it.quantity).toLocaleString()} ብር`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment & Market Details */}
              <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
                <div className="text-[10px] text-amber-300 font-bold uppercase tracking-widest">Payment & Market Information</div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Buyer Market:</span>
                  <span className="text-amber-300 font-bold">
                    {selectedOrderDetails.buyerMarket === 'INTERNATIONAL' ? '🌍 International (Abroad / USD)' : '🇪🇹 Local (Ethiopia / ETB)'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/70">Payment Gateway / Method:</span>
                  <span className="text-white font-semibold">{selectedOrderDetails.paymentMethod || 'Chapa Gateway'}</span>
                </div>

                {selectedOrderDetails.paymentStatus && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Payment Status:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      selectedOrderDetails.paymentStatus === 'PAID'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    }`}>
                      {selectedOrderDetails.paymentStatus}
                    </span>
                  </div>
                )}

                {selectedOrderDetails.chapaTxRef && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Chapa Reference:</span>
                    <span className="text-amber-300 font-mono text-[11px] font-bold">{selectedOrderDetails.chapaTxRef}</span>
                  </div>
                )}

                {selectedOrderDetails.paymentReceiptUrl && !selectedOrderDetails.paymentReceiptUrl.includes('placeholder') && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="text-white/70 text-[10px] mb-2">Payment Receipt:</div>
                    <a 
                      href={selectedOrderDetails.paymentReceiptUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img 
                        src={selectedOrderDetails.paymentReceiptUrl} 
                        alt="Payment Receipt" 
                        className="w-full max-w-md mx-auto rounded-lg border border-amber-400/30 hover:border-amber-400/60 transition-colors cursor-pointer"
                      />
                    </a>
                    <div className="text-center mt-2">
                      <a 
                        href={selectedOrderDetails.paymentReceiptUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-amber-300 hover:text-amber-200 text-xs underline"
                      >
                        View Full Size
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="flex items-center justify-between bg-black/60 rounded-xl p-4 border border-white/10 text-sm font-bold">
                <span>Total Amount:</span>
                <span className="text-amber-300 text-lg">
                  {selectedOrderDetails.currency === 'USD' ? '$' : ''}{selectedOrderDetails.total.toFixed(2)} {selectedOrderDetails.currency || (selectedOrderDetails.buyerMarket === 'INTERNATIONAL' ? 'USD' : 'ETB')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
