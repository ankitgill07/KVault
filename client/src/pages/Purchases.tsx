
import { useState, useEffect } from "react";
import { Download, Search } from "lucide-react";
import { paymentApi, type Purchase, type InvoiceData } from "../api/paymentApi";

import { generateInvoiceHTML } from "../utils/Helping";


const statusStyles: Record<string, string> = {
  Paid: "bg-[oklch(0.68_0.16_155/0.15)] text-[oklch(0.45_0.16_155)]",
  Pending: "bg-[oklch(0.78_0.16_75/0.18)] text-[oklch(0.5_0.16_75)]",
  Refunded: "bg-muted text-muted-foreground",
};


export function Purchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("All");
  const [year, setYear] = useState("All");

  // Fetch purchase history on component mount
  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await paymentApi.getPurchaseHistory();
        setPurchases(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch purchase history");
        console.error("Error fetching purchase history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseHistory();
  }, []);

  const filtered = purchases?.filter((p) => {
    const yr = new Date(p.date).getFullYear().toString();
    return (status === "All" || p.status === status) && (year === "All" || yr === year);
  });
  const total = filtered.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);

  // Handle download receipt/invoice
  const handleDownloadReceipt = async (enrollmentId: string) => {
    try {
      const invoiceData = await paymentApi.getInvoice(enrollmentId);
      const invoiceWindow = window.open("", "_blank");
      if (invoiceWindow) {
        const printContent = generateInvoiceHTML(invoiceData);
        invoiceWindow.document.write(printContent);
        invoiceWindow.document.close();
        setTimeout(() => {
          invoiceWindow.print();
        }, 500);
      }
    } catch (err: any) {
      console.error("Error downloading invoice:", err);
      alert("Failed to download invoice. Please try again.");
    }
  };

  // Helper function to generate invoice HTML


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading purchase history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600 font-semibold">Error loading purchase history</p>
          <p className="text-red-500 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">No purchases yet</p>
          <p className="text-muted-foreground text-sm mt-2">Your purchase history will appear here after you buy a course.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] animate-fade-in min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mb-6  flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Purchase History</h1>
        {<p className="mt-1 text-sm text-muted-foreground">{filtered.length} transactions · ₹{total} paid total</p>}
      </div>
    </div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input placeholder="Search invoices…" className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10" />
        </div>
        <Select value={status} onChange={setStatus} options={["All", "Paid", "Pending", "Refunded"]} label="Status" />
        <Select value={year} onChange={setYear} options={["All", "2025", "2024"]} label="Year" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Course</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3">Invoice</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr key={p.id} className="transition hover:bg-muted/30">
                  <td className="px-5 py-3.5 font-semibold text-foreground">{p.course}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{new Date(p.date).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 font-semibold text-foreground">₹{p.amount.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-muted-foreground capitalize">{p.method}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{p.invoiceNumber}</td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button 
                      onClick={() => handleDownloadReceipt(p.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary"
                    >
                      <Download className="h-3.5 w-3.5" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) {
  return (
    <label className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm">
      <span className="text-xs font-medium text-muted-foreground">{label}:</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent text-sm font-semibold text-foreground outline-none">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

