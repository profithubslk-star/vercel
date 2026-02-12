import React, { useState } from 'react';
import { Upload, Zap, Target, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BotUploadModal } from '../components/BotUploadModal';
import { supabase } from '../lib/supabase';

export const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleBotUpload = async (botData: any) => {
    if (!profile) return;

    try {
      const { error } = await supabase.from('bots').insert({
        creator_id: profile.id,
        ...botData
      });

      if (error) throw error;
      setUploadModalOpen(false);
    } catch (error) {
      console.error('Failed to upload bot:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            Load or build your bot
          </h1>
          <p className="text-slate-400 text-lg mb-8">
            Import from your computer, build from scratch, or use the Entry Scanner.
          </p>

          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Search trading bots by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <BotOption
            icon={Upload}
            label="My computer"
            bgColor="bg-blue-900/50"
            iconColor="text-blue-400"
            onClick={() => setUploadModalOpen(true)}
          />
          <BotOption
            icon={Target}
            label="Entry Scanner"
            bgColor="bg-red-900/50"
            iconColor="text-red-400"
            onClick={() => {}}
          />
          <BotOption
            icon={Zap}
            label="Fast Trader"
            bgColor="bg-red-900/50"
            iconColor="text-red-400"
            onClick={() => {}}
          />
          <BotOption
            icon={Target}
            label="Best Strategy"
            bgColor="bg-red-900/50"
            iconColor="text-red-400"
            onClick={() => {}}
          />
        </div>
      </div>

      <BotUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleBotUpload}
      />
    </div>
  );
};

const BotOption: React.FC<{
  icon: React.ElementType;
  label: string;
  bgColor: string;
  iconColor: string;
  onClick: () => void;
}> = ({ icon: Icon, label, bgColor, iconColor, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center p-8 bg-slate-800 rounded-xl border-2 border-slate-700 hover:border-blue-500 hover:shadow-lg transition group"
  >
    <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
      <Icon className={iconColor} size={28} />
    </div>
    <span className="text-slate-300 font-medium">{label}</span>
  </button>
);
