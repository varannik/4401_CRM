import HolographicButton from "@/components/HolographicButton";

interface DashboardButtonProps {
  onClick: () => void;
}

export default function DashboardButton({ onClick }: DashboardButtonProps) {
  return (
    <div className="flex justify-center">
      <HolographicButton onClick={onClick} size="large">
        Access CRM Dashboard
        <svg 
          className="w-5 h-5 transition-transform group-hover:translate-x-1" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M13 7l5 5m0 0l-5 5m5-5H6" 
          />
        </svg>
      </HolographicButton>
    </div>
  );
} 