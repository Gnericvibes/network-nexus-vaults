
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

interface BalanceCardProps {
  title: string;
  amount: string;
  subtitle?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ 
  title, 
  amount, 
  subtitle,
  icon = <Wallet className="h-5 w-5" />,
  isLoading = false
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-9 w-3/4 bg-muted animate-pulse-slow rounded"></div>
        ) : (
          <>
            <div className="text-2xl font-bold">${amount}</div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
