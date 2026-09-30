import React from 'react';

export default function StatCards({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
      <div className="bg-[#00C853] text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between h-36">
        <span className="text-sm font-semibold tracking-wide">Open requests</span>
        <div>
          <h2 className="text-4xl font-black">04</h2>
          <p className="text-xs mt-1 text-green-100">Across 4 areas ↗</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between h-36">
        <span className="text-sm font-medium text-gray-500">Ready for you</span>
        <div>
          <h2 className="text-4xl font-black text-gray-900">03</h2>
          <p className="text-xs mt-1 text-gray-400">Next 48 hours</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between h-36">
        <span className="text-sm font-medium text-gray-500">Current borrowing</span>
        <div>
          <h2 className="text-4xl font-black text-gray-900">
            {stats.totalBorrowed < 10 ? `0${stats.totalBorrowed}` : stats.totalBorrowed}
          </h2>
          <p className="text-xs mt-1 text-gray-400">+2 this week</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between h-36">
        <span className="text-sm font-medium text-gray-500">Week capacity</span>
        <div>
          <h2 className="text-4xl font-black text-gray-900">72%</h2>
          <p className="text-xs mt-1 text-gray-400">Comfortably paced</p>
        </div>
      </div>
    </div>
  );
}
