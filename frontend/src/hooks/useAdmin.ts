/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import type { Profile } from './useProfile';
import { API_URL } from '@/config';
import { fetchWithTimeout } from '@/lib/api';

export type AdminProfile = Profile;
export type AdminTransaction = any;

const MOCK_PROFILES_DATA = [
  {
    id: "prof_user1",
    user_id: "user1",
    name: "Welile Kisa",
    phone: "+256 701 234 567",
    referral_code: "WELI99",
    referred_by: null,
    wallet_balance: 3000000,
    total_deposits: 3000000,
    deposits_this_month: 3,
    growth_earned: 150000,
    last_deposit_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    last_growth_date: null,
    has_withdrawn_this_month: false,
    savings_locked: false,
    financing_unlocked: false,
    financing_status: "none",
    selected_car_id: "vitz",
    assigned_agent: null,
    flagged: false,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "prof_user2",
    user_id: "user2",
    name: "Natasha Kisakye",
    phone: "+256 772 345 678",
    referral_code: "NATA88",
    referred_by: "WELI99",
    wallet_balance: 7800000,
    total_deposits: 7500000,
    deposits_this_month: 5,
    growth_earned: 300000,
    last_deposit_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    last_growth_date: null,
    has_withdrawn_this_month: false,
    savings_locked: false,
    financing_unlocked: false,
    financing_status: "none",
    selected_car_id: "premio",
    assigned_agent: null,
    flagged: false,
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "prof_user3",
    user_id: "user3",
    name: "John Mukasa",
    phone: "+256 752 987 654",
    referral_code: "JOHN77",
    referred_by: null,
    wallet_balance: 10500000,
    total_deposits: 10000000,
    deposits_this_month: 8,
    growth_earned: 500000,
    last_deposit_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    last_growth_date: null,
    has_withdrawn_this_month: false,
    savings_locked: true,
    financing_unlocked: true,
    financing_status: "approved",
    selected_car_id: "noah",
    assigned_agent: "Agent Brian",
    flagged: false,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "prof_user4",
    user_id: "user4",
    name: "Sarah Nsubuga",
    phone: "+256 781 445 566",
    referral_code: "SARA66",
    referred_by: "NATA88",
    wallet_balance: 7500000,
    total_deposits: 7200000,
    deposits_this_month: 6,
    growth_earned: 300000,
    last_deposit_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    last_growth_date: null,
    has_withdrawn_this_month: false,
    savings_locked: false,
    financing_unlocked: true,
    financing_status: "pending",
    selected_car_id: "wish",
    assigned_agent: null,
    flagged: false,
    created_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "prof_user5",
    user_id: "user5",
    name: "David Okello",
    phone: "+256 704 556 677",
    referral_code: "DAVE55",
    referred_by: null,
    wallet_balance: 1200000,
    total_deposits: 1200000,
    deposits_this_month: 1,
    growth_earned: 0,
    last_deposit_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    last_growth_date: null,
    has_withdrawn_this_month: false,
    savings_locked: false,
    financing_unlocked: false,
    financing_status: "none",
    selected_car_id: "passo",
    assigned_agent: null,
    flagged: false,
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

const MOCK_TRANSACTIONS: Record<string, Array<{ type: string; amount: number; method: string; created_at: string }>> = {
  user1: [
    { type: "deposit", amount: 1000000, method: "MTN Mobile Money", created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { type: "deposit", amount: 1000000, method: "Airtel Money", created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
    { type: "deposit", amount: 1000000, method: "MTN Mobile Money", created_at: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString() }
  ],
  user2: [
    { type: "deposit", amount: 2000000, method: "Equity Bank", created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { type: "deposit", amount: 2000000, method: "MTN Mobile Money", created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
    { type: "deposit", amount: 3500000, method: "Equity Bank", created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() }
  ],
  user3: [
    { type: "deposit", amount: 3000000, method: "Airtel Money", created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { type: "deposit", amount: 3000000, method: "Airtel Money", created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() },
    { type: "deposit", amount: 4000000, method: "Equity Bank", created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() }
  ],
  user4: [
    { type: "deposit", amount: 2500000, method: "MTN Mobile Money", created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { type: "deposit", amount: 2500000, method: "Airtel Money", created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() },
    { type: "deposit", amount: 2200000, method: "MTN Mobile Money", created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() }
  ],
  user5: [
    { type: "deposit", amount: 1200000, method: "MTN Mobile Money", created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() }
  ]
};

const getAllMockProfiles = (): AdminProfile[] => {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('mockProfile_'));
  if (keys.length === 0) {
    // Populate mock profiles
    MOCK_PROFILES_DATA.forEach(p => {
      localStorage.setItem(`mockProfile_${p.user_id}`, JSON.stringify(p));
    });
    // Populate mock transactions
    Object.entries(MOCK_TRANSACTIONS).forEach(([userId, txs]) => {
      localStorage.setItem(`mockTx_${userId}`, JSON.stringify(txs.map((tx, i) => ({
        ...tx,
        id: `tx_${userId}_${i}`,
        user_id: userId
      }))));
    });
    return MOCK_PROFILES_DATA;
  }
  return keys.map(k => JSON.parse(localStorage.getItem(k) || '{}'));
};

const getMockTransactionsForUser = (userId: string) => {
  const stored = localStorage.getItem(`mockTx_${userId}`);
  return stored ? JSON.parse(stored) : [];
};

const updateMockProfileAdmin = (userId: string, updates: Partial<AdminProfile>) => {
  const key = `mockProfile_${userId}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    const profile = JSON.parse(stored);
    const updated = { ...profile, ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(updated));
  }
};

export function useAllProfiles() {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      return getAllMockProfiles();
    },
    enabled: isAdmin,
  });
}

export function useUserTransactions(userId: string | null) {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ['admin-transactions', userId],
    queryFn: async () => {
      if (!userId) return [];
      return getMockTransactionsForUser(userId);
    },
    enabled: isAdmin && !!userId,
  });
}

export function useAdminApproveFinancing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      updateMockProfileAdmin(userId, { financing_status: 'approved', savings_locked: true });
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
      updateMockProfileAdmin(userId, { flagged: !flagged });
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
      updateMockProfileAdmin(userId, { assigned_agent: agent });
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

const getMockCfoRequests = (): CfoRequest[] => {
  const stored = localStorage.getItem('mockCfoRequests');
  if (!stored) {
    const initial: CfoRequest[] = [
      {
        id: "req_1",
        user_id: "user4",
        user_name: "Sarah Nsubuga",
        user_phone: "+256 781 445 566",
        type: "financing_approval",
        status: "pending",
        details: "User has completed 30% of Toyota Wish savings target (7.5M UGX / 10M UGX car price). Admin requesting credit line approval.",
        requested_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    localStorage.setItem('mockCfoRequests', JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(stored);
};

const saveMockCfoRequests = (requests: CfoRequest[]) => {
  localStorage.setItem('mockCfoRequests', JSON.stringify(requests));
};

export function useCfoRequests() {
  const { isCfo, isAdmin } = useAuth();

  return useQuery({
    queryKey: ['cfo-requests'],
    queryFn: async () => {
      return getMockCfoRequests();
    },
    enabled: isCfo || isAdmin,
  });
}

export function useSubmitCfoRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, userName, userPhone, type, details }: { userId: string; userName: string; userPhone: string; type: 'financing_approval' | 'unflag_request'; details: string }) => {
      const requests = getMockCfoRequests();
      
      const alreadyPending = requests.find(r => r.user_id === userId && r.type === type && r.status === 'pending');
      if (alreadyPending) throw new Error("A request of this type is already pending CFO review.");

      const newRequest: CfoRequest = {
        id: `req_${Date.now()}`,
        user_id: userId,
        user_name: userName,
        user_phone: userPhone,
        type,
        status: 'pending',
        details,
        requested_at: new Date().toISOString()
      };
      
      requests.unshift(newRequest);
      saveMockCfoRequests(requests);

      if (type === 'financing_approval') {
        updateMockProfileAdmin(userId, { financing_status: 'pending' });
      }
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
      const requests = getMockCfoRequests();
      const reqIdx = requests.findIndex(r => r.id === requestId);
      if (reqIdx === -1) throw new Error("Request not found");

      const req = requests[reqIdx];
      req.status = status;
      req.resolved_at = new Date().toISOString();

      saveMockCfoRequests(requests);

      if (req.type === 'financing_approval') {
        if (status === 'approved') {
          updateMockProfileAdmin(req.user_id, { financing_status: 'approved', savings_locked: true });
        } else {
          updateMockProfileAdmin(req.user_id, { financing_status: 'rejected' });
        }
      } else if (req.type === 'unflag_request') {
        if (status === 'approved') {
          updateMockProfileAdmin(req.user_id, { flagged: false });
        }
      }
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
