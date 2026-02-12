import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: any;
  profile: any;
  isLoading: boolean;
  deriveData: any;
  accountBalance: any;
  accountList: any[];
  currentAccount: any;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  authorizeDeriv: (token: string) => Promise<void>;
  fetchAccountBalance: () => Promise<void>;
  fetchAccountList: () => Promise<void>;
  switchAccount: (loginid: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [deriveData, setDeriveData] = useState(null);
  const [accountBalance, setAccountBalance] = useState<any>(null);
  const [accountList, setAccountList] = useState<any[]>([]);
  const [currentAccount, setCurrentAccount] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user || null);

      if (data.session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.session.user.id)
          .maybeSingle();

        setProfile(profileData);
      }

      setIsLoading(false);
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (!profileData && event === 'SIGNED_IN') {
            await supabase.from('profiles').insert({
              user_id: session.user.id,
              deriv_email: session.user.email
            });

            const { data: newProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();

            setProfile(newProfile);
          } else {
            setProfile(profileData);
          }
        } else {
          setProfile(null);
          setDeriveData(null);
        }
      })();
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const loadAccountData = async () => {
      if (profile?.deriv_api_token) {
        if (!deriveData) {
          try {
            const { authorize } = (await import('../services/deriv')) as any;
            const response = await authorize(profile.deriv_api_token);
            if (response.authorize) {
              setDeriveData(response.authorize);
            }
          } catch (error) {
            console.error('Failed to auto-authorize with saved token:', error);
          }
        } else {
          try {
            const { getAccountBalance, getAccountList } = (await import('../services/deriv')) as any;

            const balanceResponse = await getAccountBalance();
            if (balanceResponse.balance) {
              setAccountBalance(balanceResponse.balance);
            }

            const accountsResponse = await getAccountList();
            if (accountsResponse.account_list) {
              setAccountList(accountsResponse.account_list);
              const current = accountsResponse.account_list.find((acc: any) => acc.loginid === deriveData?.loginid);
              setCurrentAccount(current);
            }
          } catch (error) {
            console.error('Failed to load account data:', error);
          }
        }
      }
    };

    loadAccountData();
  }, [profile?.deriv_api_token, deriveData?.loginid]);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const authorizeDeriv = async (token: string) => {
    try {
      const { authorize } = (await import('../services/deriv')) as any;
      const data = await authorize(token);

      if (!data || !data.authorize) {
        throw new Error('Invalid response from Deriv API');
      }

      setDeriveData(data.authorize);

      // If no Supabase session exists, create one using Deriv credentials
      if (!session) {
        // Create a deterministic password based on the Deriv user_id
        // This allows returning users to log in automatically
        const derivPassword = `DerivProfitHub_${data.authorize.user_id}_SecureKey2024`;

        // Try to sign in first
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.authorize.email,
          password: derivPassword
        });

        // If sign in fails, create a new account
        if (signInError) {
          const { error: signUpError } = await supabase.auth.signUp({
            email: data.authorize.email,
            password: derivPassword,
            options: {
              data: {
                deriv_account_id: String(data.authorize.user_id),
                deriv_email: data.authorize.email
              }
            }
          });

          if (signUpError) {
            throw new Error(signUpError.message || 'Failed to create account');
          }
        }

        // Wait for the session to be established
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Refresh session
        const { data: sessionData } = await supabase.auth.getSession();
        setSession(sessionData.session);
        setUser(sessionData.session?.user || null);
      }

      // Get current session
      const { data: currentSession } = await supabase.auth.getSession();
      const userId = currentSession.session?.user?.id;

      if (userId) {
        // First check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (existingProfile) {
          // Update existing profile
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              deriv_account_id: String(data.authorize.user_id),
              deriv_email: data.authorize.email,
              deriv_api_token: token
            })
            .eq('id', existingProfile.id);

          if (updateError) {
            console.error('Error updating profile:', updateError);
          }

          setProfile({
            ...existingProfile,
            deriv_account_id: String(data.authorize.user_id),
            deriv_email: data.authorize.email,
            deriv_api_token: token
          });
        } else {
          // Create new profile
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              user_id: userId,
              deriv_account_id: String(data.authorize.user_id),
              deriv_email: data.authorize.email,
              deriv_api_token: token
            });

          if (insertError) {
            console.error('Error creating profile:', insertError);
            throw new Error('Failed to create user profile');
          }

          const { data: newProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

          setProfile(newProfile);
        }
      } else {
        throw new Error('Failed to establish session');
      }
    } catch (error: any) {
      console.error('Failed to authorize with Deriv:', error);
      setDeriveData(null);
      throw new Error(error.message || 'Failed to connect to Deriv. Please check your API token and try again.');
    }
  };

  const fetchAccountBalance = async () => {
    try {
      const { getAccountBalance } = (await import('../services/deriv')) as any;
      const response = await getAccountBalance();
      if (response.balance) {
        setAccountBalance(response.balance);
      }
    } catch (error) {
      console.error('Failed to fetch account balance:', error);
    }
  };

  const fetchAccountList = async () => {
    try {
      const { getAccountList } = (await import('../services/deriv')) as any;
      const response = await getAccountList();
      if (response.account_list) {
        setAccountList(response.account_list);
        const current = response.account_list.find((acc: any) => acc.loginid === deriveData?.loginid);
        setCurrentAccount(current);
      }
    } catch (error) {
      console.error('Failed to fetch account list:', error);
    }
  };

  const switchAccountHandler = async (loginid: string) => {
    try {
      const { switchAccount, authorize } = (await import('../services/deriv')) as any;

      if (!profile?.deriv_api_token) {
        throw new Error('No API token found');
      }

      await switchAccount(loginid);
      const response = await authorize(profile.deriv_api_token);

      if (response.authorize) {
        setDeriveData(response.authorize);
      }
    } catch (error) {
      console.error('Failed to switch account:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        deriveData,
        accountBalance,
        accountList,
        currentAccount,
        signUp,
        signIn,
        signOut,
        authorizeDeriv,
        fetchAccountBalance,
        fetchAccountList,
        switchAccount: switchAccountHandler
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
