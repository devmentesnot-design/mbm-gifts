import React, { useState } from 'react';
import { Camera, FileText, Sparkles, Upload, Loader2, Check, X, Layers } from 'lucide-react';
import { PreparedPackage, CustomBoxOption } from '../data/giftsData';
import { uploadToCloudinary } from '../utils/cloudinary';
import { MarketCurrency } from '../context/MarketContext';
import { formatPrice } from '../utils/currency';

export interface MultiSideCustomizationSectionProps {
  item: PreparedPackage | CustomBoxOption;
  customSidesSelected: 'front_only' | 'front_and_back';
  onChangeCustomSidesSelected: (sides: 'front_only' | 'front_and_back') => void;
  // Front side
  frontText: string;
  onChangeFrontText: (text: string) => void;
  frontImageUrl: string;
  onChangeFrontImageUrl: (url: string) => void;
  // Back side
  backText: string;
  onChangeBackText: (text: string) => void;
  backImageUrl: string;
  onChangeBackImageUrl: (url: string) => void;
  currency?: MarketCurrency;
}

export const MultiSideCustomizationSection: React.FC<MultiSideCustomizationSectionProps> = ({
  item,
  customSidesSelected,
  onChangeCustomSidesSelected,
  frontText,
  onChangeFrontText,
  frontImageUrl,
  onChangeFrontImageUrl,
  backText,
  onChangeBackText,
  backImageUrl,
  onChangeBackImageUrl,
  currency = 'ETB',
}) => {
  const [activeTab, setActiveTab] = useState<'front' | 'back'>('front');
  const [isUploadingFront, setIsUploadingFront] = useState(false);
  const [isUploadingBack, setIsUploadingBack] = useState(false);

  const isMultiSide = item.customizationSides === 'front_back';
  const isBackOptional = item.backCustomOptional ?? true;

  const backExtraPrice = currency === 'USD'
    ? (item.backCustomPriceUsd || 0)
    : (item.backCustomPrice || 0);

  const handleUpload = async (side: 'front' | 'back', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (side === 'front') {
      setIsUploadingFront(true);
      try {
        const url = await uploadToCloudinary(file);
        onChangeFrontImageUrl(url);
      } catch (err: any) {
        alert('Front photo upload failed: ' + (err?.message || 'Please try again.'));
      } finally {
        setIsUploadingFront(false);
      }
    } else {
      setIsUploadingBack(true);
      try {
        const url = await uploadToCloudinary(file);
        onChangeBackImageUrl(url);
      } catch (err: any) {
        alert('Back photo upload failed: ' + (err?.message || 'Please try again.'));
      } finally {
        setIsUploadingBack(false);
      }
    }
  };

  // --------------------------------------------------------------------------
  // CASE A: Standard Single-Side Customization
  // --------------------------------------------------------------------------
  if (!isMultiSide) {
    const inputType = item.customInputType || 'text';
    const label = item.customInputLabel || 'Required Customization Details';

    return (
      <div className="bg-[#FAF6EE] border border-[#D8C6A8] rounded-2xl p-4 sm:p-5 mb-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-1.5 text-[#8E6E2F] text-xs font-bold uppercase tracking-wider border-b border-[#D8C6A8]/40 pb-2">
          <Sparkles className="w-4 h-4 text-[#B8944A]" />
          <span>{label}</span>
        </div>

        {/* Photo Upload */}
        {(inputType === 'image' || inputType === 'both') && (
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#3A2A20] font-bold mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#B8944A]" />
                <span>Upload Custom Photo <span className="text-red-500">*</span></span>
              </span>
              <span className="text-[10px] text-[#756457] font-normal">PNG, JPG up to 10MB</span>
            </label>

            {frontImageUrl ? (
              <div className="flex items-center gap-3 bg-white border border-emerald-500/40 rounded-xl p-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden border border-emerald-400/40 bg-[#FAF6EE] flex-shrink-0">
                  <img src={frontImageUrl} alt="Uploaded preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-emerald-700 text-xs font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Photo Attached
                  </span>
                  <button
                    type="button"
                    onClick={() => onChangeFrontImageUrl('')}
                    className="text-red-600 hover:text-red-700 text-[11px] font-bold mt-0.5 flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" /> Remove & Change
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#D8C6A8] hover:border-[#B8944A] rounded-xl p-3.5 cursor-pointer bg-white/80 hover:bg-white transition-all text-center">
                {isUploadingFront ? (
                  <div className="flex items-center gap-2 text-[#8E6E2F] text-xs font-bold py-1.5">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading photo...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-[#B8944A] mb-1" />
                    <span className="text-xs font-bold text-[#241A15]">Click to Choose Photo</span>
                    <span className="text-[10px] text-[#756457] mt-0.5">High resolution recommended</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploadingFront}
                  onChange={(e) => handleUpload('front', e)}
                />
              </label>
            )}
          </div>
        )}

        {/* Text Input */}
        {(inputType === 'text' || inputType === 'both') && (
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#3A2A20] font-bold mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#B8944A]" />
              <span>Custom Text / Inscription <span className="text-red-500">*</span></span>
            </label>
            <textarea
              value={frontText}
              onChange={(e) => onChangeFrontText(e.target.value)}
              placeholder="Enter name, initials, memorable date, or custom quote..."
              className="w-full bg-white border border-[#D8C6A8] rounded-xl p-2.5 text-xs text-[#241A15] placeholder:text-[#756457]/50 focus:outline-none focus:border-[#B8944A] h-16 resize-none font-inter"
            />
          </div>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // CASE B: Multi-Side Customization (Front & Back)
  // --------------------------------------------------------------------------
  const frontType = item.frontCustomType || item.customInputType || 'both';
  const backType = item.backCustomType || 'both';
  const frontPrompt = item.frontCustomLabel || item.customInputLabel || 'Front Side Customization';
  const backPrompt = item.backCustomLabel || 'Back Side Customization';

  const isFrontComplete = (
    (frontType === 'text' ? !!frontText.trim() : true) &&
    (frontType === 'image' ? !!frontImageUrl : true) &&
    (frontType === 'both' ? (!!frontText.trim() && !!frontImageUrl) : true)
  );

  const isBackComplete = (
    (backType === 'text' ? !!backText.trim() : true) &&
    (backType === 'image' ? !!backImageUrl : true) &&
    (backType === 'both' ? (!!backText.trim() && !!backImageUrl) : true)
  );

  return (
    <div className="bg-[#FAF6EE] border border-[#D8C6A8] rounded-2xl p-4 sm:p-5 mb-5 space-y-4 shadow-sm">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#D8C6A8]/40 pb-2.5">
        <div className="flex items-center gap-1.5 text-[#8E6E2F] text-xs font-bold uppercase tracking-wider">
          <Layers className="w-4 h-4 text-[#B8944A]" />
          <span>Customization Placement (Front & Back)</span>
        </div>
        <span className="text-[10px] text-[#756457] font-medium bg-amber-400/15 px-2 py-0.5 rounded-full border border-amber-400/30">
          Two-Sided Item
        </span>
      </div>

      {/* Side Choice Toggle (If Back is Optional) */}
      {isBackOptional && (
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#3A2A20] font-bold mb-1.5">
            Select Sides to Customize:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                onChangeCustomSidesSelected('front_only');
                setActiveTab('front');
              }}
              className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                customSidesSelected === 'front_only'
                  ? 'bg-[#241A15] text-[#FBF8F2] border-[#241A15] shadow-md'
                  : 'bg-white/80 border-[#D8C6A8] text-[#241A15]/80 hover:bg-white'
              }`}
            >
              <span className="font-extrabold flex items-center gap-1">
                {customSidesSelected === 'front_only' && <Check className="w-3.5 h-3.5 text-[#E6D5B8]" />}
                Front Side Only
              </span>
              <span className="text-[10px] opacity-70 font-normal">Standard 1-sided print</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeCustomSidesSelected('front_and_back')}
              className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                customSidesSelected === 'front_and_back'
                  ? 'bg-[#241A15] text-[#FBF8F2] border-[#241A15] shadow-md'
                  : 'bg-white/80 border-[#D8C6A8] text-[#241A15]/80 hover:bg-white'
              }`}
            >
              <span className="font-extrabold flex items-center gap-1">
                {customSidesSelected === 'front_and_back' && <Check className="w-3.5 h-3.5 text-[#E6D5B8]" />}
                Front & Back Sides
              </span>
              <span className="text-[10px] text-amber-600 font-semibold">
                {backExtraPrice > 0 ? `+${formatPrice(backExtraPrice, currency)}` : 'Both sides included'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Side Switcher Tabs */}
      {customSidesSelected === 'front_and_back' && (
        <div className="flex border-b border-[#D8C6A8]/60 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setActiveTab('front')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border-b-2 -mb-[1px] ${
              activeTab === 'front'
                ? 'border-[#B8944A] text-[#8E6E2F]'
                : 'border-transparent text-[#756457] hover:text-[#241A15]'
            }`}
          >
            <span>1. Front Side</span>
            {isFrontComplete && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center font-bold">✓</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('back')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border-b-2 -mb-[1px] ${
              activeTab === 'back'
                ? 'border-[#B8944A] text-[#8E6E2F]'
                : 'border-transparent text-[#756457] hover:text-[#241A15]'
            }`}
          >
            <span>2. Back Side</span>
            {isBackComplete ? (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center font-bold">✓</span>
            ) : (
              <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-normal">Action Needed</span>
            )}
          </button>
        </div>
      )}

      {/* FRONT SIDE PANEL */}
      {(customSidesSelected === 'front_only' || activeTab === 'front') && (
        <div className="space-y-3.5 bg-white/70 rounded-xl p-3.5 border border-[#D8C6A8]/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8E6E2F] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              {frontPrompt}
            </span>
            <span className="text-[10px] text-[#756457]">
              {frontType === 'both' ? 'Photo & Text required' : frontType === 'image' ? 'Photo required' : 'Text required'}
            </span>
          </div>

          {/* Front Photo */}
          {(frontType === 'image' || frontType === 'both') && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#3A2A20] font-bold mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#B8944A]" />
                  <span>Front Photo / Logo <span className="text-red-500">*</span></span>
                </span>
                <span className="text-[10px] text-[#756457] font-normal">PNG, JPG up to 10MB</span>
              </label>

              {frontImageUrl ? (
                <div className="flex items-center gap-3 bg-white border border-emerald-500/40 rounded-xl p-2.5">
                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-emerald-400/40 bg-[#FAF6EE] flex-shrink-0">
                    <img src={frontImageUrl} alt="Front preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-emerald-700 text-xs font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Front Photo Ready
                    </span>
                    <button
                      type="button"
                      onClick={() => onChangeFrontImageUrl('')}
                      className="text-red-600 hover:text-red-700 text-[11px] font-bold mt-0.5 flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" /> Remove & Change
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#D8C6A8] hover:border-[#B8944A] rounded-xl p-3 cursor-pointer bg-white hover:bg-[#FAF6EE] transition-all text-center">
                  {isUploadingFront ? (
                    <div className="flex items-center gap-2 text-[#8E6E2F] text-xs font-bold py-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading front photo...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-[#B8944A] mb-1" />
                      <span className="text-xs font-bold text-[#241A15]">Click to Upload Front Photo</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploadingFront}
                    onChange={(e) => handleUpload('front', e)}
                  />
                </label>
              )}
            </div>
          )}

          {/* Front Text */}
          {(frontType === 'text' || frontType === 'both') && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#3A2A20] font-bold mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#B8944A]" />
                <span>Front Custom Text / Message <span className="text-red-500">*</span></span>
              </label>
              <textarea
                value={frontText}
                onChange={(e) => onChangeFrontText(e.target.value)}
                placeholder="Enter custom text for the front side..."
                className="w-full bg-white border border-[#D8C6A8] rounded-xl p-2.5 text-xs text-[#241A15] placeholder:text-[#756457]/50 focus:outline-none focus:border-[#B8944A] h-16 resize-none font-inter"
              />
            </div>
          )}

          {customSidesSelected === 'front_and_back' && (
            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('back')}
                className="text-xs text-[#8E6E2F] hover:text-[#241A15] font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Continue to Back Side</span> →
              </button>
            </div>
          )}
        </div>
      )}

      {/* BACK SIDE PANEL */}
      {customSidesSelected === 'front_and_back' && activeTab === 'back' && (
        <div className="space-y-3.5 bg-white/70 rounded-xl p-3.5 border border-[#D8C6A8]/50 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8E6E2F] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              {backPrompt}
            </span>
            <span className="text-[10px] text-[#756457]">
              {backType === 'both' ? 'Photo & Text required' : backType === 'image' ? 'Photo required' : 'Text required'}
            </span>
          </div>

          {/* Back Photo */}
          {(backType === 'image' || backType === 'both') && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#3A2A20] font-bold mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#B8944A]" />
                  <span>Back Photo / Graphic <span className="text-red-500">*</span></span>
                </span>
                <span className="text-[10px] text-[#756457] font-normal">PNG, JPG up to 10MB</span>
              </label>

              {backImageUrl ? (
                <div className="flex items-center gap-3 bg-white border border-emerald-500/40 rounded-xl p-2.5">
                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-emerald-400/40 bg-[#FAF6EE] flex-shrink-0">
                    <img src={backImageUrl} alt="Back preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-emerald-700 text-xs font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Back Photo Ready
                    </span>
                    <button
                      type="button"
                      onClick={() => onChangeBackImageUrl('')}
                      className="text-red-600 hover:text-red-700 text-[11px] font-bold mt-0.5 flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" /> Remove & Change
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#D8C6A8] hover:border-[#B8944A] rounded-xl p-3 cursor-pointer bg-white hover:bg-[#FAF6EE] transition-all text-center">
                  {isUploadingBack ? (
                    <div className="flex items-center gap-2 text-[#8E6E2F] text-xs font-bold py-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading back photo...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-[#B8944A] mb-1" />
                      <span className="text-xs font-bold text-[#241A15]">Click to Upload Back Photo</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploadingBack}
                    onChange={(e) => handleUpload('back', e)}
                  />
                </label>
              )}
            </div>
          )}

          {/* Back Text */}
          {(backType === 'text' || backType === 'both') && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#3A2A20] font-bold mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#B8944A]" />
                <span>Back Custom Text / Name / Number <span className="text-red-500">*</span></span>
              </label>
              <textarea
                value={backText}
                onChange={(e) => onChangeBackText(e.target.value)}
                placeholder="Enter custom text, player number, or quote for the back side..."
                className="w-full bg-white border border-[#D8C6A8] rounded-xl p-2.5 text-xs text-[#241A15] placeholder:text-[#756457]/50 focus:outline-none focus:border-[#B8944A] h-16 resize-none font-inter"
              />
            </div>
          )}

          <div className="pt-1 flex justify-start">
            <button
              type="button"
              onClick={() => setActiveTab('front')}
              className="text-xs text-[#8E6E2F] hover:text-[#241A15] font-bold flex items-center gap-1 cursor-pointer"
            >
              ← <span>Back to Front Side</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
