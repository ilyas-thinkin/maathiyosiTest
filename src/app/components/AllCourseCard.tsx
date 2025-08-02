'use client';

import { FC } from 'react';
import clsx from 'clsx';

type CardProps = {
  title: string;
  description: string;
  price: string;
  badge?: string;
  thumbnail: string;   // ✅ new prop for course image
};

const Card: FC<CardProps> = ({
  title,
  description,
  price,
  badge = 'NEW',
  thumbnail,
}) => {
  return (
    <div
      className={clsx(
        'relative w-[220px] h-[300px] bg-white rounded-2xl overflow-hidden',
        'border border-white/20 shadow-md hover:shadow-lg hover:-translate-y-2',
        'transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex-shrink-0 group'
      )}
    >
      {/* ✅ Badge */}
      <div className="absolute top-3 right-3 bg-emerald-500 text-white px-2 py-1 text-[0.7rem] font-semibold rounded-full scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-400 delay-100 z-10">
        {badge}
      </div>

      {/* ✅ Thumbnail Image */}
      <div className="w-full h-[120px] overflow-hidden">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover rounded-t-2xl transform group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* ✅ Text Content */}
      <div className="p-5 flex flex-col gap-2">
        <p className="text-slate-800 font-semibold text-[1.15em] group-hover:text-red-600 transition-all">
          {title}
        </p>
        <p className="text-slate-700 text-[0.95em] leading-snug opacity-80 group-hover:opacity-100 transition-all line-clamp-2">
          {description}
        </p>

        {/* ✅ Footer */}
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
