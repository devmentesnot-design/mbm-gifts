import React, { useState } from 'react';
import {
  ArrowLeft,
  Package,
  Truck,
  Check,
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  ShoppingBag,
  Headset,
  ShieldCheck,
  CreditCard,
  FileText,
  AlertCircle,
  RefreshCw,
  Eye,
  User,
  Sparkles,
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '../types/cart';
import { formatPrice } from '../utils/currency';
import { OfficialReceiptModal } from './OfficialReceiptModal';

interface MyOrdersPageProps {
  orders: Order[];
  session: any;
  onNavigate: (path: string) => void;
  onSelectOrderForPayment?: (order: Order) => void;
}

export const MyOrdersPage: React.FC<MyOrdersPageProps> = ({
  orders,
  session,
  onNavigate,
  onSelectOrderForPayment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ord.senderName && ord.senderName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ord.chapaTxRef && ord.chapaTxRef.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ord.customer.phone.includes(searchTerm);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'under_review' && (ord.paymentStatus === 'UNDER_REVIEW' || ord.paymentStatus === 'PAYMENT_SUBMITTED' || (ord.paymentStatus === 'PENDING_PAYMENT' && ord.paymentReceiptUrl))) ||
      (statusFilter === 'paid' && ord.paymentStatus === 'PAID') ||
      (statusFilter === 'shipped' && ord.status === 'Shipped') ||
      (statusFilter === 'delivered' && ord.status === 'Delivered') ||
      (statusFilter === 'rejected' && ord.paymentStatus === 'REJECTED') ||
      ord.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Calculate current stage for order progress tracker (1 to 5)
  const getOrderProgressStage = (ord: Order): { stage: number; label: string; description: string } => {
    if (ord.paymentStatus === 'REJECTED') {
      return { stage: 1, label: 'Payment Rejected', description: 'Re-submit valid payment screenshot' };
    }
    if (ord.status === 'Delivered') {
      return { stage: 5, label: 'Delivered', description: 'Successfully handed over to recipient' };
    }
    if (ord.status === 'Shipped') {
      return { stage: 4, label: 'Out for Delivery', description: 'Driver is on the way in Ethiopia' };
    }
    if (ord.status === 'Processing' || ord.paymentStatus === 'PAID') {
      return { stage: 3, label: 'Paid & In Preparation', description: 'Assembling luxury gift box & items' };
    }
    if (ord.paymentStatus === 'UNDER_REVIEW' || ord.paymentStatus === 'PAYMENT_SUBMITTED' || ord.paymentReceiptUrl) {
      return { stage: 1, label: 'Payment Under Review', description: 'Verifying payment with finance team' };
    }
    return { stage: 1, label: 'Pending Payment', description: 'Awaiting payment verification' };
  };

  const getOrderStatusBadge = (ord: Order) => {
    if (ord.paymentStatus === 'REJECTED') {
      return (
        <span className="bg-red-500/20 text-red-300 border border-red-500/40 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
          Verification Unsuccessful
        </span>
      );
    }
    switch (ord.status) {
      case 'Delivered':
        return (
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            Delivered
          </span>
        );
      case 'Shipped':
        return (
          <span className="bg-indigo-500/25 text-indigo-200 border border-indigo-500/40 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <Truck className="w-3.5 h-3.5 text-indigo-300 animate-bounce" />
            Out for Delivery
          </span>
        );
      case 'Processing':
        return (
          <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <Package className="w-3.5 h-3.5 text-blue-300" />
            Paid • In Preparation
          </span>
        );
      case 'Cancelled':
        return (
          <span className="bg-red-500/20 text-red-300 border border-red-500/40 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        if (ord.paymentStatus === 'PAID') {
          return (
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Paid • Confirmed
            </span>
          );
        }
        return (
          <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            Pending Verification
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (status?: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>PAID & VERIFIED</span>
          </span>
        );
      case 'UNDER_REVIEW':
      case 'PAYMENT_SUBMITTED':
        return (
          <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>UNDER REVIEW</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="bg-red-500/20 text-red-300 border border-red-500/40 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-red-400" />
            <span>PAYMENT REJECTED</span>
          </span>
        );
      default:
        return (
          <span className="bg-amber-400/15 text-amber-200/80 border border-amber-400/30 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>PENDING PAYMENT</span>
          </span>
        );
    }
  };

  const getOrderCurrency = (ord: Order): 'ETB' | 'USD' => {
    if (ord.currency === 'USD' || ord.buyerMarket === 'INTERNATIONAL') return 'USD';
    return 'ETB';
  };

  const handleResubmitPayment = (order: Order) => {
    try {
      localStorage.setItem('mbm_pending_order', JSON.stringify(order));
    } catch {}
    if (onSelectOrderForPayment) {
      onSelectOrderForPayment(order);
    }
    onNavigate('/checkout/payment');
  };

  return (
    <div className="min-h-screen bg-transparent text-[#FFF8ED] font-inter selection:bg-[#D9A514] selection:text-[#2B0005]">
      {/* Top Header Navigation */}
      <div className="border-b border-[#D9A514]/20 bg-[#2B0005]/80 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors cursor-pointer text-xs sm:text-sm uppercase tracking-wider font-bold"
          >
            <ArrowLeft className="w-4 h-4 text-amber-300" />
            <span>Back to Shop</span>
          </button>

          <img
            src="/logo.png"
            alt="MBM Gifts"
            referrerPolicy="no-referrer"
            className="h-24 sm:h-28 w-auto object-contain drop-shadow-md"
          />

          {session && (
            <div className="flex items-center gap-2.5 bg-black/40 border border-amber-400/40 rounded-full pl-1.5 pr-3 py-1">
              {(() => {
                const avatarUrl =
                  session.user?.user_metadata?.avatar_url ||
                  session.user?.user_metadata?.picture ||
                  null;
                const fullName =
                  session.user?.user_metadata?.full_name ||
                  session.user?.user_metadata?.name ||
                  '';
                const firstName = fullName.trim()
                  ? fullName.trim().split(' ')[0]
                  : (session.user?.email?.split('@')[0] || 'User').charAt(0).toUpperCase() +
                    (session.user?.email?.split('@')[0] || 'user').slice(1);

                return avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={firstName}
                    className="w-7 h-7 rounded-full object-cover border-2 border-amber-400/50"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-[#8c1119] font-extrabold flex items-center justify-center text-xs shadow-inner">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                );
              })()}
              <span className="font-semibold tracking-wide text-amber-200 text-xs max-w-[100px] truncate">
                {(() => {
                  const fullName =
                    session.user?.user_metadata?.full_name ||
                    session.user?.user_metadata?.name ||
                    '';
                  if (fullName.trim()) {
                    return fullName.trim().split(' ')[0];
                  }
                  const email = session.user?.email || '';
                  const username = email.split('@')[0] || 'User';
                  return username.charAt(0).toUpperCase() + username.slice(1);
                })()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Page Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-amber-300 text-xs uppercase tracking-widest font-bold mb-1">
              <Package className="w-4 h-4" />
              <span>Customer Portal</span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ml-2">
                <Headset className="w-3 h-3 text-emerald-400" />
                24/7 Dispatch Active
              </span>
            </div>
            <h1 className="font-podium text-3xl sm:text-4xl text-white uppercase tracking-wider">
              My Orders
            </h1>
            <p className="text-white/60 text-xs sm:text-sm mt-1">
              Track delivery progress, review payment verification status, and print official receipts.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/')}
            className="self-start md:self-auto bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-bold px-5 py-2.5 rounded-full text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-400/20"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Order New Gift</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        {orders.length > 0 && (
          <div className="bg-[#2a0407] border border-white/10 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search order ID, sender name, ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/40 border border-white/15 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-[11px] text-white/40 uppercase tracking-wider mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
              </span>
              {[
                { id: 'all', label: `All (${orders.length})` },
                { id: 'under_review', label: `Under Review (${orders.filter(o => o.paymentStatus === 'UNDER_REVIEW' || o.paymentStatus === 'PAYMENT_SUBMITTED').length})` },
                { id: 'paid', label: `Verified & Paid (${orders.filter(o => o.paymentStatus === 'PAID').length})` },
                { id: 'shipped', label: `Out for Delivery (${orders.filter(o => o.status === 'Shipped').length})` },
                { id: 'delivered', label: `Delivered (${orders.filter(o => o.status === 'Delivered').length})` },
                { id: 'rejected', label: `Needs Action (${orders.filter(o => o.paymentStatus === 'REJECTED').length})` },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === st.id
                      ? 'bg-amber-400 text-[#8c1119] shadow-sm font-extrabold'
                      : 'bg-black/30 text-white/60 hover:text-white border border-white/10'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Orders Listing */}
        {orders.length === 0 ? (
          <div className="bg-[#2a0407] border border-white/10 rounded-3xl p-12 sm:p-16 text-center text-white/60 max-w-xl mx-auto my-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Truck className="w-10 h-10" />
            </div>
            <h2 className="font-podium text-2xl uppercase text-white mb-2 tracking-wider">
              No Orders Placed Yet
            </h2>
            <p className="text-sm text-white/60 max-w-md mx-auto mb-8 leading-relaxed">
              When you send gifts or create custom gift boxes with MBM Gifts, your live order status and payment verification will appear right here.
            </p>
            <button
              onClick={() => onNavigate('/')}
              className="bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-bold px-8 py-3.5 rounded-full text-xs uppercase tracking-widest transition-all cursor-pointer shadow-xl shadow-amber-400/20 inline-flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Gift Collection</span>
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-[#2a0407] border border-white/10 rounded-2xl p-10 text-center text-white/50">
            <p className="text-sm">No orders matching your search or filter criteria.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="mt-3 text-xs text-amber-300 underline uppercase tracking-wider font-bold cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((ord, idx) => {
              const isExpanded = expandedOrders[ord.id] ?? idx === 0;
              const ordCurr = getOrderCurrency(ord);
              const isPaid = ord.paymentStatus === 'PAID';
              const isUnderReview =
                ord.paymentStatus === 'UNDER_REVIEW' || ord.paymentStatus === 'PAYMENT_SUBMITTED';
              const isRejected = ord.paymentStatus === 'REJECTED';
              const progress = getOrderProgressStage(ord);

              return (
                <div
                  key={ord.id}
                  className="bg-[#2a0407] border border-white/10 hover:border-amber-400/30 transition-all rounded-2xl overflow-hidden shadow-xl"
                >
                  {/* Order Top Summary Header */}
                  <div className="p-4 md:p-5 bg-[#350509] border-b border-white/10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <div className="font-podium text-2xl text-white uppercase tracking-wider font-bold">
                          {ord.id}
                        </div>

                        {/* Market Badge */}
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/40 border border-white/20 text-white flex items-center gap-1">
                          <span>{ord.buyerMarket === 'INTERNATIONAL' ? '🌍 Diaspora (USD)' : '🇪🇹 Local (ETB)'}</span>
                        </span>

                        {/* Payment Status Badge */}
                        {getPaymentStatusBadge(ord.paymentStatus)}
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-4 text-xs text-white/70">
                        <div>
                          <span className="text-white/40 uppercase tracking-wider text-[10px] block">Placed On</span>
                          <span className="font-semibold text-white">{ord.createdAt}</span>
                        </div>
                        <div>
                          <span className="text-white/40 uppercase tracking-wider text-[10px] block">Total Amount</span>
                          <span className="font-podium text-xl text-amber-300 font-bold">
                            {formatPrice(ord.total, ordCurr)}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleExpand(ord.id)}
                          className="p-1.5 bg-black/30 hover:bg-black/50 rounded-lg border border-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                          title="Toggle Order Details"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Status Badge & Progress Stage Line */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-2">
                      <div className="inline-flex">{getOrderStatusBadge(ord)}</div>

                      <div className="flex flex-wrap items-center gap-2">
                        {ord.senderName && (
                          <div className="flex items-center gap-1.5 text-[11px] bg-black/40 border border-amber-400/20 px-2.5 py-1 rounded-lg text-amber-200">
                            <User className="w-3 h-3 text-amber-300" />
                            <span>Sender: <strong>{ord.senderName}</strong></span>
                          </div>
                        )}

                        {ord.transactionId && (
                          <div className="flex items-center gap-1.5 text-[11px] bg-black/40 border border-white/10 px-2.5 py-1 rounded-lg">
                            <span className="text-white/50">Ref:</span>
                            <span className="font-mono text-amber-300 font-bold">{ord.transactionId}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Visual 5-Stage Step Progress Tracker */}
                    {!isRejected && (
                      <div className="pt-4 pb-2 border-t border-white/10">
                        <div className="relative">
                          {/* Background Connector Bar */}
                          <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-black/50 rounded-full z-0" />
                          
                          {/* Active Progress Fill */}
                          <div 
                            className="absolute top-1/2 left-4 -translate-y-1/2 h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-500 rounded-full transition-all duration-500 z-0"
                            style={{
                              width: progress.stage === 1 ? '10%' : progress.stage === 2 ? '30%' : progress.stage === 3 ? '55%' : progress.stage === 4 ? '80%' : '94%'
                            }}
                          />

                          {/* Milestones */}
                          <div className="relative z-10 grid grid-cols-5 text-center">
                            {/* Step 1: Proof Uploaded */}
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                                ord.paymentReceiptUrl || isPaid || progress.stage >= 1
                                  ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                                  : 'bg-black/60 text-white/50 border border-white/20'
                              }`}>
                                <Check className="w-4 h-4" />
                              </div>
                              <span className="text-[10px] font-bold text-white/90 mt-1.5 uppercase tracking-wider hidden sm:block">
                                1. Proof Uploaded
                              </span>
                            </div>

                            {/* Step 2: Payment Verified */}
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                                isPaid || progress.stage >= 2
                                  ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                                  : isUnderReview
                                  ? 'bg-amber-400 text-[#8c1119] ring-4 ring-amber-400/30 animate-pulse'
                                  : 'bg-black/60 text-white/50 border border-white/20'
                              }`}>
                                {isPaid ? <ShieldCheck className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                              </div>
                              <span className={`text-[10px] font-bold mt-1.5 uppercase tracking-wider hidden sm:block ${
                                isPaid ? 'text-emerald-300 font-extrabold' : isUnderReview ? 'text-amber-300 animate-pulse' : 'text-white/60'
                              }`}>
                                {isPaid ? '2. Verified (Paid)' : '2. Verifying'}
                              </span>
                            </div>

                            {/* Step 3: Preparing Gift Box */}
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                                ord.status === 'Processing'
                                  ? 'bg-blue-500 text-white ring-4 ring-blue-500/30 animate-pulse'
                                  : ord.status === 'Shipped' || ord.status === 'Delivered'
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-black/60 text-white/50 border border-white/20'
                              }`}>
                                <Package className="w-4 h-4" />
                              </div>
                              <span className={`text-[10px] font-bold mt-1.5 uppercase tracking-wider hidden sm:block ${
                                ord.status === 'Processing' ? 'text-blue-300 font-extrabold' : ord.status === 'Shipped' || ord.status === 'Delivered' ? 'text-emerald-300' : 'text-white/60'
                              }`}>
                                3. Packing Box
                              </span>
                            </div>

                            {/* Step 4: Out for Delivery */}
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                                ord.status === 'Shipped'
                                  ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/30 animate-bounce'
                                  : ord.status === 'Delivered'
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-black/60 text-white/50 border border-white/20'
                              }`}>
                                <Truck className="w-4 h-4" />
                              </div>
                              <span className={`text-[10px] font-bold mt-1.5 uppercase tracking-wider hidden sm:block ${
                                ord.status === 'Shipped' ? 'text-indigo-300 font-extrabold' : ord.status === 'Delivered' ? 'text-emerald-300' : 'text-white/60'
                              }`}>
                                4. Out for Delivery
                              </span>
                            </div>

                            {/* Step 5: Delivered */}
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                                ord.status === 'Delivered'
                                  ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30'
                                  : 'bg-black/60 text-white/50 border border-white/20'
                              }`}>
                                <Sparkles className="w-4 h-4" />
                              </div>
                              <span className={`text-[10px] font-bold mt-1.5 uppercase tracking-wider hidden sm:block ${
                                ord.status === 'Delivered' ? 'text-emerald-300 font-extrabold' : 'text-white/60'
                              }`}>
                                5. Delivered
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="sm:hidden text-center mt-2 text-xs font-bold text-amber-300">
                          Current Stage: {progress.label}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expandable Order Body */}
                  {isExpanded && (
                    <div className="p-5 md:p-6 space-y-6">
                      
                      {/* Special Banner for UNDER_REVIEW */}
                      {isUnderReview && (
                        <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-200">
                          <Clock className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5 animate-pulse" />
                          <div>
                            <strong className="text-amber-300 block mb-0.5">Payment Verification in Progress</strong>
                            Your payment proof has been submitted. Our team is verifying your payment with our accounts. Your order will be confirmed upon verification.
                          </div>
                        </div>
                      )}

                      {/* Special Banner for REJECTED */}
                      {isRejected && (
                        <div className="bg-red-500/15 border border-red-500/40 rounded-xl p-4 space-y-3 text-xs">
                          <div className="flex items-start gap-3 text-red-200">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <strong className="text-red-300 block mb-0.5">Payment Verification Unsuccessful</strong>
                              {ord.rejectionReason ? (
                                <p className="bg-black/30 p-2.5 rounded-lg border border-red-500/20 text-red-100 mt-1">
                                  Reason: "{ord.rejectionReason}"
                                </p>
                              ) : (
                                <p>We could not locate this payment record with the details provided.</p>
                              )}
                            </div>
                          </div>

                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => handleResubmitPayment(ord)}
                              className="bg-amber-400 hover:bg-amber-300 text-[#8c1119] font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Re-submit Payment Proof</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Customer & Recipient Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/30 border border-white/10 rounded-xl p-4 text-xs">
                        <div>
                          <span className="text-amber-300 uppercase font-bold text-[10px] tracking-wider block mb-1">
                            Customer / Recipient
                          </span>
                          <div className="text-white font-semibold">{ord.customer.fullName}</div>
                          <div className="text-white/60">{ord.customer.phone}</div>
                          <div className="text-white/40 text-[11px]">{ord.customer.email}</div>
                          {ord.customer.giftRecipientName && (
                            <div className="text-amber-200/80 mt-1 italic">
                              Gift for: {ord.customer.giftRecipientName}
                            </div>
                          )}
                        </div>

                        <div>
                          <span className="text-amber-300 uppercase font-bold text-[10px] tracking-wider block mb-1">
                            Delivery Destination (Ethiopia)
                          </span>
                          <div className="text-white font-semibold">{ord.customer.address}</div>
                          <div className="text-white/60">{ord.customer.city}</div>
                          {ord.customer.giftMessage && (
                            <div className="text-amber-200/90 mt-2 text-[11px] bg-amber-400/10 border border-amber-400/20 rounded-lg p-2.5">
                              "{ord.customer.giftMessage}"
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Items in this Order */}
                      <div>
                        <span className="text-white/50 uppercase font-bold text-[10px] tracking-widest block mb-3">
                          Items Included ({ord.items.length})
                        </span>
                        <div className="space-y-3">
                          {ord.items.map((item) => {
                            const isPkg = item.type === 'package';
                            const singleObj =
                              'item' in item && item.item
                                ? item.item
                                : 'selectedItems' in item
                                ? item.selectedItems?.[0]
                                : null;
                            const title = isPkg
                              ? item.package?.name || 'Gift Package'
                              : singleObj?.name || 'Single Item';
                            const img = isPkg
                              ? item.package?.image || ''
                              : singleObj?.image || ('boxStyle' in item ? item.boxStyle?.image : '');
                            const subtitle = isPkg
                              ? `${item.package?.category || 'Ready-made'} • Package`
                              : singleObj?.category
                              ? `${singleObj.category} • Single Item`
                              : 'Single Item';

                            let unitPrice = 0;
                            if (ordCurr === 'USD') {
                              if (isPkg) {
                                unitPrice =
                                  item.package.price_usd != null && item.package.price_usd > 0
                                    ? item.package.price_usd
                                    : Math.round((item.package.price / 120) * 100) / 100;
                              } else {
                                if (singleObj) {
                                  unitPrice =
                                    singleObj.price_usd != null && singleObj.price_usd > 0
                                    ? singleObj.price_usd
                                    : Math.round((singleObj.price / 120) * 100) / 100;
                                } else {
                                  unitPrice = item.totalPrice || 0;
                                }
                              }
                            } else {
                              unitPrice = isPkg
                                ? item.package.price
                                : singleObj
                                ? singleObj.price
                                : item.totalPrice || 0;
                            }

                            return (
                              <div
                                key={item.id}
                                className="bg-black/20 border border-white/5 rounded-xl p-3 flex items-center gap-3"
                              >
                                {img ? (
                                  <img
                                    src={img}
                                    alt={title}
                                    className="w-12 h-12 rounded-lg object-cover bg-black/40 border border-white/10 flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0 text-white/30">
                                    🎁
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-podium text-sm uppercase text-white truncate font-bold">
                                    {title}
                                  </div>
                                  <div className="text-[11px] text-white/50 truncate">
                                    {subtitle}
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="text-xs text-white/50">Qty: {item.quantity}</div>
                                  <div className="text-xs font-bold text-amber-300">
                                    {formatPrice(unitPrice * item.quantity, ordCurr)}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Summary Breakdown */}
                      <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-amber-300" />
                            <span className="text-white/70">Payment:</span>
                            <span className="font-semibold text-white">
                              {ord.paymentMethod || 'Manual Transfer'}
                            </span>
                          </div>

                          {ord.paymentReceiptUrl && (
                            <a
                              href={ord.paymentReceiptUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-300" />
                              <span>View Receipt</span>
                            </a>
                          )}

                          {isPaid && (
                            <button
                              onClick={() => setSelectedReceiptOrder(ord)}
                              className="bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>View Official Invoice</span>
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-white/60">Final Total:</span>
                          <span className="font-podium text-xl font-bold text-amber-300">
                            {formatPrice(ord.total, ordCurr)}
                          </span>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Official Receipt Modal View */}
      {selectedReceiptOrder && (
        <OfficialReceiptModal
          order={selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
        />
      )}

    </div>
  );
};
