import { useState, useEffect } from "react";

export type Network = "mtn" | "telecel" | "airteltigo";

interface NetworkOption {
  id: Network;
  label: string;
  color: string;
  bgColor: string;
}

const NETWORKS: NetworkOption[] = [
  {
    id: "mtn",
    label: "MTN",
    color: "#FFD800",
    bgColor: "#1f1f1f",
  },
  {
    id: "telecel",
    label: "Telecel/Vodafone",
    color: "#C60C30",
    bgColor: "#f5f5f5",
  },
  {
    id: "airteltigo",
    label: "AirtelTigo",
    color: "#EF3B39",
    bgColor: "#f5f5f5",
  },
];

/**
 * Detects network based on phone number prefix
 * - "054", "024", "050" = MTN
 * - "020" = Telecel/Vodafone
 * - "055", "056" = AirtelTigo (optional, not strict)
 */
// eslint-disable-next-line react-refresh/only-export-components
export const detectNetwork = (phone: string): Network => {
  // Remove common prefixes and spaces
  const cleaned = phone.replace(/\D/g, "").slice(-10);

  if (
    cleaned.startsWith("054") ||
    cleaned.startsWith("024") ||
    cleaned.startsWith("050")
  ) {
    return "mtn";
  }

  if (cleaned.startsWith("020")) {
    return "telecel";
  }

  if (cleaned.startsWith("055") || cleaned.startsWith("056")) {
    return "airteltigo";
  }

  // Default to MTN
  return "mtn";
};

interface NetworkSelectorProps {
  value: Network;
  onChange: (network: Network) => void;
  phone?: string;
}

export const NetworkSelector = ({
  value,
  onChange,
  phone,
}: NetworkSelectorProps) => {
  const [selected, setSelected] = useState<Network>(value);

  // Auto-detect network when phone changes
  useEffect(() => {
    if (phone) {
      const detected = detectNetwork(phone);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelected(detected);
      onChange(detected);
    }
  }, [phone, onChange]);

  const handleSelect = (network: Network) => {
    setSelected(network);
    onChange(network);
  };

  return (
    <div className="flex flex-col gap-2">
      <p
        className="text-xs font-bold text-slate-500 uppercase tracking-wide"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Mobile Network
      </p>

      <div className="flex gap-3">
        {NETWORKS.map((network) => (
          <button
            key={network.id}
            onClick={() => handleSelect(network.id)}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all border-2 flex items-center justify-center ${
              selected === network.id
                ? "border-[#1E3A5F] shadow-md"
                : "border-slate-200 hover:border-slate-300"
            }`}
            style={{
              background: network.bgColor,
              color: network.color,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {network.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NetworkSelector;
