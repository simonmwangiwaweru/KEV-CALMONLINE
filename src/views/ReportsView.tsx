import React from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../services/financialEngine';
import { 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Printer
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { jobs, products, ledger, settings, thisMonthSummary } = useApp();

  // Calculate profitability ranking for jobs
  const analyzedJobs = jobs.map((j) => {
    const totalCosts = j.directCosts.reduce((sum, c) => sum + c.amount, 0);
    const profit = j.agreedPrice - totalCosts;
    const margin = j.agreedPrice > 0 ? Math.round((profit / j.agreedPrice) * 100) : 0;
    return { ...j, totalCosts, profit, margin };
  }).sort((a, b) => b.profit - a.profit);

  const mostProfitableJobs = analyzedJobs.slice(0, 3);
  const lowMarginJobs = [...analyzedJobs].sort((a, b) => a.margin - b.margin).slice(0, 3);

  // Total product profit
  const totalProductSales = products.reduce((sum, p) => sum + p.totalSalesAmount, 0);
  const totalProductCosts = products.reduce((sum, p) => sum + p.totalCost, 0);
  const totalProductProfit = totalProductSales - totalProductCosts;

  // Handle CSV export of the append-only ledger
  const exportLedgerCsv = () => {
    const headers = ['ID', 'Date', 'Type', 'Account', 'Bucket', 'Category', 'Description', 'Amount', 'Channel', 'Reference'];
    const rows = ledger.map(e => [
      e.id,
      e.date,
      e.type,
      e.account,
      e.bucket,
      `"${e.category}"`,
      `"${e.description}"`,
      e.amount,
      e.paymentMethod,
      e.referenceCode || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `calm_online_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="t-group text-[var(--ok)]">
              Analytics & Statements
            </span>
            <span className="text-[var(--text-3)]">·</span>
            <span className="t-caption">Profit Margins & General Ledger</span>
          </div>
          <h2 className="t-title text-xl font-bold mt-0.5">
            Financial Reports & Ledgers
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportLedgerCsv}
            className="px-3.5 py-2 glass glass--pill text-[var(--text-2)] hover:text-[var(--text)] border border-white/40 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-[var(--glass-shadow)]"
          >
            <Download className="w-4 h-4 text-[var(--text-2)]" strokeWidth={1.5} />
            Export Ledger CSV
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 glass glass--pill is-active text-[var(--text)] font-semibold text-xs border border-white/60 shadow-[var(--glow)] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 stroke-[1.8]" />
            Print Statement
          </button>
        </div>
      </div>

      {/* Top Profitability Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 glass glass--tile space-y-1 shadow-[var(--glass-shadow)]">
          <span className="t-label block">Total Net Service Profit</span>
          <p className="t-readout font-mono font-semibold text-[var(--ok)]">
            {formatCurrency(thisMonthSummary.totalProfit, settings.currency)}
          </p>
          <span className="t-caption text-left block">After all direct costs</span>
        </div>

        <div className="p-4 glass glass--tile space-y-1 shadow-[var(--glass-shadow)]">
          <span className="t-label block">Total Product Sales Profit</span>
          <p className="t-readout font-mono font-semibold text-[var(--text)]">
            {formatCurrency(totalProductProfit, settings.currency)}
          </p>
          <span className="t-caption text-left block">From {products.length} product transactions</span>
        </div>

        <div className="p-4 glass glass--tile space-y-1 shadow-[var(--glass-shadow)]">
          <span className="t-label block">Uncollected Receivables</span>
          <p className="t-readout font-mono font-semibold text-[var(--pending)]">
            {formatCurrency(thisMonthSummary.totalClientBalancesPending, settings.currency)}
          </p>
          <span className="t-caption text-left block">Pending client balances</span>
        </div>
      </div>

      {/* Most Profitable Jobs vs Low Margin Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Most Profitable Jobs */}
        <div className="p-5 glass space-y-3 shadow-[var(--glass-shadow)]">
          <div className="flex items-center gap-2 t-group text-[var(--ok)]">
            <TrendingUp className="w-4 h-4 text-[var(--ok)]" strokeWidth={1.5} />
            <span>Most Profitable Service Jobs</span>
          </div>

          <div className="space-y-2">
            {mostProfitableJobs.map((j) => (
              <div key={j.id} className="p-3 glass glass--tile flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-[var(--text)] block">{j.serviceName}</span>
                  <span className="t-caption text-left block">{j.clientName} · Charged: {formatCurrency(j.agreedPrice, settings.currency)}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-semibold text-[var(--ok)] text-sm block">
                    +{formatCurrency(j.profit, settings.currency)}
                  </span>
                  <span className="t-caption font-mono font-semibold text-[var(--text-2)]">
                    {j.margin}% Net Margin
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Margin Jobs / Cost Intensive */}
        <div className="p-5 glass space-y-3 shadow-[var(--glass-shadow)]">
          <div className="flex items-center gap-2 t-group text-[var(--pending)]">
            <TrendingDown className="w-4 h-4 text-[var(--pending)]" strokeWidth={1.5} />
            <span>Highest Direct Cost Ratios (Review Pricing)</span>
          </div>

          <div className="space-y-2">
            {lowMarginJobs.map((j) => (
              <div key={j.id} className="p-3 glass glass--tile flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-[var(--text)] block">{j.serviceName}</span>
                  <span className="t-caption text-left block">{j.clientName} · Costs: {formatCurrency(j.totalCosts, settings.currency)}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-semibold text-[var(--text)] text-sm block">
                    +{formatCurrency(j.profit, settings.currency)}
                  </span>
                  <span className="t-caption font-mono font-semibold text-[var(--pending)]">
                    {j.margin}% Net Margin
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Full Audit Ledger */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="t-group">
              Append-Only Financial Ledger (Full Audit Trail)
            </h3>
            <p className="t-label mt-0.5">
              All transactions have immutable references, accounts, and categories.
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--text-3)] glass glass--pill px-2.5 py-1">
            {ledger.length} total entries
          </span>
        </div>

        <div className="glass overflow-hidden shadow-[var(--glass-shadow)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/10 text-[var(--text-2)] uppercase tracking-wider font-semibold border-b border-white/20">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Channel / Reference</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {ledger.map((entry) => {
                  const isInflow = entry.type.startsWith('income_') || (entry.type === 'transfer_owner_salary' && entry.account === 'personal');
                  return (
                    <tr key={entry.id} className="hover:bg-white/10">
                      <td className="px-4 py-3 font-mono text-[var(--text-2)]">{entry.date}</td>
                      <td className="px-4 py-3 font-mono uppercase text-[10px]">
                        <span className={`px-2 py-0.5 rounded-full font-semibold glass glass--pill ${
                          entry.account === 'company' ? 'text-[var(--ok)] bg-[var(--ok)]/15 border-[var(--ok)]/40' : 'text-[var(--text)] bg-white/20 border-white/40'
                        }`}>
                          {entry.account}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-[var(--text)]">{entry.category}</td>
                      <td className="px-4 py-3 text-[var(--text-2)] max-w-sm truncate">{entry.description}</td>
                      <td className="px-4 py-3 font-mono text-[var(--text-3)]">
                        {entry.paymentMethod} {entry.referenceCode ? `(${entry.referenceCode})` : ''}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-semibold ${
                        isInflow ? 'text-[var(--ok)]' : 'text-[var(--text)]'
                      }`}>
                        {isInflow ? '+' : '−'}{formatCurrency(entry.amount, settings.currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};
