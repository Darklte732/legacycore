'use client'

import { useState, useEffect } from 'react'

// Collection of inspirational quotes for insurance agents
const INSPIRATIONAL_MESSAGES = [
  {
    quote: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
    message: "Every client interaction is an opportunity to build your business for the future."
  },
  {
    quote: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    author: "Winston Churchill",
    message: "Insurance is about resilience. Your clients look to you for guidance through uncertainty."
  },
  {
    quote: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.",
    author: "Steve Jobs",
    message: "When you protect families and businesses, you're doing truly meaningful work."
  },
  {
    quote: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    message: "Help your clients protect their dreams and secure their future."
  },
  {
    quote: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
    message: "Consistency in client outreach leads to long-term success in insurance."
  },
  {
    quote: "The only limit to our realization of tomorrow will be our doubts of today.",
    author: "Franklin D. Roosevelt",
    message: "Each conversation is a step toward securing someone's future."
  },
  {
    quote: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    message: "Your confidence in your products gives clients peace of mind."
  },
  {
    quote: "The best preparation for tomorrow is doing your best today.",
    author: "H. Jackson Brown, Jr.",
    message: "The right planning today prevents emergencies tomorrow."
  },
  {
    quote: "Your attitude, not your aptitude, will determine your altitude.",
    author: "Zig Ziglar",
    message: "A positive approach to client service will elevate your insurance practice."
  },
  {
    quote: "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
    author: "Stephen Covey",
    message: "Make time for your most valuable clients and prospects each day."
  },
  {
    quote: "People don't care how much you know until they know how much you care.",
    author: "Theodore Roosevelt",
    message: "In insurance, relationships matter more than policies."
  },
  {
    quote: "The expert in anything was once a beginner.",
    author: "Helen Hayes",
    message: "Every insurance professional started with their first client conversation."
  },
  {
    quote: "Success is walking from failure to failure with no loss of enthusiasm.",
    author: "Winston Churchill",
    message: "Every 'no' brings you closer to your next 'yes'."
  },
  {
    quote: "It's not about having time, it's about making time.",
    author: "Unknown",
    message: "Schedule your follow-ups and client check-ins like they're your most important meetings."
  },
  {
    quote: "The pessimist sees difficulty in every opportunity. The optimist sees opportunity in every difficulty.",
    author: "Winston Churchill",
    message: "Every client problem is a chance to demonstrate your value as an insurance professional."
  }
];

// Function to get a consistent message for the day
const getDailyInspiration = () => {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const index = dayOfYear % INSPIRATIONAL_MESSAGES.length;
  return INSPIRATIONAL_MESSAGES[index];
};

// Component for displaying the daily inspiration
export default function DailyInspiration() {
  const [inspiration, setInspiration] = useState(getDailyInspiration());
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update the time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Format the current time in 12-hour format with AM/PM
  const formattedTime = currentTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  // Format the current date with month name and day
  const formattedDate = currentTime.toLocaleDateString([], {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="welcome-container p-6 flex flex-col items-center justify-center text-center">
      <div className="time-display mb-3">
        <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{formattedTime}</h2>
        <p className="text-gray-600 dark:text-gray-400">{formattedDate}</p>
      </div>

      <div className="inspiration-card max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-500 hover:shadow-lg mt-6">
        <div className="p-8">
          <div className="quote-icon flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
          </div>
          
          <blockquote className="text-xl italic font-medium text-gray-800 dark:text-gray-200 mb-4">
            "{inspiration.quote}"
          </blockquote>
          
          <p className="text-right text-gray-600 dark:text-gray-400 font-medium mb-6">
            — {inspiration.author}
          </p>
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-700 dark:text-gray-300">
              {inspiration.message}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex flex-col items-center">
        <p className="text-gray-600 dark:text-gray-400 mb-2">Start a new conversation or select a previous chat</p>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
} 