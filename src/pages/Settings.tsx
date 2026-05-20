import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, RotateCcw, Save } from "lucide-react";

function formatValue(val: number, decimals: number = 2): string {
  return val.toFixed(decimals);
}

export default function Settings() {
  const utils = trpc.useUtils();
  const { data: config, isLoading } = trpc.band.getConfig.useQuery({ userId: 1 });

  const updateMutation = trpc.band.updateConfig.useMutation({
    onSuccess: () => {
      utils.band.getConfig.invalidate();
      utils.band.fullState.invalidate();
      utils.backtest.run.invalidate();
      utils.backtest.gridSearch.invalidate();
    },
  });

  // Local state for form values
  const [windowHours, setWindowHours] = useState(48);
  const [bandMultiplier, setBandMultiplier] = useState(2.0);
  const [profitMarginPct, setProfitMarginPct] = useState(0.15);
  const [useBnbDiscount, setUseBnbDiscount] = useState(false);
  const [makerFeePct, setMakerFeePct] = useState(0.1);
  const [takerFeePct, setTakerFeePct] = useState(0.1);
  const [withdrawalFeeBtc, setWithdrawalFeeBtc] = useState(0.0002);
  const [investmentAmount, setInvestmentAmount] = useState(1000);
  const [saved, setSaved] = useState(false);

  // Sync with loaded config
  useEffect(() => {
    if (config) {
      setWindowHours(config.windowHours);
      setBandMultiplier(config.bandMultiplier);
      setProfitMarginPct(config.profitMarginPct);
      setUseBnbDiscount(config.useBnbDiscount);
      setMakerFeePct(config.makerFeePct);
      setTakerFeePct(config.takerFeePct);
      setWithdrawalFeeBtc(config.withdrawalFeeBtc);
      setInvestmentAmount(config.investmentAmount);
    }
  }, [config]);

  const handleSave = () => {
    updateMutation.mutate({
      userId: 1,
      windowHours,
      bandMultiplier,
      profitMarginPct,
      useBnbDiscount,
      makerFeePct,
      takerFeePct,
      withdrawalFeeBtc,
      investmentAmount,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setWindowHours(48);
    setBandMultiplier(2.0);
    setProfitMarginPct(0.15);
    setUseBnbDiscount(false);
    setMakerFeePct(0.1);
    setTakerFeePct(0.1);
    setWithdrawalFeeBtc(0.0002);
    setInvestmentAmount(1000);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div
          className="h-8 rounded"
          style={{ background: "var(--color-bg-surface)", width: "20%" }}
        />
        <div
          className="h-96 rounded"
          style={{ background: "var(--color-bg-surface)" }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon
          className="w-5 h-5"
          style={{ color: "var(--color-accent-neutral)" }}
        />
        <h1
          className="text-xl font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Settings
        </h1>
      </div>

      <div className="card-surface space-y-8">
        {/* Band Parameters */}
        <div>
          <h2
            className="text-sm font-semibold mb-4"
            style={{
              color: "var(--color-text-primary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Band Parameters
          </h2>

          {/* Window Hours */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Window Size (hours)
              </label>
              <span
                className="text-sm font-medium px-2 py-0.5 rounded-sm"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: "var(--color-bg-surface)",
                  color: "var(--color-text-primary)",
                }}
              >
                {windowHours}h
              </span>
            </div>
            <Slider
              value={[windowHours]}
              onValueChange={(v) => setWindowHours(v[0])}
              min={6}
              max={168}
              step={6}
              className="w-full"
            />
            <div
              className="flex justify-between mt-1"
              style={{ color: "var(--color-text-muted)", fontSize: 10 }}
            >
              <span>6h</span>
              <span>168h</span>
            </div>
          </div>

          {/* Band Multiplier */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Band Multiplier (k)
              </label>
              <span
                className="text-sm font-medium px-2 py-0.5 rounded-sm"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: "var(--color-bg-surface)",
                  color: "var(--color-text-primary)",
                }}
              >
                {formatValue(bandMultiplier, 1)}
              </span>
            </div>
            <Slider
              value={[bandMultiplier]}
              onValueChange={(v) => setBandMultiplier(v[0])}
              min={0.5}
              max={5.0}
              step={0.1}
              className="w-full"
            />
            <div
              className="flex justify-between mt-1"
              style={{ color: "var(--color-text-muted)", fontSize: 10 }}
            >
              <span>0.5</span>
              <span>5.0</span>
            </div>
          </div>

          {/* Profit Margin */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Profit Margin (%)
              </label>
              <span
                className="text-sm font-medium px-2 py-0.5 rounded-sm"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: "var(--color-bg-surface)",
                  color: "var(--color-text-primary)",
                }}
              >
                {formatValue(profitMarginPct, 2)}%
              </span>
            </div>
            <Slider
              value={[profitMarginPct]}
              onValueChange={(v) => setProfitMarginPct(v[0])}
              min={0}
              max={2}
              step={0.01}
              className="w-full"
            />
            <div
              className="flex justify-between mt-1"
              style={{ color: "var(--color-text-muted)", fontSize: 10 }}
            >
              <span>0%</span>
              <span>2%</span>
            </div>
          </div>
        </div>

        <div className="section-divider" />

        {/* Fee Configuration */}
        <div>
          <h2
            className="text-sm font-semibold mb-4"
            style={{
              color: "var(--color-text-primary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Fee Configuration
          </h2>

          {/* BNB Discount */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <label
                className="text-sm block"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Use BNB Fee Discount
              </label>
              <span
                className="text-xs"
                style={{ color: "var(--color-text-muted)" }}
              >
                Reduces maker/taker fees to 0.075%
              </span>
            </div>
            <Switch
              checked={useBnbDiscount}
              onCheckedChange={setUseBnbDiscount}
            />
          </div>

          {/* Maker Fee */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Maker Fee (%)
              </label>
              <span
                className="text-sm font-medium px-2 py-0.5 rounded-sm"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: "var(--color-bg-surface)",
                  color: "var(--color-text-primary)",
                }}
              >
                {formatValue(makerFeePct, 3)}%
              </span>
            </div>
            <Slider
              value={[makerFeePct]}
              onValueChange={(v) => setMakerFeePct(v[0])}
              min={0}
              max={0.5}
              step={0.001}
              className="w-full"
            />
          </div>

          {/* Taker Fee */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Taker Fee (%)
              </label>
              <span
                className="text-sm font-medium px-2 py-0.5 rounded-sm"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: "var(--color-bg-surface)",
                  color: "var(--color-text-primary)",
                }}
              >
                {formatValue(takerFeePct, 3)}%
              </span>
            </div>
            <Slider
              value={[takerFeePct]}
              onValueChange={(v) => setTakerFeePct(v[0])}
              min={0}
              max={0.5}
              step={0.001}
              className="w-full"
            />
          </div>

          {/* Withdrawal Fee */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Withdrawal Fee (BTC)
              </label>
              <span
                className="text-sm font-medium px-2 py-0.5 rounded-sm"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: "var(--color-bg-surface)",
                  color: "var(--color-text-primary)",
                }}
              >
                {withdrawalFeeBtc.toFixed(4)} BTC
              </span>
            </div>
            <Slider
              value={[withdrawalFeeBtc]}
              onValueChange={(v) => setWithdrawalFeeBtc(v[0])}
              min={0}
              max={0.001}
              step={0.00001}
              className="w-full"
            />
          </div>

          {/* Investment Amount */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Investment Amount (USD)
              </label>
              <span
                className="text-sm font-medium px-2 py-0.5 rounded-sm"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: "var(--color-bg-surface)",
                  color: "var(--color-text-primary)",
                }}
              >
                ${investmentAmount.toLocaleString()}
              </span>
            </div>
            <Slider
              value={[investmentAmount]}
              onValueChange={(v) => setInvestmentAmount(v[0])}
              min={100}
              max={100000}
              step={100}
              className="w-full"
            />
            <div
              className="flex justify-between mt-1"
              style={{ color: "var(--color-text-muted)", fontSize: 10 }}
            >
              <span>$100</span>
              <span>$100,000</span>
            </div>
          </div>
        </div>

        <div className="section-divider" />

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-sm transition-opacity hover:opacity-80"
            style={{
              background: saved
                ? "rgba(34,197,94,0.2)"
                : "var(--color-accent-neutral)",
              color: saved
                ? "var(--color-accent-buy)"
                : "var(--color-text-primary)",
              fontFamily: "var(--font-sans)",
            }}
          >
            <Save className="w-4 h-4" />
            {saved ? "Saved" : "Save Changes"}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-sm transition-opacity hover:opacity-80"
            style={{
              background: "var(--color-bg-surface)",
              color: "var(--color-text-secondary)",
              border: "1px solid var(--color-border-subtle)",
              fontFamily: "var(--font-sans)",
            }}
          >
            <RotateCcw className="w-4 h-4" />
            Reset Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
