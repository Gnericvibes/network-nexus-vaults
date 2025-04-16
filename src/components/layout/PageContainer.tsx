
import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  noFooter?: boolean;
  noHeader?: boolean;
}

const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  className = '',
  noFooter = false,
  noHeader = false
}) => {
  return (
    <div className={`flex flex-col min-h-screen ${className}`}>
      {!noHeader && <Header />}
      <main className={`flex-grow ${!noHeader ? 'pt-20' : ''}`}>
        {children}
      </main>
      {!noFooter && <Footer />}
    </div>
  );
};

export default PageContainer;
