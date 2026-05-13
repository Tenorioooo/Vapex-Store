import { useState } from 'react';

interface ProductImageProps {
  src: string | null;
  alt: string;
  brand?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function ProductImage({ src, alt, brand, className = '', size = 'md' }: ProductImageProps) {
  const [error, setError] = useState(false);

  const emojiSize = { sm: 'text-2xl', md: 'text-4xl', lg: 'text-5xl', xl: 'text-8xl' }[size];
  const brandSize = { sm: 'text-[8px]', md: 'text-xs', lg: 'text-sm', xl: 'text-base' }[size];

  if (src && !error) {
    return (
      <img
        src={src}
        alt={alt}
        onError={() => setError(true)}
        className={`w-full h-full object-cover ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0a] ${className}`}>
      <div className="text-center">
        <div className={`${emojiSize} mb-1`}>💨</div>
        {brand && <div className={`text-gray-600 ${brandSize}`}>{brand}</div>}
      </div>
    </div>
  );
}
