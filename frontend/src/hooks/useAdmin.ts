 
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import type { Profile } from './useProfile';
import { API_URL } from '@/config';
import { fetchWithTimeout } from '@/lib/api';

export type AdminProfile = Profile;
export type AdminTransaction = any;

export function useAllProfiles() {
  const { isAdmin, session } = useAuth();

  return useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const res = await fetchWithTimeout(`${API_URL}/admin/profiles`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      if (!res.ok) {
        console.error('Failed to fetch profiles', res.status);
        throw new Error('Failed to fetch profiles');
      }
      const data = await res.json();
      console.log('Profiles data:', data);
      return data.profiles;
    },
    enabled: isAdmin && !!session?.access_token,
  });
}

export function useAllTransactions() {
  const { isAdmin, isCfo, session } = useAuth();

  return useQuery({
    queryKey: ['admin-transactions'],
    queryFn: async () => {
      const res = await fetchWithTimeout(`${API_URL}/admin/transactions`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch transactions');
      const data = await res.json();
      return data.transactions;
    },
    enabled: (isAdmin || isCfo) && !!session?.access_token,
  });
}

export function useUserTransactions(userId: string | null) {
  const { data: allTxs } = useAllTransactions();
  
  return useQuery({
    queryKey: ['admin-transactions', userId],
    queryFn: async () => {
      if (!userId || !allTxs) return [];
      return allTxs.filter((tx: any) => tx.user_id === userId);
    },
    enabled: !!userId && !!allTxs,
  });
}

export function useAdminApproveFinancing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // Stubbed: updateMockProfileAdmin was removed
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
    },
  });
}

export function useAdminFlagUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, flagged }: { userId: string; flagged: boolean }) => {
      // Stubbed: updateMockProfileAdmin was removed
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
    },
  });
}

export function useAdminAssignAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, agent }: { userId: string; agent: string }) => {
      // Stubbed: updateMockProfileAdmin was removed
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
    },
  });
}

export interface CfoRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_phone: string;
  type: 'financing_approval' | 'unflag_request';
  status: 'pending' | 'approved' | 'rejected';
  details: string;
  requested_at: string;
  resolved_at?: string;
}

export function useCfoRequests() {
  const { isCfo, isAdmin } = useAuth();

  return useQuery({
    queryKey: ['cfo-requests'],
    queryFn: async () => {
      console.warn('CFO requests API not implemented yet. Mock logic removed.');
      return [] as CfoRequest[];
    },
    enabled: isCfo || isAdmin,
  });
}

export function useSubmitCfoRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, userName, userPhone, type, details }: { userId: string; userName: string; userPhone: string; type: 'financing_approval' | 'unflag_request'; details: string }) => {
      console.warn('Submit CFO request API not implemented yet.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cfo-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
    }
  });
}

export function useResolveCfoRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: 'approved' | 'rejected' }) => {
      console.warn('Resolve CFO request API not implemented yet.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cfo-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
    }
  });
}

export function usePendingDeposits() {
  const { isCfo, isAdmin, session } = useAuth();

  return useQuery({
    queryKey: ['admin-pending-deposits'],
    queryFn: async () => {
      if (!session?.access_token) return [];
      const res = await fetchWithTimeout(`${API_URL}/admin/deposits/pending`);
      if (!res.ok) throw new Error('Failed to fetch pending deposits');
      const data = await res.json();
      return data.deposits;
    },
    enabled: !!session?.access_token && (isCfo || isAdmin),
    refetchInterval: 5000,
  });
}

export function useApproveDeposit() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetchWithTimeout(`${API_URL}/admin/deposits/${id}/approve`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to approve deposit');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-deposits'] });
    }
  });
}

export function useRejectDeposit() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetchWithTimeout(`${API_URL}/admin/deposits/${id}/reject`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to reject deposit');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-deposits'] });
    }
  });
}

export function usePendingWithdrawals() {
  const { isCfo, isAdmin, session } = useAuth();

  return useQuery({
    queryKey: ['admin-pending-withdrawals'],
    queryFn: async () => {
      if (!session?.access_token) return [];
      const res = await fetchWithTimeout(`${API_URL}/admin/withdrawals/pending`);
      if (!res.ok) throw new Error('Failed to fetch pending withdrawals');
      const data = await res.json();
      return data.withdrawals;
    },
    enabled: !!session?.access_token && (isCfo || isAdmin),
    refetchInterval: 5000,
  });
}

export function useApproveWithdrawal() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetchWithTimeout(`${API_URL}/admin/withdrawals/${id}/approve`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to approve withdrawal');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-withdrawals'] });
    }
  });
}

export function useRejectWithdrawal() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetchWithTimeout(`${API_URL}/admin/withdrawals/${id}/reject`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to reject withdrawal');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-withdrawals'] });
    }
  });
}
