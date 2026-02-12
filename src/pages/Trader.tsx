import React, { useState, useEffect } from 'react';
import { TrendingUp, Volume2, Zap } from 'lucide-react';
import { getDerivWS, subscribeTicks } from '../services/deriv';

export const TraderPage: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('EURUSD');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [bid, setBid] = useState(0);
  const [ask, setAsk] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const setupWebSocket = async () => {
      try {
        await getDerivWS();
        setIsConnected(true);

        const subId = await subscribeTicks(selectedSymbol, (tick) => {
          setCurrentPrice(tick.tick.quote);
          setBid(tick.tick.bid);
          setAsk(tick.tick.ask);
        });

        return () => {
          // Cleanup subscription
        };
      } catch (error) {
        console.error('Failed to connect:', error);
        setIsConnected(false);
      }
    };

    setupWebSocket();
  }, [selectedSymbol]);

  const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'NZDUSD'];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">D Trader</h1>
        <p className="text-slate-400">Live trading interface powered by Deriv API</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-slate-400 text-sm mb-1">Current Symbol</p>
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedSymbol}
                    onChange={(e) => setSelectedSymbol(e.target.value)}
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {symbols.map((sym) => (
                      <option key={sym} value={sym}>
                        {sym}
                      </option>
                    ))}
                  </select>
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-slate-400">{isConnected ? 'Connected' : 'Disconnected'}</span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-white">{currentPrice.toFixed(5)}</p>
                <p className="text-slate-400 text-sm">Price</p>
              </div>
            </div>

            <div className="h-96 bg-slate-700 rounded-lg border border-slate-600 flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="mx-auto mb-3 text-slate-500" size={48} />
                <p className="text-slate-400">Chart loading...</p>
                <p className="text-slate-500 text-xs mt-2">Bid: {bid.toFixed(5)} | Ask: {ask.toFixed(5)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="font-bold text-white mb-4">Trade</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 text-xs mb-1">Amount</label>
                <input
                  type="number"
                  placeholder="100"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1">Duration</label>
                <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500">
                  <option>1 minute</option>
                  <option>5 minutes</option>
                  <option>15 minutes</option>
                  <option>1 hour</option>
                </select>
              </div>

              <button className="w-full py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded font-semibold text-sm transition">
                CALL
              </button>

              <button className="w-full py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded font-semibold text-sm transition">
                PUT
              </button>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="font-bold text-white mb-3">Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Today Win Rate</span>
                <span className="text-green-400">65%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Trades</span>
                <span className="text-white">12</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Profit/Loss</span>
                <span className="text-green-400">+$150</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
