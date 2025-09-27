'use client';

import { useState } from 'react';

export default function CardCountingPage() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("Let's play!");

  const handleCardDeal = (card: number) => {
    let newCount = count;
    if (card >= 2 && card <= 6) {
      newCount++;
    } else if (card >= 10 || card === 1) { // 1 for Ace
      newCount--;
    }
    setCount(newCount);

    if (newCount > 0) {
      setMessage("Count is positive! Bet high!");
    } else if (newCount < 0) {
      setMessage("Count is negative. Bet low.");
    } else {
      setMessage("Count is neutral. Stick to basic strategy.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Card Counting Trainer</h1>
      <p className="text-2xl mb-4">Current Count: <span className="font-semibold">{count}</span></p>
      <p className="text-xl mb-6">{message}</p>
      <div className="grid grid-cols-4 gap-4">
        {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1].map((card) => (
          <button
            key={card}
            onClick={() => handleCardDeal(card)}
            className="px-6 py-3 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            {card === 1 ? 'A' : card === 11 ? 'J' : card === 12 ? 'Q' : card === 13 ? 'K' : card}
          </button>
        ))}
      </div>
      <button
        onClick={() => {
          setCount(0);
          setMessage("Let's play!");
        }}
        className="mt-8 px-6 py-3 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
      >
        Reset
      </button>
    </div>
  );
}
