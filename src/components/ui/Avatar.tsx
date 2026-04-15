'use client';

import { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /** Show a colored ring (e.g. emerald for verified) */
  ring?: 'emerald' | 'blue' | 'none';
}

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

const ringMap = {
  none: '',
  emerald: 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-[#0a0a0a]',
  blue: 'ring-2 ring-[#0A66C2] ring-offset-2 ring-offset-[#0a0a0a]',
};

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// Consistent color from name string
function getColor(name?: string): string {
  const colors = [
    'bg-emerald-600', 'bg-blue-600', 'bg-purple-600', 'bg-pink-600',
    'bg-orange-600', 'bg-teal-600', 'bg-cyan-600', 'bg-indigo-600',
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function Avatar({ src, name, size = 'md', className = '', ring = 'none' }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = src && !imgError;

  return (
    <div
      className={`${sizeMap[size]} ${ringMap[ring]} rounded-full shrink-0 overflow-hidden flex items-center justify-center font-semibold text-white ${
        showImage ? '' : getColor(name)
      } ${className}`}
    >
      {showImage ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
