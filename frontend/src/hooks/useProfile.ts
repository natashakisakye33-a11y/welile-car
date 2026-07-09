import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { API_URL } from '@/config';
import { fetchWithTimeout } from '@/lib/api';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email?: string;
  residence?: string;
  avatar_url?: string;
  passport_url?: string;
  national_id?: string;
  employment_status?: string;
  selected_car_name?: string | null;
  selected_car_image?: string | null;
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
  guarantor1Name?: string | null;
  guarantor1Phone?: string | null;
  guarantor1Email?: string | null;
  guarantor1IdUrl?: string | null;
  guarantor2Name?: string | null;
  guarantor2Phone?: string | null;
  guarantor2Email?: string | null;
  guarantor2IdUrl?: string | null;
}

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
        
        const profile: Profile = {
          id: me.id.toString(),
          user_id: me.id.toString(),
          name: me.name || '',
          phone: me.phone || '',
          residence: me.address || me.residence || '',
          avatar_url: me.avatarUrl || me.avatar_url || '',
          passport_url: me.passportUrl || me.passport_url || '',
          national_id: me.nationalId || me.national_id || '',
          employment_status: me.employmentStatus || me.employment_status || '',
          referral_code: '',
          referred_by: null,
          wallet_balance: summary?.savings?.totalSaved || 0,
          total_deposits: summary?.savings?.totalSaved || 0,
          deposits_this_month: 0,
          growth_earned: summary?.savings?.interestEarned || 0,
          last_deposit_date: null,
          last_growth_date: null,
          has_withdrawn_this_month: false,
          savings_locked: false,
          financing_unlocked: summary?.journey?.currentStep !== 'Saving',
          financing_status: summary?.vehicle ? 'active' : 'none',
          selected_car_id: summary?.vehicle ? summary.vehicle.id.toString() : null,
          selected_car_condition: summary?.vehicle?.selectedCondition || null,
          selected_car_price: summary?.vehicle?.selectedPrice || null,
          selected_car_name: summary?.vehicle ? `${summary.vehicle.make} ${summary.vehicle.model} (${summary.vehicle.year})` : null,
          selected_car_image: summary?.vehicle?.image || null,
          assigned_agent: null,
          flagged: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          guarantor1Name: me.guarantor1Name,
          guarantor1Phone: me.guarantor1Phone,
          guarantor1Email: me.guarantor1Email,
          guarantor1IdUrl: me.guarantor1IdUrl,
          guarantor2Name: me.guarantor2Name,
          guarantor2Phone: me.guarantor2Phone,
          guarantor2Email: me.guarantor2Email,
          guarantor2IdUrl: me.guarantor2IdUrl
        };
        
        return profile;
      } catch (err) {
        return null;
      }
    },
    enabled: !!user && !!token,
    refetchInterval: 3000,
  });
}

export function useUpdateProfile() {
  const { user, session } = useAuth();
  const token = session?.access_token;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Profile & { avatar_url?: string; passport_url?: string; national_id?: string; employment_status?: string; guarantor1Id_url?: string; guarantor2Id_url?: string }>) => {
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update profile');
      }

      return res.json();
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (carId: string) => {
      // Just mock UI state for now since there's no backend route 
      // but without storing mock profile data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useSelectCarDetails() {
  const { session } = useAuth();
  const token = session?.access_token;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ carId, condition, price }: { carId: string; condition: 'used' | 'new'; price: number }) => {
      if (!token) throw new Error('Not authenticated');

      const res = await fetchWithTimeout(`${API_URL}/users/select-vehicle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ vehicleId: carId, condition, price })
      });

      if (!res.ok) throw new Error('Failed to select vehicle');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });
}

export function useApplyGrowth() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      console.warn('Apply growth logic must run on backend. Mock logic removed.');
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
  const target = (profile.selected_car_price || 15000000) * 0.3;
  const percentage = Math.min(100, Math.round((profile.wallet_balance / target) * 100));
  return {
    target,
    progress: profile.wallet_balance,
    remaining: Math.max(0, target - profile.wallet_balance),
    percentage,
  };
}
