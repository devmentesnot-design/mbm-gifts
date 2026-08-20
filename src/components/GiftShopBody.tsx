import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PreparedPackage, CustomBoxOption, GiftCategory, GiftBoxStyle, CUSTOM_ITEMS, PREPARED_PACKAGES } from '../data/giftsData';
import { ShoppingBag, Star, Eye, X, Check, Search, Filter, Plus, Minus, PackageCheck, Sparkles, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useMarket } from '../context/MarketContext';
import { formatPrice } from '../utils/currency';

interface GiftShopBodyProps {
  packages?: PreparedPackage[];
  customItems?: CustomBoxOption[];
  categories?: GiftCategory[];
  giftBoxes?: GiftBoxStyle[];
  onAddToCartPrepared: (pkg: PreparedPackage, note?: string) => void;
  onAddToCartCustom: (customBox: {
    boxStyle: CustomBoxOption;
    selectedItems: CustomBoxOption[];
    cardMessage: string;
    ribbonColor: string;
    totalPrice: number;
  }) => void;
  onViewPackageDetail?: (pkgId: string) => void;
}

export const GiftShopBody: React.FC<GiftShopBodyProps> = ({
  packages = PREPARED_PACKAGES,
  customItems = CUSTOM_ITEMS,
  categories = [],
  giftBoxes = [],
  onAddToCartPrepared,
  onAddToCartCustom,
  onViewPackageDetail,
}) => {
  const { t } = useLanguage();
  const { buyerMarket, currency } = useMarket();
  const [mode, setMode] = useState<'pkg' | 'build'>('pkg');

  // Market Price Helpers
  const getPkgPrice = (pkg: PreparedPackage): number => {
    if (buyerMarket === 'INTERNATIONAL') {
      if (pkg.price_usd != null && pkg.price_usd > 0) return pkg.price_usd;
      return Math.round((pkg.price / 120) * 100) / 100;
    }
    return pkg.price;
  };

  const getItemPrice = (item: CustomBoxOption): number => {
    if (buyerMarket === 'INTERNATIONAL') {
      if (item.price_usd != null && item.price_usd > 0) return item.price_usd;
      return Math.round((item.price / 120) * 100) / 100;
    }
    return item.price;
  };
  
  // Shared Filter State
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Prepared Packages State
  const [selectedModalPkg, setSelectedModalPkg] = useState<PreparedPackage | null>(null);
  const [selectedCustomItemModal, setSelectedCustomItemModal] = useState<CustomBoxOption | null>(null);
  const [giftNote, setGiftNote] = useState<string>('');

  // Custom Build State (Cart)
  const [customCart, setCustomCart] = useState<Record<string, number>>({});
  
  // Automatic signature gift box (complimentary inclusion or configured default)
  const automaticBox: CustomBoxOption = {
    id: giftBoxes[0]?.id || 'box-automatic-signature',
    name: giftBoxes[0]?.name || 'Signature MBM Crimson Velvet Keepsake Box',
    category: 'box',
    price: giftBoxes[0]?.price || 0,
    image: giftBoxes[0]?.image || '/header_hero.jpg',
    description: giftBoxes[0]?.description || 'Complimentary signature deep red box lined with plush velvet lining & gold foil embossing.',
  };

  // Dynamically compute available categories strictly from master DB categories
  const dynamicCategories = useMemo(() => {
    const list: string[] = ['All'];
    const added = new Set<string>(['All']);

    if (categories && categories.length > 0) {
      const allowedType = mode === 'pkg' ? ['package', 'both'] : ['custom_item', 'both'];
      categories.forEach(c => {
        const catType = c.type || 'both';
        if (allowedType.includes(catType)) {
          if (!added.has(c.name)) {
            added.add(c.name);
            list.push(c.name);
          }
        }
      });
    } else {
      // Fallback only if database categories array is empty
      if (mode === 'pkg') {
        packages.forEach(p => {
          if (p.category) {
            p.category.split(',').forEach(c => {
              const trimmed = c.trim();
              if (trimmed && !added.has(trimmed)) {
                added.add(trimmed);
                list.push(trimmed);
              }
            });
          }
        });
      } else {
        customItems.forEach(i => {
          if (i.category) {
            i.category.split(',').forEach(c => {
              const trimmed = c.trim();
              if (trimmed && !added.has(trimmed)) {
                added.add(trimmed);
                list.push(trimmed);
              }
            });
          }
        });
      }
    }

    return list;
  }, [mode, categories, packages, customItems]);

  // Handle outside click for sort menu
  const sortMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Smart helper to match item categories (including multiple comma-separated categories) against category names and slugs
  const isCategoryMatch = (itemCat: string, activeCat: string) => {
    if (!activeCat || activeCat === 'All') return true;
    if (!itemCat) return false;
    const activeLower = activeCat.toLowerCase().trim();

    // Support comma-separated multiple categories on a single item or ready-made package
    const itemCategories = itemCat.split(',').map(c => c.toLowerCase().trim()).filter(Boolean);

    for (const singleItemCat of itemCategories) {
      if (singleItemCat === activeLower) return true;

      if (categories && categories.length > 0) {
        const catObj = categories.find(
          c => c.name.toLowerCase().trim() === activeLower || c.slug.toLowerCase().trim() === activeLower
        );
        if (catObj) {
          const slugLower = catObj.slug.toLowerCase().trim();
          const nameLower = catObj.name.toLowerCase().trim();
          if (singleItemCat === slugLower || singleItemCat === nameLower) return true;
          if (nameLower.includes(singleItemCat) || singleItemCat.includes(nameLower)) return true;
          if (slugLower.includes(singleItemCat) || singleItemCat.includes(slugLower)) return true;
        }
      }

      if (activeLower.includes(singleItemCat) || singleItemCat.includes(activeLower)) return true;
    }

    return false;
  };

  // Filtered & Sorted Packages with Smart Keyword / Multi-Word Matching
  const filteredPackages = useMemo(() => {
    let result = [...packages];
    
    // Category filter
    if (activeCategory !== 'All') {
      result = result.filter(p => isCategoryMatch(p.category, activeCategory));
    }

    // Smart Multi-Word / Keyword Search
    const searchWords = searchTerm.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (searchWords.length > 0) {
      result = result.filter(p => {
        const searchableText = [
          p.name,
          p.category,
          p.badge || '',
          p.shortDesc || '',
          p.popularFor || '',
          ...(p.itemsIncluded || []),
          ...(p.itemsIncludedDetailed?.map(d => `${d.name} ${d.description}`) || []),
        ].join(' ').toLowerCase();
        
        return searchWords.every(word => searchableText.includes(word));
      });
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => getPkgPrice(a) - getPkgPrice(b));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => getPkgPrice(b) - getPkgPrice(a));
    }

    return result;
  }, [packages, activeCategory, searchTerm, sortBy, categories, buyerMarket]);

  // Filtered & Sorted Custom Items with Smart Keyword Matching
  const filteredCustomItems = useMemo(() => {
    let result = [...customItems];
    if (activeCategory !== 'All') {
      result = result.filter(i => isCategoryMatch(i.category, activeCategory));
    }
    
    // Smart Multi-Word / Keyword Search
    const searchWords = searchTerm.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (searchWords.length > 0) {
      result = result.filter(item => {
        const searchableText = [
          item.name,
          item.category,
          item.description || '',
        ].join(' ').toLowerCase();
        
        return searchWords.every(word => searchableText.includes(word));
      });
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => getItemPrice(a) - getItemPrice(b));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => getItemPrice(b) - getItemPrice(a));
    }
    
    return result;
  }, [customItems, activeCategory, searchTerm, sortBy, categories, buyerMarket]);

  const handleModalAdd = () => {
    if (selectedModalPkg) {
      onAddToCartPrepared(selectedModalPkg, giftNote);
      setSelectedModalPkg(null);
      setGiftNote('');
    }
  };

  const handleCustomQtyChange = (id: string, delta: number) => {
    setCustomCart(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      const newCart = { ...prev };
      if (next === 0) {
        delete newCart[id];
      } else {
        newCart[id] = next;
      }
      return newCart;
    });
  };

  const customCartSummary = useMemo(() => {
    let count = 0;
    let total = 0;
    const selectedItemsList: CustomBoxOption[] = [];
    Object.entries(customCart).forEach(([id, qty]) => {
      const item = customItems.find(i => i.id === id);
      if (item) {
        const itemPrice = getItemPrice(item);
        count += qty;
        total += itemPrice * qty;
        for (let i=0; i<qty; i++) {
          selectedItemsList.push(item);
        }
      }
    });
    return { count, total, selectedItemsList };
  }, [customCart, customItems, buyerMarket]);

  const handleAddCustomBoxToCart = () => {
    if (customCartSummary.count === 0) return;
    onAddToCartCustom({
      boxStyle: automaticBox,
      selectedItems: customCartSummary.selectedItemsList,
      cardMessage: '', 
      ribbonColor: 'Gold Satin Ribbon',
      totalPrice: customCartSummary.total,
    });
    setCustomCart({}); // Reset cart
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

  const handlePackageClick = (pkg: PreparedPackage) => {
    if (onViewPackageDetail) {
      onViewPackageDetail(pkg.id);
    } else {
      setSelectedModalPkg(pkg);
    }
  };

  const renderPackagesView = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3.5 md:gap-4">
      {filteredPackages.map((pkg) => (
        <div
          key={pkg.id}
          className="group relative luxury-satin-card luxury-satin-card-hover rounded-xl sm:rounded-2xl overflow-hidden flex flex-col justify-between w-full shadow-lg"
        >
          {/* Square Image Container with Inner Border */}
          <div className="p-1.5 sm:p-2.5">
            <div 
              className="relative w-full aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-black/40 border border-white/10 cursor-pointer group-hover:border-[#D9A514]/40 transition-all flex items-center justify-center"
              onClick={() => handlePackageClick(pkg)}
            >
              <img
                src={pkg.image}
                alt={pkg.name}
                className="absolute inset-0 w-full h-full object-contain p-1.5 sm:p-2.5 group-hover:scale-105 transition-transform duration-700"
              />
              {pkg.badge && (
                <span className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 bg-gradient-to-r from-[#F5C542] to-[#D9A514] text-[#2B0005] text-[8px] sm:text-[10px] font-black tracking-wider sm:tracking-widest px-1.5 sm:px-2.5 py-0.5 sm:py-1 uppercase rounded-full shadow-md z-10">
                  {pkg.badge}
                </span>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-2 sm:p-4 pt-0 flex-1 flex flex-col justify-between">
            <div className="cursor-pointer" onClick={() => handlePackageClick(pkg)}>
              <div className="text-[9px] sm:text-[10px] text-amber-300/90 font-bold uppercase tracking-wider truncate mb-0.5">
                {pkg.category?.includes(',') ? pkg.category.split(',')[0].trim() : pkg.category}
              </div>
              <h3 className="font-podium text-xs sm:text-lg uppercase font-bold text-white tracking-wide mb-1 group-hover:text-amber-300 transition-colors line-clamp-1">
                {pkg.name}
              </h3>
              <p className="text-white/60 text-[10px] sm:text-[12px] font-inter line-clamp-2 leading-tight sm:leading-relaxed mb-2 sm:mb-3">
                {pkg.shortDesc}
              </p>
            </div>
            
            <div className="pt-2 sm:pt-3 mt-auto border-t border-white/10 z-20">
              <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-2.5">
                <span className="text-xs sm:text-xl font-bold font-inter text-amber-300">
                  {formatPrice(getPkgPrice(pkg), currency)}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch gap-1 sm:gap-2">
                {/* Details Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handlePackageClick(pkg); }}
                  className="flex-1 bg-black/50 hover:bg-black/80 text-amber-300 border border-amber-400/40 hover:border-amber-400 px-1.5 sm:px-3 py-1 sm:py-2 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-inter font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                  title="View Package Details"
                >
                  <Eye className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                  <span>Details</span>
                </button>

                {/* Add to Cart Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); onAddToCartPrepared(pkg); }}
                  className="flex-1 bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-bold px-1.5 sm:px-3 py-1 sm:py-2 text-[9px] sm:text-xs font-inter uppercase tracking-wider rounded-md sm:rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-amber-400/20"
                  title="Add to Cart"
                >
                  <ShoppingBag className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      {filteredPackages.length === 0 && (
        <div className="col-span-full py-16 text-center text-white/50 border border-dashed border-white/10 rounded-2xl p-6 bg-black/20">
          <p className="text-sm font-medium mb-2">No gift packages matched your search criteria.</p>
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}
              className="text-xs text-amber-300 hover:text-amber-200 underline font-bold uppercase tracking-wider cursor-pointer"
            >
              Clear filters and search
            </button>
          )}
        </div>
      )}
    </div>
  );

  const renderBuildView = () => (
    <div className="pb-32">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3.5">
        {filteredCustomItems.map(item => {
          const qty = customCart[item.id] || 0;
          return (
            <div key={item.id} className="group luxury-satin-card luxury-satin-card-hover rounded-xl sm:rounded-2xl p-2 sm:p-3.5 flex flex-col justify-between w-full shadow-lg">
              {/* Square Image Container with Inner Border */}
              <div 
                onClick={() => setSelectedCustomItemModal(item)}
                className="relative w-full aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-black/40 border border-white/10 cursor-pointer group-hover:border-[#D9A514]/40 transition-all flex items-center justify-center"
              >
                <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-contain p-1.5 sm:p-2.5 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-[#230005]/90 text-[#F5C542] border border-[#D9A514]/50 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 shadow-lg backdrop-blur-sm">
                    <Eye className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#F5C542]" />
                    <span className="hidden sm:inline">View Details</span>
                  </span>
                </div>
              </div>

              {/* Title & Category Info */}
              <div className="mt-2 sm:mt-3 cursor-pointer flex-1 flex flex-col" onClick={() => setSelectedCustomItemModal(item)}>
                <div className="text-[9px] sm:text-[10px] text-amber-300/90 font-bold uppercase tracking-wider truncate mb-0.5">
                  {item.category?.includes(',') ? item.category.split(',')[0].trim() : item.category}
                </div>
                <div className="font-podium font-bold text-xs sm:text-base text-white uppercase line-clamp-1 group-hover:text-amber-300 transition-colors">{item.name}</div>
                <p className="text-white/60 text-[10px] sm:text-xs font-inter line-clamp-2 mt-0.5 sm:mt-1 leading-tight sm:leading-snug">{item.description}</p>
              </div>
              
              {/* Price & Responsive Action Controls */}
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/10">
                <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-2.5">
                  <span className="font-inter font-bold text-xs sm:text-lg text-amber-300">
                    {formatPrice(getItemPrice(item), currency)}
                  </span>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  {/* View Details Button */}
                  <button
                    onClick={() => setSelectedCustomItemModal(item)}
                    className="flex-1 bg-black/40 hover:bg-black/70 text-amber-300 border border-amber-400/30 hover:border-amber-400 px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-inter font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap shadow-sm"
                    title="View Item Details"
                  >
                    <Eye className="w-3 sm:w-4 h-3 sm:h-4 text-amber-300" />
                    <span className="hidden sm:inline">Details</span>
                  </button>

                  {/* Quantity Counter */}
                  <div className="flex items-center border border-white/20 rounded-md sm:rounded-lg overflow-hidden bg-black/40">
                    <button 
                      onClick={() => handleCustomQtyChange(item.id, -1)} 
                      className="w-6 sm:w-8 h-6 sm:h-8 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                    </button>
                    <span className="w-5 sm:w-7 text-center text-xs sm:text-sm font-bold text-white font-inter">{qty}</span>
                    <button 
                      onClick={() => handleCustomQtyChange(item.id, 1)} 
                      className="w-6 sm:w-8 h-6 sm:h-8 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                      title="Increase quantity"
                    >
                      <Plus className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filteredCustomItems.length === 0 && (
          <div className="col-span-full py-16 text-center text-white/50 border border-dashed border-white/10 rounded-2xl p-6 bg-black/20">
            <p className="text-sm font-medium mb-2">No custom items matched your search criteria.</p>
            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}
                className="text-xs text-amber-300 hover:text-amber-200 underline font-bold uppercase tracking-wider cursor-pointer"
              >
                Clear filters and search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Floating Tag Summary Panel */}
      <div className={`fixed sm:right-6 sm:bottom-6 bottom-0 left-0 sm:left-auto z-40 bg-[#EFE3C8] border-t sm:border border-[#D8C58E] sm:rounded-tl-xl sm:rounded-tr-xl sm:rounded-bl-xl sm:rounded-br-[26px] p-4 sm:p-5 shadow-[0_16px_40px_rgba(31,43,36,0.3)] font-inter w-full sm:w-64 transition-all duration-300 ${mode === 'build' ? 'translate-y-0 opacity-100 sm:rotate-[-2deg] hover:rotate-0' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        {/* Decorative Tag Hole (Desktop only visually better) */}
        <div className="hidden sm:block absolute left-4 top-4 w-3.5 h-3.5 rounded-full bg-black/90 border-2 border-[#B79D5D] shadow-inner z-10" />
        <div className="hidden sm:block absolute left-[-6px] top-[14px] w-5 h-0.5 bg-gradient-to-r from-[#8c1119] via-[#8c1119] to-transparent rotate-[35deg]" />
        
        <div className="sm:pl-6 relative z-10 flex flex-col max-h-[60vh]">
          <div className="text-[10px] uppercase tracking-widest text-[#6E5B2B] font-bold mb-1">Your gift box</div>
          <div className="text-xs text-[#5A4C22] mb-1.5 font-medium">{customCartSummary.count} item{customCartSummary.count !== 1 ? 's' : ''}</div>
          <div className="font-podium font-bold text-2xl text-[#163830] leading-none mb-3 border-b border-[#D8C58E] pb-3">
            {formatPrice(customCartSummary.total, currency)}
          </div>
          
          <div className="overflow-y-auto pr-1 mb-3 space-y-1 scrollbar-hide text-[11px] text-[#5A4C22] font-medium leading-tight">
            {Object.entries(customCart).map(([id, qty]) => {
              const item = customItems.find(i => i.id === id);
              if (!item) return null;
              return (
                <div key={id} className="flex justify-between gap-2">
                  <span className="truncate">{qty}x {item.name}</span>
                </div>
              );
            })}
          </div>
          
          {customCartSummary.count === 0 ? (
            <div className="text-[11px] text-[#7A6A38] font-medium pt-1">Add items to start building</div>
          ) : (
            <button 
              onClick={handleAddCustomBoxToCart}
              className="w-full bg-[#8c1119] hover:bg-[#6e0d13] text-white font-bold text-[13px] uppercase tracking-wider py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md mt-auto"
            >
              Add box to cart
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <section id="packages" className="w-full px-2 sm:px-6 md:px-10 lg:px-16 py-10 sm:py-16 lg:py-24 bg-[#2B0005]/40 backdrop-blur-[2px] border-t border-b border-[#D9A514]/15 relative">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <span className="text-[#F5C542] text-xs font-inter tracking-[0.25em] uppercase font-bold mb-2 block">
              Gifting, made simple
            </span>
            <h2 className="font-podium text-2xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-[#FFF8ED]">
              Find the right gift
            </h2>
            <p className="text-[#FFF8ED]/75 text-xs sm:text-sm max-w-md mt-2 sm:mt-3 font-inter">
              Pick a ready-made package, or build your own box item by item.
            </p>
          </div>
        </div>

        {/* Mode Toggle & Search Toolbar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* Mode Toggle */}
          <div className="inline-flex bg-[#230005]/80 border border-[#D9A514]/25 rounded-full p-1 gap-1 shadow-inner backdrop-blur-sm w-fit self-start">
            <button 
              onClick={() => { setMode('pkg'); setActiveCategory('All'); }}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-extrabold font-inter uppercase tracking-wider transition-all cursor-pointer ${mode === 'pkg' ? 'bg-gradient-to-r from-[#F5C542] to-[#D9A514] text-[#2B0005] shadow-lg' : 'text-[#FFF8ED]/70 hover:text-[#FFF8ED]'}`}
            >
              Ready-made packages
            </button>
            <button 
              onClick={() => { setMode('build'); setActiveCategory('All'); }}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-extrabold font-inter uppercase tracking-wider transition-all cursor-pointer ${mode === 'build' ? 'bg-gradient-to-r from-[#F5C542] to-[#D9A514] text-[#2B0005] shadow-lg' : 'text-[#FFF8ED]/70 hover:text-[#FFF8ED]'}`}
            >
              Build your own
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F5C542]/70" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${mode === 'pkg' ? 'packages, occasions, items...' : 'items, chocolates, accessories...'}`}
              className="w-full bg-[#1e0004]/90 border border-[#D9A514]/30 rounded-full pl-9 pr-9 py-2.5 text-xs text-[#FFF8ED] placeholder:text-white/40 focus:outline-none focus:border-[#F5C542] focus:ring-1 focus:ring-[#F5C542]/40 transition-all shadow-inner font-inter"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-0.5 rounded-full"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Sleek Horizontal Categories Bar & Sort Dropdown */}
        <div className="flex items-center gap-2 sm:gap-4 border-y border-white/10 py-2.5 sm:py-3 mb-6 sm:mb-10 overflow-visible">
          
          {/* Scrollable category chips */}
          <div className="flex-1 flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {dynamicCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-3.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-bold font-inter uppercase tracking-wider rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === cat 
                  ? 'bg-gradient-to-r from-[#F5C542] to-[#D9A514] border-[#F5C542] text-[#2B0005] font-black shadow-md scale-[1.02]' 
                  : 'bg-[#230005]/60 border-[#D9A514]/20 text-[#FFF8ED]/80 hover:border-[#F5C542]/50 hover:text-[#FFF8ED]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0 z-30" ref={sortMenuRef}>
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-1.5 sm:gap-2 bg-[#230005]/70 border border-[#D9A514]/25 hover:border-[#F5C542]/60 text-[#FFF8ED] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-[11px] font-bold font-inter uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>Sort</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#F5C542] transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-48 bg-[#230005]/95 border border-[#D9A514]/30 rounded-2xl shadow-[0_16px_36px_rgba(0,0,0,0.7)] overflow-hidden font-inter text-sm backdrop-blur-xl">
                {[
                  { id: 'popular', label: 'Popular' },
                  { id: 'price-asc', label: 'Price: low to high' },
                  { id: 'price-desc', label: 'Price: high to low' },
                  { id: 'newest', label: 'Newest' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setSortBy(opt.id); setIsSortOpen(false); }}
                    className={`w-full text-left px-4 py-3 hover:bg-[#D9A514]/15 transition-colors cursor-pointer ${sortBy === opt.id ? 'text-[#F5C542] font-bold' : 'text-[#FFF8ED]/80'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        {mode === 'pkg' ? renderPackagesView() : renderBuildView()}

      </div>

      {/* Package Detail Modal (re-used from PreparedPackages) */}
      {selectedModalPkg && (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#230005]/95 border border-[#D9A514]/40 rounded-3xl max-w-5xl w-full p-6 sm:p-8 lg:p-10 relative shadow-2xl backdrop-blur-xl animate-scale-in my-auto max-h-[92vh] overflow-y-auto font-inter">
            {/* Close Button */}
            <button
              onClick={() => setSelectedModalPkg(null)}
              className="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-full bg-black/40 hover:bg-white/10 transition-all cursor-pointer z-20"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Top Package Overview Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8 pb-8 border-b border-white/15">
              {/* Left Column: Image & Stats (5 cols) */}
              <div className="lg:col-span-5 relative">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-white/15 bg-black/40 shadow-xl group">
                  <img
                    src={selectedModalPkg.image}
                    alt={selectedModalPkg.name}
                    className="absolute inset-0 w-full h-full object-contain p-4"
                  />
                  {selectedModalPkg.badge && (
                    <span className="absolute top-4 left-4 bg-amber-400 text-[#8c1119] text-xs font-bold tracking-widest px-3 py-1 uppercase rounded-full shadow-lg z-10">
                      {selectedModalPkg.badge}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-white/70 font-inter px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-300 font-bold">★ {selectedModalPkg.rating}</span>
                    <span className="text-white/30">•</span>
                    <span>{selectedModalPkg.reviewsCount} customer reviews</span>
                  </div>
                  {selectedModalPkg.popularFor && (
                    <span className="text-amber-200/90 font-medium text-[11px] truncate max-w-[180px]">
                      {selectedModalPkg.popularFor}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column: Title, Price & Order Action (7 cols) */}
              <div className="lg:col-span-7 flex flex-col justify-between h-full">
                <div>
                  <h2 className="font-podium text-2xl sm:text-4xl uppercase text-white font-bold tracking-tight mb-2">
                    {selectedModalPkg.name}
                  </h2>

                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-3xl font-bold font-inter text-amber-300">
                      {formatPrice(getPkgPrice(selectedModalPkg), currency)}
                    </span>
                    <span className="text-xs text-white/60 font-inter uppercase tracking-wider">
                      {buyerMarket === 'INTERNATIONAL' ? '✨ Free Delivery in Ethiopia' : 'Premium Packaging Included'}
                    </span>
                  </div>

                  <p className="text-white/85 text-xs sm:text-sm font-inter leading-relaxed mb-6">
                    {selectedModalPkg.shortDesc}
                  </p>

                  {/* Gift Note Input */}
                  <div className="mb-6 bg-black/30 border border-white/15 rounded-xl p-4">
                    <label className="block text-xs uppercase tracking-wider text-amber-300 font-inter mb-2 font-bold flex items-center justify-between">
                      <span>Personalized Gift Note (Optional)</span>
                      <span className="text-[10px] text-white/50 font-normal">Handwritten on wax-sealed card</span>
                    </label>
                    <textarea
                      value={giftNote}
                      onChange={(e) => setGiftNote(e.target.value)}
                      placeholder="Write a personalized message to be included inside the box..."
                      className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400 h-20 resize-none font-inter"
                    />
                  </div>
                </div>

                <button
                  onClick={handleModalAdd}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-bold py-4 text-xs sm:text-sm tracking-widest uppercase rounded-xl flex items-center justify-center gap-2.5 transition-all font-inter shadow-xl shadow-amber-400/20 cursor-pointer"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>ADD PACKAGE TO CART — {formatPrice(getPkgPrice(selectedModalPkg), currency)}</span>
                </button>
              </div>
            </div>

            {/* Included Items Section - Rich Detailed Grid */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-podium text-xl sm:text-2xl uppercase font-bold text-white flex items-center gap-2.5">
                  <PackageCheck className="w-6 h-6 text-amber-300" />
                  <span>Items Included Inside ({getItemDetails(selectedModalPkg).length} Items)</span>
                </h3>
                <span className="text-xs text-amber-300 font-inter font-semibold uppercase tracking-wider hidden sm:inline">
                  ★ Handcrafted & Curated
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {getItemDetails(selectedModalPkg).map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-black/40 border border-white/15 rounded-xl p-4 flex gap-4 items-center hover:border-amber-400/50 transition-all duration-300 group"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-white/15 bg-black/50 flex-shrink-0 relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute bottom-1 right-1 bg-amber-400 text-[#8c1119] p-1 rounded-full shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-amber-300 font-bold uppercase tracking-widest bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                          Item #{idx + 1}
                        </span>
                      </div>
                      <h4 className="font-podium text-base font-bold text-white uppercase mt-1 line-clamp-1 group-hover:text-amber-300 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-white/70 text-xs font-inter mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Single Custom Item Detail Modal */}
      {selectedCustomItemModal && (
        <div className="fixed inset-0 z-[65] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-inter">
          <div className="bg-[#230005]/95 border border-[#D9A514]/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl backdrop-blur-xl animate-scale-in my-auto max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedCustomItemModal(null)}
              className="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-full bg-black/40 hover:bg-white/10 transition-all cursor-pointer z-20"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Left: Image Container */}
              <div className="w-full sm:w-1/2">
                <div className="relative rounded-xl overflow-hidden border border-white/15 bg-black/40 shadow-lg">
                  <img
                    src={selectedCustomItemModal.image}
                    alt={selectedCustomItemModal.name}
                    className="w-full h-56 sm:h-64 object-contain p-4"
                  />
                </div>
              </div>

              {/* Right: Item Info & Box Control */}
              <div className="flex-1 flex flex-col justify-between w-full">
                <div>
                  <div className="text-amber-300 text-xs font-bold uppercase tracking-widest mb-1">
                    Custom Box Gift Component
                  </div>
                  <h3 className="font-podium text-2xl uppercase text-white font-bold mb-2">
                    {selectedCustomItemModal.name}
                  </h3>
                  <div className="text-2xl font-bold font-inter text-amber-300 mb-3">
                    {formatPrice(getItemPrice(selectedCustomItemModal), currency)}
                  </div>

                  <p className="text-white/85 text-xs sm:text-sm font-inter leading-relaxed mb-5">
                    {selectedCustomItemModal.description}
                  </p>

                  <div className="bg-black/30 border border-white/10 rounded-xl p-3 mb-6 text-xs text-white/80 font-inter space-y-1">
                    <div className="flex items-center gap-2 text-amber-300 font-bold uppercase text-[11px] tracking-wider">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Signature Quality</span>
                    </div>
                    <p className="text-white/70 text-[11px]">
                      Hand-packed in your custom velvet box with gold foil wrapping.
                    </p>
                  </div>
                </div>

                {/* Add to Custom Box Quantity Controls */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <span className="text-xs text-white/70 font-bold uppercase tracking-wider">In Box:</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-white/20 rounded-full overflow-hidden bg-black/40 h-10">
                      <button
                        onClick={() => handleCustomQtyChange(selectedCustomItemModal.id, -1)}
                        className="w-10 h-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                        title="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-white font-inter">
                        {customCart[selectedCustomItemModal.id] || 0}
                      </span>
                      <button
                        onClick={() => handleCustomQtyChange(selectedCustomItemModal.id, 1)}
                        className="w-10 h-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                        title="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        if (!customCart[selectedCustomItemModal.id]) {
                          handleCustomQtyChange(selectedCustomItemModal.id, 1);
                        }
                        setSelectedCustomItemModal(null);
                      }}
                      className="bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-bold px-5 py-2.5 rounded-full text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
