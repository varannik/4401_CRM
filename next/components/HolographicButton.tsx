import { ReactNode } from "react";

interface HolographicButtonProps {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function HolographicButton({ 
  children, 
  onClick, 
  disabled = false, 
  loading = false, 
  size = 'medium',
  className = '' 
}: HolographicButtonProps) {
  const sizeClasses = {
    small: 'w-56 h-12 text-base',
    medium: 'w-64 h-12 text-base', 
    large: 'w-[300px] h-20 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`group relative ${sizeClasses[size]} bg-[#F1F0F0] hover:bg-[#070808] flex justify-center items-center overflow-hidden rounded-[15px] transition-all duration-500 ease-in-out border-none cursor-pointer mx-auto hover:scale-105 hover:shadow-[0_0_20px_rgba(241,240,240,0.5)] ${disabled || loading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
    >
      {/* Holographic overlay effect */}
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-t from-transparent via-transparent to-[rgba(241,240,240,0.3)] transform -rotate-45 transition-all duration-500 ease-in-out opacity-0 group-hover:opacity-100 group-hover:translate-y-full pointer-events-none"></div>
      
      {/* Button content */}
      <div className="relative z-[2] text-[#070808] group-hover:text-[#F1F0F0] font-semibold flex items-center gap-3 transition-colors duration-500 ease-in-out">
        {children}
      </div>
    </button>
  );
} 