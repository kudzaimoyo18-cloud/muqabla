'use client';

import React from 'react';
import Link from 'next/link';

interface RealismButtonProps {
  text: string;
  href?: string;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function RealismButton({ text, href, variant = 'primary', icon, className = '', onClick }: RealismButtonProps) {
  const isPrimary = variant === 'primary';

  const button = (
    <button
      onClick={onClick}
      className={`group relative p-[2px] rounded-[16px] text-[1rem] border-none cursor-pointer transition-all ${
        isPrimary
          ? 'bg-[radial-gradient(circle_80px_at_80%_-10%,_#34d399,_#0f1111)]'
          : 'bg-[radial-gradient(circle_80px_at_80%_-10%,_#ffffff,_#181b1b)]'
      } ${className}`}
    >
      {/* Glow behind button */}
      <div className={`absolute top-0 right-0 w-[65%] h-[60%] rounded-[120px] transition-all duration-300 ease-out -z-10 ${
        isPrimary
          ? 'shadow-[0_0_20px_#10b98138] group-hover:shadow-[0_0_40px_#10b98160]'
          : 'shadow-[0_0_20px_#ffffff38] group-hover:shadow-[0_0_40px_#ffffff60]'
      }`} />

      {/* Bottom-left green blob */}
      <div className={`absolute bottom-0 left-0 w-[50px] h-[50%] rounded-[17px] transition-all duration-300 ease-out
        ${isPrimary
          ? 'bg-[radial-gradient(circle_60px_at_0%_100%,_#10b981,_#10b98150,_transparent)] shadow-[-2px_9px_40px_#10b98140] group-hover:w-[90px] group-hover:shadow-[-4px_1px_45px_#10b98160]'
          : 'bg-[radial-gradient(circle_60px_at_0%_100%,_#3fff75,_#00ff8050,_transparent)] shadow-[-2px_9px_40px_#00ff2d40] group-hover:w-[90px] group-hover:shadow-[-4px_1px_45px_#00ff2d60]'
        }`} />

      {/* Inner content */}
      <div className={`relative flex items-center justify-center gap-2.5 px-[28px] py-[14px] group-hover:scale-105 rounded-[14px] text-white z-10 transition-all duration-300 font-medium ${
        isPrimary
          ? 'bg-[radial-gradient(circle_80px_at_80%_-50%,_#059669,_#0f1111)]'
          : 'bg-[radial-gradient(circle_80px_at_80%_-50%,_#777777,_#0f1111)]'
      }`}>
        {icon}
        {text}

        {/* Inner glow layer */}
        <div className="absolute inset-0 rounded-[14px] bg-[radial-gradient(circle_60px_at_0%_100%,_#10b98119,_#10b98111,_transparent)] z-[-1]" />
      </div>
    </button>
  );

  if (href) {
    return <Link href={href} className="inline-block">{button}</Link>;
  }

  return button;
}
