import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, BarChart3, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const CopyTradingPage: React.FC = () => {
  const [followers, setFollowers] = useState<any[]>([]);
  const [myFollowing, setMyFollowing] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile) {
      loadCopyTradingData();
    }
  }, [profile]);

  const loadCopyTradingData = async () => {
    if (!profile) return;

    setIsLoading(true);

    const [followersRes, followingRes] = await Promise.all([
      supabase
        .from('bot_shares')
        .select('*, creator:profiles(display_name, total_followers)')
        .eq('follower_id', profile.id),
      supabase
        .from('bot_shares')
        .select('*, follower:profiles(display_name)')
        .eq('creator_id', profile.id)
    ]);

    setMyFollowing(followersRes.data || []);
    setFollowers(followingRes.data || []);
    setIsLoading(false);
  };

  const handleStopCopying = async (shareId: string) => {
    const { error } = await supabase
      .from('bot_shares')
      .delete()
      .eq('id', shareId);

    if (!error) {
      loadCopyTradingData();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Copy Trading</h1>
        <p className="text-slate-400">Copy trades from other professionals or share your trades</p>
      </div>

      <div className="flex gap-2">
        {(['followers', 'following'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {tab === 'followers' ? 'Your Traders' : 'Traders You Follow'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-slate-400">Loading...</p>
        </div>
      ) : activeTab === 'followers' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {followers.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
              <Users className="mx-auto mb-3 text-slate-500" size={48} />
              <p className="text-slate-400">No followers yet. Share great trades to get followers!</p>
            </div>
          ) : (
            followers.map((follower) => (
              <FollowerCard key={follower.id} follower={follower} />
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myFollowing.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
              <Copy className="mx-auto mb-3 text-slate-500" size={48} />
              <p className="text-slate-400">You're not following anyone yet. Find traders to copy!</p>
            </div>
          ) : (
            myFollowing.map((following) => (
              <FollowingCard
                key={following.id}
                following={following}
                onStop={() => handleStopCopying(following.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

const FollowerCard: React.FC<{ follower: any }> = ({ follower }) => (
  <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-blue-500 transition">
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="font-bold text-white">{follower.follower?.display_name}</h3>
        <p className="text-slate-400 text-sm">Copying your trades</p>
      </div>
      <Users className="text-blue-400" size={24} />
    </div>

    <div className="space-y-2 text-sm mb-4">
      <div className="flex justify-between">
        <span className="text-slate-400">Copy Amount</span>
        <span className="text-white font-semibold">{follower.allocation_percentage}%</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-400">Status</span>
        <span className="text-green-400 font-semibold">
          {follower.copy_trading_enabled ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>

    <button className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-semibold transition">
      Manage
    </button>
  </div>
);

const FollowingCard: React.FC<{ following: any; onStop: () => void }> = ({ following, onStop }) => (
  <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-blue-500 transition">
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="font-bold text-white">{following.creator?.display_name}</h3>
        <p className="text-slate-400 text-sm">{following.creator?.total_followers} followers</p>
      </div>
      <TrendingUp className="text-green-400" size={24} />
    </div>

    <div className="space-y-2 text-sm mb-4">
      <div className="flex justify-between">
        <span className="text-slate-400">Your Allocation</span>
        <span className="text-white font-semibold">{following.allocation_percentage}%</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-400">Status</span>
        <span className={`font-semibold ${following.copy_trading_enabled ? 'text-green-400' : 'text-red-400'}`}>
          {following.copy_trading_enabled ? 'Copying' : 'Stopped'}
        </span>
      </div>
    </div>

    <button
      onClick={onStop}
      className="w-full py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-lg text-sm font-semibold transition"
    >
      Stop Copying
    </button>
  </div>
);
