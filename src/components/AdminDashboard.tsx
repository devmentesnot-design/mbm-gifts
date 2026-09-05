import React, { useState, useEffect } from 'react';
import { PreparedPackage, CustomBoxOption, GiftCategory, GiftBoxStyle, DEFAULT_CATEGORIES, DEFAULT_GIFT_BOXES, PackageItemDetail, getStoredCategories, saveStoredCategories, deleteStoredCategory, getStoredGiftBoxes, saveStoredGiftBoxes, deleteStoredGiftBox, deleteStoredPackage, deleteStoredCustomItem, updatePaymentVerificationInDb } from '../data/giftsData';
import { Order, OrderStatus, PaymentStatus } from '../types/cart';
import { uploadToCloudinary } from '../utils/cloudinary';
import { formatPrice } from '../utils/currency';
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
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  Image as ImageIcon,
  Tag,
  CheckCircle2,
  Layers,
  Loader2,
  AlertCircle,
  LogOut,
  ArrowRight,
  Camera,
  FileText,
  ShieldCheck,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  User,
  RefreshCw,
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
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'payments' | 'packages' | 'customItems' | 'categories' | 'giftBoxes' | 'customers'>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Payment Verification State
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'under_review' | 'paid' | 'rejected'>('under_review');
  const [paymentSearchTerm, setPaymentSearchTerm] = useState('');
  const [rejectingPaymentOrder, setRejectingPaymentOrder] = useState<Order | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);
  const [isProcessingPaymentAction, setIsProcessingPaymentAction] = useState(false);

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

  // Payment Approval & Rejection Handlers
  const handleApprovePayment = async (orderToApprove: Order) => {
    if (!confirm(`Are you sure you want to approve payment for order ${orderToApprove.id}? This will confirm the order and mark it as PAID.`)) {
      return;
    }

    setIsProcessingPaymentAction(true);
    const reviewerName = session?.user?.email || 'Admin';
    const nowIso = new Date().toISOString();

    try {
      await updatePaymentVerificationInDb(orderToApprove.id, {
        paymentStatus: 'PAID',
        orderStatus: 'Processing',
        reviewedBy: reviewerName,
        reviewedAt: nowIso,
        rejectionReason: null,
      });

      onUpdateOrderStatus(orderToApprove.id, 'Processing');

      if (selectedOrderDetails && selectedOrderDetails.id === orderToApprove.id) {
        setSelectedOrderDetails({
          ...selectedOrderDetails,
          paymentStatus: 'PAID',
          status: 'Processing',
          reviewedBy: reviewerName,
          reviewedAt: nowIso,
          rejectionReason: undefined,
        });
      }
    } catch (err: any) {
      console.error('❌ Error approving payment:', err);
      alert('Failed to approve payment: ' + (err?.message || 'Database error'));
    } finally {
      setIsProcessingPaymentAction(false);
    }
  };

  const handleOpenRejectModal = (orderToReject: Order) => {
    setRejectingPaymentOrder(orderToReject);
    setRejectionReasonInput(
      orderToReject.rejectionReason || 'Transfer amount or sender name could not be verified in payment account statements.'
    );
  };

  const handleConfirmRejectPayment = async () => {
    if (!rejectingPaymentOrder) return;

    const reason = rejectionReasonInput.trim() || 'Payment details could not be confirmed in bank or mobile transfer records.';
    setIsProcessingPaymentAction(true);
    const reviewerName = session?.user?.email || 'Admin';
    const nowIso = new Date().toISOString();

    try {
      await updatePaymentVerificationInDb(rejectingPaymentOrder.id, {
        paymentStatus: 'REJECTED',
        rejectionReason: reason,
        reviewedBy: reviewerName,
        reviewedAt: nowIso,
      });

      if (selectedOrderDetails && selectedOrderDetails.id === rejectingPaymentOrder.id) {
        setSelectedOrderDetails({
          ...selectedOrderDetails,
          paymentStatus: 'REJECTED',
          rejectionReason: reason,
          reviewedBy: reviewerName,
          reviewedAt: nowIso,
        });
      }

      setRejectingPaymentOrder(null);
      setRejectionReasonInput('');
    } catch (err: any) {
      console.error('❌ Error rejecting payment:', err);
      alert('Failed to reject payment: ' + (err?.message || 'Database error'));
    } finally {
      setIsProcessingPaymentAction(false);
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

  // Helper to match item/package categories against admin filter (parent or compound)
  const matchesAdminCategory = (itemCat: string | undefined, filter: string): boolean => {
    if (!filter || filter === 'all') return true;
    if (!itemCat) return false;
    const filterLower = filter.toLowerCase().trim();
    const isCompound = filterLower.includes(' > ');
    const cats = itemCat.split(',').map((c) => c.trim().toLowerCase()).filter(Boolean);
    for (const c of cats) {
      if (isCompound) {
        if (c === filterLower) return true;
      } else {
        if (c === filterLower || c.startsWith(filterLower + ' > ')) return true;
      }
    }
    return false;
  };

  // Order Search & Filter State
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Package Search & Detailed Modal State
  const [pkgSearchTerm, setPkgSearchTerm] = useState('');
  const [pkgCategoryFilter, setPkgCategoryFilter] = useState<string>('all');
  const [pkgPage, setPkgPage] = useState(1);
  const [isPkgCategorySidebarOpen, setIsPkgCategorySidebarOpen] = useState(true);
  const [isMobilePkgCategoryOpen, setIsMobilePkgCategoryOpen] = useState(false);
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
    requiresCustomInput: false,
    customInputType: 'text' as 'text' | 'image' | 'both',
    customInputLabel: '',
    hasCustomUnit: false,
    customUnitName: 'kg',
    customUnitMin: '2',
    customUnitStep: '1',
    customUnitMax: '10',
    customUnitPricePerUnit: '',
    customUnitPricePerUnitUsd: '',
  });
  // Sub-items inside the package detailed form
  const [pkgSubItems, setPkgSubItems] = useState<PackageItemDetail[]>([]);

  // Single Custom Item Search & Modal State
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [itemCategoryFilter, setItemCategoryFilter] = useState<string>('all');
  const [itemPage, setItemPage] = useState(1);
  const [isItemCategorySidebarOpen, setIsItemCategorySidebarOpen] = useState(true);
  const [isMobileItemCategoryOpen, setIsMobileItemCategoryOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomBoxOption | null>(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    category: 'Sweets & Chocolates',
    price: '',
    price_usd: '',
    description: '',
    image: '',
    requiresCustomInput: false,
    customInputType: 'text' as 'text' | 'image' | 'both',
    customInputLabel: '',
    hasCustomUnit: false,
    customUnitName: 'kg',
    customUnitMin: '2',
    customUnitStep: '1',
    customUnitMax: '10',
    customUnitPricePerUnit: '',
    customUnitPricePerUnitUsd: '',
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
    subcategories: string[];
  }>({
    name: '',
    slug: '',
    description: '',
    type: 'package',
    subcategories: [],
  });
  const [subcategoryInput, setSubcategoryInput] = useState('');
  // Track expanded parent categories in sidebar filters
  const [expandedPkgCategories, setExpandedPkgCategories] = useState<Set<string>>(new Set());
  const [expandedItemCategories, setExpandedItemCategories] = useState<Set<string>>(new Set());

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
  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending' || o.paymentStatus === 'UNDER_REVIEW' || o.paymentStatus === 'PAYMENT_SUBMITTED').length;
  
  // ONLY orders that have been APPROVED / PAID appear in the Orders Management dispatch queue
  const approvedOrders = orders.filter(
    (o) => o.paymentStatus === 'PAID' || o.status === 'Processing' || o.status === 'Shipped' || o.status === 'Delivered'
  );
  const verifiedOrdersCount = approvedOrders.length;

  // Filtered Categories by Usage
  const packageCategories = categoriesList.filter((c) => !c.type || c.type === 'package' || c.type === 'both');
  const customItemCategories = categoriesList.filter((c) => !c.type || c.type === 'custom_item' || c.type === 'both');

  /**
   * Normalize a raw comma-separated category string by matching each token
   * case-insensitively against the categoriesList names and slugs.
   * If a match is found, we replace the token with the canonical display name.
   * Unmatched tokens are kept as-is.
   */
  const normalizeCategoryString = (raw: string): string => {
    if (!raw) return '';
    return raw
      .split(',')
      .map((token) => {
        const t = token.trim();
        if (!t) return null;
        // Try exact match first (case-insensitive)
        const exact = categoriesList.find(
          (c) => c.name.toLowerCase() === t.toLowerCase()
        );
        if (exact) return exact.name;
        // Try slug match
        const bySlug = categoriesList.find(
          (c) => c.slug && c.slug.toLowerCase() === t.toLowerCase().replace(/\s+/g, '-')
        );
        if (bySlug) return bySlug.name;
        // Try partial/substring match (e.g. "Valentine" matches "Valentine's Day")
        const partial = categoriesList.find(
          (c) =>
            c.name.toLowerCase().includes(t.toLowerCase()) ||
            t.toLowerCase().includes(c.name.toLowerCase())
        );
        if (partial) return partial.name;
        // Check subcategory format "Parent > Sub"
        if (t.includes('>')) {
          const [parentPart, subPart] = t.split('>').map((s) => s.trim());
          const parentCat = categoriesList.find(
            (c) => c.name.toLowerCase() === parentPart.toLowerCase()
          );
          if (parentCat && parentCat.subcategories) {
            const sub = parentCat.subcategories.find(
              (s) => s.toLowerCase() === subPart.toLowerCase()
            );
            if (sub) return `${parentCat.name} > ${sub}`;
          }
        }
        return t; // keep as-is if no match
      })
      .filter(Boolean)
      .join(', ');
  };

  const ADMIN_PAGE_SIZE = 20; // 5 rows × 4 cols

  // Reset pagination on filter or search change
  useEffect(() => { setPkgPage(1); }, [pkgCategoryFilter, pkgSearchTerm]);
  useEffect(() => { setItemPage(1); }, [itemCategoryFilter, itemSearchTerm]);

  // Filtered Orders (ONLY from approvedOrders — unapproved orders stay in Payment Verification)
  const filteredOrders = approvedOrders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      o.customer.email.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      o.customer.phone.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      o.customer.address.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      (o.senderName && o.senderName.toLowerCase().includes(orderSearchTerm.toLowerCase()));

    const matchesStatus =
      orderStatusFilter === 'all' ||
      (orderStatusFilter === 'processing' && o.status === 'Processing') ||
      (orderStatusFilter === 'shipped' && o.status === 'Shipped') ||
      (orderStatusFilter === 'delivered' && o.status === 'Delivered') ||
      (orderStatusFilter === 'cancelled' && o.status === 'Cancelled') ||
      o.status.toLowerCase() === orderStatusFilter.toLowerCase();

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
        subcategories: cat.subcategories || [],
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        slug: '',
        description: '',
        type: 'package',
        subcategories: [],
      });
    }
    setSubcategoryInput('');
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
                subcategories: categoryForm.subcategories,
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
        subcategories: categoryForm.subcategories,
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
        category: normalizeCategoryString(pkg.category),
        price: pkg.price.toString(),
        price_usd: pkg.price_usd != null ? pkg.price_usd.toString() : '',
        shortDesc: pkg.shortDesc,
        popularFor: pkg.popularFor || 'Anniversaries & Special Celebrations',
        image: pkg.image,
        badge: pkg.badge || '',
        requiresCustomInput: pkg.requiresCustomInput || false,
        customInputType: (pkg.customInputType as 'text' | 'image' | 'both') || 'text',
        customInputLabel: pkg.customInputLabel || '',
        hasCustomUnit: pkg.hasCustomUnit || false,
        customUnitName: pkg.customUnitName || 'kg',
        customUnitMin: pkg.customUnitMin != null ? pkg.customUnitMin.toString() : '2',
        customUnitStep: pkg.customUnitStep != null ? pkg.customUnitStep.toString() : '1',
        customUnitMax: pkg.customUnitMax != null ? pkg.customUnitMax.toString() : '10',
        customUnitPricePerUnit: pkg.customUnitPricePerUnit != null ? pkg.customUnitPricePerUnit.toString() : '',
        customUnitPricePerUnitUsd: pkg.customUnitPricePerUnitUsd != null ? pkg.customUnitPricePerUnitUsd.toString() : '',
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
        requiresCustomInput: false,
        customInputType: 'text',
        customInputLabel: '',
        hasCustomUnit: false,
        customUnitName: 'kg',
        customUnitMin: '2',
        customUnitStep: '1',
        customUnitMax: '10',
        customUnitPricePerUnit: '',
        customUnitPricePerUnitUsd: '',
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
    setPkgSubItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSelectCustomItemForSubItem = (index: number, item: CustomBoxOption) => {
    setPkgSubItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        name: item.name,
        image: item.image || '',
        description: item.description || '',
      };
      return updated;
    });
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
              requiresCustomInput: pkgForm.requiresCustomInput,
              customInputType: pkgForm.customInputType,
              customInputLabel: pkgForm.customInputLabel,
              hasCustomUnit: pkgForm.hasCustomUnit,
              customUnitName: pkgForm.hasCustomUnit ? (pkgForm.customUnitName || 'kg') : undefined,
              customUnitMin: pkgForm.hasCustomUnit && pkgForm.customUnitMin ? parseFloat(pkgForm.customUnitMin) : undefined,
              customUnitStep: pkgForm.hasCustomUnit && pkgForm.customUnitStep ? parseFloat(pkgForm.customUnitStep) : undefined,
              customUnitMax: pkgForm.hasCustomUnit && pkgForm.customUnitMax ? parseFloat(pkgForm.customUnitMax) : undefined,
              customUnitPricePerUnit: pkgForm.hasCustomUnit && pkgForm.customUnitPricePerUnit ? parseFloat(pkgForm.customUnitPricePerUnit) : undefined,
              customUnitPricePerUnitUsd: pkgForm.hasCustomUnit && pkgForm.customUnitPricePerUnitUsd ? parseFloat(pkgForm.customUnitPricePerUnitUsd) : undefined,
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
        requiresCustomInput: pkgForm.requiresCustomInput,
        customInputType: pkgForm.customInputType,
        customInputLabel: pkgForm.customInputLabel,
        hasCustomUnit: pkgForm.hasCustomUnit,
        customUnitName: pkgForm.hasCustomUnit ? (pkgForm.customUnitName || 'kg') : undefined,
        customUnitMin: pkgForm.hasCustomUnit && pkgForm.customUnitMin ? parseFloat(pkgForm.customUnitMin) : undefined,
        customUnitStep: pkgForm.hasCustomUnit && pkgForm.customUnitStep ? parseFloat(pkgForm.customUnitStep) : undefined,
        customUnitMax: pkgForm.hasCustomUnit && pkgForm.customUnitMax ? parseFloat(pkgForm.customUnitMax) : undefined,
        customUnitPricePerUnit: pkgForm.hasCustomUnit && pkgForm.customUnitPricePerUnit ? parseFloat(pkgForm.customUnitPricePerUnit) : undefined,
        customUnitPricePerUnitUsd: pkgForm.hasCustomUnit && pkgForm.customUnitPricePerUnitUsd ? parseFloat(pkgForm.customUnitPricePerUnitUsd) : undefined,
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
        category: normalizeCategoryString(item.category),
        price: item.price.toString(),
        price_usd: item.price_usd != null ? item.price_usd.toString() : '',
        description: item.description,
        image: item.image,
        requiresCustomInput: item.requiresCustomInput || false,
        customInputType: (item.customInputType as 'text' | 'image' | 'both') || 'text',
        customInputLabel: item.customInputLabel || '',
        hasCustomUnit: item.hasCustomUnit || false,
        customUnitName: item.customUnitName || 'kg',
        customUnitMin: item.customUnitMin != null ? item.customUnitMin.toString() : '2',
        customUnitStep: item.customUnitStep != null ? item.customUnitStep.toString() : '1',
        customUnitMax: item.customUnitMax != null ? item.customUnitMax.toString() : '10',
        customUnitPricePerUnit: item.customUnitPricePerUnit != null ? item.customUnitPricePerUnit.toString() : '',
        customUnitPricePerUnitUsd: item.customUnitPricePerUnitUsd != null ? item.customUnitPricePerUnitUsd.toString() : '',
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
        requiresCustomInput: false,
        customInputType: 'text',
        customInputLabel: '',
        hasCustomUnit: false,
        customUnitName: 'kg',
        customUnitMin: '2',
        customUnitStep: '1',
        customUnitMax: '10',
        customUnitPricePerUnit: '',
        customUnitPricePerUnitUsd: '',
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
              requiresCustomInput: itemForm.requiresCustomInput,
              customInputType: itemForm.customInputType,
              customInputLabel: itemForm.customInputLabel,
              hasCustomUnit: itemForm.hasCustomUnit,
              customUnitName: itemForm.hasCustomUnit ? (itemForm.customUnitName || 'kg') : undefined,
              customUnitMin: itemForm.hasCustomUnit && itemForm.customUnitMin ? parseFloat(itemForm.customUnitMin) : undefined,
              customUnitStep: itemForm.hasCustomUnit && itemForm.customUnitStep ? parseFloat(itemForm.customUnitStep) : undefined,
              customUnitMax: itemForm.hasCustomUnit && itemForm.customUnitMax ? parseFloat(itemForm.customUnitMax) : undefined,
              customUnitPricePerUnit: itemForm.hasCustomUnit && itemForm.customUnitPricePerUnit ? parseFloat(itemForm.customUnitPricePerUnit) : undefined,
              customUnitPricePerUnitUsd: itemForm.hasCustomUnit && itemForm.customUnitPricePerUnitUsd ? parseFloat(itemForm.customUnitPricePerUnitUsd) : undefined,
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
        requiresCustomInput: itemForm.requiresCustomInput,
        customInputType: itemForm.customInputType,
        customInputLabel: itemForm.customInputLabel,
        hasCustomUnit: itemForm.hasCustomUnit,
        customUnitName: itemForm.hasCustomUnit ? (itemForm.customUnitName || 'kg') : undefined,
        customUnitMin: itemForm.hasCustomUnit && itemForm.customUnitMin ? parseFloat(itemForm.customUnitMin) : undefined,
        customUnitStep: itemForm.hasCustomUnit && itemForm.customUnitStep ? parseFloat(itemForm.customUnitStep) : undefined,
        customUnitMax: itemForm.hasCustomUnit && itemForm.customUnitMax ? parseFloat(itemForm.customUnitMax) : undefined,
        customUnitPricePerUnit: itemForm.hasCustomUnit && itemForm.customUnitPricePerUnit ? parseFloat(itemForm.customUnitPricePerUnit) : undefined,
        customUnitPricePerUnitUsd: itemForm.hasCustomUnit && itemForm.customUnitPricePerUnitUsd ? parseFloat(itemForm.customUnitPricePerUnitUsd) : undefined,
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
      selectedOrderCustomItems.forEach((ci) => {
        orderItems.push({
          id: `item-single-${ci.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          type: 'single',
          item: ci,
          quantity: 1,
          totalPrice: ci.price,
          customNote: orderNote,
        });
        subtotal += ci.price;
      });
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

  const pendingPaymentsCount = orders.filter(
    (o) => o.paymentStatus === 'UNDER_REVIEW' || o.paymentStatus === 'PAYMENT_SUBMITTED'
  ).length;

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    {
      id: 'payments',
      label: `Payment Verification (${pendingPaymentsCount})`,
      icon: ShieldCheck,
      badge: pendingPaymentsCount ? `${pendingPaymentsCount} Review` : null,
    },
    { 
      id: 'orders', 
      label: `Orders (${approvedOrders.length})`, 
      icon: ShoppingBag, 
      badge: approvedOrders.filter(o => o.status === 'Processing').length ? `${approvedOrders.filter(o => o.status === 'Processing').length} to pack` : null,
    },
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
          className={`fixed lg:static top-16 bottom-0 lg:top-0 left-0 z-50 w-72 bg-[#200306] border-r border-white/10 flex flex-col justify-between transition-transform duration-300 shadow-2xl lg:translate-x-0 ${
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          />
        )}

        {/* Right Content Panel */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
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
                      {approvedOrders.slice(0, 5).map((ord) => (
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
                                ord.status === 'Delivered'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : ord.status === 'Shipped'
                                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
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
                      {approvedOrders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-white/40">
                            No approved orders in dispatch yet.
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
                  <div className="inline-flex items-center gap-1.5 text-amber-300 text-[10px] font-bold uppercase tracking-widest bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded-full mb-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Verified & Paid Orders Dispatch Queue</span>
                  </div>
                  <h2 className="font-podium text-2xl sm:text-3xl uppercase font-bold text-white tracking-wide">
                    Orders Management ({approvedOrders.length})
                  </h2>
                  <p className="text-white/60 text-xs font-inter mt-1">
                    Only verified & paid orders appear here. Unapproved submissions wait in Payment Verification. Advance packaging and delivery dispatch below.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCreateOrderModalOpen(true)}
                    className="bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Create Manual Order</span>
                  </button>
                </div>
              </div>

              {/* Notice if there are unverified payments waiting */}
              {pendingPaymentsCount > 0 && (
                <div className="bg-amber-400/10 border border-amber-400/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-400 animate-pulse flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-amber-300">
                        {pendingPaymentsCount} unverified payment{pendingPaymentsCount > 1 ? 's' : ''} waiting in Payment Verification
                      </div>
                      <div className="text-[11px] text-white/60">
                        Orders move automatically into this active fulfillment queue as soon as you approve their payment.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('payments')}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-[#8c1119] font-bold text-xs uppercase tracking-wider hover:bg-amber-300 transition-all cursor-pointer whitespace-nowrap shadow"
                  >
                    Review Payments ({pendingPaymentsCount}) →
                  </button>
                </div>
              )}

              {/* Filters */}
              <div className="bg-[#2e0508] border border-white/10 rounded-2xl p-4 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-lg">
                <div className="relative w-full lg:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search by ID, name, sender, phone, address..."
                    value={orderSearchTerm}
                    onChange={(e) => setOrderSearchTerm(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Filter Pills for Approved Orders */}
                <div className="flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
                  {[
                    { id: 'all', label: `All Approved (${approvedOrders.length})` },
                    { id: 'processing', label: `In Prep / Packing (${approvedOrders.filter(o => o.status === 'Processing').length})` },
                    { id: 'shipped', label: `Out for Delivery (${approvedOrders.filter(o => o.status === 'Shipped').length})` },
                    { id: 'delivered', label: `Delivered (${approvedOrders.filter(o => o.status === 'Delivered').length})` },
                    { id: 'cancelled', label: `Cancelled (${approvedOrders.filter(o => o.status === 'Cancelled').length})` },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setOrderStatusFilter(st.id)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap ${
                        orderStatusFilter === st.id
                          ? 'bg-amber-400 border-amber-400 text-[#8c1119] shadow-md font-extrabold'
                          : 'bg-black/20 border-white/10 text-white/70 hover:text-white'
                      }`}
                    >
                      {st.label}
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
                      <th className="py-3 px-3">Customer & Sender</th>
                      <th className="py-3 px-3">Delivery Destination</th>
                      <th className="py-3 px-3">Items</th>
                      <th className="py-3 px-3">Total Amount</th>
                      <th className="py-3 px-3">Payment</th>
                      <th className="py-3 px-3">Fulfillment Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredOrders.map((ord) => {
                      const isPaid = ord.paymentStatus === 'PAID';
                      const isUnderReview = ord.paymentStatus === 'UNDER_REVIEW' || ord.paymentStatus === 'PAYMENT_SUBMITTED';
                      const isRejected = ord.paymentStatus === 'REJECTED';

                      return (
                        <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-4 px-3">
                            <div className="font-bold text-amber-300 font-podium text-sm">{ord.id}</div>
                            <span className="text-[10px] text-white/50 block mt-0.5">
                              {ord.buyerMarket === 'INTERNATIONAL' ? '🌍 Diaspora' : '🇪🇹 Local'}
                            </span>
                          </td>

                          <td className="py-4 px-3">
                            <div className="font-bold text-white">{ord.customer.fullName}</div>
                            <div className="text-[11px] text-amber-300/90 font-medium flex items-center gap-1.5 mt-0.5">
                              <Phone className="w-3 h-3 text-amber-300" />
                              <span>{ord.customer.phone || 'No phone provided'}</span>
                            </div>
                            {ord.senderName && (
                              <div className="text-[10px] text-amber-200/80 mt-0.5 flex items-center gap-1">
                                <User className="w-2.5 h-2.5 text-amber-400" />
                                <span>Sender: <strong>{ord.senderName}</strong></span>
                              </div>
                            )}
                          </td>

                          <td className="py-4 px-3">
                            <div className="flex items-start gap-1.5 text-white/80 max-w-xs">
                              <MapPin className="w-3.5 h-3.5 text-amber-300 flex-shrink-0 mt-0.5" />
                              <div>
                                <div className="font-semibold text-white">{ord.customer.address}</div>
                                <div className="text-[10px] text-white/50">{ord.customer.city}, {ord.customer.zipCode}</div>
                                {ord.customer.giftRecipientName && ord.customer.giftRecipientName !== ord.customer.fullName && (
                                  <div className="text-[10px] text-amber-200/90 italic mt-0.5">
                                    Recipient: {ord.customer.giftRecipientName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-3 text-white/80 font-medium">
                            <div>{ord.items.length} item{ord.items.length !== 1 ? 's' : ''}</div>
                            {ord.items.some((it: any) => it.customerInputText || it.customerInputImageUrl) && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-purple-300 bg-purple-900/40 border border-purple-500/40 px-2 py-0.5 rounded-full mt-1">
                                <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                                <span>Customized</span>
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-3">
                            <div className="font-bold text-amber-300 text-sm">
                              {ord.currency === 'USD' || ord.buyerMarket === 'INTERNATIONAL'
                                ? `$${ord.total.toFixed(2)} USD`
                                : `${ord.total.toLocaleString()} ብር`}
                            </div>
                            <span className="text-[10px] text-white/40 block">
                              {ord.paymentMethod?.replace('Manual Payment ', '') || 'Transfer'}
                            </span>
                          </td>

                          {/* Payment Verification Status Badge */}
                          <td className="py-4 px-3">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                <span>PAID</span>
                              </span>
                            ) : isUnderReview ? (
                              <button
                                onClick={() => {
                                  setActiveTab('payments');
                                  setPaymentSearchTerm(ord.id);
                                }}
                                className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider hover:bg-amber-400/30 cursor-pointer animate-pulse"
                                title="Click to verify in Payment dashboard"
                              >
                                <Clock className="w-3 h-3" />
                                <span>Review</span>
                              </button>
                            ) : isRejected ? (
                              <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-300 border border-red-500/40 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                                <AlertCircle className="w-3 h-3 text-red-400" />
                                <span>Rejected</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-white/10 text-white/60 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                                <span>Unpaid</span>
                              </span>
                            )}
                          </td>

                          {/* Fulfillment Delivery Status Dropdown */}
                          <td className="py-4 px-3">
                            <select
                              value={ord.status}
                              onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                              className={`border rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none transition-all cursor-pointer ${
                                ord.status === 'Delivered'
                                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                                  : ord.status === 'Shipped'
                                  ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-300'
                                  : ord.status === 'Processing'
                                  ? 'bg-blue-950/80 border-blue-500/50 text-blue-300'
                                  : ord.status === 'Cancelled'
                                  ? 'bg-red-950/80 border-red-500/50 text-red-300'
                                  : 'bg-black/60 border-amber-400/40 text-amber-300'
                              }`}
                            >
                              <option value="Pending">Pending (Awaiting Audit)</option>
                              <option value="Processing">Processing (Paid & In Prep)</option>
                              <option value="Shipped">Shipped (Out for Delivery)</option>
                              <option value="Delivered">Delivered (Completed)</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-3 text-right space-y-1">
                            <div className="flex items-center justify-end gap-1.5">
                              {ord.paymentReceiptUrl && (
                                <button
                                  type="button"
                                  onClick={() => setViewingReceiptUrl(ord.paymentReceiptUrl || null)}
                                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 hover:text-white transition-colors cursor-pointer"
                                  title="View Uploaded Payment Proof"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {ord.status === 'Processing' && (
                                <button
                                  type="button"
                                  onClick={() => onUpdateOrderStatus(ord.id, 'Shipped')}
                                  className="px-2 py-1 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold uppercase transition-all cursor-pointer whitespace-nowrap"
                                  title="Mark Out for Delivery"
                                >
                                  Dispatch
                                </button>
                              )}

                              {ord.status === 'Shipped' && (
                                <button
                                  type="button"
                                  onClick={() => onUpdateOrderStatus(ord.id, 'Delivered')}
                                  className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase transition-all cursor-pointer whitespace-nowrap"
                                  title="Mark as Delivered"
                                >
                                  Deliver
                                </button>
                              )}

                              <button
                                onClick={() => setSelectedOrderDetails(ord)}
                                className="px-3 py-1.5 rounded-lg bg-amber-400/15 border border-amber-400/30 hover:border-amber-400 hover:bg-amber-400/25 text-amber-300 font-bold text-xs cursor-pointer transition-all whitespace-nowrap"
                              >
                                Full Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-white/40">
                          No orders matched your selected filter or search term.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2.5: PAYMENT VERIFICATION & AUDIT */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-amber-300 text-[10px] font-bold uppercase tracking-widest bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded-full mb-1">
                    <ShieldCheck className="w-3 h-3 text-amber-300" />
                    <span>Financial Review & Manual Audit</span>
                  </div>
                  <h2 className="font-podium text-2xl sm:text-3xl uppercase font-bold text-white tracking-wide">
                    Payment Verification Dashboard
                  </h2>
                  <p className="text-white/60 text-xs font-inter mt-1">
                    Cross-check incoming Telebirr and bank deposits against customer sender names and uploaded receipt screenshots.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-[#2e0508] border border-amber-400/30 rounded-xl px-4 py-2 text-right shadow-lg">
                    <span className="text-[10px] text-white/50 uppercase font-bold block">Awaiting Verification</span>
                    <span className="font-podium text-xl text-amber-300 font-bold">
                      {pendingPaymentsCount} order{pendingPaymentsCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="bg-[#2e0508] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-lg">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search by sender name, order ID, phone..."
                    value={paymentSearchTerm}
                    onChange={(e) => setPaymentSearchTerm(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  {[
                    { id: 'under_review', label: `Needs Review (${pendingPaymentsCount})` },
                    { id: 'paid', label: `Approved (${orders.filter(o => o.paymentStatus === 'PAID').length})` },
                    { id: 'rejected', label: `Rejected (${orders.filter(o => o.paymentStatus === 'REJECTED').length})` },
                    { id: 'all', label: `All Payments (${orders.length})` },
                  ].map((filterTab) => (
                    <button
                      key={filterTab.id}
                      onClick={() => setPaymentFilter(filterTab.id as any)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap ${
                        paymentFilter === filterTab.id
                          ? 'bg-amber-400 border-amber-400 text-[#8c1119] shadow-md'
                          : 'bg-black/20 border-white/10 text-white/70 hover:text-white'
                      }`}
                    >
                      {filterTab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verification List / Table */}
              {(() => {
                const paymentsToDisplay = orders.filter((ord) => {
                  const matchesSearch =
                    ord.id.toLowerCase().includes(paymentSearchTerm.toLowerCase()) ||
                    ord.customer.fullName.toLowerCase().includes(paymentSearchTerm.toLowerCase()) ||
                    (ord.senderName && ord.senderName.toLowerCase().includes(paymentSearchTerm.toLowerCase())) ||
                    (ord.transactionId && ord.transactionId.toLowerCase().includes(paymentSearchTerm.toLowerCase())) ||
                    (ord.chapaTxRef && ord.chapaTxRef.toLowerCase().includes(paymentSearchTerm.toLowerCase())) ||
                    ord.customer.phone.includes(paymentSearchTerm);

                  if (!matchesSearch) return false;

                  if (paymentFilter === 'under_review') {
                    return ord.paymentStatus === 'UNDER_REVIEW' || ord.paymentStatus === 'PAYMENT_SUBMITTED';
                  }
                  if (paymentFilter === 'paid') {
                    return ord.paymentStatus === 'PAID';
                  }
                  if (paymentFilter === 'rejected') {
                    return ord.paymentStatus === 'REJECTED';
                  }
                  return true;
                });

                if (paymentsToDisplay.length === 0) {
                  return (
                    <div className="bg-[#2e0508] border border-white/10 rounded-2xl p-12 text-center text-white/40 space-y-3">
                      <ShieldCheck className="w-12 h-12 text-white/20 mx-auto" />
                      <div className="font-podium text-lg uppercase text-white font-bold">No payments in this queue</div>
                      <p className="text-xs text-white/50 max-w-sm mx-auto">
                        {paymentFilter === 'under_review'
                          ? 'Great job! There are no manual payments currently waiting for verification.'
                          : 'No payment records matched your selected filter or search term.'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {paymentsToDisplay.map((ord) => {
                      const isUnderReview = ord.paymentStatus === 'UNDER_REVIEW' || ord.paymentStatus === 'PAYMENT_SUBMITTED';
                      const isPaid = ord.paymentStatus === 'PAID';
                      const isRejected = ord.paymentStatus === 'REJECTED';
                      const isUsd = ord.currency === 'USD' || ord.buyerMarket === 'INTERNATIONAL';

                      return (
                        <div
                          key={ord.id}
                          className={`bg-[#2e0508] border rounded-2xl p-5 shadow-xl transition-all ${
                            isUnderReview
                              ? 'border-amber-400/50 bg-gradient-to-r from-[#2e0508] to-[#3a060a]'
                              : isRejected
                              ? 'border-red-500/30'
                              : 'border-white/10'
                          }`}
                        >
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                            
                            {/* Col 1: Order ID & Summary (3 cols) */}
                            <div className="lg:col-span-3 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-podium text-xl text-white font-bold uppercase tracking-wide">
                                  {ord.id}
                                </span>
                                {isUnderReview && (
                                  <span className="bg-amber-400 text-[#8c1119] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase animate-pulse">
                                    Needs Audit
                                  </span>
                                )}
                              </div>

                              <div className="text-xs space-y-1">
                                <div className="text-white font-semibold flex items-center gap-1.5">
                                  <span>{ord.customer.fullName}</span>
                                </div>
                                <div className="text-amber-300/80 flex items-center gap-1 font-medium text-[11px]">
                                  <Phone className="w-3 h-3 text-amber-300" />
                                  <span>{ord.customer.phone || 'No phone'}</span>
                                </div>
                                <div className="text-white/40 text-[10px]">
                                  {ord.customer.email}
                                </div>
                                <div className="text-white/40 text-[10px] pt-1">
                                  Submitted: {ord.paymentSubmittedAt ? new Date(ord.paymentSubmittedAt).toLocaleString() : ord.createdAt}
                                </div>
                              </div>
                            </div>

                            {/* Col 2: Sender Name & Expected Amount (4 cols) */}
                            <div className="lg:col-span-4 space-y-3 bg-black/40 border border-white/10 rounded-xl p-3.5">
                              {/* Prominent Sender Name Highlight */}
                              <div>
                                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block mb-0.5">
                                  Sender Name (Cross-Check On Phone/Bank):
                                </span>
                                <div className="font-bold text-amber-200 text-sm bg-amber-400/10 border border-amber-400/30 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
                                  <User className="w-4 h-4 text-amber-400" />
                                  <span>{ord.senderName || '(Not provided / Gateway)'}</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-white/10">
                                <div>
                                  <span className="text-white/50 text-[10px] uppercase block">Expected Amount:</span>
                                  <span className="font-podium text-base font-bold text-amber-300">
                                    {isUsd ? `$${ord.total.toFixed(2)} USD` : `${ord.total.toLocaleString()} ETB`}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-white/50 text-[10px] uppercase block">Method:</span>
                                  <span className="font-medium text-white text-[11px] truncate block">
                                    {ord.paymentMethod || 'Manual Transfer'}
                                  </span>
                                </div>
                              </div>

                              {ord.transactionId && (
                                <div className="text-[11px] text-white/70 bg-black/30 px-2.5 py-1 rounded border border-white/5 font-mono">
                                  <span className="text-white/40 mr-1.5">Ref / TX:</span>
                                  <strong className="text-white">{ord.transactionId}</strong>
                                </div>
                              )}
                            </div>

                            {/* Col 3: Receipt Proof Preview (2 cols) */}
                            <div className="lg:col-span-2 space-y-2 text-center">
                              <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider block">
                                Uploaded Receipt Proof
                              </span>
                              {ord.paymentReceiptUrl && !ord.paymentReceiptUrl.includes('placeholder') ? (
                                <div className="space-y-1.5">
                                  <div
                                    onClick={() => setViewingReceiptUrl(ord.paymentReceiptUrl || null)}
                                    className="w-20 h-20 mx-auto rounded-xl overflow-hidden border-2 border-amber-400/40 hover:border-amber-400 bg-black/60 cursor-pointer shadow-lg group relative"
                                  >
                                    <img
                                      src={ord.paymentReceiptUrl}
                                      alt="Payment Receipt Proof"
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-amber-300">
                                      <Eye className="w-5 h-5" />
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setViewingReceiptUrl(ord.paymentReceiptUrl || null)}
                                    className="text-amber-300 hover:text-amber-200 text-[11px] font-bold underline inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <Eye className="w-3 h-3" /> View Full Proof
                                  </button>
                                </div>
                              ) : (
                                <div className="py-4 text-[11px] text-white/40 bg-black/20 rounded-xl border border-white/5">
                                  No receipt file
                                </div>
                              )}
                            </div>

                            {/* Col 4: Status & Admin Decision Actions (3 cols) */}
                            <div className="lg:col-span-3 space-y-3 flex flex-col justify-between h-full">
                              <div>
                                <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider block mb-1">
                                  Payment Status
                                </span>
                                <div className="flex items-center gap-2">
                                  {isPaid && (
                                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold px-3 py-1 rounded-full text-xs uppercase flex items-center gap-1.5">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>VERIFIED & PAID</span>
                                    </span>
                                  )}
                                  {isUnderReview && (
                                    <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold px-3 py-1 rounded-full text-xs uppercase flex items-center gap-1.5">
                                      <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                                      <span>UNDER REVIEW</span>
                                    </span>
                                  )}
                                  {isRejected && (
                                    <span className="bg-red-500/20 text-red-300 border border-red-500/40 font-bold px-3 py-1 rounded-full text-xs uppercase flex items-center gap-1.5">
                                      <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                                      <span>REJECTED</span>
                                    </span>
                                  )}
                                </div>

                                {ord.rejectionReason && (
                                  <div className="text-[10px] text-red-300 bg-red-950/40 p-2 rounded-lg border border-red-500/20 mt-2">
                                    <strong>Rejection Note:</strong> "{ord.rejectionReason}"
                                  </div>
                                )}

                                {ord.reviewedBy && (
                                  <div className="text-[10px] text-white/40 mt-1">
                                    Reviewed by: {ord.reviewedBy} {ord.reviewedAt ? `on ${new Date(ord.reviewedAt).toLocaleDateString()}` : ''}
                                  </div>
                                )}
                              </div>

                              {/* Decision Action Buttons */}
                              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                                {!isPaid && (
                                  <button
                                    type="button"
                                    disabled={isProcessingPaymentAction}
                                    onClick={() => handleApprovePayment(ord)}
                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                    title="Confirm payment received and mark order as PAID"
                                  >
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                    <span>Approve</span>
                                  </button>
                                )}

                                {!isRejected && (
                                  <button
                                    type="button"
                                    disabled={isProcessingPaymentAction}
                                    onClick={() => handleOpenRejectModal(ord)}
                                    className="bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 text-red-300 font-bold text-xs uppercase tracking-wider py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                    title="Reject payment proof with reason"
                                  >
                                    <ThumbsDown className="w-3.5 h-3.5" />
                                    <span>Reject</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setSelectedOrderDetails(ord)}
                                  className="px-2.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 text-xs font-semibold cursor-pointer"
                                  title="View full order inspection details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </div>

                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 3: PACKAGES MANAGEMENT */}
          {activeTab === 'packages' && (
  <div className="space-y-6">
    {/* Header & Actions */}
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <h2 className="font-podium text-2xl sm:text-3xl uppercase font-bold text-white tracking-wide">
          Ready-made Gift Packages ({packages.length})
        </h2>
        <p className="text-white/60 text-xs font-inter mt-1">
          Manage curated gift bundles, dynamic package categories, and internal sub-items.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={pkgSearchTerm}
            onChange={(e) => setPkgSearchTerm(e.target.value)}
            placeholder="Search packages..."
            className="w-full bg-black/40 border border-white/20 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400"
          />
        </div>
        <button
          onClick={() => handleOpenPkgModal()}
          className="bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Package</span>
        </button>
      </div>
    </div>

    {/* Mobile: Vertical Category Menu (Matches PC Sidebar) */}
    <div className="md:hidden mb-4 bg-[#240004]/80 border border-[#D9A514]/20 rounded-2xl p-3 shadow-lg">
      <button
        onClick={() => setIsMobilePkgCategoryOpen(!isMobilePkgCategoryOpen)}
        className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black font-inter uppercase tracking-[0.2em] text-[#F5C542]">
            Categories
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 text-amber-300 font-bold border border-amber-400/30">
            {pkgCategoryFilter === 'all' ? 'All Packages' : pkgCategoryFilter}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-amber-300">
          <span>{isMobilePkgCategoryOpen ? 'Hide Menu' : 'Browse Categories'}</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMobilePkgCategoryOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isMobilePkgCategoryOpen && (
        <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto pr-1">
          <button
            onClick={() => setPkgCategoryFilter('all')}
            className={`w-full text-left px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
              pkgCategoryFilter === 'all'
                ? 'bg-gradient-to-r from-[#F5C542] to-[#D9A514] border-[#F5C542] text-[#2B0005] font-black shadow-md'
                : 'bg-[#230005]/60 border-[#D9A514]/20 text-[#FFF8ED]/80 hover:border-[#F5C542]/50 hover:text-[#FFF8ED]'
            }`}
          >
            <span>All Packages</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${pkgCategoryFilter === 'all' ? 'bg-[#2B0005] text-[#F5C542]' : 'bg-black/40 text-white/70'}`}>
              {packages.length}
            </span>
          </button>

          {packageCategories.map((cat) => {
            const hasSubs = cat.subcategories && cat.subcategories.length > 0;
            const isExpanded = expandedPkgCategories.has(cat.id);
            const count = packages.filter((p) => matchesAdminCategory(p.category, cat.name)).length;
            const isActive = pkgCategoryFilter.toLowerCase() === cat.name.toLowerCase();
            return (
              <div key={cat.id}>
                <button
                  onClick={() => {
                    setPkgCategoryFilter(cat.name);
                    if (hasSubs) {
                      setExpandedPkgCategories((prev) => {
                        const next = new Set(prev);
                        if (next.has(cat.id)) next.delete(cat.id); else next.add(cat.id);
                        return next;
                      });
                    }
                  }}
                  className={`w-full text-left px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#F5C542] to-[#D9A514] border-[#F5C542] text-[#2B0005] font-black shadow-md'
                      : 'bg-[#230005]/60 border-[#D9A514]/20 text-[#FFF8ED]/80 hover:border-[#F5C542]/50 hover:text-[#FFF8ED]'
                  }`}
                >
                  <span className="truncate flex-1">{cat.name}</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${isActive ? 'bg-[#2B0005] text-[#F5C542]' : 'bg-black/40 text-white/70'}`}>
                      {count}
                    </span>
                    {hasSubs && (
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    )}
                  </div>
                </button>

                {hasSubs && isExpanded && (
                  <div className="ml-3 mt-1.5 flex flex-col gap-1 border-l-2 border-[#F5C542]/30 pl-2.5">
                    {cat.subcategories!.map((sub) => {
                      const subKey = `${cat.name} > ${sub}`;
                      const subCount = packages.filter((p) => matchesAdminCategory(p.category, subKey)).length;
                      const isSubActive = pkgCategoryFilter.toLowerCase() === subKey.toLowerCase();
                      return (
                        <button
                          key={sub}
                          onClick={() => setPkgCategoryFilter(subKey)}
                          className={`w-full text-left px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                            isSubActive
                              ? 'bg-gradient-to-r from-[#F5C542] to-[#D9A514] border-[#F5C542] text-[#2B0005] font-black shadow-sm'
                              : 'bg-[#230005]/40 border-[#D9A514]/15 text-[#FFF8ED]/70 hover:border-[#F5C542]/40 hover:text-[#FFF8ED]'
                          }`}
                        >
                          <span className="truncate">↳ {sub}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${isSubActive ? 'bg-[#2B0005] text-[#F5C542]' : 'bg-black/40 text-white/60'}`}>
                            {subCount}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>

    {/* Main Content Area: Grid on Left, Sidebar on Right */}
    <div className="flex items-start gap-5">
      {/* Packages Grid & Pagination Container */}
      <div className="flex-1 min-w-0 space-y-6">
        {(() => {
          const isAllMode = pkgCategoryFilter === 'all' && !pkgSearchTerm.trim();
          let displayList: Array<{ pkg: PreparedPackage; targetCategory?: string }> = [];

          if (isAllMode) {
            const usedIds = new Set<string>();
            for (const cat of packageCategories) {
              const matching = packages.filter((p) => matchesAdminCategory(p.category, cat.name));
              if (matching.length === 0) continue;
              const pick = matching.find((p) => !usedIds.has(p.id));
              if (pick) {
                usedIds.add(pick.id);
                displayList.push({ pkg: pick, targetCategory: cat.name });
              }
            }
          } else {
            displayList = packages
              .filter((pkg) => {
                const matchesCategory = matchesAdminCategory(pkg.category, pkgCategoryFilter);
                const matchesSearch =
                  !pkgSearchTerm ||
                  pkg.name.toLowerCase().includes(pkgSearchTerm.toLowerCase()) ||
                  pkg.shortDesc?.toLowerCase().includes(pkgSearchTerm.toLowerCase());
                return matchesCategory && matchesSearch;
              })
              .map((pkg) => ({ pkg }));
          }

          if (displayList.length === 0) {
            return (
              <div className="py-16 text-center text-white/50 border border-dashed border-white/10 rounded-2xl p-6 bg-black/20">
                <p className="text-sm font-medium">No packages found for this category or search.</p>
              </div>
            );
          }

          const totalPages = Math.ceil(displayList.length / ADMIN_PAGE_SIZE);
          const safePage = Math.min(pkgPage, Math.max(totalPages, 1));
          const pageItems = displayList.slice((safePage - 1) * ADMIN_PAGE_SIZE, safePage * ADMIN_PAGE_SIZE);

          return (
            <div>
              <div className={`grid gap-5 grid-cols-1 sm:grid-cols-2 ${isPkgCategorySidebarOpen ? 'lg:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'}`}>
                {pageItems.map(({ pkg, targetCategory }) => {
                  const primaryCat = targetCategory || pkg.category?.split(',')[0]?.trim() || '';
                  const routeCat = targetCategory || primaryCat;
                  return (
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
                        {pkg.requiresCustomInput && (
                          <span className={`absolute ${pkg.badge ? 'top-8.5' : 'top-3'} left-3 bg-purple-900/90 text-purple-200 border border-purple-400/40 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shadow backdrop-blur-sm flex items-center gap-1`}>
                            {pkg.customInputType === 'image' ? <Camera className="w-2.5 h-2.5 text-purple-300" /> : pkg.customInputType === 'both' ? <Sparkles className="w-2.5 h-2.5 text-purple-300" /> : <FileText className="w-2.5 h-2.5 text-purple-300" />}
                            <span>{pkg.customInputType === 'image' ? 'Photo Required' : pkg.customInputType === 'both' ? 'Photo & Text' : 'Text Required'}</span>
                          </span>
                        )}
                        <span className="absolute bottom-3 right-3 bg-black/80 text-amber-300 border border-white/20 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {pkg.itemsIncludedDetailed?.length || pkg.itemsIncluded.length} Items Inside
                        </span>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] text-amber-300/80 font-bold uppercase tracking-wider mb-0.5">
                            {primaryCat}
                          </div>
                          <h3 className="font-podium text-lg uppercase font-bold text-white mt-1">{pkg.name}</h3>
                          <p className="text-white/60 text-xs font-inter line-clamp-2 mt-1">{pkg.shortDesc}</p>
                        </div>

                        <div className="pt-4 mt-4 border-t border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-amber-300 text-lg">ETB {pkg.price.toFixed(2)}</span>
                              {pkg.price_usd && pkg.price_usd > 0 && (
                                <span className="text-white/50 text-xs">USD ${pkg.price_usd.toFixed(2)}</span>
                              )}
                            </div>
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

                          {/* See all button in All mode */}
                          {pkgCategoryFilter === 'all' && routeCat && (
                            <button
                              onClick={() => setPkgCategoryFilter(routeCat)}
                              className="group/sa mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-amber-300/80 hover:text-amber-300 font-inter font-bold uppercase tracking-wider border border-amber-400/20 hover:border-amber-400/50 rounded-lg transition-all cursor-pointer bg-black/20 hover:bg-black/40"
                            >
                              <span>See all {routeCat}</span>
                              <ArrowRight className="w-3 h-3 group-hover/sa:translate-x-0.5 transition-transform" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 select-none">
                  <button
                    onClick={() => { setPkgPage((p) => Math.max(1, p - 1)); }}
                    disabled={safePage === 1}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-black/40 border-white/15 text-white/70 hover:border-amber-400/50 hover:text-amber-300"
                  >
                    <span>‹</span> Prev
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                      const isActive = p === safePage;
                      const show = p === 1 || p === totalPages || Math.abs(p - safePage) <= 1;
                      if (!show) {
                        if (p === safePage - 2 || p === safePage + 2) return <span key={p} className="text-white/30 text-xs px-1">…</span>;
                        return null;
                      }
                      return (
                        <button
                          key={p}
                          onClick={() => { setPkgPage(p); }}
                          className={`w-9 h-9 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${isActive ? 'bg-amber-400 text-[#8c1119] border-amber-400 shadow-lg shadow-amber-400/20' : 'bg-black/40 border-white/15 text-white/60 hover:border-amber-400/50 hover:text-amber-300'}`}
                        >{p}</button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => { setPkgPage((p) => Math.min(totalPages, p + 1)); }}
                    disabled={safePage === totalPages}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-black/40 border-white/15 text-white/70 hover:border-amber-400/50 hover:text-amber-300"
                  >
                    Next <span>›</span>
                  </button>
                </div>
              )}
              {totalPages > 1 && (
                <p className="text-center text-[11px] text-white/40 mt-2 font-inter">
                  Showing {(safePage - 1) * ADMIN_PAGE_SIZE + 1}–{Math.min(safePage * ADMIN_PAGE_SIZE, displayList.length)} of {displayList.length} packages · Page {safePage} of {totalPages}
                </p>
              )}
            </div>
          );
        })()}
      </div>

      {/* Right-Side Vertical Collapsible Category Sidebar */}
      <aside
        className="hidden md:flex flex-col flex-shrink-0 transition-[width] duration-300 ease-in-out overflow-hidden bg-[#240004]/80 border border-[#D9A514]/20 rounded-2xl p-2.5 shadow-xl sticky top-4"
        style={{ width: isPkgCategorySidebarOpen ? '220px' : '48px' }}
      >
        {/* Sidebar Header & Toggle */}
        <div className={`flex items-center mb-3 pb-2 border-b border-white/10 gap-2 ${isPkgCategorySidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {isPkgCategorySidebarOpen && (
            <span className="text-[10px] font-black font-inter uppercase tracking-[0.2em] text-[#F5C542] whitespace-nowrap pl-1">
              Categories
            </span>
          )}
          <button
            onClick={() => setIsPkgCategorySidebarOpen((prev) => !prev)}
            title={isPkgCategorySidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            className="flex items-center justify-center w-7 h-7 rounded-full bg-[#1b0003] border border-[#D9A514]/30 hover:border-[#F5C542] text-[#FFF8ED]/80 hover:text-[#F5C542] transition-all cursor-pointer flex-shrink-0 shadow"
          >
            {isPkgCategorySidebarOpen ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Categories List */}
        <div
          className="flex flex-col gap-1.5 overflow-y-auto max-h-[65vh] pr-0.5"
          style={{
            opacity: isPkgCategorySidebarOpen ? 1 : 0,
            pointerEvents: isPkgCategorySidebarOpen ? 'auto' : 'none',
            transition: 'opacity 200ms ease',
          }}
        >
          <button
            onClick={() => setPkgCategoryFilter('all')}
            className={`w-full text-left px-3 py-2 text-[11px] font-bold font-inter uppercase tracking-wider rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
              pkgCategoryFilter === 'all'
                ? 'bg-gradient-to-r from-[#F5C542] to-[#D9A514] border-[#F5C542] text-[#2B0005] font-black shadow-md'
                : 'bg-[#230005]/60 border-[#D9A514]/20 text-[#FFF8ED]/80 hover:border-[#F5C542]/50 hover:text-[#FFF8ED] hover:bg-[#230005]/90'
            }`}
          >
            <span className="truncate">All Packages</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${pkgCategoryFilter === 'all' ? 'bg-[#2B0005] text-[#F5C542]' : 'bg-black/40 text-white/70'}`}>
              {packages.length}
            </span>
          </button>

          {packageCategories.map((cat) => {
            const hasSubs = cat.subcategories && cat.subcategories.length > 0;
            const isExpanded = expandedPkgCategories.has(cat.id);
            const count = packages.filter((p) => matchesAdminCategory(p.category, cat.name)).length;
            const isActive = pkgCategoryFilter.toLowerCase() === cat.name.toLowerCase();
            return (
              <div key={cat.id}>
                <button
                  onClick={() => {
                    setPkgCategoryFilter(cat.name);
                    if (hasSubs) {
                      setExpandedPkgCategories((prev) => {
                        const next = new Set(prev);
                        if (next.has(cat.id)) next.delete(cat.id); else next.add(cat.id);
                        return next;
                      });
                    }
                  }}
                  className={`w-full text-left px-3 py-2 text-[11px] font-bold font-inter uppercase tracking-wider rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#F5C542] to-[#D9A514] border-[#F5C542] text-[#2B0005] font-black shadow-md'
                      : 'bg-[#230005]/60 border-[#D9A514]/20 text-[#FFF8ED]/80 hover:border-[#F5C542]/50 hover:text-[#FFF8ED] hover:bg-[#230005]/90'
                  }`}
                >
                  <span className="truncate flex-1">{cat.name}</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${isActive ? 'bg-[#2B0005] text-[#F5C542]' : 'bg-black/40 text-white/70'}`}>
                      {count}
                    </span>
                    {hasSubs && (
                      <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    )}
                  </div>
                </button>
                {/* Subcategories */}
                {hasSubs && isExpanded && (
                  <div className="ml-3 mt-1 flex flex-col gap-1 border-l border-[#F5C542]/20 pl-2">
                  {cat.subcategories!.map((sub) => {
                      const subKey = `${cat.name} > ${sub}`;
                      const subCount = packages.filter((p) => matchesAdminCategory(p.category, subKey)).length;
                      const isSubActive = pkgCategoryFilter.toLowerCase() === subKey.toLowerCase();
                      return (
                        <button
                          key={sub}
                          onClick={() => setPkgCategoryFilter(subKey)}
                          className={`w-full text-left px-2.5 py-1.5 text-[10px] font-bold font-inter uppercase tracking-wider rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                            isSubActive
                              ? 'bg-gradient-to-r from-[#F5C542] to-[#D9A514] border-[#F5C542] text-[#2B0005] font-black shadow-md'
                              : 'bg-[#230005]/40 border-[#D9A514]/15 text-[#FFF8ED]/60 hover:border-[#F5C542]/40 hover:text-[#FFF8ED] hover:bg-[#230005]/70'
                          }`}
                        >
                          <span className="truncate">↳ {sub}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${isSubActive ? 'bg-[#2B0005] text-[#F5C542]' : 'bg-black/40 text-white/60'}`}>
                            {subCount}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  </div>
)}

          {/* TAB 4: SINGLE CUSTOM ITEMS WITH RIGHT CATEGORY SIDEBAR */}
          {activeTab === 'customItems' && (
            <div className="space-y-6">
              {/* Header & Actions */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h2 className="font-podium text-2xl sm:text-3xl uppercase font-bold text-white tracking-wide">
                    Single Custom Gift Items ({customItems.length})
                  </h2>
                  <p className="text-white/60 text-xs font-inter mt-1">
                    Upload and manage individual item options for custom box builders, categorized using your Category Menu.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative min-w-[220px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      value={itemSearchTerm}
                      onChange={(e) => setItemSearchTerm(e.target.value)}
                      placeholder="Search custom items..."
                      className="w-full bg-black/40 border border-white/20 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <button
                    onClick={() => handleOpenItemModal()}
                    className="bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Single Item</span>
                  </button>
                </div>
              </div>

              {/* Mobile: Vertical Category Menu (Matches PC Sidebar) */}
              <div className="md:hidden mb-4 bg-[#240004]/80 border border-[#D9A514]/20 rounded-2xl p-3 shadow-lg">
                <button
                  onClick={() => setIsMobileItemCategoryOpen(!isMobileItemCategoryOpen)}
                  className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black font-inter uppercase tracking-[0.2em] text-[#F5C542]">
                      Categories
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 text-amber-300 font-bold border border-amber-400/30">
                      {itemCategoryFilter === 'all' ? 'All Custom Items' : itemCategoryFilter}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-300">
                    <span>{isMobileItemCategoryOpen ? 'Hide Menu' : 'Browse Categories'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMobileItemCategoryOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isMobileItemCategoryOpen && (
                  <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto pr-1">
                    <button
                      onClick={() => setItemCategoryFilter('all')}
                      className={`w-full text-left px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        itemCategoryFilter === 'all'
                          ? 'bg-gradient-to-r from-[#F5C542] to-[#D9A514] border-[#F5C542] text-[#2B0005] font-black shadow-md'
                          : 'bg-[#230005]/60 border-[#D9A514]/20 text-[#FFF8ED]/80 hover:border-[#F5C542]/50 hover:text-[#FFF8ED]'
                      }`}
                    >
                      <span>All Custom Items</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${itemCategoryFilter === 'all' ? 'bg-[#2B0005] text-[#F5C542]' : 'bg-black/40 text-white/70'}`}>
                        {customItems.length}
                      </span>
                    </button>

                    {customItemCategories.map((cat) => {
                      const hasSubs = cat.subcategories && cat.subcategories.length > 0;
                      const isExpanded = expandedItemCategories.has(cat.id);
                      const count = customItems.filter((i) => matchesAdminCategory(i.category, cat.name)).length;
                      const isActive = itemCategoryFilter.toLowerCase() === cat.name.toLowerCase();
                      return (
                        <div key={cat.id}>
                          <button
                            onClick={() => {
                              setItemCategoryFilter(cat.name);
                              if (hasSubs) {
                                setExpandedItemCategories((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(cat.id)) next.delete(cat.id); else next.add(cat.id);
                                  return next;
                                });
                              }
                            }}
                            className={`w-full text-left px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                              isActive
                                ? 'bg-gradient-to-r from-[#F5C542] to-[#D9A514] border-[#F5C542] text-[#2B0005] font-black shadow-md'
                                : 'bg-[#230005]/60 border-[#D9A514]/20 text-[#FFF8ED]/80 hover:border-[#F5C542]/50 hover:text-[#FFF8ED]'
                            }`}
                          >
                            <span className="truncate flex-1">{cat.name}</span>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${isActive ? 'bg-[#2B0005] text-[#F5C542]' : 'bg-black/40 text-white/70'}`}>
                                {count}
                              </span>
                              {hasSubs && (
                                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                              )}
                            </div>
                          </button>

                          {hasSubs && isExpanded && (
                            <div className="ml-3 mt-1.5 flex flex-col gap-1 border-l-2 border-[#F5C542]/30 pl-2.5">
                              {cat.subcategories!.map((sub) => {
                                const subKey = `${cat.name} > ${sub}`;
                                const subCount = customItems.filter((i) => matchesAdminCategory(i.category, subKey)).length;
                                const isSubActive = itemCategoryFilter.toLowerCase() === subKey.toLowerCase();
                                return (
                                  <button
                                    key={sub}
                                    onClick={() => setItemCategoryFilter(subKey)}
                                    className={`w-full text-left px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                                      isSubActive
                                        ? 'bg-gradient-to-r from-[#F5C542] to-[#D9A514] border-[#F5C542] text-[#2B0005] font-black shadow-sm'
                                        : 'bg-[#230005]/40 border-[#D9A514]/15 text-[#FFF8ED]/70 hover:border-[#F5C542]/40 hover:text-[#FFF8ED]'
                                    }`}
                                  >
                                    <span className="truncate">↳ {sub}</span>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${isSubActive ? 'bg-[#2B0005] text-[#F5C542]' : 'bg-black/40 text-white/60'}`}>
                                      {subCount}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Main Content Area: Grid on Left, Sidebar on Right */}
              <div className="flex items-start gap-5">
                {/* Items Grid & Pagination Container */}
                <div className="flex-1 min-w-0 space-y-6">
                  {(() => {
                    const isAllMode = itemCategoryFilter === 'all' && !itemSearchTerm.trim();
                    let displayList: Array<{ item: CustomBoxOption; targetCategory?: string }> = [];

                    if (isAllMode) {
                      const usedIds = new Set<string>();
                      for (const cat of customItemCategories) {
                        const matching = customItems.filter((i) => matchesAdminCategory(i.category, cat.name));
                        if (matching.length === 0) continue;
                        const pick = matching.find((i) => !usedIds.has(i.id));
                        if (pick) {
                          usedIds.add(pick.id);
                          displayList.push({ item: pick, targetCategory: cat.name });
                        }
                      }
                    } else {
                      displayList = customItems
                        .filter((item) => {
                          const matchesCategory = matchesAdminCategory(item.category, itemCategoryFilter);
                          const matchesSearch =
                            !itemSearchTerm ||
                            item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
                            item.description?.toLowerCase().includes(itemSearchTerm.toLowerCase());
                          return matchesCategory && matchesSearch;
                        })
                        .map((item) => ({ item }));
                    }

                    if (displayList.length === 0) {
                      return (
                        <div className="py-16 text-center text-white/50 border border-dashed border-white/10 rounded-2xl p-6 bg-black/20">
                          <p className="text-sm font-medium">No custom items found for this category or search.</p>
                        </div>
                      );
                    }

                    const totalPages = Math.ceil(displayList.length / ADMIN_PAGE_SIZE);
                    const safePage = Math.min(itemPage, Math.max(totalPages, 1));
                    const pageItems = displayList.slice((safePage - 1) * ADMIN_PAGE_SIZE, safePage * ADMIN_PAGE_SIZE);

                    return (
                      <div>
                        <div className={`grid gap-5 grid-cols-1 sm:grid-cols-2 ${isItemCategorySidebarOpen ? 'lg:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'}`}>
                          {pageItems.map(({ item, targetCategory }) => {
                            const primaryCat = targetCategory || item.category?.split(',')[0]?.trim() || '';
                            const routeCat = targetCategory || primaryCat;
                            return (
                              <div
                                key={item.id}
                                className="bg-[#2e0508] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl group"
                              >
                                <div className="relative h-40 bg-black/40 overflow-hidden">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                  {item.requiresCustomInput && (
                                    <span className="absolute top-3 left-3 bg-purple-900/90 text-purple-200 border border-purple-400/40 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shadow backdrop-blur-sm flex items-center gap-1">
                                      {item.customInputType === 'image' ? <Camera className="w-2.5 h-2.5 text-purple-300" /> : item.customInputType === 'both' ? <Sparkles className="w-2.5 h-2.5 text-purple-300" /> : <FileText className="w-2.5 h-2.5 text-purple-300" />}
                                      <span>{item.customInputType === 'image' ? 'Photo Required' : item.customInputType === 'both' ? 'Photo & Text' : 'Text Required'}</span>
                                    </span>
                                  )}
                                </div>

                                <div className="p-4 flex-1 flex flex-col justify-between">
                                  <div>
                                    <div className="text-[10px] text-amber-300/80 font-bold uppercase tracking-wider mb-0.5">
                                      {primaryCat}
                                    </div>
                                    <h3 className="font-podium text-base uppercase font-bold text-white">{item.name}</h3>
                                    <p className="text-white/60 text-xs font-inter line-clamp-2 mt-1">{item.description}</p>
                                  </div>

                                  <div className="pt-4 mt-4 border-t border-white/10">
                                    <div className="flex items-center justify-between">
                                      <div className="flex flex-col gap-0.5">
                                        <span className="font-bold text-amber-300 text-lg">ETB {item.price.toFixed(2)}</span>
                                        {item.price_usd && item.price_usd > 0 && (
                                          <span className="text-white/50 text-xs">USD ${item.price_usd.toFixed(2)}</span>
                                        )}
                                      </div>
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

                                    {/* See all button in All mode */}
                                    {itemCategoryFilter === 'all' && routeCat && (
                                      <button
                                        onClick={() => setItemCategoryFilter(routeCat)}
                                        className="group/sa mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-amber-300/80 hover:text-amber-300 font-inter font-bold uppercase tracking-wider border border-amber-400/20 hover:border-amber-400/50 rounded-lg transition-all cursor-pointer bg-black/20 hover:bg-black/40"
                                      >
                                        <span>See all {routeCat}</span>
                                        <ArrowRight className="w-3 h-3 group-hover/sa:translate-x-0.5 transition-transform" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-center gap-2 mt-8 select-none">
                            <button
                              onClick={() => { setItemPage((p) => Math.max(1, p - 1)); }}
                              disabled={safePage === 1}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-black/40 border-white/15 text-white/70 hover:border-amber-400/50 hover:text-amber-300"
                            >
                              <span>‹</span> Prev
                            </button>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                                const isActive = p === safePage;
                                const show = p === 1 || p === totalPages || Math.abs(p - safePage) <= 1;
                                if (!show) {
                                  if (p === safePage - 2 || p === safePage + 2) return <span key={p} className="text-white/30 text-xs px-1">…</span>;
                                  return null;
                                }
                                return (
                                  <button
                                    key={p}
                                    onClick={() => { setItemPage(p); }}
                                    className={`w-9 h-9 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${isActive ? 'bg-amber-400 text-[#8c1119] border-amber-400 shadow-lg shadow-amber-400/20' : 'bg-black/40 border-white/15 text-white/60 hover:border-amber-400/50 hover:text-amber-300'}`}
                                  >{p}</button>
                                );
                              })}
                            </div>
                            <button
                              onClick={() => { setItemPage((p) => Math.min(totalPages, p + 1)); }}
                              disabled={safePage === totalPages}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-black/40 border-white/15 text-white/70 hover:border-amber-400/50 hover:text-amber-300"
                            >
                              Next <span>›</span>
                            </button>
                          </div>
                        )}
                        {totalPages > 1 && (
                          <p className="text-center text-[11px] text-white/40 mt-2 font-inter">
                            Showing {(safePage - 1) * ADMIN_PAGE_SIZE + 1}–{Math.min(safePage * ADMIN_PAGE_SIZE, displayList.length)} of {displayList.length} items · Page {safePage} of {totalPages}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Right-Side Vertical Collapsible Category Sidebar */}
                <aside
                  className="hidden md:flex flex-col flex-shrink-0 transition-[width] duration-300 ease-in-out overflow-hidden bg-[#240004]/80 border border-[#D9A514]/20 rounded-2xl p-2.5 shadow-xl sticky top-4"
                  style={{ width: isItemCategorySidebarOpen ? '220px' : '48px' }}
                >
                  {/* Sidebar Header & Toggle */}
                  <div className={`flex items-center mb-3 pb-2 border-b border-white/10 gap-2 ${isItemCategorySidebarOpen ? 'justify-between' : 'justify-center'}`}>
                    {isItemCategorySidebarOpen && (
                      <span className="text-[10px] font-black font-inter uppercase tracking-[0.2em] text-[#F5C542] whitespace-nowrap pl-1">
                        Categories
                      </span>
                    )}
                    <button
                      onClick={() => setIsItemCategorySidebarOpen((prev) => !prev)}
                      title={isItemCategorySidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                      className="flex items-center justify-center w-7 h-7 rounded-full bg-[#1b0003] border border-[#D9A514]/30 hover:border-[#F5C542] text-[#FFF8ED]/80 hover:text-[#F5C542] transition-all cursor-pointer flex-shrink-0 shadow"
                    >
                      {isItemCategorySidebarOpen ? (
                        <ChevronRight className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronLeft className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Categories List */}
                  <div
                    className="flex flex-col gap-1.5 overflow-y-auto max-h-[65vh] pr-0.5"
                    style={{
                      opacity: isItemCategorySidebarOpen ? 1 : 0,
                      pointerEvents: isItemCategorySidebarOpen ? 'auto' : 'none',
                      transition: 'opacity 200ms ease',
                    }}
                  >
                    <button
                      onClick={() => setItemCategoryFilter('all')}
                      className={`w-full text-left px-3 py-2 text-[11px] font-bold font-inter uppercase tracking-wider rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        itemCategoryFilter === 'all'
                          ? 'bg-gradient-to-r from-[#F5C542] to-[#D9A514] border-[#F5C542] text-[#2B0005] font-black shadow-md'
                          : 'bg-[#230005]/60 border-[#D9A514]/20 text-[#FFF8ED]/80 hover:border-[#F5C542]/50 hover:text-[#FFF8ED] hover:bg-[#230005]/90'
                      }`}
                    >
                      <span className="truncate">All Items</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${itemCategoryFilter === 'all' ? 'bg-[#2B0005] text-[#F5C542]' : 'bg-black/40 text-white/70'}`}>
                        {customItems.length}
                      </span>
                    </button>

                    {customItemCategories.map((cat) => {
                      const hasSubs = cat.subcategories && cat.subcategories.length > 0;
                      const isExpanded = expandedItemCategories.has(cat.id);
                      const count = customItems.filter((i) => matchesAdminCategory(i.category, cat.name)).length;
                      const isActive = itemCategoryFilter.toLowerCase() === cat.name.toLowerCase();
                      return (
                        <div key={cat.id}>
                          <button
                            onClick={() => {
                              setItemCategoryFilter(cat.name);
                              if (hasSubs) {
                                setExpandedItemCategories((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(cat.id)) next.delete(cat.id); else next.add(cat.id);
                                  return next;
                                });
                              }
                            }}
                            className={`w-full text-left px-3 py-2 text-[11px] font-bold font-inter uppercase tracking-wider rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                              isActive
                                ? 'bg-gradient-to-r from-[#F5C542] to-[#D9A514] border-[#F5C542] text-[#2B0005] font-black shadow-md'
                                : 'bg-[#230005]/60 border-[#D9A514]/20 text-[#FFF8ED]/80 hover:border-[#F5C542]/50 hover:text-[#FFF8ED] hover:bg-[#230005]/90'
                            }`}
                          >
                            <span className="truncate flex-1">{cat.name}</span>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${isActive ? 'bg-[#2B0005] text-[#F5C542]' : 'bg-black/40 text-white/70'}`}>
                                {count}
                              </span>
                              {hasSubs && (
                                <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                              )}
                            </div>
                          </button>
                          {/* Subcategories */}
                          {hasSubs && isExpanded && (
                            <div className="ml-3 mt-1 flex flex-col gap-1 border-l border-[#F5C542]/20 pl-2">
                              {cat.subcategories!.map((sub) => {
                                const subKey = `${cat.name} > ${sub}`;
                                const subCount = customItems.filter((i) => matchesAdminCategory(i.category, subKey)).length;
                                const isSubActive = itemCategoryFilter.toLowerCase() === subKey.toLowerCase();
                                return (
                                  <button
                                    key={sub}
                                    onClick={() => setItemCategoryFilter(subKey)}
                                    className={`w-full text-left px-2.5 py-1.5 text-[10px] font-bold font-inter uppercase tracking-wider rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                                      isSubActive
                                        ? 'bg-gradient-to-r from-[#F5C542] to-[#D9A514] border-[#F5C542] text-[#2B0005] font-black shadow-md'
                                        : 'bg-[#230005]/40 border-[#D9A514]/15 text-[#FFF8ED]/60 hover:border-[#F5C542]/40 hover:text-[#FFF8ED] hover:bg-[#230005]/70'
                                    }`}
                                  >
                                    <span className="truncate">↳ {sub}</span>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${isSubActive ? 'bg-[#2B0005] text-[#F5C542]' : 'bg-black/40 text-white/60'}`}>
                                      {subCount}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </aside>
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

                        {/* Subcategory Pills */}
                        {cat.subcategories && cat.subcategories.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block mb-1.5">Subcategories:</span>
                            <div className="flex flex-wrap gap-1">
                              {cat.subcategories.map((sub) => (
                                <span key={sub} className="px-2 py-0.5 rounded-full bg-[#F5C542]/10 border border-[#F5C542]/25 text-amber-300/80 text-[10px] font-bold font-inter">
                                  {sub}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-inter">
          <div className="bg-[#2c0407] border border-amber-400/40 rounded-2xl max-w-lg w-full p-4 sm:p-6 md:p-8 relative shadow-2xl animate-scale-in my-auto max-h-[94vh] sm:max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setCategoryModalOpen(false)}
              className="sticky top-0 float-right -mt-1 -mr-1 sm:-mt-2 sm:-mr-2 text-white/70 hover:text-white p-2 sm:p-2.5 rounded-full bg-black/80 hover:bg-white/20 border border-white/20 shadow-xl z-30 cursor-pointer mb-2"
              title="Close modal"
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

              {/* Subcategories Section */}
              <div>
                <label className="block text-xs uppercase text-amber-300 font-bold mb-1">
                  Subcategories <span className="text-white/40 normal-case font-normal">(optional)</span>
                </label>
                <p className="text-white/40 text-[10px] mb-2 font-inter leading-snug">
                  Add subcategory names (e.g. "Muslim", "Christian"). Tag items with these names and they will appear grouped under this parent.
                </p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={subcategoryInput}
                    onChange={(e) => setSubcategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ',') && subcategoryInput.trim()) {
                        e.preventDefault();
                        const val = subcategoryInput.trim().replace(/,$/,'');
                        if (val && !categoryForm.subcategories.includes(val)) {
                          setCategoryForm({ ...categoryForm, subcategories: [...categoryForm.subcategories, val] });
                        }
                        setSubcategoryInput('');
                      }
                    }}
                    placeholder="Type a subcategory and press Enter..."
                    className="flex-1 bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = subcategoryInput.trim();
                      if (val && !categoryForm.subcategories.includes(val)) {
                        setCategoryForm({ ...categoryForm, subcategories: [...categoryForm.subcategories, val] });
                      }
                      setSubcategoryInput('');
                    }}
                    className="px-3 py-2 rounded-lg bg-amber-400/20 border border-amber-400/40 hover:bg-amber-400/40 text-amber-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                {categoryForm.subcategories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {categoryForm.subcategories.map((sub) => (
                      <span key={sub} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F5C542]/15 border border-[#F5C542]/30 text-amber-300 text-[10px] font-bold font-inter">
                        {sub}
                        <button
                          type="button"
                          onClick={() => setCategoryForm({ ...categoryForm, subcategories: categoryForm.subcategories.filter((s) => s !== sub) })}
                          className="text-amber-400/70 hover:text-red-400 transition-colors cursor-pointer ml-0.5"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-6 overflow-y-auto font-inter">
          <div className="bg-[#2c0407] border border-amber-400/40 rounded-2xl max-w-4xl w-full p-4 sm:p-8 relative shadow-2xl animate-scale-in my-auto max-h-[95vh] sm:max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setPkgModalOpen(false)}
              className="sticky top-0 float-right -mt-1 -mr-1 sm:-mt-3 sm:-mr-3 text-white/70 hover:text-white p-2 sm:p-2.5 rounded-full bg-black/80 hover:bg-white/20 border border-white/20 shadow-xl z-30 cursor-pointer mb-2"
              title="Close modal"
            >
              <X className="w-5 sm:w-6 h-5 sm:h-6" />
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
                      Categories (Select One or More) <span className="text-red-400">*</span>
                    </label>
                    <div className="space-y-2">
                      <div className="p-2.5 bg-black/50 border border-white/20 rounded-lg min-h-[46px]">
                        {/* Parent category pills row */}
                        <div className="flex flex-wrap gap-2">
                          {packageCategories.map((c) => {
                            const selectedList = pkgForm.category.split(',').map((s) => s.trim()).filter(Boolean);
                            const isSelected = selectedList.some((s) => s.toLowerCase() === c.name.toLowerCase());
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  const curList = pkgForm.category.split(',').map((s) => s.trim()).filter(Boolean);
                                  let newList: string[];
                                  if (isSelected) {
                                    newList = curList.filter((s) => s.toLowerCase() !== c.name.toLowerCase());
                                  } else {
                                    newList = [...curList, c.name];
                                  }
                                  setPkgForm({ ...pkgForm, category: newList.join(', ') });
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                  isSelected
                                    ? 'bg-amber-400 text-[#8c1119] border border-amber-400 shadow-sm scale-105'
                                    : 'bg-black/60 text-white/70 border border-white/15 hover:border-amber-400/50 hover:text-white'
                                }`}
                              >
                                {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : <Plus className="w-3 h-3 text-white/40" />}
                                <span>{c.name}</span>
                              </button>
                            );
                          })}
                        </div>
                        {/* Subcategory pills grouped by parent */}
                        {packageCategories.some((c) => c.subcategories && c.subcategories.length > 0) && (
                          <div className="mt-3 space-y-2">
                            {packageCategories.filter((c) => c.subcategories && c.subcategories.length > 0).map((c) => {
                              const selectedList = pkgForm.category.split(',').map((s) => s.trim()).filter(Boolean);
                              return (
                                <div key={`sub-${c.id}`} className="pl-2 border-l border-amber-400/20">
                                  <span className="text-[10px] text-amber-400/70 font-bold uppercase tracking-wider">{c.name} ↳</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {c.subcategories!.map((sub) => {
                                      const subKey = `${c.name} > ${sub}`;
                                      const isSubSelected = selectedList.some((s) => s.toLowerCase() === subKey.toLowerCase());
                                      return (
                                        <button
                                          type="button"
                                          key={sub}
                                          onClick={() => {
                                            const curList = pkgForm.category.split(',').map((s) => s.trim()).filter(Boolean);
                                            let newList: string[];
                                            if (isSubSelected) {
                                              newList = curList.filter((s) => s.toLowerCase() !== subKey.toLowerCase());
                                            } else {
                                              newList = [...curList, subKey];
                                            }
                                            setPkgForm({ ...pkgForm, category: newList.join(', ') });
                                          }}
                                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                                            isSubSelected
                                              ? 'bg-amber-300 text-[#8c1119] border border-amber-300 shadow-sm'
                                              : 'bg-black/40 text-white/60 border border-white/10 hover:border-amber-300/40 hover:text-white'
                                          }`}
                                        >
                                          {isSubSelected ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <span className="text-white/30">↳</span>}
                                          <span>{sub}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        value={pkgForm.category}
                        onChange={(e) => setPkgForm({ ...pkgForm, category: e.target.value })}
                        placeholder="e.g. Birthday, Luxury, Anniversary (comma separated)"
                        className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-xs text-amber-300 font-bold focus:border-amber-400 focus:outline-none"
                      />
                      <p className="text-[10px] text-white/50">
                        💡 Click badges above to toggle multiple categories, or type custom comma-separated category names.
                      </p>
                    </div>
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

                {/* Customer Input Requirement Controls */}
                <div className="mt-4 pt-4 border-t border-white/10 bg-[#3a060b]/60 rounded-xl p-4 border border-amber-400/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pkgForm.requiresCustomInput}
                          onChange={(e) => setPkgForm({ ...pkgForm, requiresCustomInput: e.target.checked })}
                          className="w-4 h-4 rounded border-amber-400/50 text-amber-500 focus:ring-amber-400 bg-black/40 cursor-pointer"
                        />
                        <span className="font-bold text-xs uppercase tracking-wider text-amber-300">
                          Requires Client Customization (Photo / Custom Text)
                        </span>
                      </label>
                      <p className="text-[11px] text-white/60 ml-6.5 mt-0.5">
                        Enable if the buyer must upload a photo or write custom text when adding this package to their cart.
                      </p>
                    </div>
                  </div>

                  {pkgForm.requiresCustomInput && (
                    <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4 pl-6.5">
                      <div>
                        <label className="block text-[11px] uppercase text-amber-300 font-bold mb-1.5">
                          What does the client need to provide?
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'text', label: 'Text Only', icon: FileText },
                            { id: 'image', label: 'Photo Upload', icon: Camera },
                            { id: 'both', label: 'Photo & Text', icon: Sparkles },
                          ].map((t) => {
                            const Icon = t.icon;
                            const isSelected = pkgForm.customInputType === t.id;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => setPkgForm({ ...pkgForm, customInputType: t.id as any })}
                                className={`p-2 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-amber-400 text-[#8c1119] border-amber-400 shadow-md font-extrabold'
                                    : 'bg-black/30 border-white/15 text-white/70 hover:text-white hover:border-white/30'
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                                <span className="text-[10px] whitespace-nowrap">{t.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase text-amber-300 font-bold mb-1.5">
                          Prompt / Instruction Label for Client
                        </label>
                        <input
                          type="text"
                          value={pkgForm.customInputLabel}
                          onChange={(e) => setPkgForm({ ...pkgForm, customInputLabel: e.target.value })}
                          placeholder="e.g. Upload couple photo & enter anniversary date"
                          className="w-full bg-black/60 border border-white/20 rounded-lg p-2 text-xs text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
                        />
                        <span className="text-[10px] text-white/40 block mt-1">
                          This label is shown directly to the buyer when adding to cart.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Scalable Unit Controls (e.g. Cakes by Kg, Flowers by Stems) */}
                <div className="mt-4 pt-4 border-t border-white/10 bg-[#3a060b]/60 rounded-xl p-4 border border-amber-400/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pkgForm.hasCustomUnit}
                          onChange={(e) => setPkgForm({ ...pkgForm, hasCustomUnit: e.target.checked })}
                          className="w-4 h-4 rounded border-amber-400/50 text-amber-500 focus:ring-amber-400 bg-black/40 cursor-pointer"
                        />
                        <span className="font-bold text-xs uppercase tracking-wider text-amber-300">
                          Enable Scalable Portion / Size (Kg, Stems, Pieces, etc.)
                        </span>
                      </label>
                      <p className="text-[11px] text-white/60 ml-6.5 mt-0.5">
                        Ideal for gifts like cakes (e.g., min 2 kg), flower bouquets (by stems), or chocolates (by pieces) where price scales with quantity.
                      </p>
                    </div>
                  </div>

                  {pkgForm.hasCustomUnit && (
                    <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pl-6.5">
                      <div>
                        <label className="block text-[11px] uppercase text-amber-300 font-bold mb-1">
                          Unit Name (e.g., kg, stems, pieces)
                        </label>
                        <input
                          type="text"
                          value={pkgForm.customUnitName}
                          onChange={(e) => setPkgForm({ ...pkgForm, customUnitName: e.target.value })}
                          placeholder="e.g. kg, stems, pieces"
                          className="w-full bg-black/60 border border-white/20 rounded-lg p-2 text-xs text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase text-amber-300 font-bold mb-1">
                          Minimum Quantity / Starting Size
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0.1"
                          value={pkgForm.customUnitMin}
                          onChange={(e) => setPkgForm({ ...pkgForm, customUnitMin: e.target.value })}
                          placeholder="e.g. 2"
                          className="w-full bg-black/60 border border-white/20 rounded-lg p-2 text-xs text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
                        />
                        <span className="text-[10px] text-white/40 block mt-0.5">Base price applies to this starting amount</span>
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase text-amber-300 font-bold mb-1">
                          Step Increment (+ / -)
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0.1"
                          value={pkgForm.customUnitStep}
                          onChange={(e) => setPkgForm({ ...pkgForm, customUnitStep: e.target.value })}
                          placeholder="e.g. 1"
                          className="w-full bg-black/60 border border-white/20 rounded-lg p-2 text-xs text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase text-amber-300 font-bold mb-1">
                          Maximum Quantity (Optional)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={pkgForm.customUnitMax}
                          onChange={(e) => setPkgForm({ ...pkgForm, customUnitMax: e.target.value })}
                          placeholder="e.g. 10"
                          className="w-full bg-black/60 border border-white/20 rounded-lg p-2 text-xs text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase text-amber-300 font-bold mb-1">
                          Price per Unit ETB (Optional)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={pkgForm.customUnitPricePerUnit}
                          onChange={(e) => setPkgForm({ ...pkgForm, customUnitPricePerUnit: e.target.value })}
                          placeholder="Defaults to Base / Min"
                          className="w-full bg-black/60 border border-white/20 rounded-lg p-2 text-xs text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase text-amber-300 font-bold mb-1">
                          Price per Unit USD (Optional)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={pkgForm.customUnitPricePerUnitUsd}
                          onChange={(e) => setPkgForm({ ...pkgForm, customUnitPricePerUnitUsd: e.target.value })}
                          placeholder="Defaults to Base USD / Min"
                          className="w-full bg-black/60 border border-white/20 rounded-lg p-2 text-xs text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
                        />
                      </div>
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
                            value={customItems.some((i) => i.name === subItem.name) ? subItem.name : (subItem.name ? '__custom__' : '')}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '__custom__') {
                                handleUpdateSubItem(index, 'name', '__custom__');
                              } else if (val) {
                                const selectedItem = customItems.find((item) => item.name === val);
                                if (selectedItem) {
                                  handleSelectCustomItemForSubItem(index, selectedItem);
                                }
                              } else {
                                handleUpdateSubItem(index, 'name', '');
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
                          {(!customItems.some((i) => i.name === subItem.name) || subItem.name === '__custom__') && (
                            <input
                              type="text"
                              value={subItem.name === '__custom__' ? '' : subItem.name}
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-inter">
          <div className="bg-[#2c0407] border border-amber-400/40 rounded-2xl max-w-lg w-full p-4 sm:p-6 md:p-8 relative shadow-2xl animate-scale-in my-auto max-h-[94vh] sm:max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setItemModalOpen(false)}
              className="sticky top-0 float-right -mt-1 -mr-1 sm:-mt-2 sm:-mr-2 text-white/70 hover:text-white p-2 sm:p-2.5 rounded-full bg-black/80 hover:bg-white/20 border border-white/20 shadow-xl z-30 cursor-pointer mb-2"
              title="Close modal"
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
                <div className="md:col-span-3">
                  <label className="block text-xs uppercase text-amber-300 font-bold mb-1">
                    Categories (Select One or More) <span className="text-red-400">*</span>
                  </label>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-black/50 border border-white/20 rounded-lg min-h-[46px]">
                      {/* Parent category pills row */}
                      <div className="flex flex-wrap gap-2">
                        {customItemCategories.map((c) => {
                          const selectedList = itemForm.category.split(',').map((s) => s.trim()).filter(Boolean);
                          const isSelected = selectedList.some((s) => s.toLowerCase() === c.name.toLowerCase());
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                const curList = itemForm.category.split(',').map((s) => s.trim()).filter(Boolean);
                                let newList: string[];
                                if (isSelected) {
                                  newList = curList.filter((s) => s.toLowerCase() !== c.name.toLowerCase());
                                } else {
                                  newList = [...curList, c.name];
                                }
                                setItemForm({ ...itemForm, category: newList.join(', ') });
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-400 text-[#8c1119] border border-amber-400 shadow-sm scale-105'
                                  : 'bg-black/60 text-white/70 border border-white/15 hover:border-amber-400/50 hover:text-white'
                              }`}
                            >
                              {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : <Plus className="w-3 h-3 text-white/40" />}
                              <span>{c.name}</span>
                            </button>
                          );
                        })}
                      </div>
                      {/* Subcategory pills grouped by parent */}
                      {customItemCategories.some((c) => c.subcategories && c.subcategories.length > 0) && (
                        <div className="mt-3 space-y-2">
                          {customItemCategories.filter((c) => c.subcategories && c.subcategories.length > 0).map((c) => {
                            const selectedList = itemForm.category.split(',').map((s) => s.trim()).filter(Boolean);
                            return (
                              <div key={`sub-${c.id}`} className="pl-2 border-l border-amber-400/20">
                                <span className="text-[10px] text-amber-400/70 font-bold uppercase tracking-wider">{c.name} ↳</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {c.subcategories!.map((sub) => {
                                    const subKey = `${c.name} > ${sub}`;
                                    const isSubSelected = selectedList.some((s) => s.toLowerCase() === subKey.toLowerCase());
                                    return (
                                      <button
                                        type="button"
                                        key={sub}
                                        onClick={() => {
                                          const curList = itemForm.category.split(',').map((s) => s.trim()).filter(Boolean);
                                          let newList: string[];
                                          if (isSubSelected) {
                                            newList = curList.filter((s) => s.toLowerCase() !== subKey.toLowerCase());
                                          } else {
                                            newList = [...curList, subKey];
                                          }
                                          setItemForm({ ...itemForm, category: newList.join(', ') });
                                        }}
                                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                                          isSubSelected
                                            ? 'bg-amber-300 text-[#8c1119] border border-amber-300 shadow-sm'
                                            : 'bg-black/40 text-white/60 border border-white/10 hover:border-amber-300/40 hover:text-white'
                                        }`}
                                      >
                                        {isSubSelected ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <span className="text-white/30">↳</span>}
                                        <span>{sub}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      value={itemForm.category}
                      onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                      placeholder="e.g. Sweets & Chocolates, Romantic Add-ons (comma separated)"
                      className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-xs text-amber-300 font-bold focus:border-amber-400 focus:outline-none"
                    />
                    <p className="text-[10px] text-white/50">
                      💡 Click badges above to toggle multiple categories, or type custom comma-separated category names.
                    </p>
                  </div>
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

              {/* Customer Customization Requirement Controls */}
              <div className="pt-3 border-t border-white/10 bg-[#3a060b]/60 rounded-xl p-3.5 border border-amber-400/20 space-y-3">
                <div>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={itemForm.requiresCustomInput}
                      onChange={(e) => setItemForm({ ...itemForm, requiresCustomInput: e.target.checked })}
                      className="w-4 h-4 rounded border-amber-400/50 text-amber-500 focus:ring-amber-400 bg-black/40 cursor-pointer"
                    />
                    <span className="font-bold text-xs uppercase tracking-wider text-amber-300">
                      Requires Client Customization (Photo / Custom Text)
                    </span>
                  </label>
                  <p className="text-[11px] text-white/60 ml-6.5 mt-0.5">
                    Enable for items like printed mugs, custom jewelry, photo frames, or custom engraved accessories.
                  </p>
                </div>

                {itemForm.requiresCustomInput && (
                  <div className="space-y-3 pt-2 border-t border-white/10 pl-6.5">
                    <div>
                      <label className="block text-[11px] uppercase text-amber-300 font-bold mb-1.5">
                        What does the client need to provide?
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'text', label: 'Text Only', icon: FileText },
                          { id: 'image', label: 'Photo Upload', icon: Camera },
                          { id: 'both', label: 'Photo & Text', icon: Sparkles },
                        ].map((t) => {
                          const Icon = t.icon;
                          const isSelected = itemForm.customInputType === t.id;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setItemForm({ ...itemForm, customInputType: t.id as any })}
                              className={`p-2 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-400 text-[#8c1119] border-amber-400 shadow-md font-extrabold'
                                  : 'bg-black/30 border-white/15 text-white/70 hover:text-white hover:border-white/30'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              <span className="text-[10px] whitespace-nowrap">{t.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase text-amber-300 font-bold mb-1.5">
                        Prompt / Instruction Label for Client
                      </label>
                      <input
                        type="text"
                        value={itemForm.customInputLabel}
                        onChange={(e) => setItemForm({ ...itemForm, customInputLabel: e.target.value })}
                        placeholder="e.g. Enter name or message to print on mug"
                        className="w-full bg-black/60 border border-white/20 rounded-lg p-2 text-xs text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
                      />
                      <span className="text-[10px] text-white/40 block mt-1">
                        This instruction is shown to the buyer when adding this item to their custom box.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Scalable Unit Controls (e.g. Cakes by Kg, Flowers by Stems, Chocolates by Piece) */}
              <div className="pt-3 border-t border-white/10 bg-[#3a060b]/60 rounded-xl p-3.5 border border-amber-400/20 space-y-3">
                <div>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={itemForm.hasCustomUnit}
                      onChange={(e) => setItemForm({ ...itemForm, hasCustomUnit: e.target.checked })}
                      className="w-4 h-4 rounded border-amber-400/50 text-amber-500 focus:ring-amber-400 bg-black/40 cursor-pointer"
                    />
                    <span className="font-bold text-xs uppercase tracking-wider text-amber-300">
                      Enable Scalable Portion / Size (Kg, Stems, Pieces, etc.)
                    </span>
                  </label>
                  <p className="text-[11px] text-white/60 ml-6.5 mt-0.5">
                    Ideal for single items like cakes (e.g., starting at 2 kg), flowers (by stem), or chocolates (by piece).
                  </p>
                </div>

                {itemForm.hasCustomUnit && (
                  <div className="pt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pl-6.5">
                    <div>
                      <label className="block text-[11px] uppercase text-amber-300 font-bold mb-1">
                        Unit Name (e.g., kg, stems, pieces)
                      </label>
                      <input
                        type="text"
                        value={itemForm.customUnitName}
                        onChange={(e) => setItemForm({ ...itemForm, customUnitName: e.target.value })}
                        placeholder="e.g. kg, stems, pieces"
                        className="w-full bg-black/60 border border-white/20 rounded-lg p-2 text-xs text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase text-amber-300 font-bold mb-1">
                        Minimum Quantity / Starting Size
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0.1"
                        value={itemForm.customUnitMin}
                        onChange={(e) => setItemForm({ ...itemForm, customUnitMin: e.target.value })}
                        placeholder="e.g. 2"
                        className="w-full bg-black/60 border border-white/20 rounded-lg p-2 text-xs text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
                      />
                      <span className="text-[10px] text-white/40 block mt-0.5">Base price applies to this starting amount</span>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase text-amber-300 font-bold mb-1">
                        Step Increment (+ / -)
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0.1"
                        value={itemForm.customUnitStep}
                        onChange={(e) => setItemForm({ ...itemForm, customUnitStep: e.target.value })}
                        placeholder="e.g. 1"
                        className="w-full bg-black/60 border border-white/20 rounded-lg p-2 text-xs text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase text-amber-300 font-bold mb-1">
                        Maximum Quantity (Optional)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={itemForm.customUnitMax}
                        onChange={(e) => setItemForm({ ...itemForm, customUnitMax: e.target.value })}
                        placeholder="e.g. 10"
                        className="w-full bg-black/60 border border-white/20 rounded-lg p-2 text-xs text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase text-amber-300 font-bold mb-1">
                        Price per Unit ETB (Optional)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={itemForm.customUnitPricePerUnit}
                        onChange={(e) => setItemForm({ ...itemForm, customUnitPricePerUnit: e.target.value })}
                        placeholder="Defaults to Base / Min"
                        className="w-full bg-black/60 border border-white/20 rounded-lg p-2 text-xs text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase text-amber-300 font-bold mb-1">
                        Price per Unit USD (Optional)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={itemForm.customUnitPricePerUnitUsd}
                        onChange={(e) => setItemForm({ ...itemForm, customUnitPricePerUnitUsd: e.target.value })}
                        placeholder="Defaults to Base USD / Min"
                        className="w-full bg-black/60 border border-white/20 rounded-lg p-2 text-xs text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
                      />
                    </div>
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-inter">
          <div className="bg-[#2c0407] border border-amber-400/40 rounded-2xl max-w-lg w-full p-4 sm:p-6 md:p-8 relative shadow-2xl animate-scale-in my-auto max-h-[94vh] sm:max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setBoxModalOpen(false)}
              className="sticky top-0 float-right -mt-1 -mr-1 sm:-mt-2 sm:-mr-2 text-white/70 hover:text-white p-2 sm:p-2.5 rounded-full bg-black/80 hover:bg-white/20 border border-white/20 shadow-xl z-30 cursor-pointer mb-2"
              title="Close modal"
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-6 overflow-y-auto font-inter">
          <div className="bg-[#2c0407] border border-amber-400/40 rounded-2xl max-w-3xl w-full p-4 sm:p-8 relative shadow-2xl animate-scale-in my-auto max-h-[95vh] sm:max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setCreateOrderModalOpen(false)}
              className="sticky top-0 float-right -mt-1 -mr-1 sm:-mt-3 sm:-mr-3 text-white/70 hover:text-white p-2 sm:p-2.5 rounded-full bg-black/80 hover:bg-white/20 border border-white/20 shadow-xl z-30 cursor-pointer mb-2"
              title="Close modal"
            >
              <X className="w-5 sm:w-6 h-5 sm:h-6" />
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
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-6 overflow-y-auto font-inter">
          <div className="bg-[#2c0407] border border-amber-400/40 rounded-2xl max-w-2xl w-full p-4 sm:p-8 relative shadow-2xl animate-scale-in my-auto max-h-[94vh] sm:max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrderDetails(null)}
              className="sticky top-0 float-right -mt-1 -mr-1 sm:-mt-2 sm:-mr-2 text-white/70 hover:text-white p-2 sm:p-2.5 rounded-full bg-black/80 hover:bg-white/20 border border-white/20 shadow-xl z-30 cursor-pointer mb-2"
              title="Close modal"
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
                    const isPkg = !!it.package;
                    const singleObj = ('item' in it && it.item) ? it.item : ('selectedItems' in it ? it.selectedItems?.[0] : null);
                    const title = isPkg ? it.package.name : (singleObj?.name || 'Single Item');
                    if (it.unitCalculatedPrice != null) {
                      itemPrice = it.unitCalculatedPrice;
                    } else if (isPkg) {
                      itemPrice = isUsd && it.package.price_usd != null && it.package.price_usd > 0
                        ? it.package.price_usd
                        : (isUsd ? Math.round((it.package.price / 120) * 100) / 100 : it.package.price);
                    } else {
                      if (singleObj) {
                        itemPrice = isUsd && singleObj.price_usd != null && singleObj.price_usd > 0
                          ? singleObj.price_usd
                          : (isUsd ? Math.round((singleObj.price / 120) * 100) / 100 : singleObj.price);
                      } else {
                        itemPrice = it.totalPrice || 0;
                      }
                    }
                    return (
                      <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white text-sm flex items-center flex-wrap gap-2">
                            <span>{title}</span>
                            {it.customUnitValue != null && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                Size / Portion: {it.customUnitValue} {it.customUnitName || 'kg'}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-white/60">Qty: {it.quantity} • {isPkg ? 'Ready-Made Package' : (singleObj?.category || 'Single Item')}</div>

                          {/* Customer Customization Details (Text & Photo) */}
                          {(it.customerInputText || it.customerInputImageUrl) && (
                            <div className="mt-2 bg-[#3a060b]/70 border border-purple-400/30 rounded-lg p-2.5 space-y-1.5 max-w-md">
                              <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-purple-400" />
                                <span>Client Customization Details</span>
                              </div>
                              {it.customerInputText && (
                                <div className="text-white text-xs bg-black/40 rounded p-1.5 border border-white/10">
                                  <span className="text-white/60 font-semibold">Custom Text: </span>
                                  <span className="text-amber-200 font-medium font-mono">"{it.customerInputText}"</span>
                                </div>
                              )}
                              {it.customerInputImageUrl && (
                                <div className="pt-1 flex items-center gap-2">
                                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-purple-400/40 bg-black/60 flex-shrink-0">
                                    <img
                                      src={it.customerInputImageUrl}
                                      alt="Client Custom Photo"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-white/70 block">Client Uploaded Photo</span>
                                    <a
                                      href={it.customerInputImageUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-amber-300 hover:underline text-[11px] font-bold inline-flex items-center gap-1 mt-0.5"
                                    >
                                      <Eye className="w-3 h-3" /> View Full Image
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="font-bold text-amber-300 text-sm whitespace-nowrap">
                          {isUsd ? `$${(itemPrice * it.quantity).toFixed(2)} USD` : `${(itemPrice * it.quantity).toLocaleString()} ብር`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment & Market Details */}
              <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
                <div className="text-[10px] text-amber-300 font-bold uppercase tracking-widest">Payment & Verification Details</div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Buyer Market:</span>
                  <span className="text-amber-300 font-bold">
                    {selectedOrderDetails.buyerMarket === 'INTERNATIONAL' ? '🌍 International (Abroad / USD)' : '🇪🇹 Local (Ethiopia / ETB)'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/70">Payment Method:</span>
                  <span className="text-white font-semibold">{selectedOrderDetails.paymentMethod || 'Manual Payment / Gateway'}</span>
                </div>

                {/* Sender Name Highlight */}
                {selectedOrderDetails.senderName && (
                  <div className="flex items-center justify-between bg-amber-400/10 border border-amber-400/30 p-2.5 rounded-lg">
                    <span className="text-amber-300 font-bold text-[11px] flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      <span>Customer Sender Name:</span>
                    </span>
                    <span className="text-amber-200 font-bold text-xs">{selectedOrderDetails.senderName}</span>
                  </div>
                )}

                {selectedOrderDetails.transactionId && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Transaction ID / Ref:</span>
                    <span className="text-white font-mono text-[11px]">{selectedOrderDetails.transactionId}</span>
                  </div>
                )}

                {selectedOrderDetails.paymentStatus && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Payment Status:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      selectedOrderDetails.paymentStatus === 'PAID'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : selectedOrderDetails.paymentStatus === 'REJECTED'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    }`}>
                      {selectedOrderDetails.paymentStatus}
                    </span>
                  </div>
                )}

                {selectedOrderDetails.rejectionReason && (
                  <div className="text-[11px] text-red-300 bg-red-950/50 p-2.5 rounded-lg border border-red-500/30">
                    <strong>Rejection Reason:</strong> "{selectedOrderDetails.rejectionReason}"
                  </div>
                )}

                {selectedOrderDetails.reviewedBy && (
                  <div className="text-[10px] text-white/50 pt-1 border-t border-white/5">
                    Reviewed by <strong>{selectedOrderDetails.reviewedBy}</strong> on {selectedOrderDetails.reviewedAt ? new Date(selectedOrderDetails.reviewedAt).toLocaleString() : 'N/A'}
                  </div>
                )}

                {selectedOrderDetails.chapaTxRef && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Chapa Reference:</span>
                    <span className="text-amber-300 font-mono text-[11px] font-bold">{selectedOrderDetails.chapaTxRef}</span>
                  </div>
                )}

                {/* Receipt Preview Thumbnail */}
                {selectedOrderDetails.paymentReceiptUrl && !selectedOrderDetails.paymentReceiptUrl.includes('placeholder') && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="text-white/70 text-[10px] mb-2 flex items-center justify-between">
                      <span>Submitted Receipt Proof:</span>
                      <button
                        type="button"
                        onClick={() => setViewingReceiptUrl(selectedOrderDetails.paymentReceiptUrl || null)}
                        className="text-amber-300 hover:text-amber-200 text-[11px] font-bold underline flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> Full Screen View
                      </button>
                    </div>
                    <div
                      onClick={() => setViewingReceiptUrl(selectedOrderDetails.paymentReceiptUrl || null)}
                      className="cursor-pointer max-w-sm mx-auto rounded-xl overflow-hidden border border-amber-400/30 hover:border-amber-400 shadow-md transition-all group"
                    >
                      <img 
                        src={selectedOrderDetails.paymentReceiptUrl} 
                        alt="Payment Receipt" 
                        className="w-full max-h-56 object-contain bg-black/60 group-hover:scale-[1.02] transition-transform"
                      />
                    </div>
                  </div>
                )}

                {/* Direct Verification Actions inside Inspection Modal */}
                {selectedOrderDetails.paymentStatus !== 'PAID' && (
                  <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isProcessingPaymentAction}
                      onClick={() => handleApprovePayment(selectedOrderDetails)}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Approve Payment (Mark Paid)</span>
                    </button>
                    <button
                      type="button"
                      disabled={isProcessingPaymentAction}
                      onClick={() => handleOpenRejectModal(selectedOrderDetails)}
                      className="bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 text-red-300 font-bold text-xs uppercase tracking-wider py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
                {/* Delivery & Fulfillment Status Controller inside Modal */}
                <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="text-white/60 block text-[10px] uppercase font-bold tracking-wider">Fulfillment Status</span>
                    <span className="font-bold text-white">Current: {selectedOrderDetails.status}</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      value={selectedOrderDetails.status}
                      onChange={(e) => {
                        const newSt = e.target.value as OrderStatus;
                        onUpdateOrderStatus(selectedOrderDetails.id, newSt);
                        setSelectedOrderDetails({
                          ...selectedOrderDetails,
                          status: newSt,
                        });
                      }}
                      className="flex-1 sm:flex-initial bg-black/60 border border-amber-400/40 rounded-xl px-3 py-2 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="Pending">Pending (Unconfirmed)</option>
                      <option value="Processing">Processing (Paid & In Prep)</option>
                      <option value="Shipped">Shipped (Out for Delivery)</option>
                      <option value="Delivered">Delivered (Completed)</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

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

      {/* ========================================================================= */}
      {/* MODAL 7: REJECT PAYMENT MODAL (WITH PRESET REASONS)                       */}
      {/* ========================================================================= */}
      {rejectingPaymentOrder && (
        <div className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-inter">
          <div className="bg-[#2a0407] border border-red-500/50 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl animate-scale-in">
            <button
              onClick={() => setRejectingPaymentOrder(null)}
              className="absolute top-4 right-4 text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
              title="Cancel rejection"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/15 pb-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-podium text-lg uppercase font-bold text-white">
                  Reject Payment for Order {rejectingPaymentOrder.id}
                </h3>
                <span className="text-xs text-white/60">
                  Customer: {rejectingPaymentOrder.customer.fullName} • {formatPrice(rejectingPaymentOrder.total, rejectingPaymentOrder.currency || 'ETB')}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-white block mb-1">
                  Choose a Quick Reason:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Transfer amount does not match order total',
                    'Sender name not found in bank / Telebirr statement',
                    'Receipt image is blurry, cropped, or unreadable',
                    'Duplicate / already processed transaction receipt',
                    'Transaction reference could not be located',
                  ].map((quickReason) => (
                    <button
                      key={quickReason}
                      type="button"
                      onClick={() => setRejectionReasonInput(quickReason)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer text-left ${
                        rejectionReasonInput === quickReason
                          ? 'bg-red-500/30 border-red-400 text-white font-semibold'
                          : 'bg-black/30 border-white/10 text-white/70 hover:text-white'
                      }`}
                    >
                      {quickReason}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-white block mb-1">
                  Detailed Rejection Note (Will be displayed to customer):
                </label>
                <textarea
                  rows={3}
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="Explain why the payment proof could not be accepted so the customer can correct it..."
                  className="w-full bg-black/50 border border-red-500/40 focus:border-red-400 rounded-xl p-3 text-xs text-white placeholder-white/40 focus:outline-none"
                />
              </div>

              <div className="bg-black/30 p-3 rounded-xl border border-white/10 text-[11px] text-white/60">
                The order will be marked as <strong className="text-red-400">REJECTED</strong> and the customer will be able to review this note and upload a corrected receipt.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingPaymentOrder(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isProcessingPaymentAction}
                  onClick={handleConfirmRejectPayment}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isProcessingPaymentAction ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Rejecting...</span>
                    </>
                  ) : (
                    <>
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>Confirm Rejection</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: RECEIPT FULLSCREEN LIGHTBOX                                      */}
      {/* ========================================================================= */}
      {viewingReceiptUrl && (
        <div 
          onClick={() => setViewingReceiptUrl(null)}
          className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 cursor-zoom-out font-inter animate-fade-in"
        >
          <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
            <a
              href={viewingReceiptUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Full Size</span>
            </a>
            <button
              onClick={() => setViewingReceiptUrl(null)}
              className="p-2 rounded-full bg-black/70 hover:bg-white/20 text-white border border-white/20 cursor-pointer shadow-lg"
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div 
            onClick={(e) => e.stopPropagation()} 
            className="max-w-4xl max-h-[85vh] overflow-auto rounded-2xl border border-amber-400/40 bg-black/80 p-2 shadow-2xl cursor-default"
          >
            <img
              src={viewingReceiptUrl}
              alt="Payment Receipt High Resolution"
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl mx-auto"
            />
          </div>
        </div>
      )}

    </div>
  );
};
