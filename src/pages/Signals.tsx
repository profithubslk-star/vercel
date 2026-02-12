import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Eye, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { SignalModal } from '../components/SignalModal';

export const SignalsPage: React.FC = () => {
  const [signals, setSignals] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    loadSignals();
    const interval = setInterval(loadSignals, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadSignals = async () => {
    const { data } = await supabase
      .from('trading_signals')
      .select('*, creator:profiles(display_name)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    setSignals(data || []);
    setIsLoading(false);
  };

  const handleFollowSignal = async (signalId: string) => {
    if (!profile) return;

    const { error } = await supabase.from('signal_followers').insert({
      signal_id: signalId,
      follower_id: profile.id
    });

    if (!error) {
      loadSignals();
      alert('Signal followed!');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Trading Signals</h1>
          <p className="text-slate-400">Live signals from professional traders</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition"
        >
          <Plus size={20} />
          <span>Create Signal</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-slate-400">Loading signals...</p>
        </div>
      ) : signals.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-slate-400">No active signals. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {signals.map((signal) => (
            <SignalCard
              key={signal.id}
              signal={signal}
              onFollow={() => handleFollowSignal(signal.id)}
            />
          ))}
        </div>
      )}

      <SignalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={() => {
          setIsModalOpen(false);
          loadSignals();
        }}
      />
    </div>
  );
};

const SignalCard: React.FC<{ signal: any; onFollow: () => void }> = ({ signal, onFollow }) => {
  const isLong = signal.signal_type === 'buy';
  const Icon = isLong ? TrendingUp : TrendingDown;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-blue-500 transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${isLong ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
            <Icon className={isLong ? 'text-green-400' : 'text-red-400'} size={24} />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{signal.asset}</h3>
            <p className="text-slate-400 text-sm">by {signal.creator?.display_name}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${signal.confidence_level > 75 ? 'text-green-400' : 'text-yellow-400'}`}>
            {signal.confidence_level}%
          </div>
          <p className="text-slate-400 text-xs">Confidence</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-700 rounded p-2">
          <p className="text-slate-500 text-xs">Entry</p>
          <p className="text-white font-semibold">${signal.entry_price}</p>
        </div>
        <div className="bg-slate-700 rounded p-2">
          <p className="text-slate-500 text-xs">Take Profit</p>
          <p className="text-green-400 font-semibold">${signal.take_profit}</p>
        </div>
        <div className="bg-slate-700 rounded p-2">
          <p className="text-slate-500 text-xs">Stop Loss</p>
          <p className="text-red-400 font-semibold">${signal.stop_loss}</p>
        </div>
      </div>

      <p className="text-slate-300 text-sm mb-4">{signal.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-slate-400 text-sm">
          <Eye size={16} />
          <span>{signal.followers_count || 0} followers</span>
        </div>
        <button
          onClick={onFollow}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
        >
          Follow Signal
        </button>
      </div>
    </div>
  );
};
