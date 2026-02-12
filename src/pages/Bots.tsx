import React, { useState, useEffect } from 'react';
import { Star, Users, TrendingUp, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const BotsPage: React.FC = () => {
  const [bots, setBots] = useState<any[]>([]);
  const [filteredBots, setFilteredBots] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    loadCategories();
    loadBots();
  }, []);

  useEffect(() => {
    filterBots();
  }, [selectedCategory, searchQuery, bots]);

  const loadCategories = async () => {
    const { data } = await supabase.from('bot_categories').select('*');
    setCategories(data || []);
  };

  const loadBots = async () => {
    setIsLoading(true);

    const { data } = await supabase
      .from('bots')
      .select('*')
      .eq('is_public', true)
      .order('total_users', { ascending: false });

    setBots(data || []);
    setIsLoading(false);
  };

  const filterBots = () => {
    let filtered = bots;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((bot) => {
        const cat = categories.find((c) => c.id === bot.category_id);
        return cat?.name === selectedCategory;
      });
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (bot) =>
          bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bot.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredBots(filtered);
  };

  const handleUsageBot = async (botId: string) => {
    if (!profile) return;

    const { error } = await supabase.from('bot_shares').insert({
      bot_id: botId,
      follower_id: profile.id,
      creator_id: bots.find((b) => b.id === botId)?.creator_id
    });

    if (!error) {
      alert('Bot added to your portfolio!');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Trading Bots</h1>
        <p className="text-slate-400">Discover and use trading bots from our community</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bots..."
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2">
          <Filter size={18} className="text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-transparent text-white focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-slate-400">Loading bots...</p>
        </div>
      ) : filteredBots.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-slate-400">No bots found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBots.map((bot) => (
            <BotCard
              key={bot.id}
              bot={bot}
              onUse={() => handleUsageBot(bot.id)}
              isFavorite={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const BotCard: React.FC<{ bot: any; onUse: () => void; isFavorite: boolean }> = ({
  bot,
  onUse,
  isFavorite
}) => (
  <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-blue-500 transition hover:shadow-lg hover:shadow-blue-500/10">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <h3 className="font-bold text-white text-lg">{bot.name}</h3>
        <p className="text-slate-400 text-xs">{bot.bot_type === 'uploaded_xml' ? 'XML Bot' : 'Custom Bot'}</p>
      </div>
      <button className="p-2 hover:bg-slate-700 rounded transition">
        <Star size={18} className={isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-slate-500'} />
      </button>
    </div>

    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{bot.description}</p>

    <div className="grid grid-cols-2 gap-2 mb-4">
      <div className="bg-slate-700 rounded p-2">
        <p className="text-slate-500 text-xs">Win Rate</p>
        <p className="text-white font-bold">{bot.win_rate || 0}%</p>
      </div>
      <div className="bg-slate-700 rounded p-2">
        <p className="text-slate-500 text-xs">Avg Return</p>
        <p className={`font-bold ${bot.average_profit_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {bot.average_profit_loss > 0 ? '+' : ''}{bot.average_profit_loss || 0}%
        </p>
      </div>
    </div>

    <div className="flex items-center space-x-3 mb-4">
      <div className="flex items-center space-x-1 text-slate-400 text-sm">
        <Users size={16} />
        <span>{bot.total_users || 0} users</span>
      </div>
      {bot.is_premium && (
        <span className="px-2 py-1 bg-yellow-900/30 text-yellow-300 text-xs rounded font-medium">
          Premium
        </span>
      )}
    </div>

    <button
      onClick={onUse}
      className="w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition transform hover:scale-105 active:scale-95"
    >
      Use Bot
    </button>
  </div>
);
