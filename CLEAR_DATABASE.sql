-- Run this in your Supabase SQL Editor to clear all default data
-- This will remove all packages, custom items, categories, and gift boxes

-- Clear all prepared packages
DELETE FROM prepared_packages;

-- Clear all custom box options (single items)
DELETE FROM custom_box_options;

-- Clear all categories
DELETE FROM categories;

-- Clear all gift boxes
DELETE FROM gift_boxes;

-- Verify deletion
SELECT 'Prepared Packages Count:' as info, COUNT(*) as count FROM prepared_packages
UNION ALL
SELECT 'Custom Items Count:', COUNT(*) FROM custom_box_options
UNION ALL
SELECT 'Categories Count:', COUNT(*) FROM categories
UNION ALL
SELECT 'Gift Boxes Count:', COUNT(*) FROM gift_boxes;
