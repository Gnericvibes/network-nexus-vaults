import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePrivyAuth } from '@/contexts/PrivyAuthContext';
import { Building, Edit, Trash2, PlusCircle } from 'lucide-react';
import BankAccountForm from './BankAccountForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface BankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  country: string;
  routing_number?: string;
  user_id: string;
  created_at: string;
}

const BankAccountsList = () => {
  const { isAuthenticated } = usePrivyAuth();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  const fetchAccounts = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      
      // Get the current session to get the user ID
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast({
          title: 'Authentication error',
          description: 'Please log in again',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error: any) {
      console.error('Error fetching bank accounts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your bank accounts',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [isAuthenticated]);

  const handleEditAccount = (account: BankAccount) => {
    setSelectedAccount(account);
    setOpenDialog(true);
  };

  const handleDeletePrompt = (accountId: string) => {
    setAccountToDelete(accountId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteAccount = async () => {
    if (!accountToDelete) return;

    try {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', accountToDelete);

      if (error) throw error;

      setAccounts(accounts.filter(account => account.id !== accountToDelete));
      toast({
        title: 'Account deleted',
        description: 'Bank account has been successfully removed',
      });
    } catch (error: any) {
      console.error('Error deleting bank account:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete bank account',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedAccount(null);
    fetchAccounts();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Bank Accounts</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Bank Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedAccount ? 'Edit Bank Account' : 'Add New Bank Account'}</DialogTitle>
              <DialogDescription>
                Enter your bank details below for easy withdrawals from your savings.
              </DialogDescription>
            </DialogHeader>
            <BankAccountForm 
              onComplete={handleDialogClose}
              existingData={selectedAccount || undefined}
              accountId={selectedAccount?.id}
            />
          </DialogContent>
        </Dialog>
      </div>

      {accounts.length === 0 ? (
        <Card className="border border-dashed">
          <CardContent className="text-center py-8">
            <Building className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
            <p className="text-lg font-medium">No bank accounts added yet</p>
            <p className="text-muted-foreground mb-4">Add your bank account to enable direct withdrawals</p>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button>Add Your First Account</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Bank Account</DialogTitle>
                  <DialogDescription>
                    Enter your bank details below for easy withdrawals from your savings.
                  </DialogDescription>
                </DialogHeader>
                <BankAccountForm onComplete={handleDialogClose} />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  {account.bank_name}
                </CardTitle>
                <CardDescription>{account.account_name}</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Account Number:</dt>
                    <dd className="font-medium">{account.account_number}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Country:</dt>
                    <dd className="font-medium">{account.country}</dd>
                  </div>
                  {account.routing_number && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Routing Number:</dt>
                      <dd className="font-medium">{account.routing_number}</dd>
                    </div>
                  )}
                  <div className="pt-2 flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditAccount(account)}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeletePrompt(account.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this bank account from your profile.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BankAccountsList;
