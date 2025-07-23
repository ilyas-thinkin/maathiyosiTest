'use client';

import { FC } from 'react';
import clsx from 'clsx';
import { ImageIcon } from 'lucide-react';

type CardProps = {
  title: string;
  description: string;
  price: string;
  badge?: string;
  imageBg?: string; // e.g., "#fca5a5"
};

const Card: FC<CardProps> = ({
  title,
  description,
  price,
  badge = 'NEW',
  imageBg = '#93c5fd', // light blue default
}) => {
  return (
    <div
      className={clsx(
        'relative w-[220px] h-[300px] bg-white rounded-2xl overflow-hidden',
        'border border-white/20 shadow-md hover:shadow-lg hover:-translate-y-2',
        'transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex-shrink-0'
      )}
    >
      {/* Shine */}
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0)_40%,rgba(255,255,255,0.8)_50%,rgba(255,255,255,0)_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shine pointer-events-none" />

      {/* Glow */}
      <div className="absolute -inset-2 bg-[radial-gradient(circle_at_50%_0%,rgba(237,58,58,0.2)_0%,rgba(124,58,237,0)_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10 p-5 h-full flex flex-col gap-3 group">
        {/* Badge */}
        <div className="absolute top-3 right-3 bg-emerald-500 text-white px-2 py-1 text-[0.7rem] font-semibold rounded-full scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-400 delay-100 z-10">
          {badge}
        </div>

        {/* Image Placeholder */}
        <div
          className="w-full h-[120px] rounded-xl flex items-center justify-center"
          style={{
            background: `linear-gradient(45deg, ${imageBg}, #fca5a5)`,
          }}
        >
          <ImageIcon className="w-9 h-9 text-white opacity-70" />
        </div>

        {/* Text Content */}
        <div className="flex flex-col gap-1">
          <p className="text-slate-800 font-semibold text-[1.15em] group-hover:text-red-600 transition-all">
            {title}
          </p>
          <p className="text-slate-700 text-[0.95em] leading-snug opacity-80 group-hover:opacity-100 transition-all">
            {description}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-auto flex justify-between items-center pt-3">
          <div className="text-slate-800 font-bold text-base group-hover:text-purple-600 transition-all">
            {price}
          </div>
            <button className="text-[11px] font-medium px-3 py-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all cursor-pointer">
                Enroll Now
            </button>

        </div>
      </div>
    </div>
  );
};

export default Card;
