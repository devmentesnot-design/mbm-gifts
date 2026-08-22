import React, { useState } from 'react';
import { PreparedPackage, CustomBoxOption, CUSTOM_ITEMS } from '../data/giftsData';
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
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PackageDetailPageProps {
  packageData: PreparedPackage;
  allPackages: PreparedPackage[];
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
    customerInputImageUrl?: string
  ) => void;
}

export const PackageDetailPage: React.FC<PackageDetailPageProps> = ({
  packageData,
  allPackages,
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
  const [clientCustomText, setClientCustomText] = useState('');
  const [clientCustomImageUrl, setClientCustomImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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

  const handleAddToCart = () => {
    if (packageData.requiresCustomInput) {
      if (
        (packageData.customInputType === 'text' || packageData.customInputType === 'both') &&
        !clientCustomText.trim()
      ) {
        alert(`Please fill in the required field: ${packageData.customInputLabel || 'Custom text'}`);
        return;
      }
      if (
        (packageData.customInputType === 'image' || packageData.customInputType === 'both') &&
        !clientCustomImageUrl
      ) {
        alert('Please upload your photo before adding to cart.');
        return;
      }
    }

    onAddToCartPrepared(packageData, giftNote, clientCustomText, clientCustomImageUrl);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const url = await uploadToCloudinary(file);
      setClientCustomImageUrl(url);
    } catch (err: any) {
      alert('Failed to upload image: ' + (err?.message || 'Please try again'));
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-transparent text-[#FFF8ED] font-inter selection:bg-[#D9A514] selection:text-[#2B0005] flex flex-col justify-between">
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
              className="inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 text-xs sm:text-sm font-bold uppercase tracking-wider bg-black/30 border border-amber-400/30 hover:border-amber-400 px-4 py-2 rounded-full transition-all cursor-pointer shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Packages</span>
            </button>

            <div className="text-xs text-white/50 font-inter hidden sm:block">
              <span>Home</span> / <span className="text-amber-300 font-medium">Packages</span> / <span className="text-white/80">{packageData.name}</span>
            </div>
          </div>
        </div>

        {/* Hero Product Overview Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6">
          <div className="bg-[#4a070c]/90 border border-amber-400/30 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden backdrop-blur-md">
            
            {/* Added Toast Notification */}
            {addedToast && (
              <div className="fixed top-24 right-6 z-50 bg-amber-400 text-[#8c1119] font-bold px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce font-inter">
                <Check className="w-5 h-5 stroke-[3]" />
                <span>Added to cart successfully!</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              
              {/* Left Column: Full Display Image Showcase (5 cols) */}
              <div className="lg:col-span-5 relative">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-white/20 bg-black/40 shadow-2xl group">
                  <img
                    src={packageData.image}
                    alt={packageData.name}
                    className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-700"
                  />
                  {packageData.badge && (
                    <span className="absolute top-4 left-4 bg-amber-400 text-[#8c1119] text-xs font-extrabold tracking-widest px-3.5 py-1.5 uppercase rounded-full shadow-lg z-10">
                      {packageData.badge}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                </div>

                {/* Rating & Review summary strip */}
                <div className="mt-4 bg-black/40 border border-white/10 rounded-xl p-3.5 flex items-center justify-between text-xs text-white/80 font-inter">
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-300">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-300 stroke-amber-300" />
                      ))}
                    </div>
                    <span className="font-bold text-amber-300">{packageData.rating}</span>
                  </div>
                  <span className="text-white/60">Based on {packageData.reviewsCount} customer reviews</span>
                </div>
              </div>

              {/* Right Column: Title, Price & Personalization Action (7 cols) */}
              <div className="lg:col-span-7 flex flex-col justify-between h-full">
                <div>
                  <div className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{packageData.category?.includes(',') ? packageData.category.split(',').map(c => c.trim()).join(' • ') : `${packageData.category} Collection`}</span>
                  </div>

                  <h1 className="font-podium text-3xl sm:text-5xl uppercase text-white font-extrabold tracking-tight mb-3 leading-none">
                    {packageData.name}
                  </h1>

                  <div className="flex flex-wrap items-baseline gap-3 mb-6 pb-6 border-b border-white/15">
                    <span className="text-3xl sm:text-4xl font-extrabold font-inter text-amber-300">
                      {formatPrice(getPkgPrice(packageData), currency)}
                    </span>
                    <span className="text-xs text-emerald-300 uppercase tracking-wider font-semibold bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-emerald-400" />
                      {buyerMarket === 'INTERNATIONAL' ? 'Free Delivery in Ethiopia' : 'Free Express Delivery Included'}
                    </span>
                  </div>

                  <p className="text-white/90 text-sm sm:text-base font-inter leading-relaxed mb-6">
                    {packageData.shortDesc}
                  </p>

                  {/* Highlights / Guarantees Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    <div className="bg-black/30 border border-white/10 rounded-xl p-3 flex items-center gap-2.5">
                      <Gift className="w-5 h-5 text-amber-300 flex-shrink-0" />
                      <div>
                        <div className="text-[11px] font-bold uppercase text-white">Velvet Box</div>
                        <div className="text-[10px] text-white/60">Gold foil ribbon</div>
                      </div>
                    </div>

                    <div className="bg-black/30 border border-white/10 rounded-xl p-3 flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-amber-300 flex-shrink-0" />
                      <div>
                        <div className="text-[11px] font-bold uppercase text-white">Wax Sealed</div>
                        <div className="text-[10px] text-white/60">Calligraphy note</div>
                      </div>
                    </div>

                    <div className="bg-black/30 border border-white/10 rounded-xl p-3 flex items-center gap-2.5 col-span-2 sm:col-span-1">
                      <Truck className="w-5 h-5 text-amber-300 flex-shrink-0" />
                      <div>
                        <div className="text-[11px] font-bold uppercase text-white">Express Delivery</div>
                        <div className="text-[10px] text-white/60">Tracked shipping</div>
                      </div>
                    </div>
                  </div>

                  {/* Client Customization Requirement Section */}
                  {packageData.requiresCustomInput && (
                    <div className="mb-6 bg-[#3a060b]/70 border border-amber-400/30 rounded-2xl p-5 shadow-lg space-y-4">
                      <div className="flex items-center gap-2 text-amber-300 font-bold uppercase text-xs tracking-wider border-b border-white/10 pb-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>{packageData.customInputLabel || 'Required Customization Details'}</span>
                      </div>

                      {/* Photo Upload if required */}
                      {(packageData.customInputType === 'image' || packageData.customInputType === 'both') && (
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-amber-200 font-bold mb-2 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Camera className="w-3.5 h-3.5 text-amber-300" />
                              <span>Upload Your Custom Photo <span className="text-red-400">*</span></span>
                            </span>
                            <span className="text-[10px] text-white/50 font-normal">PNG, JPG up to 10MB</span>
                          </label>

                          {clientCustomImageUrl ? (
                            <div className="flex items-center gap-3 bg-black/40 border border-emerald-500/40 rounded-xl p-3">
                              <div className="w-16 h-16 rounded-lg overflow-hidden border border-emerald-400/40 bg-black/60 flex-shrink-0">
                                <img src={clientCustomImageUrl} alt="Uploaded preview" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-emerald-300 text-xs font-bold flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" /> Photo Uploaded Successfully
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setClientCustomImageUrl('')}
                                  className="text-red-400 hover:text-red-300 text-[11px] font-bold mt-1 flex items-center gap-1 cursor-pointer"
                                >
                                  <X className="w-3 h-3" /> Remove & Upload Different
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-amber-400/40 hover:border-amber-400 rounded-xl p-4 cursor-pointer bg-black/30 hover:bg-black/50 transition-all text-center">
                              {isUploadingImage ? (
                                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold py-2">
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  <span>Uploading photo...</span>
                                </div>
                              ) : (
                                <>
                                  <Upload className="w-6 h-6 text-amber-300 mb-1" />
                                  <span className="text-xs font-bold text-white">Click to Upload Client Photo</span>
                                  <span className="text-[10px] text-white/50 mt-0.5">High resolution recommended</span>
                                </>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={isUploadingImage}
                                onChange={handlePhotoUpload}
                              />
                            </label>
                          )}
                        </div>
                      )}

                      {/* Custom Text input if required */}
                      {(packageData.customInputType === 'text' || packageData.customInputType === 'both') && (
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-amber-200 font-bold mb-1.5 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-amber-300" />
                            <span>Custom Text / Message <span className="text-red-400">*</span></span>
                          </label>
                          <textarea
                            value={clientCustomText}
                            onChange={(e) => setClientCustomText(e.target.value)}
                            placeholder="Enter the name, date, or message to be custom printed/engraved..."
                            className="w-full bg-black/50 border border-white/20 rounded-xl p-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400 h-20 resize-none font-inter"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Gift Note Input */}
                  <div className="mb-6 bg-black/30 border border-white/15 rounded-xl p-4">
                    <label className="block text-xs uppercase tracking-wider text-amber-300 font-inter mb-2 font-bold flex items-center justify-between">
                      <span>Personalized Gift Note (Optional)</span>
                      <span className="text-[10px] text-white/50 font-normal">Wax-sealed handwritten card</span>
                    </label>
                    <textarea
                      value={giftNote}
                      onChange={(e) => setGiftNote(e.target.value)}
                      placeholder="Write a personalized note to accompany this gift box..."
                      className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400 h-16 resize-none font-inter"
                    />
                  </div>
                </div>

                {/* Primary CTA Add To Cart Button */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="w-full sm:flex-1 bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-extrabold py-4 px-8 text-sm sm:text-base tracking-widest uppercase rounded-2xl flex items-center justify-center gap-3 transition-all font-inter shadow-2xl shadow-amber-400/20 cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
                    <span>ADD PACKAGE TO CART — {formatPrice(getPkgPrice(packageData), currency)}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Included Items Detailed Showcase Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12">
          <div className="bg-[#4a070c]/60 border border-white/15 rounded-3xl p-6 sm:p-10 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/15">
              <div>
                <div className="inline-flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-widest mb-1">
                  <PackageCheck className="w-4 h-4" />
                  <span>Package Inventory Breakdown</span>
                </div>
                <h2 className="font-podium text-2xl sm:text-4xl uppercase font-bold text-white">
                  Items Included Inside ({itemsDetailed.length} Luxury Pieces)
                </h2>
              </div>
              <span className="text-xs text-amber-300 font-inter font-bold uppercase tracking-wider bg-amber-400/10 border border-amber-400/20 px-4 py-2 rounded-full self-start sm:self-auto">
                Hand-Selected & Individually Wrapped
              </span>
            </div>

            {/* Grid of items inside with images & descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {itemsDetailed.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-black/40 border border-white/15 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-400/50 transition-all duration-300 group shadow-lg"
                >
                  <div>
                    {/* Item Image - Square Container */}
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-white/15 bg-black/50 mb-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="absolute inset-0 w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute bottom-2 right-2 bg-amber-400 text-[#8c1119] p-1.5 rounded-full shadow-md">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </span>
                      <span className="absolute top-2 left-2 bg-black/70 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-sm">
                        Piece #{idx + 1}
                      </span>
                    </div>

                    <h3 className="font-podium text-lg font-bold text-white uppercase mb-2 group-hover:text-amber-300 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-white/75 text-xs sm:text-sm font-inter leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-amber-300/80 font-bold uppercase tracking-wider">
                    <span>Guaranteed Fresh & Authentic</span>
                    <Check className="w-3.5 h-3.5 text-amber-400" />
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
              <h3 className="font-podium text-2xl uppercase font-bold text-white">
                You Might Also Like
              </h3>
              <button
                onClick={onNavigateHome}
                className="text-amber-300 hover:text-amber-200 text-xs font-bold uppercase tracking-wider underline cursor-pointer"
              >
                View All Packages
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPackages.map((relPkg) => (
                <div
                  key={relPkg.id}
                  onClick={() => onNavigateToPackage(relPkg.id)}
                  className="bg-[#4a070c]/80 border border-white/15 rounded-2xl overflow-hidden hover:border-amber-400/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer group shadow-xl flex flex-col justify-between"
                >
                  <div className="p-3.5">
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-black/40 border border-white/10">
                      <img
                        src={relPkg.image}
                        alt={relPkg.name}
                        className="absolute inset-0 w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                      />
                      {relPkg.badge && (
                        <span className="absolute top-3 left-3 bg-amber-400 text-[#8c1119] text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md">
                          {relPkg.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-podium text-lg uppercase font-bold text-white group-hover:text-amber-300 transition-colors mb-1 line-clamp-1">
                        {relPkg.name}
                      </h4>
                      <p className="text-white/70 text-xs font-inter line-clamp-2 mb-4">
                        {relPkg.shortDesc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="font-bold font-inter text-amber-300 text-lg">{formatPrice(getPkgPrice(relPkg), currency)}</span>
                      <span className="bg-amber-400 text-[#8c1119] font-bold px-3 py-1.5 text-[11px] uppercase tracking-wider rounded-full flex items-center gap-1">
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
