-- STEP 1: Add 'moderator' to the user_role enum
-- Run this command separately and commit it before running Step 2.
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'moderator';
