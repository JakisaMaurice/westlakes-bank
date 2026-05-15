const transactions = [
  { date: "May 15", description: "Salary credit", amount: "+£4,500", status: "Completed" },
  { date: "May 14", description: "Electric bill", amount: "-£135", status: "Completed" },
  { date: "May 13", description: "Transfer to savings", amount: "-£620", status: "Completed" },
  { date: "May 12", description: "Online shopping", amount: "-£220", status: "Pending" },
]

export default function Transactions() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-amber-500">Transactions</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Recent activity</h1>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Date</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Description</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Amount</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {transactions.map((transaction) => (
              <tr key={transaction.description}>
                <td className="px-6 py-4 text-sm text-slate-700">{transaction.date}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{transaction.description}</td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-950">{transaction.amount}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{transaction.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
