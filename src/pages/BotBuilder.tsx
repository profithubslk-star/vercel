import React, { useState } from 'react';
import { Save, Plus, X, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const BotBuilderPage: React.FC = () => {
  const { profile } = useAuth();
  const [botName, setBotName] = useState('');
  const [botDescription, setBotDescription] = useState('');
  const [strategy, setStrategy] = useState('');
  const [parameters, setParameters] = useState<{ key: string; value: string }[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const addParameter = () => {
    setParameters([...parameters, { key: '', value: '' }]);
  };

  const removeParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const updateParameter = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...parameters];
    updated[index][field] = val;
    setParameters(updated);
  };

  const handleSaveBot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!botName || !strategy) {
      setError('Bot name and strategy are required');
      return;
    }

    if (!profile) {
      setError('You must be logged in');
      return;
    }

    setIsLoading(true);

    try {
      const parametersObj = parameters.reduce((acc, param) => {
        if (param.key) {
          acc[param.key] = param.value || '';
        }
        return acc;
      }, {} as Record<string, string>);

      const { error: err } = await supabase.from('bots').insert({
        creator_id: profile.id,
        name: botName,
        description: botDescription,
        strategy_description: strategy,
        parameters: parametersObj,
        bot_type: 'builder_created',
        is_public: true,
        is_premium: isPremium
      });

      if (err) throw err;

      setSuccess('Bot created successfully!');
      setBotName('');
      setBotDescription('');
      setStrategy('');
      setParameters([]);
      setIsPremium(false);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create bot');
    } finally {
      setIsLoading(false);
    }
  };

  const strategyTemplates = [
    {
      name: 'Moving Average Crossover',
      description: 'Buy when fast MA crosses above slow MA'
    },
    {
      name: 'RSI Overbought/Oversold',
      description: 'Trade reversals based on RSI levels'
    },
    {
      name: 'Bollinger Band Bounce',
      description: 'Trade mean reversion around Bollinger Bands'
    },
    {
      name: 'MACD Signal Line',
      description: 'Trade based on MACD crossovers'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Bot Builder</h1>
        <p className="text-slate-400">Create custom trading bots with visual strategy builder</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSaveBot} className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Bot Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Bot Name
                  </label>
                  <input
                    type="text"
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    placeholder="My Custom Trading Bot"
                    className="input-field w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={botDescription}
                    onChange={(e) => setBotDescription(e.target.value)}
                    placeholder="Describe what your bot does..."
                    rows={3}
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isPremium}
                      onChange={(e) => setIsPremium(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-slate-300">Mark as Premium</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Trading Strategy</h2>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Strategy
                </label>
                <textarea
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  placeholder="Describe your trading strategy and rules..."
                  rows={5}
                  className="input-field w-full"
                  required
                />
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Parameters</h2>
                <button
                  type="button"
                  onClick={addParameter}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
                >
                  <Plus size={16} />
                  <span>Add Parameter</span>
                </button>
              </div>

              {parameters.length === 0 ? (
                <p className="text-slate-400 text-sm">No parameters added yet.</p>
              ) : (
                <div className="space-y-3">
                  {parameters.map((param, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={param.key}
                        onChange={(e) => updateParameter(index, 'key', e.target.value)}
                        placeholder="Parameter name"
                        className="input-field flex-1"
                      />
                      <input
                        type="text"
                        value={param.value}
                        onChange={(e) => updateParameter(index, 'value', e.target.value)}
                        placeholder="Default value"
                        className="input-field flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeParameter(index)}
                        className="p-2 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded transition"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center space-x-2 bg-red-900/20 border border-red-700/50 rounded-lg p-3">
                <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 bg-green-900/20 border border-green-700/50 rounded-lg p-3">
                <p className="text-green-300 text-sm">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 text-white rounded-lg font-semibold transition"
            >
              <Save size={20} />
              <span>{isLoading ? 'Creating Bot...' : 'Create Bot'}</span>
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="font-bold text-white mb-3">Strategy Templates</h3>
            <div className="space-y-2">
              {strategyTemplates.map((template) => (
                <button
                  key={template.name}
                  onClick={() => setStrategy(template.description)}
                  className="w-full p-3 text-left bg-slate-700 hover:bg-slate-600 rounded border border-slate-600 hover:border-blue-500 transition"
                >
                  <p className="font-semibold text-white text-sm">{template.name}</p>
                  <p className="text-slate-400 text-xs mt-1">{template.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="font-bold text-white mb-3">Quick Tips</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>• Define clear entry and exit rules</li>
              <li>• Set appropriate stop loss levels</li>
              <li>• Test your strategy on historical data</li>
              <li>• Adjust parameters based on market conditions</li>
              <li>• Monitor bot performance regularly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
