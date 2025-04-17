
import React from 'react';
import { Button } from '@/components/ui/button';
import { useChain } from '@/contexts/ChainContext';
import { useToast } from '@/components/ui/use-toast';

const ChainSwitcher: React.FC = () => {
  const { currentChain, switchChain } = useChain();
  const { toast } = useToast();

  const handleSwitchChain = async () => {
    try {
      const newChain = currentChain === 'ethereum' ? 'base' : 'ethereum';
      await switchChain(newChain);
      toast({
        title: 'Chain Switched',
        description: `You are now on ${newChain.charAt(0).toUpperCase() + newChain.slice(1)}`,
      });
    } catch (error) {
      toast({
        title: 'Chain Switch Failed',
        description: 'There was an error switching chains',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-4 mb-2">
        <div
          className={`w-3 h-3 rounded-full ${
            currentChain === 'ethereum' ? 'bg-app-purple' : 'bg-app-blue'
          }`}
        />
        <span className="font-medium">
          Current Chain: {currentChain === 'ethereum' ? 'Ethereum (SwellChain)' : 'Base'}
        </span>
      </div>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleSwitchChain}
      >
        Switch to {currentChain === 'ethereum' ? 'Base' : 'Ethereum'}
      </Button>
    </div>
  );
};

export default ChainSwitcher;
