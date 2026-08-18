import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface GiftCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  type?: 'package' | 'custom_item' | 'both';
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
}

export interface CustomBoxOption {
  id: string;
  name: string;
  category: 'box' | 'chocolate' | 'candle' | 'drink' | 'accessory' | 'personal' | string;
  price: number;      // ETB price (for LOCAL buyers)
  price_usd?: number; // USD price (for INTERNATIONAL buyers) — set independently by admin
  image: string;
  description: string;
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
      popularFor: item.popular_for || 'Gifting'
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
      popular_for: p.popularFor
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
      popular_for: p.popularFor
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
      description: item.description || item.name
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
      description: item.description
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
      description: item.description
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
      paymentStatus: o.payment_status || (o.payment_receipt_url ? 'PAID' : 'PENDING_PAYMENT')
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
      payment_status: order.paymentStatus || 'PENDING_PAYMENT'
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
      type: c.type || 'both'
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
    const { error } = await supabase.from('categories').upsert(categories, { onConflict: 'id' });
    
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
