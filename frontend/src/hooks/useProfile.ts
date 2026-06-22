import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { API_URL } from '@/config';
import { fetchWithTimeout } from '@/lib/api';

// Mock Profile type
export interface Profile {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  avatar_url?: string;
  referral_code: string;
  referred_by: string | null;
  wallet_balance: number;
  total_deposits: number;
  deposits_this_month: number;
  growth_earned: number;
  last_deposit_date: string | null;
  last_growth_date: string | null;
  has_withdrawn_this_month: boolean;
  savings_locked: boolean;
  financing_unlocked: boolean;
  financing_status: string;
  selected_car_id: string | null;
  selected_car_condition?: 'used' | 'new' | null;
  selected_car_price?: number | null;
  assigned_agent: string | null;
  flagged: boolean;
  created_at: string;
  updated_at: string;
}

export const CARS = [
  { id: 'wish', name: 'Toyota Wish', price: 10000000, image: '/cars/wish.jpg' },
  { id: 'premio', name: 'Toyota Premio', price: 12000000, image: '/cars/premio.jpg' },
  { id: 'vitz', name: 'Toyota Vitz', price: 8000000, image: '/cars/vitz.jpg' },
];

const getMockProfile = (userId: string): Profile => {
  const stored = localStorage.getItem(`mockProfile_${userId}`);
  if (stored) return JSON.parse(stored);
  
  let name = 'John Doe';
  let phone = '+256 700 123 456';
  let avatar_url = '';
  const storedUser = localStorage.getItem('mockUser');
  if (storedUser) {
    try {
      const u = JSON.parse(storedUser);
      if (u.user_metadata?.name) name = u.user_metadata.name;
      if (u.user_metadata?.phone) phone = u.user_metadata.phone;
      if (u.user_metadata?.avatar_url) avatar_url = u.user_metadata.avatar_url;
    } catch (e) {
      console.error(e);
    }
  }
  
  const initial: Profile = {
    id: `prof_${userId}`,
    user_id: userId,
    name,
    phone,
    avatar_url,
    referral_code: 'ref123',
    referred_by: null,
    wallet_balance: 0,
    total_deposits: 0,
    deposits_this_month: 0,
    growth_earned: 0,
    last_deposit_date: null,
    last_growth_date: null,
    has_withdrawn_this_month: false,
    savings_locked: false,
    financing_unlocked: false,
    financing_status: 'none',
    selected_car_id: null,
    selected_car_condition: null,
    selected_car_price: null,
    assigned_agent: null,
    flagged: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  localStorage.setItem(`mockProfile_${userId}`, JSON.stringify(initial));
  return initial;
};

const updateMockProfile = (userId: string, updates: Partial<Profile>) => {
  const profile = getMockProfile(userId);
  const updated = { ...profile, ...updates, updated_at: new Date().toISOString() };
  localStorage.setItem(`mockProfile_${userId}`, JSON.stringify(updated));
  return updated;
};

const getMockTransactions = (userId: string) => {
  const stored = localStorage.getItem(`mockTx_${userId}`);
  return stored ? JSON.parse(stored) : [];
};

const addMockTransaction = (userId: string, tx: any) => {
  const txs = getMockTransactions(userId);
  const newTx = { ...tx, id: `tx_${Date.now()}`, user_id: userId, created_at: new Date().toISOString() };
  localStorage.setItem(`mockTx_${userId}`, JSON.stringify([newTx, ...txs]));
  return newTx;
};

export function useProfile() {
  const { user, session } = useAuth();
  const token = session?.access_token;

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user || !token) return null;
      
      try {
        const [meRes, summaryRes] = await Promise.all([
          fetchWithTimeout(`${API_URL}/users/me`),
          fetchWithTimeout(`${API_URL}/dashboard/summary`)
        ]);
        
        if (!meRes.ok || !summaryRes.ok) throw new Error('Failed to fetch profile data');
        
        const me = await meRes.json();
        const summary = await summaryRes.json();
        
        const mockP = getMockProfile(me.id.toString());
        const localCarId = localStorage.getItem('mockPurchasedCarId') || mockP.selected_car_id || localStorage.getItem('selectedCarId');
        
        const profile: Profile = {
          id: me.id.toString(),
          user_id: me.id.toString(),
          name: me.name,
          phone: me.phone || '',
          avatar_url: '',
          referral_code: '',
          referred_by: null,
          wallet_balance: summary.savings.totalSaved,
          total_deposits: summary.savings.totalSaved,
          deposits_this_month: 0,
          growth_earned: summary.savings.interestEarned,
          last_deposit_date: null,
          last_growth_date: null,
          has_withdrawn_this_month: false,
          savings_locked: false,
          financing_unlocked: summary.journey.currentStep !== 'Saving',
          financing_status: summary.vehicle ? 'active' : 'none',
          selected_car_id: summary.vehicle ? summary.vehicle.id.toString() : localCarId,
          assigned_agent: null,
          flagged: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        return profile;
      } catch (err) {
        console.error(err);
        return null;
      }
    },
    enabled: !!user && !!token,
    refetchInterval: 3000, // Refetch every 3 seconds to catch deposit webhook updates
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Profile & { avatar_url?: string }>) => {
      if (!user) throw new Error('Not authenticated');
      
      const updated = updateMockProfile(user.id, updates);
      
      // Update mockUser storage to keep user_metadata sync
      const storedUser = localStorage.getItem('mockUser');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          parsed.user_metadata = {
            ...parsed.user_metadata,
            ...updates
          };
          localStorage.setItem('mockUser', JSON.stringify(parsed));
        } catch (e) {
          console.error(e);
        }
      }
      
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useTransactions() {
  const { user, session } = useAuth();
  const token = session?.access_token;

  return useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user || !token) return [];
      const res = await fetchWithTimeout(`${API_URL}/transactions/history`);
      if (!res.ok) throw new Error('Failed to fetch transactions');
      const data = await res.json();
      
      // Map DB transactions to UI transactions
      return data.transactions.map((tx: any) => ({
        id: tx.id.toString(),
        user_id: user.id.toString(),
        type: tx.type === 'DEPOSIT' ? 'deposit' : tx.type,
        amount: tx.amount,
        method: 'system',
        created_at: tx.date
      }));
    },
    enabled: !!user && !!token,
  });
}

export function useDeposit() {
  const { user, session } = useAuth();
  const token = session?.access_token;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, method, transactionId, transactionTime, transactionDate }: { amount: number; method: string; transactionId: string; transactionTime: string; transactionDate: string }) => {
      if (!user || !token) throw new Error('Not authenticated');

      const res = await fetchWithTimeout(`${API_URL}/transactions/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, method, transactionId, transactionTime, transactionDate })
      });

      if (!res.ok) {
        throw new Error('Failed to deposit');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });
}

export function useWithdraw() {
  const { user, session } = useAuth();
  const token = session?.access_token;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, method, withdrawalPhone, withdrawalName, withdrawalBank, withdrawalAccount }: { amount: number; method: string; withdrawalPhone?: string; withdrawalName?: string; withdrawalBank?: string; withdrawalAccount?: string }) => {
      if (!user || !token) throw new Error('Not authenticated');

      const res = await fetchWithTimeout(`${API_URL}/transactions/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, method, withdrawalPhone, withdrawalName, withdrawalBank, withdrawalAccount })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to withdraw');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });
}

export function usePayFromWallet() {
  const { user, session } = useAuth();
  const token = session?.access_token;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, reason }: { amount: number; reason?: string }) => {
      if (!user || !token) throw new Error('Not authenticated');

      const res = await fetchWithTimeout(`${API_URL}/transactions/pay-from-wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, reason })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to process wallet payment');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });
}

export function useSelectCar() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (carId: string) => {
      localStorage.setItem('selectedCarId', carId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useSelectCarDetails() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ carId, condition, price }: { carId: string; condition: 'used' | 'new'; price: number }) => {
      if (!user) throw new Error('Not authenticated');
      updateMockProfile(user.id, { 
        selected_car_id: carId,
        selected_car_condition: condition,
        selected_car_price: price
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useApplyGrowth() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const profile = getMockProfile(user.id);
      if (profile.wallet_balance === 0 || profile.savings_locked) return;

      const baseRate = 0.02;
      const bonusRate = (!profile.has_withdrawn_this_month && profile.deposits_this_month >= 4) ? 0.03 : 0;
      const rate = baseRate + bonusRate;
      const growth = Math.round(profile.wallet_balance * rate);

      addMockTransaction(user.id, { type: 'growth', amount: growth, method: 'system' });

      updateMockProfile(user.id, {
        wallet_balance: profile.wallet_balance + growth,
        growth_earned: profile.growth_earned + growth,
        last_growth_date: new Date().toISOString(),
        deposits_this_month: 0,
        has_withdrawn_this_month: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useRequestFinancing() {
  const { user, session } = useAuth();
  const token = session?.access_token;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ carId, carName, carPrice, requestedAmount }: { carId: string, carName: string, carPrice: number, requestedAmount: number }) => {
      if (!user || !token) throw new Error('Not authenticated');
      
      const res = await fetchWithTimeout(`${API_URL}/loans/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ carId, carName, carPrice, requestedAmount })
      });

      if (!res.ok) {
        throw new Error('Failed to submit loan application');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });
}

export function useGetProgress(profile: Profile | null | undefined) {
  if (!profile || !profile.selected_car_id) return null;
  const car = CARS.find(c => c.id === profile.selected_car_id);
  if (!car) return null;
  const target = (profile.selected_car_price || car.price) * 0.3;
  const percentage = Math.min(100, Math.round((profile.wallet_balance / target) * 100));
  return {
    target,
    progress: profile.wallet_balance,
    remaining: Math.max(0, target - profile.wallet_balance),
    percentage,
  };
}
