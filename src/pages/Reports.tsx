import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const ReportsPage: React.FC = () => {
  const [trades, setTrades] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    totalProfit: 0,
    winRate: 0
  });
  const [period, setPeriod] = useState('7days');
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile) {
      loadReports();
    }
  }, [profile, period]);

  const loadReports = async () => {
    if (!profile) return;

    setIsLoading(true);

    const { data: tradesData } = await supabase
      .from('user_trades')
      .select('*')
      .eq('user_id', profile.id)
      .eq('status', 'closed')
      .order('exit_time', { ascending: false });

    setTrades(tradesData || []);

    const totalTrades = tradesData?.length || 0;
    const winningTrades = tradesData?.filter((t) => (t.profit_loss || 0) > 0).length || 0;
    const losingTrades = totalTrades - winningTrades;
    const totalProfit = tradesData?.reduce((sum, t) => sum + (t.profit_loss || 0), 0) || 0;

    setStats({
      totalTrades,
      winningTrades,
      losingTrades,
      totalProfit,
      winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
    });

    setIsLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Trading Reports</h1>
          <p className="text-slate-400">Analyze your trading performance</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="alltime">All Time</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <ReportCard
          icon={BarChart3}
          label="Total Trades"
          value={stats.totalTrades}
          color="blue"
        />
        <ReportCard
          icon={TrendingUp}
          label="Winning Trades"
          value={stats.winningTrades}
          color="green"
        />
        <ReportCard
          icon={TrendingDown}
          label="Losing Trades"
          value={stats.losingTrades}
          color="red"
        />
        <ReportCard
          icon={DollarSign}
          label="Total P/L"
          value={`$${stats.totalProfit.toFixed(2)}`}
          color={stats.totalProfit > 0 ? 'green' : 'red'}
        />
        <ReportCard
          icon={BarChart3}
          label="Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
          color="purple"
        />
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Trade History</h2>
        </div>

        {isLoading ? (
          <div className="p-6 text-center">
            <p className="text-slate-400">Loading trades...</p>
          </div>
        ) : trades.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-slate-400">No closed trades yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-700/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Asset</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Entry</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Exit</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Profit/Loss</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Return</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr
                    key={trade.id}
                    className="border-b border-slate-700 hover:bg-slate-700/50 transition"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-white">{trade.asset}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      <span className="px-2 py-1 bg-slate-700 rounded text-xs capitalize">
                        {trade.trade_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white">${trade.entry_price}</td>
                    <td className="px-6 py-4 text-sm text-white">${trade.exit_price}</td>
                    <td className="px-6 py-4 text-sm text-white">{trade.quantity}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`font-semibold ${trade.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {trade.profit_loss >= 0 ? '+' : ''}${trade.profit_loss}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`font-semibold ${trade.profit_loss_percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {trade.profit_loss_percentage >= 0 ? '+' : ''}
                        {trade.profit_loss_percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const ReportCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}> = ({ icon: Icon, label, value, color }) => {
  const colorMap = {
    blue: 'bg-blue-900/20 text-blue-400',
    green: 'bg-green-900/20 text-green-400',
    red: 'bg-red-900/20 text-red-400',
    purple: 'bg-purple-900/20 text-purple-400'
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorMap[color as keyof typeof colorMap]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};
