
import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  noFooter?: boolean;
}

const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  className = '',
  noFooter = false
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className={`flex-grow pt-20 ${className}`}>
        {children}
      </main>
      {!noFooter && <Footer />}
    </div>
  );
};

export default PageContainer;
