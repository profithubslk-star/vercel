import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const AuthCallbackPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { authorizeDeriv } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const accounts = params.get('acct1');
        const token1 = params.get('token1');

        if (!accounts || !token1) {
          setError('No authorization data received from Deriv');
          return;
        }

        await authorizeDeriv(token1);
        window.location.hash = '#dashboard';
      } catch (err: any) {
        setError(err.message || 'Failed to complete authorization');
      }
    };

    handleCallback();
  }, [authorizeDeriv]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-red-500 mb-4">Authorization Failed</div>
            <p className="text-slate-300">{error}</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 border-4 border-slate-700 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300">Completing authorization...</p>
          </>
        )}
      </div>
    </div>
  );
};
