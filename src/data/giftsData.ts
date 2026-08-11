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
  price: number;
  color: string;
  image: string;
  description: string;
}

export const DEFAULT_CATEGORIES: GiftCategory[] = [
  { id: 'cat-luxury', name: 'Luxury', slug: 'luxury', description: 'High-density velvet hampers and executive celebration sets.', image: '/header_hero.jpg', type: 'both' },
  { id: 'cat-birthday', name: 'Birthday', slug: 'birthday', description: 'Sparkling birthday edition gift bundles.', image: '/header_hero.jpg', type: 'package' },
  { id: 'cat-romance', name: 'Romance', slug: 'romance', description: 'Romantic hampers and passion keepsakes.', image: '/header_hero.jpg', type: 'package' },
  { id: 'cat-corporate', name: 'Corporate', slug: 'corporate', description: 'Executive business and VIP client hampers.', image: '/header_hero.jpg', type: 'package' },
  { id: 'cat-sweets', name: 'Sweets & Chocolates', slug: 'sweets', description: 'Artisan pralines, Swiss truffles, and gourmet confectionaries.', image: '/candels.png', type: 'custom_item' },
  { id: 'cat-candles', name: 'Candles & Fragrance', slug: 'candles', description: 'Hand-poured essential oil candles and aromatic diffusers.', image: '/candels.png', type: 'custom_item' },
  { id: 'cat-drinkware', name: 'Fine Drinkware', slug: 'drinkware', description: 'Crystal glassware, insulated thermal tumblers, and flutes.', image: '/mugs.png', type: 'custom_item' },
  { id: 'cat-stationery', name: 'Leather & Personal', slug: 'stationery', description: 'Gold foil journal notebooks, Italian leather accessories.', image: '/notebook.png', type: 'custom_item' },
  { id: 'cat-bath', name: 'Bath & Body', slug: 'bath', description: 'Therapeutic bath salts, organic silk masks, and relaxing oils.', image: '/prfumes.png', type: 'custom_item' }
];

export const DEFAULT_GIFT_BOXES: GiftBoxStyle[] = [
  { id: 'box-signature-velvet', name: 'Signature Crimson Velvet Box', dimensions: '12" x 10" x 5"', price: 0, color: 'Crimson Red', image: '/header_hero.jpg', description: 'Plush velvet lining with gold magnetic latch and silk ribbon.' },
  { id: 'box-gold-wooden', name: 'Gold Foil Wooden Keepsake Chest', dimensions: '14" x 11" x 6"', price: 15.00, color: 'Natural Walnut & Gold', image: '/header_hero.jpg', description: 'Handcrafted solid cedar wood with 24k gold leaf foil accents.' },
  { id: 'box-matte-black', name: 'Matte Black Executive Hamper', dimensions: '13" x 9" x 5"', price: 12.00, color: 'Matte Black', image: '/header_hero.jpg', description: 'Architectural rigid matte box lined with velvet protective foam.' },
  { id: 'box-regal-rose', name: 'Classic Regal Ribbon Box', dimensions: '10" x 8" x 4"', price: 8.00, color: 'Dusty Rose', image: '/header_hero.jpg', description: 'Satin textured dusty rose container with hand-tied satin bow.' }
];

export interface PackageItemDetail {
  name: string;
  image: string;
  description: string;
}

export interface PreparedPackage {
  id: string;
  name: string;
  category: 'Birthday' | 'Luxury' | 'Romance' | 'Corporate' | 'Anniversary' | string;
  price: number;
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
  price: number;
  image: string;
  description: string;
}

// Fallback initial data in case DB is empty or fails
export const PREPARED_PACKAGES: PreparedPackage[] = [
  {
    id: 'pkg-royal-crimson',
    name: 'The Royal Crimson Luxury Box',
    category: 'Luxury',
    price: 149.99,
    rating: 4.9,
    reviewsCount: 128,
    badge: 'BEST SELLER',
    shortDesc: 'A lavish crimson keepsake box with Belgian truffles, gold-embossed notebook, and velvet candle.',
    image: '/header_hero.jpg',
    itemsIncluded: [
      'Handcrafted Crimson Velvet Box',
      'Artisan Swiss Truffles (12 pcs)',
      'Gold Foil Journal & Pen',
      'Midnight Rose Scented Soy Candle',
      'Personalized Calligraphy Card'
    ],
    itemsIncludedDetailed: [
      {
        name: 'Handcrafted Crimson Velvet Box',
        image: '/header_hero.jpg',
        description: 'High-density velvet gift box with magnetic golden latch and satin interior.'
      },
      {
        name: 'Artisan Swiss Truffles (12 pcs)',
        image: '/candels.png',
        description: 'Decadent dark & milk chocolate pralines infused with French hazelnut ganache.'
      },
      {
        name: 'Gold Foil Journal & Pen',
        image: '/notebook.png',
        description: 'Hardcover bound leatherette notebook with 24k gold leaf page edging & brass pen.'
      },
      {
        name: 'Midnight Rose Scented Soy Candle',
        image: '/candels.png',
        description: 'Hand-poured 100% soy wax infused with wild Bulgarian rose petal oil.'
      },
      {
        name: 'Personalized Calligraphy Card',
        image: '/logo.png',
        description: 'Custom hand-lettered gold ink message sealed with authentic red sealing wax.'
      }
    ],
    popularFor: 'Anniversaries, Executive Gifting & Milestones'
  },
  {
    id: 'pkg-golden-celebration',
    name: 'Golden Birthday Celebration Set',
    category: 'Birthday',
    price: 99.50,
    rating: 4.8,
    reviewsCount: 94,
    badge: 'POPULAR',
    shortDesc: 'Sparkling birthday edition featuring gourmet caramel confections, celebratory party flute, and golden bath soak.',
    image: '/header_hero.jpg',
    itemsIncluded: [
      'Gold Embossed Gift Box',
      'Salted Caramel Bonbons',
      'Stemless Crystal Flute',
      'Vanilla Amber Bath Salts'
    ],
    itemsIncludedDetailed: [
      {
        name: 'Gold Embossed Gift Box',
        image: '/header_hero.jpg',
        description: 'Metallic gold textured keepsake container with ribbon bow detailing.'
      },
      {
        name: 'Salted Caramel Bonbons',
        image: '/candels.png',
        description: 'Rich gooey sea-salt caramel enveloped in 70% dark Belgian cocoa.'
      },
      {
        name: 'Stemless Crystal Flute',
        image: '/mugs.png',
        description: 'Hand-blown ultra-clear glass flute styled with delicate gold leaf rim.'
      },
      {
        name: 'Vanilla Amber Bath Salts',
        image: '/prfumes.png',
        description: 'Aromatic therapeutic Dead Sea mineral bath soak with real vanilla pod extracts.'
      }
    ],
    popularFor: 'Birthdays & Celebrations'
  },
  {
    id: 'pkg-velvet-romance',
    name: 'Velvet Rose & Champagne Romance',
    category: 'Romance',
    price: 125.00,
    rating: 5.0,
    reviewsCount: 82,
    badge: 'NEW',
    shortDesc: 'An enchanting romantic hamper filled with rose petal infused chocolates, scented massage oil, and silk eye mask.',
    image: '/header_hero.jpg',
    itemsIncluded: [
      'Crimson Satin Ribbon Box',
      'Rose Petal Artisan Chocolate Bar',
      'French Lavender Candle',
      'Mulberry Silk Eye Mask'
    ],
    itemsIncludedDetailed: [
      {
        name: 'Crimson Satin Ribbon Box',
        image: '/header_hero.jpg',
        description: 'Luxury deep-red velvet hamper finished with double-faced crimson satin ribbon.'
      },
      {
        name: 'Rose Petal Artisan Chocolate Bar',
        image: '/candels.png',
        description: 'Organic ruby chocolate bar sprinkled with hand-crystallized organic rose petals.'
      },
      {
        name: 'French Lavender Candle',
        image: '/candels.png',
        description: 'Calming soy candle infused with natural essential oil from Provence lavender fields.'
      },
      {
        name: 'Mulberry Silk Eye Mask',
        image: '/prfumes.png',
        description: '100% Pure 22-Momme Mulberry Silk eye mask for effortless restful sleep.'
      }
    ],
    popularFor: 'Valentine, Proposals & Anniversaries'
  },
  {
    id: 'pkg-executive-excellence',
    name: 'Executive Excellence Desk Collection',
    category: 'Corporate',
    price: 175.00,
    rating: 4.9,
    reviewsCount: 67,
    badge: '',
    shortDesc: 'Sleek corporate gift box including Italian leather card holder, thermal tumbler, and single-origin coffee beans.',
    image: '/header_hero.jpg',
    itemsIncluded: [
      'Matte Black Premium Gift Box',
      'Leather Business Card Holder',
      'Insulated Matte Tumbler 500ml',
      'Single-Origin Coffee Beans (250g)'
    ],
    itemsIncludedDetailed: [
      {
        name: 'Matte Black Premium Gift Box',
        image: '/header_hero.jpg',
        description: 'Architectural matte black rigid gift container lined with custom protective felt.'
      },
      {
        name: 'Leather Business Card Holder',
        image: '/wallets.png',
        description: 'Genuine full-grain Italian leather card wallet with magnet latch & RFID shield.'
      },
      {
        name: 'Insulated Matte Tumbler 500ml',
        image: '/mugs.png',
        description: 'Double-wall stainless steel thermal travel mug keeping beverages hot/cold for 12hrs.'
      },
      {
        name: 'Single-Origin Coffee Beans (250g)',
        image: '/candels.png',
        description: 'Artisanal micro-lot whole bean coffee roasted fresh with notes of citrus & jasmine.'
      }
    ],
    popularFor: 'Corporate Rewards & VIP Clients'
  }
];

export const CUSTOM_ITEMS: CustomBoxOption[] = [
  {
    id: 'item-swiss-truffles',
    name: 'Artisan Swiss Truffles',
    category: 'Sweets & Chocolates',
    price: 18.00,
    image: '/candels.png',
    description: 'Assorted dark and milk chocolate pralines.'
  },
  {
    id: 'item-caramel-bonbons',
    name: 'Salted Caramel Bonbons',
    category: 'Sweets & Chocolates',
    price: 14.50,
    image: '/candels.png',
    description: 'Rich gooey caramel wrapped in 70% dark Belgian chocolate.'
  },
  {
    id: 'item-rose-candle',
    name: 'Midnight Rose Soy Candle',
    category: 'Candles & Fragrance',
    price: 24.00,
    image: '/candels.png',
    description: 'Hand-poured soy wax with natural rose and amber essential oils.'
  },
  {
    id: 'item-crystal-flute',
    name: 'Stemless Crystal Glassware',
    category: 'Fine Drinkware',
    price: 22.00,
    image: '/mugs.png',
    description: 'Hand-blown lead-free crystal flute with subtle gold trim.'
  },
  {
    id: 'item-leather-journal',
    name: 'Gold Foil Leather Journal',
    category: 'Leather & Personal',
    price: 28.00,
    image: '/notebook.png',
    description: 'Soft cover notebook with gold gilded edges and ribbon bookmark.'
  },
  {
    id: 'item-lavender-bath-salts',
    name: 'French Lavender Bath Salts',
    category: 'Bath & Body',
    price: 16.00,
    image: '/prfumes.png',
    description: 'Soothing Epsom bath salts with natural organic dried lavender.'
  },
  {
    id: 'item-watches',
    name: 'Luxury Watches',
    category: 'Leather & Personal',
    price: 85.00,
    image: '/Watches.png',
    description: 'Elegant timepieces with premium leather straps.'
  },
  {
    id: 'item-wallets',
    name: 'Leather Wallets',
    category: 'Leather & Personal',
    price: 35.00,
    image: '/wallets.png',
    description: 'Genuine leather bifold wallets with RFID protection.'
  },
  {
    id: 'item-sunglasses',
    name: 'Designer Sunglasses',
    category: 'Leather & Personal',
    price: 45.00,
    image: '/Sunglasses.png',
    description: 'UV protection sunglasses with stylish frames.'
  },
  {
    id: 'item-earbuds',
    name: 'Wireless Earbuds',
    category: 'Leather & Personal',
    price: 55.00,
    image: '/Earbuds.png',
    description: 'Premium wireless earbuds with noise cancellation.'
  },
  {
    id: 'item-belts',
    name: 'Leather Belts',
    category: 'Leather & Personal',
    price: 25.00,
    image: '/Belts.png',
    description: 'Classic leather belts with elegant buckles.'
  },
  {
    id: 'item-jewelry',
    name: 'Fashion Jewelry',
    category: 'Leather & Personal',
    price: 40.00,
    image: '/jewlery.png',
    description: 'Elegant jewelry sets with premium materials.'
  }
];

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
      return PREPARED_PACKAGES;
    }
    
    if (!data || data.length === 0) {
      console.log('📦 No packages in database, returning defaults');
      return PREPARED_PACKAGES;
    }

    const mapped = data.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
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

export const getStoredCustomItems = async (): Promise<CustomBoxOption[]> => {
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase not configured, using defaults');
    return CUSTOM_ITEMS;
  }

  try {
    const { data, error } = await supabase.from('custom_box_options').select('*');
    
    if (error) {
      console.error('❌ Error fetching custom items:', error);
      return CUSTOM_ITEMS;
    }
    
    if (!data || data.length === 0) {
      console.log('📦 No custom items in database, returning defaults');
      return CUSTOM_ITEMS;
    }

    const mapped = data.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
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
      giftBoxPrice: o.gift_box_price
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
      shipping: order.shipping,
      total: order.total,
      payment_method: order.paymentMethod,
      payment_receipt_url: order.paymentReceiptUrl || null,
      gift_box_style: order.giftBoxStyle || null,
      gift_box_price: order.giftBoxPrice || 0
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
      return DEFAULT_CATEGORIES;
    }
    
    if (!data || data.length === 0) {
      console.log('📦 No categories in database, returning defaults');
      return DEFAULT_CATEGORIES;
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
      return DEFAULT_GIFT_BOXES;
    }
    
    if (!data || data.length === 0) {
      console.log('📦 No gift boxes in database, returning defaults');
      return DEFAULT_GIFT_BOXES;
    }

    const mapped = data.map(b => ({
      id: b.id,
      name: b.name,
      dimensions: b.dimensions,
      price: b.price,
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
  console.log('💾 Saving', boxes.length, 'gift boxes to Supabase...');
  
  if (!isSupabaseConfigured) {
    console.error('❌ Supabase not configured!');
    throw new Error('Supabase not configured - cannot save gift boxes');
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
    if (!existingPackages || existingPackages.length === 0) {
      await saveStoredPackages(PREPARED_PACKAGES);
      console.log('✅ Seeded', PREPARED_PACKAGES.length, 'packages');
      seeded = true;
    }

    // Seed custom items
    if (!existingItems || existingItems.length === 0) {
      await saveStoredCustomItems(CUSTOM_ITEMS);
      console.log('✅ Seeded', CUSTOM_ITEMS.length, 'custom items');
      seeded = true;
    }

    // Seed categories
    if (!existingCategories || existingCategories.length === 0) {
      await saveStoredCategories(DEFAULT_CATEGORIES);
      console.log('✅ Seeded', DEFAULT_CATEGORIES.length, 'categories');
      seeded = true;
    }

    // Seed gift boxes
    if (!existingBoxes || existingBoxes.length === 0) {
      await saveStoredGiftBoxes(DEFAULT_GIFT_BOXES);
      console.log('✅ Seeded', DEFAULT_GIFT_BOXES.length, 'gift box styles');
      seeded = true;
    }

    if (seeded) {
      console.log('🎉 Database seeding complete!');
    } else {
      console.log('✅ Database already has data, skipping seed');
    }
  } catch (err) {
    console.error('❌ Error seeding database:', err);
  }
};
