import { Card, CardDescription, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Save, DollarSign } from "lucide-react";
import type { CourseFormData } from "../../../hooks/useCreateCourses";

interface Props {
  course: CourseFormData;
  setCourse: React.Dispatch<React.SetStateAction<CourseFormData>>;
  saving: boolean;
  onSave: () => Promise<void>;
}

export function Pricing({ course, setCourse, saving, onSave }: Props) {
  const price = course.price || 0;
  const discountPrice = course.discountPrice;
  const currency = course.currency || "USD";

  const handlePriceChange = (value: string) => {
    const val = parseFloat(value) || 0;
    setCourse((prev) => ({ ...prev, price: val }));
  };

  const handleDiscountChange = (value: string) => {
    const val = value === "" ? undefined : parseFloat(value) || 0;
    setCourse((prev) => ({ ...prev, discountPrice: val }));
  };

  const handleCurrencyChange = (value: string) => {
    setCourse((prev) => ({ ...prev, currency: value }));
  };

  const currencySymbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
  };

  const symbol = currencySymbols[currency] || "$";
  const finalPrice = discountPrice !== undefined ? discountPrice : price;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Course Pricing</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Configure the default pricing model, discounted price, and currency billing.
          </p>
        </div>
        <Button onClick={onSave} disabled={saving} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Pricing"}
        </Button>
      </div>

      <div className="max-w-2xl">
        <Card className="p-6 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl space-y-6">
          <div>
            <CardTitle className="text-lg font-bold text-zinc-900 dark:text-white">Pricing Model</CardTitle>
            <CardDescription className="text-sm text-zinc-500">
              Set the price of your course. Leave as 0 to make it free.
            </CardDescription>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                Currency
              </label>
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2.5 pr-10 text-sm text-zinc-900 dark:text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 cursor-pointer shadow-sm"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-400">
                  ▼
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                Base Price
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">
                  {symbol}
                </span>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 99"
                  value={price || ""}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-8 pr-3.5 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                Discounted Price
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">
                  {symbol}
                </span>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 49 (Optional)"
                  value={discountPrice === undefined ? "" : discountPrice}
                  onChange={(e) => handleDiscountChange(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-8 pr-3.5 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100/50 dark:border-violet-900/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Final purchase price for students:
              </span>
              <span className="text-xl font-bold text-violet-600 dark:text-violet-400">
                {symbol}
                {finalPrice.toFixed(2)}
              </span>
            </div>
            {discountPrice !== undefined && discountPrice < price && (
              <div className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1 text-right">
                Saving {(100 - (discountPrice / price) * 100).toFixed(0)}% off original price!
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
