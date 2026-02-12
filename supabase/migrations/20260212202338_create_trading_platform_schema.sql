/*
  # Create Trading Platform Schema

  1. New Tables
    - `profiles`: User profiles linked to Deriv accounts
    - `bots`: Trading bots (uploaded XML or builder-created)
    - `bot_categories`: Bot categories (free/premium)
    - `bot_shares`: Copy trading relationships
    - `trading_signals`: Trading signals from the signal center
    - `user_trades`: Historical trades for reporting
    - `bot_performance`: Bot performance metrics
    - `favourite_bots`: User's favourite bots

  2. Security
    - Enable RLS on all tables
    - Policies for user data isolation
    - Policies for shared/public data access

  3. Relationships
    - profiles → auth.users
    - bots → profiles (creator)
    - bot_shares → profiles (follower/follower)
    - trading_signals → profiles (creator)
    - user_trades → profiles & bots
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deriv_account_id text UNIQUE,
  deriv_email text,
  display_name text,
  avatar_url text,
  is_signal_provider boolean DEFAULT false,
  is_bot_creator boolean DEFAULT false,
  total_followers integer DEFAULT 0,
  total_bots integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bot_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category_id uuid REFERENCES bot_categories(id),
  bot_type text NOT NULL, -- 'uploaded_xml' or 'builder_created'
  xml_content text,
  parameters jsonb,
  strategy_description text,
  total_users integer DEFAULT 0,
  average_profit_loss decimal DEFAULT 0,
  win_rate decimal DEFAULT 0,
  is_premium boolean DEFAULT false,
  is_public boolean DEFAULT true,
  thumbnail_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bot_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id uuid NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  follower_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  copy_trading_enabled boolean DEFAULT true,
  allocation_percentage decimal DEFAULT 100,
  shared_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trading_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  signal_type text NOT NULL, -- 'buy', 'sell', 'hold'
  asset text NOT NULL,
  entry_price decimal,
  take_profit decimal,
  stop_loss decimal,
  confidence_level integer, -- 1-100
  description text,
  expiry_time timestamptz,
  status text DEFAULT 'active', -- 'active', 'closed', 'expired'
  followers_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS signal_followers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid NOT NULL REFERENCES trading_signals(id) ON DELETE CASCADE,
  follower_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  follow_date timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bot_id uuid REFERENCES bots(id) ON DELETE SET NULL,
  signal_id uuid REFERENCES trading_signals(id) ON DELETE SET NULL,
  trade_type text NOT NULL, -- 'manual', 'bot', 'signal_copy'
  asset text NOT NULL,
  entry_price decimal NOT NULL,
  exit_price decimal,
  quantity decimal NOT NULL,
  profit_loss decimal,
  profit_loss_percentage decimal,
  status text DEFAULT 'open', -- 'open', 'closed'
  entry_time timestamptz DEFAULT now(),
  exit_time timestamptz,
  deriv_trade_id text
);

CREATE TABLE IF NOT EXISTS bot_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id uuid NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_trades integer DEFAULT 0,
  winning_trades integer DEFAULT 0,
  losing_trades integer DEFAULT 0,
  total_profit_loss decimal DEFAULT 0,
  max_drawdown decimal DEFAULT 0,
  roi_percentage decimal DEFAULT 0,
  win_rate decimal DEFAULT 0,
  last_updated timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS favourite_bots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bot_id uuid NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  UNIQUE(user_id, bot_id)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE favourite_bots ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Bots policies
CREATE POLICY "Anyone can view public bots"
  ON bots FOR SELECT
  USING (is_public = true OR (auth.role() = 'authenticated' AND creator_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )));

CREATE POLICY "Creator can update own bots"
  ON bots FOR UPDATE
  TO authenticated
  USING (creator_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (creator_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Creator can delete own bots"
  ON bots FOR DELETE
  TO authenticated
  USING (creator_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can insert bots"
  ON bots FOR INSERT
  TO authenticated
  WITH CHECK (creator_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Bot categories - everyone can read
CREATE POLICY "Everyone can view bot categories"
  ON bot_categories FOR SELECT
  USING (true);

-- Bot shares policies
CREATE POLICY "Users can view their own bot shares"
  ON bot_shares FOR SELECT
  TO authenticated
  USING (follower_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR creator_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can insert bot shares"
  ON bot_shares FOR INSERT
  TO authenticated
  WITH CHECK (follower_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Trading signals policies
CREATE POLICY "Anyone can view active signals"
  ON trading_signals FOR SELECT
  USING (status = 'active' OR creator_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Signal creator can update own signals"
  ON trading_signals FOR UPDATE
  TO authenticated
  USING (creator_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (creator_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can insert signals"
  ON trading_signals FOR INSERT
  TO authenticated
  WITH CHECK (creator_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Signal followers policies
CREATE POLICY "Users can view signal followers"
  ON signal_followers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert signal followers"
  ON signal_followers FOR INSERT
  TO authenticated
  WITH CHECK (follower_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- User trades policies
CREATE POLICY "Users can view own trades"
  ON user_trades FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own trades"
  ON user_trades FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own trades"
  ON user_trades FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Bot performance policies
CREATE POLICY "Users can view bot performance"
  ON bot_performance FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert bot performance"
  ON bot_performance FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own bot performance"
  ON bot_performance FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Favourite bots policies
CREATE POLICY "Users can view own favourites"
  ON favourite_bots FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert favourites"
  ON favourite_bots FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete favourites"
  ON favourite_bots FOR DELETE
  TO authenticated
  USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Insert default categories
INSERT INTO bot_categories (name, description, is_premium) VALUES
  ('Scalping', 'High-frequency trading bots', false),
  ('Trend Following', 'Trend-based trading strategies', false),
  ('Mean Reversion', 'Mean reversion based bots', false),
  ('Grid Trading', 'Grid trading strategies', false),
  ('Professional Signals', 'Premium signal providers', true),
  ('Expert Bots', 'Premium bot strategies', true)
ON CONFLICT DO NOTHING;
