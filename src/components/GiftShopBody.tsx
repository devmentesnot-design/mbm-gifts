import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PreparedPackage, CustomBoxOption, GiftCategory, GiftBoxStyle, CUSTOM_ITEMS, PREPARED_PACKAGES } from '../data/giftsData';
import { ShoppingBag, Star, Eye, X, Check, Search, Filter, Plus, Minus, PackageCheck, Sparkles, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/currency';

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
  const [mode, setMode] = useState<'pkg' | 'build'>('pkg');
  
  // Shared Filter State
  const [activeCategory, setActiveCategory] = useState<string>('All');
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

  // Dynamically compute available categories from master categories AND actual packages / items
  const dynamicCategories = useMemo(() => {
    const list: string[] = ['All'];
    const added = new Set<string>(['All']);

    if (mode === 'pkg') {
      if (categories && categories.length > 0) {
        categories
          .filter(c => !c.type || c.type === 'package' || c.type === 'both')
          .forEach(c => {
            if (!added.has(c.name)) {
              added.add(c.name);
              list.push(c.name);
            }
          });
      }
      packages.forEach(p => {
        if (p.category && !added.has(p.category)) {
          added.add(p.category);
          list.push(p.category);
        }
      });
    } else {
      if (categories && categories.length > 0) {
        categories
          .filter(c => !c.type || c.type === 'custom_item' || c.type === 'both')
          .forEach(c => {
            if (!added.has(c.name)) {
              added.add(c.name);
              list.push(c.name);
            }
          });
      }
      customItems.forEach(i => {
        if (i.category && !added.has(i.category)) {
          added.add(i.category);
          list.push(i.category);
        }
      });
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

  // Smart helper to match item categories against category names and slugs
  const isCategoryMatch = (itemCat: string, activeCat: string) => {
    if (!activeCat || activeCat === 'All') return true;
    if (!itemCat) return false;
    const itemLower = itemCat.toLowerCase().trim();
    const activeLower = activeCat.toLowerCase().trim();

    if (itemLower === activeLower) return true;

    if (categories && categories.length > 0) {
      const catObj = categories.find(
        c => c.name.toLowerCase().trim() === activeLower || c.slug.toLowerCase().trim() === activeLower
      );
      if (catObj) {
        const slugLower = catObj.slug.toLowerCase().trim();
        const nameLower = catObj.name.toLowerCase().trim();
        if (itemLower === slugLower || itemLower === nameLower) return true;
        if (nameLower.includes(itemLower) || itemLower.includes(nameLower)) return true;
        if (slugLower.includes(itemLower) || itemLower.includes(slugLower)) return true;
      }
    }

    if (activeLower.includes(itemLower) || itemLower.includes(activeLower)) return true;
    return false;
  };

  // Filtered & Sorted Packages
  const filteredPackages = useMemo(() => {
    let result = [...packages];
    
    if (activeCategory !== 'All') {
      result = result.filter(p => isCategoryMatch(p.category, activeCategory));
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'popular') {
      result.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    return result;
  }, [packages, activeCategory, sortBy, categories]);

  // Filtered & Sorted Custom Items
  const filteredCustomItems = useMemo(() => {
    let result = [...customItems];
    if (activeCategory !== 'All') {
      result = result.filter(i => isCategoryMatch(i.category, activeCategory));
    }
    
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }
    
    return result;
  }, [customItems, activeCategory, sortBy, categories]);

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
        count += qty;
        total += item.price * qty;
        for (let i=0; i<qty; i++) {
          selectedItemsList.push(item);
        }
      }
    });
    return { count, total, selectedItemsList };
  }, [customCart, customItems]);

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
      {filteredPackages.map((pkg) => (
        <div
          key={pkg.id}
          className="group relative bg-[#4a070c]/90 border border-white/15 rounded-xl overflow-hidden hover:border-amber-400/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between shadow-xl max-w-sm mx-auto w-full"
        >
          {/* Image Area */}
          <div 
            className="relative h-44 sm:h-48 w-full overflow-hidden bg-black/40 cursor-pointer"
            onClick={() => handlePackageClick(pkg)}
          >
            <img
              src={pkg.image}
              alt={pkg.name}
              className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-700"
            />
            {pkg.badge && (
              <span className="absolute top-3 left-3 bg-amber-400 text-[#8c1119] text-[10px] font-bold tracking-widest px-2.5 py-1 uppercase rounded-full shadow-md z-10">
                {pkg.badge}
              </span>
            )}
          </div>

          {/* Content Area */}
          <div className="p-4 sm:p-5 flex-1 flex flex-col">
            <div className="mb-auto cursor-pointer" onClick={() => handlePackageClick(pkg)}>
              <h3 className="font-podium text-base sm:text-lg uppercase font-bold text-white tracking-wide mb-1.5 group-hover:text-amber-300 transition-colors line-clamp-1">
                {pkg.name}
              </h3>
              <p className="text-white/60 text-[11px] sm:text-[12px] font-inter line-clamp-2 leading-relaxed mb-3 sm:mb-4">
                {pkg.shortDesc}
              </p>
            </div>
            
            <div className="pt-3 sm:pt-4 mt-auto border-t border-white/10 z-20">
              <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3">
                <span className="text-lg sm:text-xl font-bold font-inter text-amber-300">{formatCurrency(pkg.price)}</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Details Button First */}
                <button
                  onClick={(e) => { e.stopPropagation(); handlePackageClick(pkg); }}
                  className="flex-1 bg-black/50 hover:bg-black/80 text-amber-300 border border-amber-400/40 hover:border-amber-400 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-inter font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap"
                  title="View Package Details"
                >
                  <Eye className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
                  <span>Details</span>
                </button>

                {/* Add to Cart Button Second */}
                <button
                  onClick={(e) => { e.stopPropagation(); onAddToCartPrepared(pkg); }}
                  className="flex-1 bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-bold px-2.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-inter uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-400/20 whitespace-nowrap"
                  title="Add to Cart"
                >
                  <ShoppingBag className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      {filteredPackages.length === 0 && (
        <div className="col-span-full py-16 text-center text-white/50 border border-dashed border-white/10 rounded-xl">
          No packages found for this category.
        </div>
      )}
    </div>
  );

  const renderBuildView = () => (
    <div className="pb-32">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {filteredCustomItems.map(item => {
          const qty = customCart[item.id] || 0;
          return (
            <div key={item.id} className="group bg-[#4a070c]/80 border border-white/15 rounded-xl p-3.5 flex flex-col justify-between hover:border-amber-400/50 hover:-translate-y-0.5 transition-all duration-200 shadow-lg">
              {/* Image Container with Hover Quick View */}
              <div 
                onClick={() => setSelectedCustomItemModal(item)}
                className="relative h-44 sm:h-48 rounded-lg overflow-hidden bg-black/50 border border-white/10 cursor-pointer group-hover:border-amber-400/30 transition-all flex items-center justify-center"
              >
                <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-black/80 text-amber-300 border border-amber-400/50 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                    <Eye className="w-3.5 h-3.5 text-amber-300" />
                    <span>View Details</span>
                  </span>
                </div>
              </div>

              {/* Title & Category Info */}
              <div className="mt-3 cursor-pointer" onClick={() => setSelectedCustomItemModal(item)}>
                <div className="text-[10px] text-amber-300/90 uppercase tracking-widest font-bold mb-0.5">{item.category}</div>
                <div className="font-podium font-bold text-base text-white uppercase line-clamp-1 group-hover:text-amber-300 transition-colors">{item.name}</div>
                <p className="text-white/60 text-xs font-inter line-clamp-2 mt-1 leading-snug">{item.description}</p>
              </div>
              
              {/* Price & Responsive Action Controls */}
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-inter font-bold text-base sm:text-lg text-amber-300">{formatCurrency(item.price)}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* View Details Button */}
                  <button
                    onClick={() => setSelectedCustomItemModal(item)}
                    className="flex-1 bg-black/40 hover:bg-black/70 text-amber-300 border border-amber-400/30 hover:border-amber-400 px-3 py-2 rounded-lg text-xs font-inter font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm"
                    title="View Item Details"
                  >
                    <Eye className="w-4 h-4 text-amber-300" />
                    <span className="inline">Details</span>
                  </button>

                  {/* Quantity Counter */}
                  <div className="flex items-center border border-white/20 rounded-lg overflow-hidden bg-black/40">
                    <button 
                      onClick={() => handleCustomQtyChange(item.id, -1)} 
                      className="w-9 h-9 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                      title="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-white font-inter">{qty}</span>
                    <button 
                      onClick={() => handleCustomQtyChange(item.id, 1)} 
                      className="w-9 h-9 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                      title="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filteredCustomItems.length === 0 && (
          <div className="col-span-full py-16 text-center text-white/50 border border-dashed border-white/10 rounded-xl">
            No items found for this category.
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
          <div className="font-podium font-bold text-3xl text-[#163830] leading-none mb-3 border-b border-[#D8C58E] pb-3">
            ${customCartSummary.total.toFixed(2)}
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
    <section id="packages" className="w-full px-3 sm:px-6 md:px-10 lg:px-16 py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-[#8c1119] via-[#6e0d13] to-[#8c1119] relative">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-amber-300 text-xs font-inter tracking-[0.25em] uppercase font-semibold mb-2 block">
              Gifting, made simple
            </span>
            <h2 className="font-podium text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-white">
              Find the right gift
            </h2>
            <p className="text-white/70 text-sm max-w-md mt-3 font-inter">
              Pick a ready-made package, or build your own box item by item.
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="inline-flex bg-[#4a070c] border border-white/10 rounded-full p-1 gap-1 mb-8 shadow-inner">
          <button 
            onClick={() => { setMode('pkg'); setActiveCategory('All'); }}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold font-inter transition-all cursor-pointer ${mode === 'pkg' ? 'bg-amber-400 text-[#8c1119] shadow-md' : 'text-white/60 hover:text-white'}`}
          >
            Ready-made packages
          </button>
          <button 
            onClick={() => { setMode('build'); setActiveCategory('All'); }}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold font-inter transition-all cursor-pointer ${mode === 'build' ? 'bg-amber-400 text-[#8c1119] shadow-md' : 'text-white/60 hover:text-white'}`}
          >
            Build your own
          </button>
        </div>

        {/* Compact Filter Bar */}
        <div className="flex items-center gap-4 border-y border-white/10 py-3 mb-10 overflow-visible">
          
          {/* Scrollable category chips */}
          <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
            {dynamicCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-2.5 text-[11px] font-bold font-inter uppercase tracking-wider rounded-full border transition-all cursor-pointer ${
                  activeCategory === cat 
                  ? 'bg-amber-400 border-amber-400 text-[#8c1119]' 
                  : 'bg-black/20 border-white/10 text-white/70 hover:border-amber-300/50 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0 z-50" ref={sortMenuRef}>
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 bg-black/20 border border-white/10 hover:border-amber-300/50 text-white/90 px-4 py-2.5 rounded-full text-[11px] font-bold font-inter uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>Sort</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-48 bg-[#4a070c] border border-white/10 rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.5)] overflow-hidden font-inter text-sm">
                {[
                  { id: 'popular', label: 'Popular' },
                  { id: 'price-asc', label: 'Price: low to high' },
                  { id: 'price-desc', label: 'Price: high to low' },
                  { id: 'newest', label: 'Newest' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setSortBy(opt.id); setIsSortOpen(false); }}
                    className={`w-full text-left px-4 py-3 hover:bg-white/10 transition-colors cursor-pointer ${sortBy === opt.id ? 'text-amber-300 font-bold' : 'text-white/80'}`}
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
          <div className="bg-[#3a060a] border border-amber-400/40 rounded-2xl max-w-5xl w-full p-6 sm:p-8 lg:p-10 relative shadow-2xl animate-scale-in my-auto max-h-[92vh] overflow-y-auto font-inter">
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
                <div className="relative rounded-xl overflow-hidden border border-white/15 bg-black/40 shadow-xl group">
                  <img
                    src={selectedModalPkg.image}
                    alt={selectedModalPkg.name}
                    className="w-full h-64 sm:h-80 object-contain p-4"
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
                  <div className="inline-flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{selectedModalPkg.category} Collection</span>
                  </div>

                  <h2 className="font-podium text-2xl sm:text-4xl uppercase text-white font-bold tracking-tight mb-2">
                    {selectedModalPkg.name}
                  </h2>

                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-3xl font-bold font-inter text-amber-300">{formatCurrency(selectedModalPkg.price)}</span>
                    <span className="text-xs text-white/60 font-inter uppercase tracking-wider">Premium Gift Packaging Included</span>
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
                  <span>ADD PACKAGE TO CART — {formatCurrency(selectedModalPkg.price)}</span>
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
          <div className="bg-[#3a060a] border border-amber-400/40 rounded-2xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl animate-scale-in my-auto max-h-[90vh] overflow-y-auto">
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
                  <span className="absolute top-3 left-3 bg-amber-400 text-[#8c1119] text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md">
                    {selectedCustomItemModal.category}
                  </span>
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
                    {formatCurrency(selectedCustomItemModal.price)}
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
