"use client";

import { ThreeDot } from 'react-loading-indicators';

export const ScatterBoxLoaderComponent = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-white">
      <ThreeDot
        variant="bounce"
        color="#de5252"
        size="medium"
        text=""
        textColor=""
      />
    </div>
  );
};
