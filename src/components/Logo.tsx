
import React from "react";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={`${className}`}>
      <svg width="340" height="180" viewBox="0 0 340 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M73 36L102 36L102 70L73 70L73 36Z" fill="white" />
        <path d="M110 36L139 36L139 70L110 70L110 36Z" />
        <path d="M147 36L176 36L176 70L147 70L147 36Z" fill="white" />
        <path d="M184 36L213 36L213 70L184 70L184 36Z" fill="white" />
        <path d="M221 36L250 36L250 70L221 70L221 36Z" fill="white" />
        <path d="M258 36L287 36L287 70L258 70L258 36Z" />
        <path d="M73 78L102 78L102 112L73 112L73 78Z" />
        <path d="M110 78L139 78L139 112L110 112L110 78Z" fill="white" />
        <path d="M147 78L176 78L176 112L147 112L147 78Z" />
        <path d="M184 78L213 78L213 112L184 112L184 78Z" fill="white" />
        <path d="M221 78L250 78L250 112L221 112L221 78Z" />
        <path d="M258 78L287 78L287 112L258 112L258 78Z" fill="white" />
      </svg>
    </div>
  );
};

export default Logo;
