-- ============================================================================
-- MIGRATION: Add Receipt and Gift Box Fields to Orders Table
-- Run this in Supabase SQL Editor to add new columns
-- ============================================================================

-- Add payment receipt URL column
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT;

-- Add gift box style column
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS gift_box_style TEXT;

-- Add gift box price column
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS gift_box_price NUMERIC DEFAULT 0;

-- Verify columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'orders' 
  AND column_name IN ('payment_receipt_url', 'gift_box_style', 'gift_box_price')
ORDER BY ordinal_position;

-- Success message
SELECT 'Migration complete! New order fields added successfully.' as status;
