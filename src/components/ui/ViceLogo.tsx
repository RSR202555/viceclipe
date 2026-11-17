import React from 'react';
import Image from 'next/image';

interface ViceLogoProps {
  collapsed?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const ViceLogo: React.FC<ViceLogoProps> = ({
  collapsed = false,
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  if (collapsed) {
    return (
      <div className={`flex items-center justify-center select-none ${className}`}>
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-900/40 to-pink-900/30 border border-purple-500/40 p-1.5 shadow-[0_0_15px_rgba(139,46,255,0.4)] flex items-center justify-center">
          <Image
            src="/images/vice-clipper-icon-trans.png"
            alt="VICE CLIPPER"
            width={32}
            height={32}
            className="object-contain drop-shadow-[0_0_8px_rgba(255,20,147,0.7)]"
            priority
          />
        </div>
      </div>
    );
  }

  // Size dimensions for the full logo
  const sizeConfig = {
    sm: { width: 130, height: 49 },
    md: { width: 170, height: 64 },
    lg: { width: 230, height: 87 },
  }[size];

  return (
    <div className={`flex flex-col select-none group cursor-pointer ${className}`}>
      {/* Brandmark Image with Neon Glow */}
      <div className="relative flex items-center">
        <Image
          src="/images/vice-clipper-logo-transparent.png"
          alt="VICE CLIPPER - The GTA 6 Content Hub"
          width={sizeConfig.width}
          height={sizeConfig.height}
          priority
          className="object-contain drop-shadow-[0_0_14px_rgba(139,46,255,0.45)] group-hover:drop-shadow-[0_0_20px_rgba(255,20,147,0.65)] transition-all duration-300"
          onError={(e) => {
            // Fallback to original image if needed
            const target = e.target as HTMLImageElement;
            target.src = '/images/vice clipper logo.png';
          }}
        />
      </div>

      {showSubtitle && (
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-vice-textMuted group-hover:text-vice-pink transition-colors mt-1 pl-1">
          The GTA 6 Content Hub
        </span>
      )}
    </div>
  );
};
