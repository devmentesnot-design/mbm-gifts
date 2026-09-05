import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  AlertCircle,
  Loader2,
  Upload,
  Check,
  Copy,
  Clock,
  FileText,
  HelpCircle,
  Building2,
  Phone,
  RefreshCw,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { Order, PaymentStatus } from '../types/cart';
import { formatPrice } from '../utils/currency';
import { PAYMENT_CONFIG, PaymentAccountOption } from '../config/paymentConfig';
import { uploadToCloudinary } from '../utils/cloudinary';
import { OfficialReceiptModal } from './OfficialReceiptModal';

interface CheckoutPaymentPageProps {
  order: Order;
  onPaymentSubmitted: (
    receiptUrl: string,
    paymentMethod: string,
    chapaTxRef?: string,
    paymentStatus?: PaymentStatus,
    senderName?: string,
    transactionId?: string
  ) => void;
  onBack: () => void;
  onNavigate?: (path: string) => void;
}

export const CheckoutPaymentPage: React.FC<CheckoutPaymentPageProps> = ({
  order,
  onPaymentSubmitted,
  onBack,
  onNavigate,
}) => {
  // Selected Manual Account
  const [selectedAccount, setSelectedAccount] = useState<PaymentAccountOption>(
    PAYMENT_CONFIG.accounts[0] || {
      id: 'telebirr',
      name: 'Telebirr',
      accountType: 'Mobile Money',
      accountNumber: '0912XXXXXX',
      accountName: 'DERARA BUSINESS',
    }
  );

  // Manual Payment Form States (Sender Name + Receipt Screenshot Upload only)
  const [senderName, setSenderName] = useState<string>(order.senderName || order.customer?.giftSenderName || '');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(order.paymentReceiptUrl || null);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [manualError, setManualError] = useState<string>('');
  const [copiedAccountId, setCopiedAccountId] = useState<string | null>(null);
  const [isReSubmitting, setIsReSubmitting] = useState(false);

  // Local Order State to reflect real-time updates (e.g. UNDER_REVIEW, PAID, REJECTED)
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [verifiedPaidOrder, setVerifiedPaidOrder] = useState<Order | null>(
    order.paymentStatus === 'PAID' ? order : null
  );

  const market = currentOrder.buyerMarket || 'ETHIOPIA';
  const currency = currentOrder.currency || (market === 'ETHIOPIA' ? 'ETB' : 'USD');

  // Sync prop changes into local state if order updates
  useEffect(() => {
    setCurrentOrder(order);
    if (order.paymentStatus === 'PAID') {
      setVerifiedPaidOrder(order);
    }
  }, [order]);

  // Copy Account Number helper
  const handleCopyAccount = (accountNumber: string, id: string) => {
    navigator.clipboard.writeText(accountNumber);
    setCopiedAccountId(id);
    setTimeout(() => setCopiedAccountId(null), 2500);
  };

  // Handle Receipt File Selection & Validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type: JPG, JPEG, PNG, WEBP, PDF
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setManualError('Unsupported file type. Please upload a JPG, PNG, WEBP image or PDF receipt.');
      return;
    }

    // Validate size: max 12MB
    if (file.size > 12 * 1024 * 1024) {
      setManualError('File size is too large. Please upload a receipt under 12MB.');
      return;
    }

    setManualError('');
    setReceiptFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview('PDF_DOCUMENT');
    }
  };

  // Submit Manual Payment Proof
  const handleSubmitManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError('');

    // 1. Validate Sender Name (REQUIRED)
    if (!senderName.trim()) {
      setManualError('Sender Name is required. Please enter the name shown on your payment account.');
      return;
    }

    // 2. Validate Receipt Upload (REQUIRED)
    if (!receiptFile && !receiptPreview) {
      setManualError('Please upload a screenshot or photo of your payment receipt.');
      return;
    }

    setIsSubmittingManual(true);

    try {
      let finalReceiptUrl = currentOrder.paymentReceiptUrl || '';

      // Upload file to Cloudinary if a new file was chosen
      if (receiptFile) {
        finalReceiptUrl = await uploadToCloudinary(receiptFile);
      }

      if (!finalReceiptUrl) {
        throw new Error('Failed to upload payment receipt. Please check your connection and try again.');
      }

      const paymentMethodName = `Manual Payment (${selectedAccount.name})`;
      const nowIso = new Date().toISOString();

      const updated: Order = {
        ...currentOrder,
        paymentReceiptUrl: finalReceiptUrl,
        paymentMethod: paymentMethodName,
        paymentStatus: 'UNDER_REVIEW',
        senderName: senderName.trim(),
        paymentSubmittedAt: nowIso,
        rejectionReason: undefined, // Clear past rejection if any
        status: 'Pending',
      };

      setCurrentOrder(updated);
      setIsReSubmitting(false);

      // Persist to DB / App state
      onPaymentSubmitted(
        finalReceiptUrl,
        paymentMethodName,
        undefined,
        'UNDER_REVIEW',
        senderName.trim()
      );
    } catch (err: any) {
      console.error('❌ Manual payment submission error:', err);
      setManualError(err.message || 'Error submitting payment verification. Please try again.');
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // If order is confirmed and paid, show the official receipt
  if (verifiedPaidOrder || currentOrder.paymentStatus === 'PAID') {
    return (
      <OfficialReceiptModal
        order={verifiedPaidOrder || currentOrder}
        onNavigate={onNavigate}
        isStandalonePage={true}
      />
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STATE VIEW: UNDER_REVIEW (Customer submitted receipt, waiting for admin check)
  // ─────────────────────────────────────────────────────────────────────────
  if (
    !isReSubmitting &&
    (currentOrder.paymentStatus === 'UNDER_REVIEW' ||
      currentOrder.paymentStatus === 'PAYMENT_SUBMITTED')
  ) {
    return (
      <div className="min-h-screen bg-transparent text-[#FFF8ED] font-inter flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 selection:bg-[#D9A514] selection:text-[#2B0005]">
        <div className="w-full max-w-2xl luxury-satin-card border border-amber-400/40 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-10 text-center space-y-6 animate-scale-in backdrop-blur-xl">
          
          {/* Pulsing Status Icon */}
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping opacity-60" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-[#8c1119] flex items-center justify-center shadow-xl shadow-amber-400/30">
              <Clock className="w-10 h-10" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
              <span>Status: Under Review</span>
            </div>
            <h2 className="font-podium text-2xl sm:text-3xl uppercase font-bold text-white tracking-wide">
              Payment Verification in Progress
            </h2>
            <p className="text-sm text-white/80 max-w-lg mx-auto leading-relaxed">
              Your payment information has been submitted successfully. Our team is currently verifying your payment.
            </p>
          </div>

          {/* Payment Summary Box */}
          <div className="bg-black/40 border border-amber-400/30 rounded-2xl p-5 text-left text-xs space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="text-white/60">Order Reference:</span>
              <span className="font-podium text-base text-amber-300 font-bold">{currentOrder.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Amount to Pay:</span>
              <span className="font-bold text-white text-sm">{formatPrice(currentOrder.total, currency)}</span>
            </div>
            {currentOrder.senderName && (
              <div className="flex justify-between items-center">
                <span className="text-white/60">Sender Name:</span>
                <span className="font-semibold text-amber-200">{currentOrder.senderName}</span>
              </div>
            )}
            {currentOrder.transactionId && (
              <div className="flex justify-between items-center">
                <span className="text-white/60">Transaction Reference:</span>
                <span className="font-mono text-white/90">{currentOrder.transactionId}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-white/60">Payment Method:</span>
              <span className="text-white/90">{currentOrder.paymentMethod || 'Manual Transfer'}</span>
            </div>
            {currentOrder.paymentReceiptUrl && (
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-white/60">Submitted Receipt:</span>
                <a
                  href={currentOrder.paymentReceiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-300 hover:text-amber-200 underline font-bold flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Uploaded Proof</span>
                </a>
              </div>
            )}
          </div>

          {/* Friendly Guidance */}
          <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-4 text-xs text-amber-200/90 leading-relaxed text-left flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-300 mb-0.5">Please wait while your payment is being confirmed.</div>
              Once verified by our finance team, your order will automatically be confirmed and dispatched for preparation. You can check the status anytime in your account.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => (onNavigate ? onNavigate('/my-orders') : (window.location.href = '/my-orders'))}
              className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-podium font-bold text-sm uppercase tracking-wider py-3.5 px-7 rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-400/20"
            >
              Go to My Orders
            </button>
            <button
              onClick={() => (onNavigate ? onNavigate('/') : (window.location.href = '/'))}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl transition-colors cursor-pointer border border-white/10"
            >
              Continue Shopping
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STATE VIEW: REJECTED (Admin rejected payment with reason, allow re-submit)
  // ─────────────────────────────────────────────────────────────────────────
  if (!isReSubmitting && currentOrder.paymentStatus === 'REJECTED') {
    return (
      <div className="min-h-screen bg-transparent text-[#FFF8ED] font-inter flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 selection:bg-[#D9A514] selection:text-[#2B0005]">
        <div className="w-full max-w-2xl luxury-satin-card border border-red-500/40 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-10 text-center space-y-6 animate-scale-in backdrop-blur-xl">
          
          <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto shadow-lg shadow-red-500/20">
            <XCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-red-500/20 text-red-300 border border-red-500/40 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span>Status: Verification Unsuccessful</span>
            </div>
            <h2 className="font-podium text-2xl sm:text-3xl uppercase font-bold text-white tracking-wide">
              Payment Could Not Be Verified
            </h2>
            <p className="text-sm text-white/80 max-w-md mx-auto">
              Our team was unable to confirm your payment with the details provided.
            </p>
          </div>

          {/* Rejection Reason Notice */}
          <div className="bg-red-950/50 border border-red-500/40 rounded-2xl p-5 text-left space-y-2 text-xs">
            <div className="text-red-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>Reason Provided by Verification Team</span>
            </div>
            <p className="text-red-200 text-sm font-medium bg-black/40 p-3 rounded-xl border border-red-500/20">
              "{currentOrder.rejectionReason || 'Transfer record could not be located with the provided sender name or receipt.'}"
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-white/60">Order ID:</span>
              <span className="font-bold text-white">{currentOrder.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Required Amount:</span>
              <span className="font-bold text-amber-300">{formatPrice(currentOrder.total, currency)}</span>
            </div>
          </div>

          {/* Action to Re-submit Proof */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setIsReSubmitting(true)}
              className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-podium font-bold text-sm uppercase tracking-wider py-3.5 px-8 rounded-xl transition-all cursor-pointer shadow-xl shadow-amber-400/20 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Re-submit Payment Proof</span>
            </button>
            <button
              onClick={onBack}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl transition-colors cursor-pointer border border-white/10"
            >
              Back
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN CHECKOUT VIEW
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-transparent text-[#FFF8ED] font-inter flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 selection:bg-[#D9A514] selection:text-[#2B0005]">
      <div className="w-full max-w-5xl luxury-satin-card border border-[#D9A514]/40 rounded-3xl shadow-2xl overflow-hidden animate-scale-in backdrop-blur-xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr]">
            
            {/* Left Column: Payment Method Selection & Checkout Flow */}
            <div className="p-6 sm:p-8 lg:p-10 space-y-6">
              
              {/* Top Header */}
              <div className="flex items-center justify-between pb-4 border-b border-amber-400/20">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-amber-300 text-[10px] font-bold uppercase tracking-widest bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded-full mb-1">
                    <ShieldCheck className="w-3 h-3 text-amber-300" />
                    <span>100% Secure Checkout</span>
                  </div>
                  <h2 className="font-podium text-2xl sm:text-3xl uppercase tracking-wide text-white">
                    Complete Your Payment
                  </h2>
                </div>
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white cursor-pointer"
                  title="Go back to cart"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              {/* ───────────────────────────────────────────────────────────── */}
              {/* MANUAL PAYMENT WITH RECEIPT / SCREENSHOT VERIFICATION         */}
              {/* ───────────────────────────────────────────────────────────── */}
              <div className="space-y-6">
                
                {/* Account Summary & Transfer Instructions */}
                <div className="bg-black/30 border border-amber-400/25 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div>
                        <span className="text-[10px] text-amber-300 uppercase tracking-widest font-bold block">
                          Send Payment To
                        </span>
                        <div className="text-base font-bold text-white">
                          {PAYMENT_CONFIG.businessName}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-white/50 uppercase tracking-widest block">
                          Amount to Pay
                        </span>
                        <div className="font-podium text-xl text-amber-300 font-bold">
                          {formatPrice(currentOrder.total, currency)}
                        </div>
                      </div>
                    </div>

                    {/* Account Cards Selection */}
                    <div className="space-y-2">
                      <div className="text-[11px] text-white/70 font-semibold">
                        Select a payment account to transfer:
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {PAYMENT_CONFIG.accounts.map((acc) => {
                          const isSelected = selectedAccount.id === acc.id;
                          const isCopied = copiedAccountId === acc.id;

                          return (
                            <div
                              key={acc.id}
                              onClick={() => setSelectedAccount(acc)}
                              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-amber-400/10 border-amber-400 text-white shadow-md'
                                  : 'bg-black/40 border-white/10 text-white/70 hover:border-white/20'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5 gap-2">
                                {acc.logo ? (
                                  <img
                                    src={acc.logo}
                                    alt={acc.name}
                                    className="h-6 w-auto max-w-[90px] object-contain rounded"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                                      const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                                      if (fallback) fallback.style.display = 'block';
                                    }}
                                  />
                                ) : null}
                                <span
                                  className="font-bold text-xs text-white truncate"
                                  style={{ display: acc.logo ? 'none' : 'block' }}
                                >
                                  {acc.name}
                                </span>
                                {acc.badge && (
                                  <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-bold whitespace-nowrap">
                                    {acc.badge}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between gap-2 mt-1 pt-1.5 border-t border-white/5">
                                <span className="font-mono text-xs text-amber-300 font-bold tracking-wide select-all">
                                  {acc.accountNumber}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyAccount(acc.accountNumber, acc.id);
                                  }}
                                  className="p-1 rounded bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                                  title="Copy account number"
                                >
                                  {isCopied ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <p className="text-[11px] text-white/60 leading-relaxed italic">
                      After completing the payment, provide your details below for verification.
                    </p>
                  </div>

                  {/* Verification Form */}
                  <form onSubmit={handleSubmitManualPayment} className="space-y-4">
                    
                    {/* Error Banner */}
                    {manualError && (
                      <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3.5 flex items-start gap-2.5 text-red-200 text-xs animate-shake">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                        <div>{manualError}</div>
                      </div>
                    )}

                    {/* 1. SENDER NAME (REQUIRED) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                          <span>Sender Name</span>
                          <span className="text-amber-400">*</span>
                        </label>
                        <span className="text-[10px] text-amber-300 font-semibold">REQUIRED FOR VERIFICATION</span>
                      </div>
                      <input
                        type="text"
                        required
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="Enter the name used to send the payment"
                        className="w-full bg-black/50 border border-amber-400/40 focus:border-amber-400 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none transition-all shadow-inner"
                      />
                      <p className="text-[11px] text-white/60">
                        {PAYMENT_CONFIG.instructions.senderNameHelper}
                      </p>
                    </div>

                    {/* 2. RECEIPT UPLOAD (REQUIRED) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                          <span>Payment Receipt / Screenshot</span>
                          <span className="text-amber-400">*</span>
                        </label>
                        <span className="text-[10px] text-white/50">JPG, PNG, WEBP, PDF (Max 12MB)</span>
                      </div>

                      <div className="relative border-2 border-dashed border-amber-400/30 hover:border-amber-400/60 rounded-2xl p-4 text-center transition-colors bg-black/30">
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />

                        {receiptPreview ? (
                          <div className="space-y-2">
                            {receiptPreview === 'PDF_DOCUMENT' ? (
                              <div className="flex items-center justify-center gap-2 text-amber-300 font-bold text-xs py-4">
                                <FileText className="w-8 h-8" />
                                <span>PDF Document Selected ({receiptFile?.name})</span>
                              </div>
                            ) : (
                              <div className="relative max-w-xs mx-auto rounded-lg overflow-hidden border border-amber-400/40">
                                <img
                                  src={receiptPreview}
                                  alt="Receipt Preview"
                                  className="w-full max-h-44 object-contain bg-black/60"
                                />
                              </div>
                            )}
                            <div className="text-[11px] text-emerald-400 font-semibold flex items-center justify-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>Receipt Attached • Click or Drop to Change</span>
                            </div>
                          </div>
                        ) : (
                          <div className="py-4 space-y-2">
                            <div className="w-10 h-10 mx-auto rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
                              <Upload className="w-5 h-5" />
                            </div>
                            <div className="text-xs font-bold text-white">
                              Click or Drag Receipt Screenshot Here
                            </div>
                            <p className="text-[11px] text-white/50">
                              {PAYMENT_CONFIG.instructions.receiptHelper}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmittingManual}
                      className="w-full bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-[#8c1119] font-podium font-bold text-base sm:text-lg uppercase tracking-wider py-4 px-6 rounded-2xl transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-amber-400/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer mt-4"
                    >
                      {isSubmittingManual ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin text-[#8c1119]" />
                          <span>Uploading & Submitting Payment...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-5 h-5" />
                          <span>Submit Payment for Verification</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

            </div>

            {/* Right Column: Order Summary & Review Breakdown */}
            <div className="bg-black/40 p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-amber-400/20 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="bg-black/30 border border-white/10 rounded-xl p-3.5 text-center">
                  <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold block mb-0.5">
                    Order Reference
                  </span>
                  <span className="font-podium text-2xl text-amber-300 font-bold tracking-wide">
                    {currentOrder.id}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold block mb-2">
                    Gift Items ({currentOrder.items.length})
                  </span>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {currentOrder.items.map((it, idx) => {
                      const isPkg = it.type === 'package';
                      const singleObj = ('item' in it && it.item) ? it.item : ('selectedItems' in it ? it.selectedItems?.[0] : null);
                      const title = isPkg ? (it.package?.name || 'Gift Package') : (singleObj?.name || 'Single Item');
                      
                      let unitPrice = 0;
                      if (it.unitCalculatedPrice != null) {
                        unitPrice = it.unitCalculatedPrice;
                      } else if (isPkg) {
                        unitPrice = currency === 'USD' ? (it.package?.price_usd || Math.round((it.package?.price / 120) * 100) / 100) : it.package?.price;
                      } else {
                        unitPrice = singleObj ? (currency === 'USD' ? (singleObj.price_usd || Math.round((singleObj.price / 120) * 100) / 100) : singleObj.price) : (it.totalPrice || 0);
                      }
                      const itemTotal = (unitPrice || 0) * it.quantity;

                      return (
                        <div
                          key={idx}
                          className="bg-black/30 border border-white/5 rounded-lg p-2.5 flex items-center justify-between text-xs"
                        >
                          <div className="truncate pr-2">
                            <div className="font-bold text-white truncate flex items-center gap-1.5 flex-wrap">
                              <span>{it.quantity}x {title}</span>
                              {it.customUnitValue != null && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-400/20 text-amber-300">
                                  ({it.customUnitValue} {it.customUnitName || 'kg'})
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-amber-300 font-bold flex-shrink-0">
                            {formatPrice(itemTotal > 0 ? itemTotal : currentOrder.total, currency)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-black/30 border border-white/10 rounded-xl p-3 text-xs space-y-1.5">
                  <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider mb-1">
                    Delivery Destination (Ethiopia)
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Recipient:</span>
                    <span className="font-semibold text-white">{currentOrder.customer.giftRecipientName || currentOrder.customer.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Contact:</span>
                    <span className="text-white/90">{currentOrder.customer.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Destination:</span>
                    <span className="text-white/90">{currentOrder.customer.address}{currentOrder.customer.city ? `, ${currentOrder.customer.city}` : ''}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal</span>
                  <span className="font-bold text-white">{formatPrice(currentOrder.subtotal || currentOrder.total, currency)}</span>
                </div>
                {currentOrder.giftBoxPrice != null && currentOrder.giftBoxPrice > 0 && (
                  <div className="flex justify-between text-white/70">
                    <span>Packaging ({currentOrder.giftBoxStyle})</span>
                    <span className="font-bold text-white">{formatPrice(currentOrder.giftBoxPrice, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white/70">
                  <span>Delivery in Ethiopia</span>
                  <span className="text-emerald-400 font-bold uppercase">Free</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-white/10">
                  <div>
                    <div className="font-podium text-sm uppercase text-white font-bold">Total Amount Due</div>
                    <div className="text-[10px] text-white/40">Includes all taxes & delivery</div>
                  </div>
                  <span className="font-podium text-2xl text-amber-300 font-bold">
                    {formatPrice(currentOrder.total, currency)}
                  </span>
                </div>
              </div>

            </div>

          </div>

      </div>
    </div>
  );
};
