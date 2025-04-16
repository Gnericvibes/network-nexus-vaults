
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ReturnsCalculator = () => {
  const [stakingAmount, setStakingAmount] = useState(1000);
  const [stakingPeriod, setStakingPeriod] = useState(30);
  const APY = 12; // 12% APY

  const calculateReturns = () => {
    // Simple interest calculation
    const returnAmount = (stakingAmount * APY * (stakingPeriod / 365)) / 100;
    return returnAmount.toFixed(2);
  };

  return (
    <div className="w-full max-w-md bg-teal-800/30 backdrop-blur-sm border border-teal-700/30 rounded-xl p-6">
      <h3 className="text-xl mb-6 text-white">Quick Returns Calculator</h3>
      
      <div className="mb-4">
        <label className="block text-teal-400 mb-2">Staking Amount (USDT)</label>
        <Input
          type="number"
          value={stakingAmount}
          onChange={(e) => setStakingAmount(Number(e.target.value))}
          className="bg-teal-800/30 border-teal-600 text-white w-full"
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-teal-400 mb-2">Staking Period</label>
        <div className="flex gap-3">
          <Button
            onClick={() => setStakingPeriod(30)}
            className={`flex-1 ${stakingPeriod === 30 ? 'bg-teal-500 hover:bg-teal-400' : 'bg-teal-800/60 hover:bg-teal-700'}`}
          >
            30 Days
          </Button>
          <Button
            onClick={() => setStakingPeriod(90)}
            className={`flex-1 ${stakingPeriod === 90 ? 'bg-teal-500 hover:bg-teal-400' : 'bg-teal-800/60 hover:bg-teal-700'}`}
          >
            90 Days
          </Button>
          <Button
            onClick={() => setStakingPeriod(180)}
            className={`flex-1 ${stakingPeriod === 180 ? 'bg-teal-500 hover:bg-teal-400' : 'bg-teal-800/60 hover:bg-teal-700'}`}
          >
            180 Days
          </Button>
        </div>
      </div>
      
      <div className="bg-teal-900/60 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-teal-400">Estimated Returns:</p>
            <p className="text-xs text-teal-500">at {APY}% APY</p>
          </div>
          <div className="text-2xl font-bold text-white">${calculateReturns()}</div>
        </div>
      </div>
    </div>
  );
};

export default ReturnsCalculator;
