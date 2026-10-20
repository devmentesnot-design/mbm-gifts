import React, { useState } from 'react';
import { PreparedPackage, CustomBoxOption, CUSTOM_ITEMS, calculateCustomUnitPrice } from '../data/giftsData';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartItem } from '../types/cart';
import { useMarket } from '../context/MarketContext';
import { formatPrice } from '../utils/currency';
import { uploadToCloudinary } from '../utils/cloudinary';
import {
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  Check,
  Star,
  PackageCheck,
  Truck,
  ShieldCheck,
  Gift,
  Heart,
  Share2,
  Clock,
  Camera,
  FileText,
  Upload,
  Loader2,
  X,
  Minus,
  Plus
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { MultiSideCustomizationSection } from './MultiSideCustomizationSection';

interface PackageDetailPageProps {
  packageData: PreparedPackage;
  allPackages: PreparedPackage[];
  customItems?: CustomBoxOption[];
  session: any;
  cartItems: CartItem[];
  onOpenCart: () => void;
  onNavigateToLogin: () => void;
  onNavigateToPackage: (pkgId: string) => void;
  onNavigateHome: () => void;
  onAddToCartPrepared: (
    pkg: PreparedPackage,
    customNote?: string,
    customerInputText?: string,
    customerInputImageUrl?: string,
    customUnitValue?: number,
    customUnitName?: string,
    unitCalculatedPrice?: number,
    customSidesSelected?: 'front_only' | 'front_and_back',
    frontInputText?: string,
    frontInputImageUrl?: string,
    backInputText?: string,
    backInputImageUrl?: string,
    backSidePrice?: number,
    selectedSize?: string,
    subItemCustomizations?: Record<string, any>
  ) => void;
}

export const PackageDetailPage: React.FC<PackageDetailPageProps> = ({
  packageData,
  allPackages,
  customItems = [],
  session,
  cartItems,
  onOpenCart,
  onNavigateToLogin,
  onNavigateToPackage,
  onNavigateHome,
  onAddToCartPrepared,
}) => {
  const { t } = useLanguage();
  const { buyerMarket, currency } = useMarket();
  const [addedToast, setAddedToast] = useState(false);
  const [giftNote, setGiftNote] = useState('');

  // Find all included items that require client customization
  const customizableSubItems = React.useMemo(() => {
    const detailed = packageData.itemsIncludedDetailed || [];
    const pool = (customItems && customItems.length > 0) ? customItems : CUSTOM_ITEMS;
    const list: Array<{
      id: string;
      subItemName: string;
      subItemImage?: string;
      subItemDescription?: string;
      subItemIndex: number;
      config: CustomBoxOption;
    }> = [];

    if (detailed.length > 0) {
      detailed.forEach((sub, idx) => {
        // 1st priority: sub-item has its own requiresCustomInput flag (saved by admin)
        // 2nd priority: match against the pool by customItemId or name
        let ci: CustomBoxOption | undefined;

        if (sub.customItemId) {
          ci = pool.find(c => c.id === sub.customItemId);
        }
        if (!ci) {
          ci = pool.find(c =>
            (sub.name && c.name && sub.name.toLowerCase().trim() === c.name.toLowerCase().trim()) ||
            (sub.name && c.name && sub.name.toLowerCase().includes(c.name.toLowerCase())) ||
            (sub.name && c.name && c.name.toLowerCase().includes(sub.name.toLowerCase()))
          );
        }

        // Determine if this sub-item requires customization:
        // - by its own persisted flag (new packages), or
        // - by its pool match having requiresCustomInput (existing packages)
        const needsCustom = sub.requiresCustomInput || (ci && ci.requiresCustomInput);
        if (!needsCustom) return;

        // Build a config: prefer the pool entry, fall back to synthetic config from sub-item flags
        const config: CustomBoxOption = ci
          ? {
              ...ci,
              // Allow sub-item flags to override pool values when present
              requiresCustomInput: true,
              customInputType: sub.customInputType || ci.customInputType,
              customInputLabel: sub.customInputLabel || ci.customInputLabel,
              customizationSides: sub.customizationSides || ci.customizationSides,
              frontCustomType: sub.frontCustomType || ci.frontCustomType,
              frontCustomLabel: sub.frontCustomLabel || ci.frontCustomLabel,
              backCustomType: sub.backCustomType || ci.backCustomType,
              backCustomLabel: sub.backCustomLabel || ci.backCustomLabel,
              backCustomOptional: sub.backCustomOptional ?? ci.backCustomOptional,
              backCustomPrice: sub.backCustomPrice ?? ci.backCustomPrice,
              backCustomPriceUsd: sub.backCustomPriceUsd ?? ci.backCustomPriceUsd,
            }
          : {
              // Synthetic fallback when item isn't in pool (e.g. deleted custom item)
              id: sub.customItemId || `synthetic-${idx}`,
              name: sub.name,
              image: sub.image || '',
              description: sub.description || '',
              category: '',
              price: sub.price || 0,
              price_usd: sub.price_usd,
              requiresCustomInput: true,
              customInputType: sub.customInputType || 'both',
              customInputLabel: sub.customInputLabel || `Personalization for ${sub.name}`,
              customizationSides: sub.customizationSides || 'single',
              frontCustomType: sub.frontCustomType || sub.customInputType || 'both',
              frontCustomLabel: sub.frontCustomLabel || sub.customInputLabel || '',
              backCustomType: sub.backCustomType || 'both',
              backCustomLabel: sub.backCustomLabel || '',
              backCustomOptional: sub.backCustomOptional ?? true,
              backCustomPrice: sub.backCustomPrice,
              backCustomPriceUsd: sub.backCustomPriceUsd,
              hasCustomUnit: false,
              customUnitName: 'kg',
              customUnitMin: 1,
              customUnitStep: 1,
              customUnitMax: 50,
              hasSizeOptions: false,
            };

        list.push({
          id: sub.customItemId || `sub-${idx}-${config.id}`,
          subItemName: sub.name || config.name,
          subItemImage: sub.image || config.image,
          subItemDescription: sub.description || config.description,
          subItemIndex: idx,
          config,
        });
      });
    } else if (packageData.itemsIncluded && packageData.itemsIncluded.length > 0) {
      packageData.itemsIncluded.forEach((name, idx) => {
        const ci = pool.find(c => c.requiresCustomInput && (
          (c.name && name.toLowerCase().trim() === c.name.toLowerCase().trim()) ||
          (c.name && name.toLowerCase().includes(c.name.toLowerCase())) ||
          (c.name && c.name.toLowerCase().includes(name.toLowerCase()))
        ));
        if (ci) {
          list.push({
            id: `sub-${idx}-${ci.id}`,
            subItemName: name,
            subItemImage: ci.image,
            subItemDescription: ci.description,
            subItemIndex: idx,
            config: ci,
          });
        }
      });
    }

    return list;
  }, [packageData, customItems]);


  const isMultiCustomizable = customizableSubItems.length > 1;

  // Auto-detect if any included item in this package requires client customization (e.g. Photo Frame)
  const effectivePackage = React.useMemo(() => {
    if (packageData.requiresCustomInput) return packageData;
    if (customizableSubItems.length === 0) return packageData;

    const firstMatch = customizableSubItems[0].config;
    return {
      ...packageData,
      requiresCustomInput: true,
      customInputType: packageData.customInputType || firstMatch.customInputType || 'both',
      customInputLabel: packageData.customInputLabel || firstMatch.customInputLabel || `Customization for ${firstMatch.name}`,
      customizationSides: packageData.customizationSides || firstMatch.customizationSides || 'single',
      frontCustomType: packageData.frontCustomType || firstMatch.frontCustomType || firstMatch.customInputType || 'both',
      frontCustomLabel: packageData.frontCustomLabel || firstMatch.frontCustomLabel || firstMatch.customInputLabel || `Front for ${firstMatch.name}`,
      backCustomType: packageData.backCustomType || firstMatch.backCustomType || 'both',
      backCustomLabel: packageData.backCustomLabel || firstMatch.backCustomLabel || '',
      backCustomOptional: packageData.backCustomOptional ?? firstMatch.backCustomOptional ?? true,
      backCustomPrice: packageData.backCustomPrice ?? firstMatch.backCustomPrice,
      backCustomPriceUsd: packageData.backCustomPriceUsd ?? firstMatch.backCustomPriceUsd,
    };
  }, [packageData, customizableSubItems]);

  // Single-item default customization state
  const defaultSides = (effectivePackage.customizationSides === 'front_back' && effectivePackage.backCustomOptional === false) ? 'front_and_back' : 'front_only';
  const [customSidesSelected, setCustomSidesSelected] = useState<'front_only' | 'front_and_back'>(defaultSides);
  const [frontCustomText, setFrontCustomText] = useState('');
  const [frontCustomImageUrl, setFrontCustomImageUrl] = useState('');
  const [backCustomText, setBackCustomText] = useState('');
  const [backCustomImageUrl, setBackCustomImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Multi-item customization state (when package has >= 2 customizable sub-items)
  const [subItemCustomStates, setSubItemCustomStates] = useState<Record<string, {
    customSidesSelected: 'front_only' | 'front_and_back';
    frontText: string;
    frontImageUrl: string;
    backText: string;
    backImageUrl: string;
  }>>({});

  const getSubItemCustomState = (itemId: string, cfg: CustomBoxOption) => {
    return subItemCustomStates[itemId] || {
      customSidesSelected: (cfg.customizationSides === 'front_back' && cfg.backCustomOptional === false) ? 'front_and_back' : 'front_only',
      frontText: '',
      frontImageUrl: '',
      backText: '',
      backImageUrl: '',
    };
  };

  const updateSubItemCustomState = (itemId: string, partial: Partial<{
    customSidesSelected: 'front_only' | 'front_and_back';
    frontText: string;
    frontImageUrl: string;
    backText: string;
    backImageUrl: string;
  }>, cfg: CustomBoxOption) => {
    setSubItemCustomStates(prev => {
      const current = prev[itemId] || {
        customSidesSelected: (cfg.customizationSides === 'front_back' && cfg.backCustomOptional === false) ? 'front_and_back' : 'front_only',
        frontText: '',
        frontImageUrl: '',
        backText: '',
        backImageUrl: '',
      };
      return {
        ...prev,
        [itemId]: { ...current, ...partial }
      };
    });
  };

  const isMultiSide = isMultiCustomizable ? false : effectivePackage.customizationSides === 'front_back';

  // Calculate extra price for optional back sides across all customizable items
  const totalBackSideExtraPrice = React.useMemo(() => {
    if (isMultiCustomizable) {
      return customizableSubItems.reduce((sum, item) => {
        if (item.config.customizationSides !== 'front_back') return sum;
        const state = subItemCustomStates[item.id];
        const isBack = state ? state.customSidesSelected === 'front_and_back' : false;
        if (isBack) {
          const price = currency === 'USD' ? (item.config.backCustomPriceUsd || 0) : (item.config.backCustomPrice || 0);
          return sum + price;
        }
        return sum;
      }, 0);
    } else {
      return (isMultiSide && customSidesSelected === 'front_and_back')
        ? (currency === 'USD' ? (effectivePackage.backCustomPriceUsd || 0) : (effectivePackage.backCustomPrice || 0))
        : 0;
    }
  }, [isMultiCustomizable, customizableSubItems, subItemCustomStates, isMultiSide, customSidesSelected, currency, effectivePackage]);

  const backSideExtraPrice = totalBackSideExtraPrice;

  // Scalable unit state (e.g. 2 kg minimum, stepper)
  const initialUnitVal = effectivePackage.hasCustomUnit ? (effectivePackage.customUnitMin || 1) : 1;
  const [selectedUnitValue, setSelectedUnitValue] = useState<number>(initialUnitVal);
  const [selectedSize, setSelectedSize] = useState<string>(
    effectivePackage.hasSizeOptions && effectivePackage.sizeOptions && effectivePackage.sizeOptions.length > 0
      ? effectivePackage.sizeOptions[0].label
      : ''
  );

  const getPkgPrice = (pkg: PreparedPackage): number => {
    if (buyerMarket === 'INTERNATIONAL') {
      if (pkg.price_usd != null && pkg.price_usd > 0) return pkg.price_usd;
      return Math.round((pkg.price / 120) * 100) / 100;
    }
    return pkg.price;
  };

  const getItemDetails = (pkg: PreparedPackage) => {
    if (pkg.itemsIncludedDetailed && pkg.itemsIncludedDetailed.length > 0) {
      return pkg.itemsIncludedDetailed;
    }
    return pkg.itemsIncluded.map((itemName) => {
      const matched = CUSTOM_ITEMS.find(
        (c) => c.name.toLowerCase().includes(itemName.toLowerCase()) || itemName.toLowerCase().includes(c.name.toLowerCase())
      );
      if (matched) {
        return {
          name: itemName,
          image: matched.image,
          description: matched.description,
        };
      }
      return {
        name: itemName,
        image: pkg.image,
        description: 'Hand-selected premium gift component curated for this luxury package.',
      };
    });
  };

  const itemsDetailed = getItemDetails(packageData);
  const relatedPackages = allPackages.filter((p) => p.id !== packageData.id).slice(0, 3);

  const currentCalculatedPrice = packageData.hasCustomUnit
    ? calculateCustomUnitPrice(packageData, selectedUnitValue, currency)
    : getPkgPrice(packageData);

  const handleAddToCart = () => {
    if (effectivePackage.requiresCustomInput) {
      if (isMultiCustomizable) {
        for (const item of customizableSubItems) {
          const state = getSubItemCustomState(item.id, item.config);
          const cfg = item.config;
          const isItemMulti = cfg.customizationSides === 'front_back';

          if (isItemMulti) {
            const frontType = cfg.frontCustomType || cfg.customInputType || 'text';
            const backType = cfg.backCustomType || 'text';
            const frontPrompt = cfg.frontCustomLabel || cfg.customInputLabel || 'Front side';
            const backPrompt = cfg.backCustomLabel || 'Back side';

            if (frontType === 'text' && !state.frontText.trim()) {
              alert(`Please fill in required front text for "${item.subItemName}": ${frontPrompt}`);
              return;
            }
            if (frontType === 'image' && !state.frontImageUrl) {
              alert(`Please upload front photo for "${item.subItemName}".`);
              return;
            }
            if (frontType === 'both' && !state.frontText.trim() && !state.frontImageUrl) {
              alert(`Please provide a photo or text for "${item.subItemName}" (${frontPrompt}).`);
              return;
            }

            if (state.customSidesSelected === 'front_and_back') {
              if (backType === 'text' && !state.backText.trim()) {
                alert(`Please fill in required back text for "${item.subItemName}": ${backPrompt}`);
                return;
              }
              if (backType === 'image' && !state.backImageUrl) {
                alert(`Please upload back photo for "${item.subItemName}".`);
                return;
              }
              if (backType === 'both' && !state.backText.trim() && !state.backImageUrl) {
                alert(`Please provide a photo or text for back side of "${item.subItemName}".`);
                return;
              }
            }
          } else {
            const inputType = cfg.customInputType || 'text';
            if (inputType === 'text' && !state.frontText.trim()) {
              alert(`Please fill in the required customization for "${item.subItemName}": ${cfg.customInputLabel || 'Custom text'}`);
              return;
            }
            if (inputType === 'image' && !state.frontImageUrl) {
              alert(`Please upload photo for "${item.subItemName}".`);
              return;
            }
            if (inputType === 'both' && !state.frontText.trim() && !state.frontImageUrl) {
              alert(`Please provide at least a photo or text for "${item.subItemName}".`);
              return;
            }
          }
        }
      } else {
        const targetConfig = customizableSubItems[0]?.config || effectivePackage;
        const targetMulti = targetConfig.customizationSides === 'front_back';
        if (targetMulti) {
          const frontType = targetConfig.frontCustomType || targetConfig.customInputType || 'text';
          const backType = targetConfig.backCustomType || 'text';
          const frontPrompt = targetConfig.frontCustomLabel || targetConfig.customInputLabel || 'Front side';
          const backPrompt = targetConfig.backCustomLabel || 'Back side';

          if (frontType === 'text' && !frontCustomText.trim()) {
            alert(`Please fill in required front text: ${frontPrompt}`);
            return;
          }
          if (frontType === 'image' && !frontCustomImageUrl) {
            alert('Please upload your front photo.');
            return;
          }
          if (frontType === 'both' && !frontCustomText.trim() && !frontCustomImageUrl) {
            alert(`Please provide at least a text or photo for the front side: ${frontPrompt}`);
            return;
          }

          if (customSidesSelected === 'front_and_back') {
            if (backType === 'text' && !backCustomText.trim()) {
              alert(`Please fill in required back text: ${backPrompt}`);
              return;
            }
            if (backType === 'image' && !backCustomImageUrl) {
              alert('Please upload your back photo.');
              return;
            }
            if (backType === 'both' && !backCustomText.trim() && !backCustomImageUrl) {
              alert(`Please provide at least a text or photo for the back side: ${backPrompt}`);
              return;
            }
          }
        } else {
          const inputType = targetConfig.customInputType || 'text';
          if (inputType === 'text' && !frontCustomText.trim()) {
            alert(`Please fill in the required field: ${targetConfig.customInputLabel || 'Custom text'}`);
            return;
          }
          if (inputType === 'image' && !frontCustomImageUrl) {
            alert('Please upload your photo before adding to cart.');
            return;
          }
          if (inputType === 'both' && !frontCustomText.trim() && !frontCustomImageUrl) {
            alert(`Please provide at least a text or photo for: ${targetConfig.customInputLabel || 'customization'}`);
            return;
          }
        }
      }
    }

    let finalCustomerInputText = frontCustomText;
    let finalCustomerInputImageUrl = frontCustomImageUrl;
    let finalFrontInputText = isMultiSide ? frontCustomText : undefined;
    let finalFrontInputImageUrl = isMultiSide ? frontCustomImageUrl : undefined;
    let finalBackInputText = isMultiSide && customSidesSelected === 'front_and_back' ? backCustomText : undefined;
    let finalBackInputImageUrl = isMultiSide && customSidesSelected === 'front_and_back' ? backCustomImageUrl : undefined;
    let subItemCustomizationsRecord: Record<string, any> | undefined = undefined;

    if (isMultiCustomizable) {
      const summaryParts: string[] = [];
      const record: Record<string, any> = {};

      customizableSubItems.forEach((item) => {
        const state = getSubItemCustomState(item.id, item.config);
        const parts: string[] = [];
        if (state.frontText.trim()) {
          parts.push(state.customSidesSelected === 'front_and_back' ? `Front: "${state.frontText.trim()}"` : `"${state.frontText.trim()}"`);
        }
        if (state.frontImageUrl) {
          parts.push('[Photo Attached]');
        }
        if (state.customSidesSelected === 'front_and_back') {
          if (state.backText.trim()) parts.push(`Back: "${state.backText.trim()}"`);
          if (state.backImageUrl) parts.push('[Back Photo Attached]');
        }

        summaryParts.push(`${item.subItemName}: ${parts.join(', ') || 'Customized'}`);

        record[item.id] = {
          itemId: item.id,
          itemName: item.subItemName,
          customSidesSelected: state.customSidesSelected,
          frontText: state.frontText,
          frontImageUrl: state.frontImageUrl,
          backText: state.backText,
          backImageUrl: state.backImageUrl,
          inputText: state.frontText,
          imageUrl: state.frontImageUrl || state.backImageUrl,
        };
      });

      finalCustomerInputText = summaryParts.join(' | ');
      finalFrontInputText = finalCustomerInputText;
      finalCustomerInputImageUrl = customizableSubItems
        .map(i => {
          const s = getSubItemCustomState(i.id, i.config);
          return s.frontImageUrl || s.backImageUrl;
        })
        .find(Boolean) || '';
      finalFrontInputImageUrl = finalCustomerInputImageUrl;
      subItemCustomizationsRecord = record;
    }

    const calculatedWithBack = currentCalculatedPrice + totalBackSideExtraPrice;

    onAddToCartPrepared(
      effectivePackage,
      giftNote,
      finalCustomerInputText,
      finalCustomerInputImageUrl,
      effectivePackage.hasCustomUnit ? selectedUnitValue : undefined,
      effectivePackage.hasCustomUnit ? (effectivePackage.customUnitName || 'kg') : undefined,
      effectivePackage.hasCustomUnit ? calculatedWithBack : undefined,
      isMultiSide ? customSidesSelected : undefined,
      finalFrontInputText,
      finalFrontInputImageUrl,
      finalBackInputText,
      finalBackInputImageUrl,
      totalBackSideExtraPrice,
      effectivePackage.hasSizeOptions ? selectedSize : undefined,
      subItemCustomizationsRecord
    );
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const url = await uploadToCloudinary(file);
      setFrontCustomImageUrl(url);
    } catch (err: any) {
      alert('Failed to upload image: ' + (err?.message || 'Please try again'));
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-transparent text-[#241A15] font-inter selection:bg-[#B8944A] selection:text-white flex flex-col justify-between">
      {/* Top Navbar */}
      <Navbar
        session={session}
        cartItems={cartItems}
        onOpenCart={onOpenCart}
        onNavigateToLogin={onNavigateToLogin}
      />

      <main className="flex-1 pb-20">
        {/* Breadcrumb & Navigation Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-8 pb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 text-[#3A2A20] hover:text-[#B8944A] text-xs sm:text-sm font-bold uppercase tracking-wider bg-[#FBF8F2]/90 border border-[#D8C6A8] hover:border-[#B8944A] px-4 py-2 rounded-full transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="w-4 h-4 text-[#B8944A]" />
              <span>Back to All Packages</span>
            </button>

            <div className="text-xs text-[#756457] font-inter hidden sm:block">
              <span>Home</span> / <span className="text-[#B8944A] font-semibold">Packages</span> / <span className="text-[#241A15] font-medium">{packageData.name}</span>
            </div>
          </div>
        </div>

        {/* Hero Product Overview Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6">
          <div className="luxury-satin-card border border-[#D8C6A8] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl relative overflow-hidden backdrop-blur-md">
            
            {/* Added Toast Notification */}
            {addedToast && (
              <div className="fixed top-24 right-6 z-50 bg-[#241A15] text-[#FBF8F2] border border-[#B8944A]/60 font-bold px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce font-inter">
                <Check className="w-5 h-5 text-[#B8944A] stroke-[3]" />
                <span>Added to cart successfully!</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              
              {/* Left Column: Full Display Image Showcase (5 cols) */}
              <div className="lg:col-span-5 relative">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-[#D8C6A8]/70 bg-white/80 shadow-md group flex items-center justify-center p-4">
                  <img
                    src={packageData.image}
                    alt={packageData.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                  />
                  {packageData.badge && (
                    <span className="absolute top-4 left-4 bg-[#B8944A] text-white text-xs font-extrabold tracking-widest px-3.5 py-1.5 uppercase rounded-full shadow-md z-10">
                      {packageData.badge}
                    </span>
                  )}
                </div>

                {/* Rating & Review summary strip */}
                <div className="mt-4 bg-[#F5EFE6]/80 border border-[#D8C6A8]/60 rounded-xl p-3.5 flex items-center justify-between text-xs text-[#756457] font-inter">
                  <div className="flex items-center gap-2">
                    <div className="flex text-[#B8944A]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#B8944A] stroke-[#B8944A]" />
                      ))}
                    </div>
                    <span className="font-bold text-[#241A15]">{packageData.rating}</span>
                  </div>
                  <span className="text-[#756457]">Based on {packageData.reviewsCount} customer reviews</span>
                </div>
              </div>

              {/* Right Column: Title, Price & Personalization Action (7 cols) */}
              <div className="lg:col-span-7 flex flex-col justify-between h-full">
                <div>
                  <div className="inline-flex items-center gap-2 bg-[#F5EFE6] border border-[#D8C6A8] text-[#8E6E2F] text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-[#B8944A]" />
                    <span>{packageData.category?.includes(',') ? packageData.category.split(',').map(c => c.trim()).join(' • ') : `${packageData.category} Collection`}</span>
                  </div>

                  <h1 className="font-podium text-3xl sm:text-5xl uppercase text-[#241A15] font-extrabold tracking-tight mb-3 leading-none">
                    {packageData.name}
                  </h1>

                  <div className="flex flex-wrap items-baseline gap-3 mb-6 pb-6 border-b border-[#D8C6A8]/50">
                    <span className="text-3xl sm:text-4xl font-extrabold font-inter text-[#241A15]">
                      {formatPrice(currentCalculatedPrice, currency)}
                    </span>
                    {packageData.hasCustomUnit && (
                      <span className="text-xs text-[#756457] font-inter font-semibold">
                        ({selectedUnitValue} {packageData.customUnitName || 'kg'})
                      </span>
                    )}
                    <span className="text-xs text-emerald-800 uppercase tracking-wider font-semibold bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-emerald-600" />
                      {buyerMarket === 'INTERNATIONAL' ? 'Free Delivery in Ethiopia' : 'Free Express Delivery Included'}
                    </span>
                  </div>

                  <p className="text-[#3A2A20]/90 text-sm sm:text-base font-inter leading-relaxed mb-6">
                    {packageData.shortDesc}
                  </p>

                  {/* Highlights / Guarantees Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    <div className="bg-[#F5EFE6]/80 border border-[#D8C6A8]/60 rounded-xl p-3 flex items-center gap-2.5 shadow-sm">
                      <Gift className="w-5 h-5 text-[#B8944A] flex-shrink-0" />
                      <div>
                        <div className="text-[11px] font-bold uppercase text-[#241A15]">Velvet Box</div>
                        <div className="text-[10px] text-[#756457]">Gold foil ribbon</div>
                      </div>
                    </div>

                    <div className="bg-[#F5EFE6]/80 border border-[#D8C6A8]/60 rounded-xl p-3 flex items-center gap-2.5 shadow-sm">
                      <ShieldCheck className="w-5 h-5 text-[#B8944A] flex-shrink-0" />
                      <div>
                        <div className="text-[11px] font-bold uppercase text-[#241A15]">Wax Sealed</div>
                        <div className="text-[10px] text-[#756457]">Calligraphy note</div>
                      </div>
                    </div>

                    <div className="bg-[#F5EFE6]/80 border border-[#D8C6A8]/60 rounded-xl p-3 flex items-center gap-2.5 col-span-2 sm:col-span-1 shadow-sm">
                      <Truck className="w-5 h-5 text-[#B8944A] flex-shrink-0" />
                      <div>
                        <div className="text-[11px] font-bold uppercase text-[#241A15]">Express Delivery</div>
                        <div className="text-[10px] text-[#756457]">Tracked shipping</div>
                      </div>
                    </div>
                  </div>

                  {/* Scalable Unit / Measurement Selector (e.g. Cake by KG, Flowers by Stems) */}
                  {packageData.hasCustomUnit && (
                    <div className="mb-6 bg-[#F5EFE6]/90 border border-[#D8C6A8] rounded-2xl p-5 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#241A15] font-bold uppercase text-xs tracking-wider">
                          <Sparkles className="w-4 h-4 text-[#B8944A]" />
                          <span>Select {packageData.customUnitName?.toUpperCase() || 'SIZE / WEIGHT'}</span>
                        </div>
                        <span className="text-[11px] text-[#8E6E2F] bg-[#FAF6EF] border border-[#D8C6A8] px-2.5 py-0.5 rounded-full font-medium">
                          Min: {packageData.customUnitMin || 1} {packageData.customUnitName || 'kg'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-white/80 border border-[#D8C6A8] rounded-xl p-3.5 shadow-sm">
                        <div>
                          <div className="text-[#241A15] font-bold text-sm">
                            {selectedUnitValue} {packageData.customUnitName || 'kg'}
                          </div>
                          <div className="text-[11px] text-[#756457]">
                            Adjust size in {packageData.customUnitStep || 1} {packageData.customUnitName || 'kg'} increments
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            disabled={selectedUnitValue <= (packageData.customUnitMin || 1)}
                            onClick={() => setSelectedUnitValue(prev => Number((Math.max(packageData.customUnitMin || 1, prev - (packageData.customUnitStep || 1))).toFixed(2)))}
                            className="w-10 h-10 rounded-lg bg-[#FAF6EF] border border-[#D8C6A8] text-[#241A15] font-bold flex items-center justify-center hover:border-[#B8944A] hover:text-[#B8944A] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-sm"
                            title="Decrease size"
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <span className="font-podium text-lg font-bold text-[#241A15] min-w-[3.5rem] text-center">
                            {selectedUnitValue} <span className="text-xs font-normal text-[#756457]">{packageData.customUnitName || 'kg'}</span>
                          </span>

                          <button
                            type="button"
                            disabled={selectedUnitValue >= (packageData.customUnitMax || 50)}
                            onClick={() => setSelectedUnitValue(prev => Number((Math.min(packageData.customUnitMax || 50, prev + (packageData.customUnitStep || 1))).toFixed(2)))}
                            className="w-10 h-10 rounded-lg bg-[#FAF6EF] border border-[#D8C6A8] text-[#241A15] font-bold flex items-center justify-center hover:border-[#B8944A] hover:text-[#B8944A] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-sm"
                            title="Increase size"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Size Selection Section if package has size options (e.g. S, M, L, XL) */}
                  {packageData.hasSizeOptions && packageData.sizeOptions && packageData.sizeOptions.length > 0 && (
                    <div className="mb-6 bg-[#FAF6EE] border border-[#D8C6A8] rounded-2xl p-4 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#8E6E2F] font-bold uppercase text-xs tracking-wider">
                          <Sparkles className="w-4 h-4 text-[#B8944A]" />
                          <span>Select Your Size</span>
                        </div>
                        {selectedSize && (
                          <span className="text-xs font-bold text-[#241A15]">
                            Size: <span className="text-[#8E6E2F] font-extrabold">{selectedSize}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {packageData.sizeOptions.map((sz, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedSize(sz.label)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              selectedSize === sz.label
                                ? 'bg-[#241A15] text-[#FAF6EE] border-[#241A15] shadow-md ring-2 ring-[#B8944A]/50 scale-105'
                                : 'bg-white/90 hover:bg-[#E6D5B8]/40 text-[#241A15] border-[#D8C6A8]'
                            }`}
                          >
                            {sz.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Client Customization Requirement Section */}
                  {effectivePackage.requiresCustomInput && (
                    isMultiCustomizable ? (
                      <div className="space-y-4 mb-5">
                        <div className="bg-amber-500/10 border border-amber-400/40 rounded-xl p-3 flex items-center gap-2.5">
                          <Sparkles className="w-4 h-4 text-[#B8944A] flex-shrink-0" />
                          <div className="text-xs text-[#8E6E2F]">
                            <span className="font-bold uppercase tracking-wider block">
                              Customization Required ({customizableSubItems.length} Items Inside)
                            </span>
                            <span className="text-[11px] text-[#241A15]/70">
                              Please provide personalization details for each customizable gift component below:
                            </span>
                          </div>
                        </div>

                        {customizableSubItems.map((subItem) => {
                          const state = getSubItemCustomState(subItem.id, subItem.config);
                          return (
                            <MultiSideCustomizationSection
                              key={subItem.id}
                              item={subItem.config}
                              itemName={subItem.subItemName}
                              itemImage={subItem.subItemImage}
                              itemBadge={`Item #${subItem.subItemIndex + 1}`}
                              customSidesSelected={state.customSidesSelected}
                              onChangeCustomSidesSelected={(sides) =>
                                updateSubItemCustomState(subItem.id, { customSidesSelected: sides }, subItem.config)
                              }
                              frontText={state.frontText}
                              onChangeFrontText={(txt) =>
                                updateSubItemCustomState(subItem.id, { frontText: txt }, subItem.config)
                              }
                              frontImageUrl={state.frontImageUrl}
                              onChangeFrontImageUrl={(url) =>
                                updateSubItemCustomState(subItem.id, { frontImageUrl: url }, subItem.config)
                              }
                              backText={state.backText}
                              onChangeBackText={(txt) =>
                                updateSubItemCustomState(subItem.id, { backText: txt }, subItem.config)
                              }
                              backImageUrl={state.backImageUrl}
                              onChangeBackImageUrl={(url) =>
                                updateSubItemCustomState(subItem.id, { backImageUrl: url }, subItem.config)
                              }
                              currency={currency}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <MultiSideCustomizationSection
                        item={customizableSubItems[0]?.config || effectivePackage}
                        itemName={customizableSubItems[0]?.subItemName}
                        itemImage={customizableSubItems[0]?.subItemImage}
                        itemBadge={customizableSubItems[0] ? `Item #${customizableSubItems[0].subItemIndex + 1}` : undefined}
                        customSidesSelected={customSidesSelected}
                        onChangeCustomSidesSelected={setCustomSidesSelected}
                        frontText={frontCustomText}
                        onChangeFrontText={setFrontCustomText}
                        frontImageUrl={frontCustomImageUrl}
                        onChangeFrontImageUrl={setFrontCustomImageUrl}
                        backText={backCustomText}
                        onChangeBackText={setBackCustomText}
                        backImageUrl={backCustomImageUrl}
                        onChangeBackImageUrl={setBackCustomImageUrl}
                        currency={currency}
                      />
                    )
                  )}

                </div>

                {/* Primary CTA Add To Cart Button */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="w-full sm:flex-1 bg-[#241A15] hover:bg-[#3A2A20] text-[#FBF8F2] font-extrabold py-4 px-8 text-sm sm:text-base tracking-widest uppercase rounded-2xl flex items-center justify-center gap-3 transition-all font-inter shadow-xl shadow-[#241A15]/10 cursor-pointer transform hover:-translate-y-0.5 border border-[#B8944A]/40 hover:border-[#B8944A]"
                  >
                    <ShoppingBag className="w-5 h-5 text-[#B8944A] stroke-[2.5]" />
                    <span>
                      ADD PACKAGE TO CART — {formatPrice(currentCalculatedPrice + backSideExtraPrice, currency)}
                      {packageData.hasCustomUnit ? ` (${selectedUnitValue} ${packageData.customUnitName || 'kg'})` : ''}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Included Items Detailed Showcase Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12">
          <div className="luxury-satin-card border border-[#D8C6A8] rounded-3xl p-6 sm:p-10 shadow-xl backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#D8C6A8]/50">
              <div>
                <div className="inline-flex items-center gap-2 text-[#8E6E2F] text-xs font-bold uppercase tracking-widest mb-1">
                  <PackageCheck className="w-4 h-4 text-[#B8944A]" />
                  <span>Package Inventory Breakdown</span>
                </div>
                <h2 className="font-podium text-2xl sm:text-4xl uppercase font-bold text-[#241A15]">
                  Items Included Inside ({itemsDetailed.length} Luxury Pieces)
                </h2>
              </div>
              <span className="text-xs text-[#8E6E2F] font-inter font-bold uppercase tracking-wider bg-[#F5EFE6] border border-[#D8C6A8] px-4 py-2 rounded-full self-start sm:self-auto shadow-sm">
                Hand-Selected & Individually Wrapped
              </span>
            </div>

            {/* Grid of items inside with images & descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {itemsDetailed.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white/80 border border-[#D8C6A8]/60 hover:border-[#B8944A] rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 group shadow-sm hover:shadow-md"
                >
                  <div>
                    {/* Item Image - Square Container */}
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-[#D8C6A8]/40 bg-[#FAF6EF]/60 mb-4 p-3 flex items-center justify-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute bottom-2 right-2 bg-[#B8944A] text-white p-1.5 rounded-full shadow-md">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </span>
                      <span className="absolute top-2 left-2 bg-[#241A15]/80 text-[#FBF8F2] border border-[#D8C6A8]/30 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-sm">
                        Piece #{idx + 1}
                      </span>
                    </div>

                    <h3 className="font-podium text-lg font-bold text-[#241A15] uppercase mb-2 group-hover:text-[#B8944A] transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-[#756457] text-xs sm:text-sm font-inter leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#D8C6A8]/40 flex items-center justify-between text-[11px] text-[#8E6E2F] font-bold uppercase tracking-wider">
                    <span>Guaranteed Fresh & Authentic</span>
                    <Check className="w-3.5 h-3.5 text-[#B8944A]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* You Might Also Like / Related Packages */}
        {relatedPackages.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-podium text-2xl uppercase font-bold text-[#241A15]">
                You Might Also Like
              </h3>
              <button
                onClick={onNavigateHome}
                className="text-[#B8944A] hover:text-[#8E6E2F] text-xs font-bold uppercase tracking-wider underline cursor-pointer"
              >
                View All Packages
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPackages.map((relPkg) => (
                <div
                  key={relPkg.id}
                  onClick={() => onNavigateToPackage(relPkg.id)}
                  className="luxury-satin-card luxury-satin-card-hover rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md flex flex-col justify-between"
                >
                  <div className="p-3.5">
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-white/80 border border-[#D8C6A8]/50 flex items-center justify-center p-3">
                      <img
                        src={relPkg.image}
                        alt={relPkg.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                      {relPkg.badge && (
                        <span className="absolute top-3 left-3 bg-[#B8944A] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md">
                          {relPkg.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-podium text-lg uppercase font-bold text-[#241A15] group-hover:text-[#B8944A] transition-colors mb-1 line-clamp-1">
                        {relPkg.name}
                      </h4>
                      <p className="text-[#756457] text-xs font-inter line-clamp-2 mb-4">
                        {relPkg.shortDesc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#D8C6A8]/40 flex items-center justify-between">
                      <span className="font-bold font-inter text-[#241A15] text-lg">{formatPrice(getPkgPrice(relPkg), currency)}</span>
                      <span className="bg-[#241A15] text-[#FBF8F2] group-hover:bg-[#B8944A] font-bold px-3.5 py-1.5 text-[11px] uppercase tracking-wider rounded-full flex items-center gap-1 transition-colors shadow-sm">
                        <span>View Details</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
