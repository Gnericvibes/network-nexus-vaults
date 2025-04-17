
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageContainer from '@/components/layout/PageContainer';
import ChainSwitcher from '@/components/dashboard/ChainSwitcher';
import { useTransactions, TransactionType } from '@/contexts/TransactionContext';
import { ArrowLeft, Clock, Check, XCircle, Calendar } from 'lucide-react';

const HistoryPage: React.FC = () => {
  const [filter, setFilter] = useState<TransactionType | 'all'>('all');
  const navigate = useNavigate();
  const { transactions, getFilteredTransactions } = useTransactions();

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-app-green" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-app-gray" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-app-red" />;
      default:
        return null;
    }
  };

  // Get transaction color
  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case 'deposit':
      case 'on-ramp':
        return 'bg-app-green/10 text-app-green';
      case 'withdrawal':
      case 'off-ramp':
        return 'bg-app-blue/10 text-app-blue';
      case 'stake':
        return 'bg-app-purple/10 text-app-purple';
      case 'unstake':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get type label
  const getTypeLabel = (type: TransactionType) => {
    switch (type) {
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      case 'stake':
        return 'Stake';
      case 'unstake':
        return 'Unstake';
      case 'on-ramp':
        return 'On-Ramp';
      case 'off-ramp':
        return 'Off-Ramp';
      default:
        return type;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-app-green/10 text-app-green border-app-green/30">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-app-red/10 text-app-red border-app-red/30">Failed</Badge>;
      default:
        return null;
    }
  };

  // Filter transactions
  const filteredTransactions = filter === 'all' 
    ? transactions 
    : getFilteredTransactions([filter]);

  // Get transaction history by month
  const getTransactionsByMonth = () => {
    const months: Record<string, any[]> = {};
    
    filteredTransactions.forEach(tx => {
      const monthYear = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric'
      }).format(tx.timestamp);
      
      if (!months[monthYear]) {
        months[monthYear] = [];
      }
      
      months[monthYear].push(tx);
    });
    
    return months;
  };
  
  const transactionsByMonth = getTransactionsByMonth();

  return (
    <PageContainer>
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Transaction History</h1>
            <p className="text-muted-foreground mt-1">
              View and track all your transactions
            </p>
          </div>
          
          <ChainSwitcher />
        </div>
        
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle>Filter Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="w-full sm:w-auto">
                <Select 
                  value={filter}
                  onValueChange={(value) => setFilter(value as TransactionType | 'all')}
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="on-ramp">On-Ramp (Buy USDC)</SelectItem>
                    <SelectItem value="off-ramp">Off-Ramp (Sell USDC)</SelectItem>
                    <SelectItem value="stake">Stake</SelectItem>
                    <SelectItem value="unstake">Unstake</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Showing {filteredTransactions.length} transactions
              </p>
            </div>
          </CardContent>
        </Card>
        
        {Object.keys(transactionsByMonth).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(transactionsByMonth).map(([month, txs]) => (
              <div key={month} className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-app-purple" />
                  <h2 className="text-xl font-semibold">{month}</h2>
                </div>
                
                <div className="bg-white rounded-lg border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Amount</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Chain</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {txs.map(tx => (
                          <tr key={tx.id} className="border-b hover:bg-muted/20">
                            <td className="px-4 py-4 align-middle">
                              <div className={`px-2.5 py-1 rounded-full inline-flex items-center ${getTransactionColor(tx.type)}`}>
                                <span className="text-sm font-medium">{getTypeLabel(tx.type)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 align-middle text-sm">{formatDate(tx.timestamp)}</td>
                            <td className="px-4 py-4 align-middle font-medium">${tx.amount}</td>
                            <td className="px-4 py-4 align-middle text-sm capitalize">{tx.chain}</td>
                            <td className="px-4 py-4 align-middle">
                              <div className="flex items-center gap-1.5">
                                {getStatusIcon(tx.status)}
                                {getStatusBadge(tx.status)}
                              </div>
                            </td>
                            <td className="px-4 py-4 align-middle text-sm text-muted-foreground">
                              {tx.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border">
            <p className="text-muted-foreground mb-4">No transactions found matching your filter</p>
            <Button onClick={() => setFilter('all')} variant="outline">
              Clear Filter
            </Button>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default HistoryPage;
