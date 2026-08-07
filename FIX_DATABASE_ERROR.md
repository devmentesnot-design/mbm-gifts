# Fix Database Error - Step by Step

## ❌ Error You're Seeing
```
Could not find the 'gift_box_price' column of 'orders' in the schema cache
```

## ✅ Solution - Follow These Steps

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Copy and Run This SQL

Open the file: `RUN_THIS_IN_SUPABASE_NOW.sql`

Or copy this:

```sql
-- Add the new columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS gift_box_style TEXT;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS gift_box_price NUMERIC DEFAULT 0;
```

### Step 3: Click "RUN" Button

You should see a success message.

### Step 4: Refresh Your App

1. Close your app completely
2. Restart it
3. Try creating an order again

## Why This Happened

The code was updated to save new fields (`payment_receipt_url`, `gift_box_style`, `gift_box_price`) to the database, but these columns don't exist in your database yet. Running the SQL above creates them.

## Verification

After running the SQL, you can verify by running this query:

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'orders';
```

You should see all columns including the 3 new ones.

## Alternative: Run Complete Setup Again

If the above doesn't work, you can run the entire `ONE_COMPLETE_SETUP.sql` file again - it's safe because it uses `IF NOT EXISTS` checks and won't duplicate anything.
