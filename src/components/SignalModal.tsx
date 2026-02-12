import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SignalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
}

export const SignalModal: React.FC<SignalModalProps> = ({ isOpen, onClose, onCreate }) => {
  const { profile } = useAuth();
  const [signalType, setSignalType] = useState<'buy' | 'sell'>('buy');
  const [asset, setAsset] = useState('EURUSD');
  const [entryPrice, setEntryPrice] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState(75);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!profile) {
      setError('You must be logged in');
      return;
    }

    if (!entryPrice || !takeProfit || !stopLoss) {
      setError('Please fill in all price fields');
      return;
    }

    setIsLoading(true);

    try {
      const { error: err } = await supabase.from('trading_signals').insert({
        creator_id: profile.id,
        signal_type: signalType,
        asset,
        entry_price: parseFloat(entryPrice),
        take_profit: parseFloat(takeProfit),
        stop_loss: parseFloat(stopLoss),
        confidence_level: confidenceLevel,
        description,
        status: 'active'
      });

      if (err) throw err;

      setAsset('EURUSD');
      setEntryPrice('');
      setTakeProfit('');
      setStopLoss('');
      setDescription('');
      setConfidenceLevel(75);
      onCreate();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create signal');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const assets = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'NZDUSD', 'BTC', 'ETH', 'GOLD'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Create Trading Signal</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded transition"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Signal Type
            </label>
            <div className="flex gap-3">
              {(['buy', 'sell'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSignalType(type)}
                  className={`flex-1 py-2 rounded-lg font-semibold transition ${
                    signalType === type
                      ? type === 'buy'
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Asset
            </label>
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {assets.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Entry Price
            </label>
            <input
              type="number"
              step="0.0001"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              placeholder="0.0000"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Take Profit
              </label>
              <input
                type="number"
                step="0.0001"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                placeholder="0.0000"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Stop Loss
              </label>
              <input
                type="number"
                step="0.0001"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                placeholder="0.0000"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Confidence Level: {confidenceLevel}%
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={confidenceLevel}
              onChange={(e) => setConfidenceLevel(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your signal reasoning..."
              rows={3}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 bg-red-900/20 border border-red-700/50 rounded-lg p-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition font-medium"
            >
              {isLoading ? 'Creating...' : 'Create Signal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
