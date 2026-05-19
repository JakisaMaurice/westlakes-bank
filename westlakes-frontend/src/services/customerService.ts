import { api } from "@/lib/api"

export interface BankAccount {
  id: number
  account_number: string
  account_type: string
  balance: string
  status: string
  created_at: string
}

export interface Customer {
  id: number
  full_name: string
  email: string
  phone_number: string
  national_id: string
  role: string
  is_verified: boolean
  is_active: boolean
  created_at: string
  accounts: BankAccount[]
  total_balance: string
  primary_account: BankAccount | null
}

export interface CustomerListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Customer[]
}

export interface Transaction {
  id: number
  sender_account: number | null
  receiver_account: number | null
  sender_account_number: string | null
  receiver_account_number: string | null
  sender_name: string | null
  receiver_name: string | null
  transaction_type: string
  amount: string
  transaction_reference: string
  status: string
  timestamp: string
  description: string
}

export interface TransactionListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Transaction[]
}

export interface AuditLog {
  id: number
  admin: number | null
  admin_name: string | null
  customer: number | null
  customer_name: string | null
  action: string
  action_display: string
  previous_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  notes: string
  ip_address: string | null
  timestamp: string
}

export interface AuditLogListResponse {
  count: number
  next: string | null
  previous: string | null
  results: AuditLog[]
}

export interface Message {
  id: number
  sender: number
  sender_name: string
  recipient: number
  recipient_name: string
  message_type: string
  subject: string
  body: string
  is_read: boolean
  read_at: string | null
  created_at: string
}

export interface MessageListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Message[]
}

export interface DepositPayload {
  receiver_account_number: string
  amount: string
  description?: string
}

export interface SendMessagePayload {
  recipient: number
  message_type: string
  subject: string
  body: string
}

export interface CustomerFilters {
  search?: string
  status?: string
  account_type?: string
  is_verified?: boolean
  ordering?: string
  page?: number
  page_size?: number
}

const customerService = {
  getCustomers: (filters: CustomerFilters = {}) => {
    const params = new URLSearchParams()
    if (filters.search) params.set("search", filters.search)
    if (filters.status) params.set("status", filters.status)
    if (filters.account_type) params.set("account_type", filters.account_type)
    if (filters.is_verified !== undefined) params.set("is_verified", String(filters.is_verified))
    if (filters.ordering) params.set("ordering", filters.ordering)
    if (filters.page) params.set("page", String(filters.page))
    if (filters.page_size) params.set("page_size", String(filters.page_size))
    return api.get<CustomerListResponse>(`/api/auth/customers/?${params.toString()}`)
  },

  getCustomer: (id: number) => {
    return api.get<Customer>(`/api/auth/customers/${id}/`)
  },

  approveAccount: (accountId: number) => {
    return api.post<BankAccount>(`/api/accounts/${accountId}/approve/`)
  },

  rejectAccount: (accountId: number, reason: string) => {
    return api.post<BankAccount>(`/api/accounts/${accountId}/reject/`, { reason })
  },

  suspendAccount: (accountId: number, reason: string) => {
    return api.post<BankAccount>(`/api/accounts/${accountId}/suspend/`, { reason })
  },

  activateAccount: (accountId: number) => {
    return api.post<BankAccount>(`/api/accounts/${accountId}/activate/`)
  },

  freezeAccount: (accountId: number, reason: string) => {
    return api.post<BankAccount>(`/api/accounts/${accountId}/freeze/`, { reason })
  },

  lockAccount: (accountId: number, reason: string) => {
    return api.post<BankAccount>(`/api/accounts/${accountId}/lock/`, { reason })
  },

  unlockAccount: (accountId: number) => {
    return api.post<BankAccount>(`/api/accounts/${accountId}/unlock/`)
  },

  verifyCustomer: (customerId: number) => {
    return api.post<Customer>(`/api/auth/customers/${customerId}/verify/`)
  },

  resetPassword: (customerId: number, newPassword: string) => {
    return api.post(`/api/auth/customers/${customerId}/reset-password/`, { new_password: newPassword })
  },

  getCustomerTransactions: (_accountId: number, page = 1) => {
    return api.get<TransactionListResponse>(`/api/transactions/?page=${page}`)
  },

  adminDeposit: (payload: DepositPayload) => {
    return api.post<Transaction>("/api/transactions/admin-deposit/", payload)
  },

  getAuditLogs: (customerId?: number, page = 1) => {
    const params = new URLSearchParams()
    params.set("page", String(page))
    if (customerId) params.set("customer_id", String(customerId))
    return api.get<AuditLogListResponse>(`/api/audit-logs/?${params.toString()}`)
  },

  getMessages: (customerId?: number) => {
    const params = new URLSearchParams()
    if (customerId) params.set("customer_id", String(customerId))
    return api.get<MessageListResponse>(`/api/messages/?${params.toString()}`)
  },

  sendMessage: (payload: SendMessagePayload) => {
    return api.post<Message>("/api/messages/", payload)
  },

  markMessageRead: (messageId: number) => {
    return api.post<Message>(`/api/messages/${messageId}/read/`)
  },
}

export default customerService
