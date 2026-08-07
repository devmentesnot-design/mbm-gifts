import React, { useState } from 'react';
import { ArrowLeft, Upload, Check, X, CreditCard, Building2 } from 'lucide-react';
import { Order } from '../types/cart';
import { formatCurrency } from '../utils/currency';
import { uploadToCloudinary } from '../utils/cloudinary';

interface CheckoutPaymentPageProps {
  order: Order;
  onPaymentSubmitted: (receiptUrl: string, paymentMethod: string) => void;
  onBack: () => void;
}

export const CheckoutPaymentPage: React.FC<CheckoutPaymentPageProps> = ({
  order,
  onPaymentSubmitted,
  onBack,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('cbe');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const paymentMethods = [
    { 
      id: 'cbe', 
      name: 'Commercial Bank of Ethiopia', 
      shortName: 'CBE',
      logo: '/cbe-logo.jpg', 
      type: 'BANK',
      shortcode: '1000012345'
    },
    { 
      id: 'telebirr', 
      name: 'Telebirr', 
      shortName: 'Telebirr',
      logo: '/telebirr-logo.jpg', 
      type: 'MOBILE',
      shortcode: '9876543210'
    },
    { 
      id: 'mpesa', 
      name: 'M-Pesa', 
      shortName: 'M-Pesa',
      logo: '/m-pesa.png', 
      type: 'MOBILE',
      shortcode: '1122334455'
    },
    { 
      id: 'abyssinia', 
      name: 'Bank of Abyssinia', 
      shortName: 'Abyssinia',
      logo: '/abissinya.png', 
      type: 'BANK',
      shortcode: '5544332211'
    },
    { 
      id: 'cbebirr', 
      name: 'CBE Birr', 
      shortName: 'CBE Birr',
      logo: '/cbe-birr.png', 
      type: 'MOBILE',
      shortcode: '7788990011'
    },
  ];

  const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB');
        return;
      }
      setUploadedFile(file);
      setError('');
    }
  };

  const handleSubmit = async () => {
    setError('');

    if (!uploadedFile) {
      setError('Please upload a payment receipt screenshot');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload receipt to Cloudinary
      console.log('📤 Uploading payment receipt to Cloudinary...');
      const receiptUrl = await uploadToCloudinary(uploadedFile);
      console.log('✅ Receipt uploaded:', receiptUrl);

      const selectedMethodName = paymentMethods.find(m => m.id === selectedMethod)?.name || selectedMethod;
      
      // Pass receipt URL and payment method back to parent
      onPaymentSubmitted(receiptUrl, selectedMethodName);
    } catch (err) {
      console.error('❌ Failed to upload receipt:', err);
      setError('Failed to upload receipt. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2a0407] via-[#3d0a0e] to-[#2a0407] text-white font-inter flex items-center justify-center p-4">
      {/* Payment Modal */}
      <div className="w-full max-w-5xl bg-gradient-to-br from-[#4a1015] to-[#3d0a0e] border border-amber-400/20 rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px]">
          {/* Left Section: Payment Form */}
          <div className="p-6 sm:p-8 lg:p-10 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-amber-400/20">
              <div className="flex items-center gap-3">
                <h2 className="font-podium text-2xl sm:text-3xl uppercase tracking-wide text-amber-300">Select Payment Method</h2>
              </div>
              <button
                onClick={onBack}
                className="p-2 hover:bg-white/10 rounded-lg transition-corners"
                title="Go back"
              >
                <X className="w-5 h-5 text-white/60 hover:text-white" />
              </button>
            </div>

            {/* Payment Methods Grid */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-amber-400 text-[#8c1119] flex items-center justify-center font-bold text-sm shadow-md">
                  1
                </div>
                <label className="text-xs uppercase tracking-widest text-amber-300 font-bold">
                  Choose Your Payment Method
                </label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {paymentMethods.map((method) => {
                  const isSelected = selectedMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`relative border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer min-h-[120px] ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400/15 ring-2 ring-amber-400/40 shadow-lg shadow-amber-400/10'
                          : 'border-white/15 bg-black/20 hover:border-amber-400/40 hover:bg-black/30'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
                          <Check className="w-3.5 h-3.5 text-[#8c1119] stroke-[3]" />
                        </div>
                      )}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex items-center justify-center p-2">
                        <img src={method.logo} alt={method.name} className="w-full h-full object-contain" />
                      </div>
                      <div className={`text-xs font-bold text-center ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                        {method.shortName}
                      </div>
                      <div className="text-[9px] text-white/40 uppercase tracking-wider">
                        {method.type}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bank Transfer Details */}
            {selectedMethodData && (
              <div className="bg-black/30 border border-amber-400/30 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-amber-400/20">
                  <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center p-2 shadow-md">
                    <img src={selectedMethodData.logo} alt={selectedMethodData.name} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">Transfer to the following shortcode:</div>
                    <div className="text-amber-300/80 text-xs">Complete your payment via {selectedMethodData.name}</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-400 to-amber-500 border border-amber-300 rounded-lg p-5 text-center shadow-lg">
                  <div className="text-[10px] text-[#8c1119]/70 uppercase tracking-widest mb-1.5 font-bold">Transfer Shortcode</div>
                  <div className="font-mono text-3xl sm:text-4xl font-bold text-[#8c1119] tracking-wider mb-2 drop-shadow-sm">{selectedMethodData.shortcode}</div>
                  <div className="inline-flex items-center gap-1.5 bg-[#8c1119] text-amber-300 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                    <Building2 className="w-3 h-3" />
                    {selectedMethodData.shortName}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Upload Receipt */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-amber-400 text-[#8c1119] flex items-center justify-center font-bold text-sm shadow-md">
                  2
                </div>
                <label className="text-xs uppercase tracking-widest text-amber-300 font-bold">
                  Upload Transfer Receipt
                </label>
              </div>

              {/* File Upload Area */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="receipt-upload"
                />
                {uploadedFile && uploadedFile.type.startsWith('image/') ? (
                  <div className="relative border-2 border-emerald-500/40 rounded-xl overflow-hidden bg-black/30">
                    <img 
                      src={URL.createObjectURL(uploadedFile)} 
                      alt="Receipt preview" 
                      className="w-full h-64 object-contain bg-black/50"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <div className="bg-emerald-500/90 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Uploaded
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setUploadedFile(null);
                        }}
                        className="bg-red-500/90 hover:bg-red-600 text-white p-1.5 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-3 bg-black/60 text-xs text-white/80">
                      <div className="font-semibold truncate">{uploadedFile.name}</div>
                      <div className="text-white/50">{(uploadedFile.size / 1024).toFixed(1)} KB</div>
                    </div>
                  </div>
                ) : uploadedFile ? (
                  <div className="border-2 border-emerald-500/40 rounded-xl p-6 bg-black/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                          <Check className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                          <div className="text-sm text-emerald-300 font-semibold">{uploadedFile.name}</div>
                          <div className="text-xs text-white/50">{(uploadedFile.size / 1024).toFixed(1)} KB</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setUploadedFile(null);
                        }}
                        className="text-xs text-red-400 hover:text-red-300 underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="receipt-upload"
                    className="block border-2 border-dashed border-amber-400/30 hover:border-amber-400/60 rounded-xl p-8 text-center cursor-pointer transition-all bg-black/20 hover:bg-black/30"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-12 h-12 text-amber-300/60" />
                      <div className="text-sm text-white/80 font-semibold">Click to browse or drag receipt here</div>
                      <div className="text-xs text-white/50">
                        SUPPORTS JPG, PNG, PDF (MAX 5MB)
                      </div>
                    </div>
                  </label>
                )}
              </div>

              {error && (
                <div className="mt-3 bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-xs font-semibold flex items-center gap-2">
                  <span>⚠️ {error}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full font-bold py-4 text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-white/10 text-white/40 cursor-not-allowed'
                  : 'bg-amber-400 hover:bg-amber-300 text-[#8c1119] cursor-pointer shadow-amber-400/30'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#8c1119]/30 border-t-[#8c1119] rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Confirm & Submit Order</span>
                </>
              )}
            </button>
          </div>

          {/* Right Section: Order Summary */}
          <div className="bg-gradient-to-br from-[#3d0a0e] to-[#2a0407] border-l border-amber-400/20 p-6 sm:p-8 space-y-6">
            <div className="bg-[#8c1119]/20 border border-amber-400/40 rounded-xl px-4 py-3 shadow-md">
              <div className="text-[10px] uppercase tracking-widest text-amber-300/70 font-bold mb-1">Order Summary</div>
              <div className="font-podium text-2xl text-amber-300 uppercase tracking-wide">
                {order.id}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-white/70">
                <span>Base Price</span>
                <span className="font-bold text-white">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Quantity</span>
                <span className="font-bold text-white">x {order.items.length}</span>
              </div>
              <div className="border-t border-amber-400/20 pt-3 flex justify-between items-end">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-amber-300/70 mb-1">Total Price</div>
                  <div className="font-podium text-3xl text-amber-300 font-bold">
                    {formatCurrency(order.total)}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-black/30 border border-amber-400/20 rounded-xl p-4 space-y-2 text-xs">
              <div className="text-[10px] uppercase tracking-widest text-amber-300/70 font-bold mb-2">Delivery Details</div>
              <div className="flex justify-between">
                <span className="text-white/60">Phone:</span>
                <span className="text-white font-semibold">{order.customer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Address:</span>
                <span className="text-white font-semibold text-right">{order.customer.address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
