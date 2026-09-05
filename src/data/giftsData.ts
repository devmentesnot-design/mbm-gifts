import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface GiftCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  type?: 'package' | 'custom_item' | 'both';
  subcategories?: string[]; // Optional list of subcategory names (e.g. ['Muslim', 'Christian'])
}

export interface GiftBoxStyle {
  id: string;
  name: string;
  dimensions: string;
  price: number;      // ETB price (for LOCAL buyers)
  price_usd?: number; // USD price (for INTERNATIONAL buyers)
  color: string;
  image: string;
  description: string;
}

export const DEFAULT_CATEGORIES: GiftCategory[] = [];

export const DEFAULT_GIFT_BOXES: GiftBoxStyle[] = [];

export interface PackageItemDetail {
  name: string;
  image: string;
  description: string;
}

export interface PreparedPackage {
  id: string;
  name: string;
  category: 'Birthday' | 'Luxury' | 'Romance' | 'Corporate' | 'Anniversary' | string;
  price: number;      // ETB price (for LOCAL buyers)
  price_usd?: number; // USD price (for INTERNATIONAL buyers) — set independently by admin
  rating: number;
  reviewsCount: number;
  badge?: string;
  shortDesc: string;
  image: string;
  itemsIncluded: string[];
  itemsIncludedDetailed?: PackageItemDetail[];
  popularFor: string;
  // Customer input requirement fields
  requiresCustomInput?: boolean;            // If true, customer must provide input when ordering
  customInputType?: 'text' | 'image' | 'both'; // What kind of input is needed
  customInputLabel?: string;                // Prompt shown to customer (e.g. "Enter name to print")
  // Scalable unit / measurement fields (e.g. Cake by KG, Flowers by Stems, Chocolates by Pcs)
  hasCustomUnit?: boolean;
  customUnitName?: string;                  // e.g. 'kg', 'stems', 'pieces', 'servings', 'g'
  customUnitMin?: number;                   // Minimum value (e.g. 2 for cake)
  customUnitStep?: number;                  // Step increment (e.g. 1 or 0.5)
  customUnitMax?: number;                   // Maximum value (e.g. 10 or 50)
  customUnitPricePerUnit?: number;          // Explicit price per unit in ETB (optional)
  customUnitPricePerUnitUsd?: number;       // Explicit price per unit in USD (optional)
}

export interface CustomBoxOption {
  id: string;
  name: string;
  category: 'box' | 'chocolate' | 'candle' | 'drink' | 'accessory' | 'personal' | string;
  price: number;      // ETB price (for LOCAL buyers)
  price_usd?: number; // USD price (for INTERNATIONAL buyers) — set independently by admin
  image: string;
  description: string;
  // Customer input requirement fields
  requiresCustomInput?: boolean;
  customInputType?: 'text' | 'image' | 'both';
  customInputLabel?: string;
  // Scalable unit / measurement fields (e.g. Cake by KG, Flowers by Stems, Chocolates by Pcs)
  hasCustomUnit?: boolean;
  customUnitName?: string;
  customUnitMin?: number;
  customUnitStep?: number;
  customUnitMax?: number;
  customUnitPricePerUnit?: number;
  customUnitPricePerUnitUsd?: number;
}

// Fallback initial data in case DB is empty or fails
export const PREPARED_PACKAGES: PreparedPackage[] = [];

export const CUSTOM_ITEMS: CustomBoxOption[] = [];

// NO LONGER USING LOCALSTORAGE - All data in Supabase only

export const getStoredPackages = async (): Promise<PreparedPackage[]> => {
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase not configured, using defaults');
    return PREPARED_PACKAGES;
  }

  try {
    const { data, error } = await supabase.from('prepared_packages').select('*');
    
    if (error) {
      console.error('❌ Error fetching packages:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('📦 No packages in database');
      return [];
    }

    const mapped = data.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      price_usd: item.price_usd ?? (item.price ? Math.round((item.price / 120) * 100) / 100 : undefined),
      rating: item.rating || 5.0,
      reviewsCount: item.reviews_count || 100,
      badge: item.badge,
      shortDesc: item.description || '',
      image: item.image,
      itemsIncluded: item.items_included || [],
      itemsIncludedDetailed: item.items_included_detailed || [],
      popularFor: item.popular_for || 'Gifting',
      requiresCustomInput: item.requires_custom_input || false,
      customInputType: item.custom_input_type || 'text',
      customInputLabel: item.custom_input_label || '',
      hasCustomUnit: item.has_custom_unit || false,
      customUnitName: item.custom_unit_name || 'kg',
      customUnitMin: item.custom_unit_min != null ? Number(item.custom_unit_min) : 1,
      customUnitStep: item.custom_unit_step != null ? Number(item.custom_unit_step) : 1,
      customUnitMax: item.custom_unit_max != null ? Number(item.custom_unit_max) : 50,
      customUnitPricePerUnit: item.custom_unit_price_per_unit != null ? Number(item.custom_unit_price_per_unit) : undefined,
      customUnitPricePerUnitUsd: item.custom_unit_price_per_unit_usd != null ? Number(item.custom_unit_price_per_unit_usd) : undefined
    }));
    
    console.log('✅ Loaded', mapped.length, 'packages from Supabase');
    return mapped;
  } catch (err) {
    console.error('❌ Error loading packages:', err);
    return PREPARED_PACKAGES;
  }
};

export const saveStoredPackages = async (packages: PreparedPackage[]) => {
  console.log('💾 Saving', packages.length, 'packages to Supabase...');
  
  if (!isSupabaseConfigured) {
    console.error('❌ Supabase not configured!');
    return;
  }

  try {
    const formatted = packages.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      price_usd: p.price_usd ?? null,
      rating: p.rating,
      reviews_count: p.reviewsCount,
      badge: p.badge || null,
      description: p.shortDesc,
      image: p.image,
      items_included: p.itemsIncluded,
      items_included_detailed: p.itemsIncludedDetailed,
      popular_for: p.popularFor,
      requires_custom_input: p.requiresCustomInput || false,
      custom_input_type: p.customInputType || 'text',
      custom_input_label: p.customInputLabel || '',
      has_custom_unit: p.hasCustomUnit || false,
      custom_unit_name: p.customUnitName || 'kg',
      custom_unit_min: p.customUnitMin ?? 1,
      custom_unit_step: p.customUnitStep ?? 1,
      custom_unit_max: p.customUnitMax ?? 50,
      custom_unit_price_per_unit: p.customUnitPricePerUnit ?? null,
      custom_unit_price_per_unit_usd: p.customUnitPricePerUnitUsd ?? null
    }));
    
    const { error } = await supabase.from('prepared_packages').upsert(formatted, { onConflict: 'id' });
    
    if (error) {
      console.error('❌ Supabase save error:', error);
      throw error;
    }
    
    console.log('✅ Saved', packages.length, 'packages to Supabase successfully');
  } catch (err) {
    console.error('❌ Failed to save to Supabase:', err);
    throw err;
  }
};

export const saveSinglePackage = async (p: PreparedPackage) => {
  console.log('💾 Saving single package to Supabase:', p.id);
  if (!isSupabaseConfigured) return;
  try {
    const formatted = {
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      price_usd: p.price_usd ?? null,
      rating: p.rating,
      reviews_count: p.reviewsCount,
      badge: p.badge || null,
      description: p.shortDesc,
      image: p.image,
      items_included: p.itemsIncluded,
      items_included_detailed: p.itemsIncludedDetailed,
      popular_for: p.popularFor,
      requires_custom_input: p.requiresCustomInput || false,
      custom_input_type: p.customInputType || 'text',
      custom_input_label: p.customInputLabel || '',
      has_custom_unit: p.hasCustomUnit || false,
      custom_unit_name: p.customUnitName || 'kg',
      custom_unit_min: p.customUnitMin ?? 1,
      custom_unit_step: p.customUnitStep ?? 1,
      custom_unit_max: p.customUnitMax ?? 50,
      custom_unit_price_per_unit: p.customUnitPricePerUnit ?? null,
      custom_unit_price_per_unit_usd: p.customUnitPricePerUnitUsd ?? null
    };
    const { error } = await supabase.from('prepared_packages').upsert([formatted], { onConflict: 'id' });
    if (error) {
      console.error('❌ Error saving single package:', error);
      throw error;
    }
    console.log('✅ Saved single package to Supabase successfully:', p.name);
  } catch (err) {
    console.error('❌ Failed to save single package to Supabase:', err);
    throw err;
  }
};

export const getStoredCustomItems = async (): Promise<CustomBoxOption[]> => {
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase not configured, using defaults');
    return CUSTOM_ITEMS;
  }

  try {
    const { data, error } = await supabase.from('custom_box_options').select('*');
    
    if (error) {
      console.error('❌ Error fetching custom items:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('📦 No custom items in database');
      return [];
    }

    const mapped = data.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      price_usd: item.price_usd ?? (item.price ? Math.round((item.price / 120) * 100) / 100 : undefined),
      image: item.image,
      description: item.description || item.name,
      requiresCustomInput: item.requires_custom_input || false,
      customInputType: item.custom_input_type || 'text',
      customInputLabel: item.custom_input_label || '',
      hasCustomUnit: item.has_custom_unit || false,
      customUnitName: item.custom_unit_name || 'kg',
      customUnitMin: item.custom_unit_min != null ? Number(item.custom_unit_min) : 1,
      customUnitStep: item.custom_unit_step != null ? Number(item.custom_unit_step) : 1,
      customUnitMax: item.custom_unit_max != null ? Number(item.custom_unit_max) : 50,
      customUnitPricePerUnit: item.custom_unit_price_per_unit != null ? Number(item.custom_unit_price_per_unit) : undefined,
      customUnitPricePerUnitUsd: item.custom_unit_price_per_unit_usd != null ? Number(item.custom_unit_price_per_unit_usd) : undefined
    }));
    
    console.log('✅ Loaded', mapped.length, 'custom items from Supabase');
    return mapped;
  } catch (err) {
    console.error('❌ Error loading custom items:', err);
    return CUSTOM_ITEMS;
  }
};

export const saveStoredCustomItems = async (items: CustomBoxOption[]) => {
  console.log('💾 Saving', items.length, 'custom items to Supabase...');
  
  if (!isSupabaseConfigured) {
    console.error('❌ Supabase not configured!');
    throw new Error('Supabase not configured - cannot save custom items');
  }

  try {
    const formatted = items.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      price_usd: item.price_usd ?? null,
      image: item.image,
      description: item.description,
      requires_custom_input: item.requiresCustomInput || false,
      custom_input_type: item.customInputType || 'text',
      custom_input_label: item.customInputLabel || '',
      has_custom_unit: item.hasCustomUnit || false,
      custom_unit_name: item.customUnitName || 'kg',
      custom_unit_min: item.customUnitMin ?? 1,
      custom_unit_step: item.customUnitStep ?? 1,
      custom_unit_max: item.customUnitMax ?? 50,
      custom_unit_price_per_unit: item.customUnitPricePerUnit ?? null,
      custom_unit_price_per_unit_usd: item.customUnitPricePerUnitUsd ?? null
    }));
    
    const { error } = await supabase.from('custom_box_options').upsert(formatted, { onConflict: 'id' });
    
    if (error) {
      console.error('❌ Supabase save error:', error);
      throw error;
    }
    
    console.log('✅ Saved', items.length, 'custom items to Supabase successfully');
  } catch (err) {
    console.error('❌ Failed to save to Supabase:', err);
    throw err;
  }
};

export const saveSingleCustomItem = async (item: CustomBoxOption) => {
  console.log('💾 Saving single custom item to Supabase:', item.id);
  if (!isSupabaseConfigured) return;
  try {
    const formatted = {
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      price_usd: item.price_usd ?? null,
      image: item.image,
      description: item.description,
      requires_custom_input: item.requiresCustomInput || false,
      custom_input_type: item.customInputType || 'text',
      custom_input_label: item.customInputLabel || '',
      has_custom_unit: item.hasCustomUnit || false,
      custom_unit_name: item.customUnitName || 'kg',
      custom_unit_min: item.customUnitMin ?? 1,
      custom_unit_step: item.customUnitStep ?? 1,
      custom_unit_max: item.customUnitMax ?? 50,
      custom_unit_price_per_unit: item.customUnitPricePerUnit ?? null,
      custom_unit_price_per_unit_usd: item.customUnitPricePerUnitUsd ?? null
    };
    const { error } = await supabase.from('custom_box_options').upsert([formatted], { onConflict: 'id' });
    if (error) {
      console.error('❌ Error saving single custom item:', error);
      throw error;
    }
    console.log('✅ Saved single custom item to Supabase successfully:', item.name);
  } catch (err) {
    console.error('❌ Failed to save single custom item to Supabase:', err);
    throw err;
  }
};

/**
 * Helper to calculate the single-item price when a scalable unit is selected.
 * (e.g. 3 kg of a cake with min 2 kg and base price 2400 ETB -> 3600 ETB)
 */
export const calculateCustomUnitPrice = (
  item: PreparedPackage | CustomBoxOption,
  unitValue: number,
  currencyOrMarket: string = 'ETB'
): number => {
  const isUsd = currencyOrMarket === 'USD' || currencyOrMarket === 'INTERNATIONAL';
  const basePrice = isUsd
    ? (item.price_usd != null && item.price_usd > 0 ? item.price_usd : Math.round((item.price / 120) * 100) / 100)
    : item.price;

  if (!item.hasCustomUnit) {
    return basePrice;
  }

  const minUnit = item.customUnitMin && item.customUnitMin > 0 ? item.customUnitMin : 1;
  const effectiveUnit = Math.max(minUnit, unitValue);

  // If explicit price per unit is configured
  if (isUsd && item.customUnitPricePerUnitUsd != null && item.customUnitPricePerUnitUsd > 0) {
    return Math.round(item.customUnitPricePerUnitUsd * effectiveUnit * 100) / 100;
  }
  if (!isUsd && item.customUnitPricePerUnit != null && item.customUnitPricePerUnit > 0) {
    return Math.round(item.customUnitPricePerUnit * effectiveUnit);
  }

  // Otherwise, default price per unit = basePrice / minUnit
  const pricePerUnit = basePrice / minUnit;
  const calculated = pricePerUnit * effectiveUnit;
  return isUsd ? Math.round(calculated * 100) / 100 : Math.round(calculated);
};

export const getStoredOrders = async (): Promise<any[]> => {
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase not configured');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching orders:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('📦 No orders in database');
      return [];
    }

    const mapped = data.map(o => ({
      id: o.id,
      createdAt: o.created_at ? new Date(o.created_at).toLocaleString() : new Date().toLocaleString(),
      status: o.status,
      customer: o.customer_info,
      items: o.items,
      subtotal: o.subtotal,
      shipping: o.shipping,
      total: o.total,
      paymentMethod: o.payment_method,
      paymentReceiptUrl: o.payment_receipt_url,
      giftBoxStyle: o.gift_box_style,
      giftBoxPrice: o.gift_box_price,
      buyerMarket: o.buyer_market || 'ETHIOPIA',
      currency: o.currency || 'ETB',
      deliveryFee: o.delivery_fee || 0,
      chapaTxRef: o.chapa_tx_ref || null,
      paymentStatus: o.payment_status || (o.payment_receipt_url ? (o.payment_method?.includes('Manual') ? 'UNDER_REVIEW' : 'PAID') : 'PENDING_PAYMENT'),
      senderName: o.sender_name || null,
      transactionId: o.transaction_id || null,
      rejectionReason: o.rejection_reason || null,
      paymentSubmittedAt: o.payment_submitted_at || null,
      reviewedAt: o.reviewed_at || null,
      reviewedBy: o.reviewed_by || null,
    }));
    
    console.log('✅ Loaded', mapped.length, 'orders from Supabase');
    return mapped;
  } catch (err) {
    console.error('❌ Error loading orders:', err);
    return [];
  }
};

export const saveSingleOrder = async (order: any) => {
  console.log('💾 Saving single order to Supabase:', order.id);
  
  if (!isSupabaseConfigured) {
    console.error('❌ Supabase not configured!');
    throw new Error('Supabase not configured - cannot save order');
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('👤 Order creator user ID:', session?.user?.id || 'GUEST / ANONYMOUS');
    
    const formattedOrder = {
      id: order.id,
      user_id: session?.user?.id || order.userId || null,
      status: order.status || 'Pending',
      customer_info: order.customer,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping || 0,
      total: order.total,
      payment_method: order.paymentMethod,
      payment_receipt_url: order.paymentReceiptUrl || null,
      gift_box_style: order.giftBoxStyle || null,
      gift_box_price: order.giftBoxPrice || 0,
      buyer_market: order.buyerMarket || 'ETHIOPIA',
      currency: order.currency || 'ETB',
      delivery_fee: order.deliveryFee || 0,
      chapa_tx_ref: order.chapaTxRef || null,
      payment_status: order.paymentStatus || 'PENDING_PAYMENT',
      sender_name: order.senderName || null,
      transaction_id: order.transactionId || null,
      rejection_reason: order.rejectionReason || null,
      payment_submitted_at: order.paymentSubmittedAt || (order.paymentStatus === 'UNDER_REVIEW' || order.paymentReceiptUrl ? new Date().toISOString() : null),
      reviewed_at: order.reviewedAt || null,
      reviewed_by: order.reviewedBy || null,
    };
    
    console.log('📝 Formatted order payload for DB:', formattedOrder);
    
    const { data, error } = await supabase.from('orders').upsert([formattedOrder], { onConflict: 'id' });
    
    if (error) {
      console.error('❌ Supabase order save error:', error);
      throw error;
    }
    
    console.log('✅ Order', order.id, 'saved to Supabase successfully');
    return data;
  } catch (err) {
    console.error('❌ Failed to save order to Supabase:', err);
    throw err;
  }
};

export const updateOrderStatusInDb = async (orderId: string, newStatus: string) => {
  console.log('📝 Updating order status in Supabase:', orderId, '→', newStatus);
  
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId);

  if (error) {
    console.error('❌ Failed to update order status in Supabase:', error);
    throw error;
  }

  console.log('✅ Order status updated in Supabase');
  return data;
};

export const updatePaymentVerificationInDb = async (
  orderId: string,
  updates: {
    paymentStatus: string;
    orderStatus?: string;
    rejectionReason?: string | null;
    reviewedBy?: string | null;
    reviewedAt?: string | null;
  }
) => {
  console.log('📝 Updating payment verification in Supabase:', orderId, updates);

  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const payload: any = {
    payment_status: updates.paymentStatus,
    reviewed_at: updates.reviewedAt || new Date().toISOString(),
    reviewed_by: updates.reviewedBy || 'Admin',
  };

  if (updates.rejectionReason !== undefined) {
    payload.rejection_reason = updates.rejectionReason;
  }

  if (updates.orderStatus) {
    payload.status = updates.orderStatus;
  }

  const { data, error } = await supabase
    .from('orders')
    .update(payload)
    .eq('id', orderId);

  if (error) {
    console.error('❌ Failed to update payment verification in Supabase:', error);
    throw error;
  }

  console.log('✅ Payment verification updated in Supabase for order:', orderId);
  return data;
};

export const saveStoredOrders = async (orders: any[]) => {
  console.log('💾 Saving', orders.length, 'orders to Supabase...');
  
  if (!isSupabaseConfigured) {
    console.error('❌ Supabase not configured!');
    throw new Error('Supabase not configured - cannot save orders');
  }

  if (orders.length === 0) {
    return;
  }

  for (const order of orders) {
    await saveSingleOrder(order);
  }
};

export const getStoredCategories = async (): Promise<GiftCategory[]> => {
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase not configured, using defaults');
    return DEFAULT_CATEGORIES;
  }

  try {
    const { data, error } = await supabase.from('categories').select('*');
    
    if (error) {
      console.error('❌ Error fetching categories:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('📦 No categories in database');
      return [];
    }

    const mapped = data.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug || c.name.toLowerCase().replace(/\s+/g, '-'),
      description: c.description || '',
      image: c.image,
      type: c.type || 'both',
      subcategories: Array.isArray(c.subcategories) ? c.subcategories : []
    }));
    
    console.log('✅ Loaded', mapped.length, 'categories from Supabase');
    return mapped;
  } catch (err) {
    console.error('❌ Error loading categories:', err);
    return DEFAULT_CATEGORIES;
  }
};

export const saveStoredCategories = async (categories: GiftCategory[]) => {
  console.log('💾 Saving', categories.length, 'categories to Supabase...');
  
  if (!isSupabaseConfigured) {
    console.error('❌ Supabase not configured!');
    throw new Error('Supabase not configured - cannot save categories');
  }

  try {
    const payload = categories.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image ?? null,
      type: c.type ?? 'both',
      subcategories: c.subcategories ?? []
    }));
    const { error } = await supabase.from('categories').upsert(payload, { onConflict: 'id' });
    
    if (error) {
      console.error('❌ Supabase save error:', error);
      throw error;
    }
    
    console.log('✅ Saved', categories.length, 'categories to Supabase successfully');
  } catch (err) {
    console.error('❌ Failed to save to Supabase:', err);
    throw err;
  }
};

export const getStoredGiftBoxes = async (): Promise<GiftBoxStyle[]> => {
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase not configured, using defaults');
    return DEFAULT_GIFT_BOXES;
  }

  try {
    const { data, error } = await supabase.from('gift_boxes').select('*');
    
    if (error) {
      console.error('❌ Error fetching gift boxes:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('📦 No gift boxes in database');
      return [];
    }

    const mapped = data.map(b => ({
      id: b.id,
      name: b.name,
      dimensions: b.dimensions,
      price: b.price,
      price_usd: b.price_usd ?? (b.price ? Math.round((b.price / 120) * 100) / 100 : undefined),
      color: b.color,
      image: b.image,
      description: b.description
    }));
    
    console.log('✅ Loaded', mapped.length, 'gift boxes from Supabase');
    return mapped;
  } catch (err) {
    console.error('❌ Error loading gift boxes:', err);
    return DEFAULT_GIFT_BOXES;
  }
};

export const saveStoredGiftBoxes = async (boxes: GiftBoxStyle[]) => {
  console.log('💾 Saving', boxes.length, 'gift boxes...');
  
  if (!isSupabaseConfigured) {
    localStorage.setItem('mbm_stored_gift_boxes_v2', JSON.stringify(boxes));
    return;
  }

  try {
    const { error } = await supabase.from('gift_boxes').upsert(boxes, { onConflict: 'id' });
    
    if (error) {
      console.error('❌ Supabase save error:', error);
      throw error;
    }
    
    console.log('✅ Saved', boxes.length, 'gift boxes to Supabase successfully');
  } catch (err) {
    console.error('❌ Failed to save to Supabase:', err);
    throw err;
  }
};

export const deleteStoredCategory = async (id: string) => {
  console.log('🗑️ Deleting category from Supabase:', id);
  if (!isSupabaseConfigured) return;
  try {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      console.error('❌ Supabase delete category error:', error);
      throw error;
    }
    console.log('✅ Deleted category', id, 'from Supabase successfully');
  } catch (err) {
    console.error('❌ Failed to delete category from Supabase:', err);
    throw err;
  }
};

export const deleteStoredPackage = async (id: string) => {
  console.log('🗑️ Deleting package from Supabase:', id);
  if (!isSupabaseConfigured) return;
  try {
    const { error } = await supabase.from('prepared_packages').delete().eq('id', id);
    if (error) {
      console.error('❌ Supabase delete package error:', error);
      throw error;
    }
    console.log('✅ Deleted package', id, 'from Supabase successfully');
  } catch (err) {
    console.error('❌ Failed to delete package from Supabase:', err);
    throw err;
  }
};

export const deleteStoredCustomItem = async (id: string) => {
  console.log('🗑️ Deleting custom item from Supabase:', id);
  if (!isSupabaseConfigured) return;
  try {
    const { error } = await supabase.from('custom_box_options').delete().eq('id', id);
    if (error) {
      console.error('❌ Supabase delete custom item error:', error);
      throw error;
    }
    console.log('✅ Deleted custom item', id, 'from Supabase successfully');
  } catch (err) {
    console.error('❌ Failed to delete custom item from Supabase:', err);
    throw err;
  }
};

export const deleteStoredGiftBox = async (id: string) => {
  console.log('🗑️ Deleting gift box from Supabase:', id);
  if (!isSupabaseConfigured) return;
  try {
    const { error } = await supabase.from('gift_boxes').delete().eq('id', id);
    if (error) {
      console.error('❌ Supabase delete gift box error:', error);
      throw error;
    }
    console.log('✅ Deleted gift box', id, 'from Supabase successfully');
  } catch (err) {
    console.error('❌ Failed to delete gift box from Supabase:', err);
    throw err;
  }
};

// Seed initial data into Supabase (run once on first load)
export const seedInitialData = async () => {
  if (!isSupabaseConfigured) {
    console.log('⚠️ Supabase not configured, skipping seed');
    return;
  }

  try {
    console.log('🌱 Checking if database needs seeding...');

    // Check if we already have data
    const { data: existingPackages } = await supabase.from('prepared_packages').select('id').limit(1);
    const { data: existingItems } = await supabase.from('custom_box_options').select('id').limit(1);
    const { data: existingCategories } = await supabase.from('categories').select('id').limit(1);
    const { data: existingBoxes } = await supabase.from('gift_boxes').select('id').limit(1);

    let seeded = false;

    console.log('🌱 Seeding initial data into database...');

    // Seed packages
    // Removed to prevent auto-seeding if user intentionally deletes all packages
    // if (!existingPackages || existingPackages.length === 0) {
    //   await saveStoredPackages(PREPARED_PACKAGES);
    //   console.log('✅ Seeded', PREPARED_PACKAGES.length, 'packages');
    //   seeded = true;
    // }

    // Seed custom items
    // Removed to prevent auto-seeding if user intentionally deletes all custom items
    // if (!existingItems || existingItems.length === 0) {
    //   await saveStoredCustomItems(CUSTOM_ITEMS);
    //   console.log('✅ Seeded', CUSTOM_ITEMS.length, 'custom items');
    //   seeded = true;
    // }

    // Seed categories
    // Removed to prevent auto-seeding if user intentionally deletes all categories
    // if (!existingCategories || existingCategories.length === 0) {
    //   await saveStoredCategories(DEFAULT_CATEGORIES);
    //   console.log('✅ Seeded', DEFAULT_CATEGORIES.length, 'categories');
    //   seeded = true;
    // }

    // Seed gift boxes
    // Removed to prevent auto-seeding if user intentionally deletes all gift boxes
    // if (!existingBoxes || existingBoxes.length === 0) {
    //   await saveStoredGiftBoxes(DEFAULT_GIFT_BOXES);
    //   console.log('✅ Seeded', DEFAULT_GIFT_BOXES.length, 'gift box styles');
    //   seeded = true;
    // }

    if (seeded) {
      console.log('🎉 Database seeding complete!');
    } else {
      console.log('✅ Database already has data, skipping seed');
    }
  } catch (err) {
    console.error('❌ Error seeding database:', err);
  }
};
