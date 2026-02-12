/*
  # Add Deriv API Token Column

  1. Changes
    - Add `deriv_api_token` column to `profiles` table to store encrypted Deriv API tokens
    - This allows users to authenticate with just their Deriv token

  2. Security
    - Column is text type to store the token
    - Will be accessed only by the authenticated user who owns the profile
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'deriv_api_token'
  ) THEN
    ALTER TABLE profiles ADD COLUMN deriv_api_token text;
  END IF;
END $$;