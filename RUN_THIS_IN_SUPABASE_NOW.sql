-- ============================================================================
-- URGENT: Run this in Supabase SQL Editor RIGHT NOW
-- Copy everything below and paste into Supabase SQL Editor, then click RUN
-- ============================================================================

-- Step 1: Add the new columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS gift_box_style TEXT;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS gift_box_price NUMERIC DEFAULT 0;

-- Step 2: Verify the columns were added
SELECT 
  'SUCCESS! All columns added.' as status,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'orders' 
  AND column_name IN ('payment_receipt_url', 'gift_box_style', 'gift_box_price');

-- You should see: column_count = 3
