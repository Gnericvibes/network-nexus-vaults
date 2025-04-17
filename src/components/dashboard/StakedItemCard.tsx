
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Lock, Unlock } from 'lucide-react';

interface StakedItemCardProps {
  amount: string;
  protocol: 'SwellChain' | 'Base';
  rewards: string;
  lockPeriod: number;
  unlockDate: Date;
  onWithdraw: () => void;
}

const StakedItemCard: React.FC<StakedItemCardProps> = ({
  amount,
  protocol,
  rewards,
  lockPeriod,
  unlockDate,
  onWithdraw
}) => {
  const isUnlocked = new Date() >= unlockDate;
  const protocolColor = protocol === 'SwellChain' ? 'app-purple' : 'app-blue';
  
  // Calculate remaining time
  const getRemainingTime = () => {
    if (isUnlocked) return 'Unlocked';
    
    const now = new Date();
    const diff = unlockDate.getTime() - now.getTime();
    
    // Convert to days
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 30) {
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? 's' : ''} left`;
    } else {
      return `${days} day${days !== 1 ? 's' : ''} left`;
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className={`h-2 w-full bg-${protocolColor}`} />
      <CardContent className="pt-6">
        <div className="flex justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">
            {protocol}
          </span>
          <span className="text-sm font-medium">
            {isUnlocked ? (
              <div className="flex items-center text-app-green">
                <Unlock size={16} className="mr-1" />
                Unlocked
              </div>
            ) : (
              <div className="flex items-center text-app-gray">
                <Lock size={16} className="mr-1" />
                {lockPeriod} Month Lock
              </div>
            )}
          </span>
        </div>
        
        <div className="space-y-2">
          <div>
            <div className="text-2xl font-bold">${amount}</div>
            <p className="text-xs text-muted-foreground">Staked Amount</p>
          </div>
          
          <div>
            <div className="text-lg font-semibold text-app-green">+${rewards}</div>
            <p className="text-xs text-muted-foreground">Earned Rewards</p>
          </div>
          
          <div className="flex items-center text-sm text-app-gray">
            <Clock size={14} className="mr-1" />
            {getRemainingTime()}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 px-6 py-3">
        <Button
          className="w-full"
          disabled={!isUnlocked}
          onClick={onWithdraw}
        >
          {isUnlocked ? 'Withdraw' : 'Locked'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StakedItemCard;
