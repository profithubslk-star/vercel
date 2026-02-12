export const getCurrencyName = (currency: string): string => {
  const currencyNames: Record<string, string> = {
    'USD': 'US Dollar',
    'EUR': 'Euro',
    'GBP': 'British Pound',
    'AUD': 'Australian Dollar',
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'LTC': 'Litecoin',
    'UST': 'Tether TRC20',
    'USDT': 'Tether',
    'eUSDT': 'Tether ERC20',
    'tUSDT': 'Tether TRC20',
    'USDC': 'USD Coin',
    'DAI': 'Dai',
    'BUSD': 'Binance USD',
    'PAX': 'Paxos Standard',
    'TUSD': 'TrueUSD',
  };

  return currencyNames[currency] || currency;
};

export const formatBalance = (balance: number, currency: string): string => {
  if (currency === 'BTC' || currency === 'ETH' || currency === 'LTC') {
    return balance.toFixed(8);
  }
  return balance.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};
