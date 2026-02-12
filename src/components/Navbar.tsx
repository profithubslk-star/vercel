import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from '../hooks/useNavigate';
import { getCurrencyName, formatBalance } from '../utils/currency';
import logo from '../assets/red_logo_+_blue_letters.png';

export const Navbar: React.FC<{ currentPage: string; setCurrentPage: (page: string) => void }> = ({
  currentPage,
  setCurrentPage
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { user, profile, signOut, accountBalance, accountList, currentAccount, deriveData, switchAccount } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = () => setAccountMenuOpen(false);
    if (accountMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [accountMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    setCurrentPage('home');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'trader', label: 'D Trader' },
    { id: 'bots', label: 'Bots' },
    { id: 'bot-builder', label: 'Bot Builder' },
    { id: 'signals', label: 'Signals' },
    { id: 'copy-trading', label: 'Copy Trading' },
    { id: 'charts', label: 'Charts' },
    { id: 'reports', label: 'Reports' }
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <img
              src={logo}
              alt="ProfitHub"
              className="h-6 cursor-pointer hover:opacity-80 transition"
              onClick={() => setCurrentPage('dashboard')}
            />
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  currentPage === item.id
                    ? 'bg-red-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user && profile ? (
              <>
                {accountBalance && (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAccountMenuOpen(!accountMenuOpen);
                      }}
                      className="flex items-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 hover:border-slate-600 transition"
                    >
                      <div className="text-left">
                        <div className="text-sm font-semibold text-white">
                          {formatBalance(accountBalance.balance, accountBalance.currency)} {accountBalance.currency}
                        </div>
                        <div className="text-xs text-slate-400">
                          {getCurrencyName(accountBalance.currency)} {deriveData?.is_virtual ? '(Demo)' : ''}
                        </div>
                      </div>
                      <ChevronDown size={16} className="text-slate-400" />
                    </button>

                    {accountMenuOpen && accountList.length > 0 && (
                      <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
                        <div className="p-2">
                          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase">
                            Switch Account
                          </div>
                          {accountList.map((account: any) => (
                            <button
                              key={account.loginid}
                              onClick={async () => {
                                if (account.loginid !== deriveData?.loginid) {
                                  await switchAccount(account.loginid);
                                }
                                setAccountMenuOpen(false);
                              }}
                              className={`w-full px-3 py-2 text-left rounded-lg transition ${
                                account.loginid === deriveData?.loginid
                                  ? 'bg-blue-600 text-white'
                                  : 'hover:bg-slate-700 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="text-sm font-medium">
                                    {getCurrencyName(account.currency)}
                                  </div>
                                  <div className="text-xs opacity-75">
                                    {account.loginid} • {account.is_virtual ? 'Demo' : 'Real'}
                                  </div>
                                </div>
                                {account.loginid === deriveData?.loginid && (
                                  <span className="text-xs ml-2">✓</span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-2 text-sm text-slate-300">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-blue-600 flex items-center justify-center text-white font-bold">
                    {profile?.display_name?.charAt(0) || deriveData?.email?.charAt(0) || 'U'}
                  </div>
                  <span>{profile?.display_name || deriveData?.email || user?.email}</span>
                </div>
                <button
                  onClick={() => setCurrentPage('settings')}
                  className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                >
                  <Settings size={20} />
                </button>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : null}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-slate-200"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 py-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                  currentPage === item.id
                    ? 'bg-red-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
            {user && (
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                Sign Out
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
