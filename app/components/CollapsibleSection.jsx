import { useState } from 'react';

export default function CollapsibleSection({ title, children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-6">
      <div 
        className="flex items-center justify-between cursor-pointer py-3 px-4 bg-[#2B2D31] hover:bg-[#2B2D31]/80 rounded-lg transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="font-semibold text-[#f3f4f5] text-sm tracking-wide uppercase">
          {title}
        </h2>
        <span className="text-[#b5bac1] transition-transform duration-200" style={{
          transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)'
        }}>
          ▼
        </span>
      </div>
      <div className={`transition-all duration-200 overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        <div className="bg-[#1E1F22] rounded-lg p-4">
          {children}
        </div>
      </div>
    </div>
  );
} 