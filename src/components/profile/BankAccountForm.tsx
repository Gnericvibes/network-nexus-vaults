import React from 'react';
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePrivyAuth } from '@/contexts/PrivyAuthContext';

const formSchema = z.object({
  bank_name: z.string().min(2, { message: 'Bank name must be at least 2 characters.' }),
  account_name: z.string().min(2, { message: 'Account name is required.' }),
  account_number: z.string().min(5, { message: 'Valid account number required.' }),
  country: z.string().min(2, { message: 'Country is required.' }),
  routing_number: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BankAccountFormProps {
  onComplete?: () => void;
  existingData?: FormValues;
  accountId?: string;
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({ onComplete, existingData, accountId }) => {
  const { toast } = useToast();
  const { user, isAuthenticated } = usePrivyAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: existingData || {
      bank_name: '',
      account_name: '',
      account_number: '',
      country: '',
      routing_number: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!isAuthenticated || !user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to add a bank account',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
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

      if (accountId) {
        // Update existing account
        const { error } = await supabase
          .from('bank_accounts')
          .update({
            bank_name: values.bank_name,
            account_name: values.account_name,
            account_number: values.account_number,
            country: values.country,
            routing_number: values.routing_number || null,
            user_id: session.user.id,
          })
          .eq('id', accountId);

        if (error) throw error;
        toast({
          title: 'Bank account updated',
          description: 'Your bank account details have been successfully updated.',
        });
      } else {
        // Create new account
        const { error } = await supabase.from('bank_accounts').insert({
          bank_name: values.bank_name,
          account_name: values.account_name,
          account_number: values.account_number,
          country: values.country,
          routing_number: values.routing_number || null,
          user_id: session.user.id,
        });

        if (error) throw error;
        toast({
          title: 'Bank account added',
          description: 'Your bank account has been successfully added.',
        });
      }

      if (onComplete) onComplete();
    } catch (error: any) {
      console.error('Error saving bank account:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save bank account details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="bank_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your bank name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="account_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Holder Name</FormLabel>
              <FormControl>
                <Input placeholder="Name on account" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="account_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter account number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Nigeria">Nigeria</SelectItem>
                  <SelectItem value="Ghana">Ghana</SelectItem>
                  <SelectItem value="Kenya">Kenya</SelectItem>
                  <SelectItem value="South Africa">South Africa</SelectItem>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="routing_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Routing/Swift Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter routing number if applicable" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Saving...' : accountId ? 'Update Account' : 'Add Account'}
        </Button>
      </form>
    </Form>
  );
};

export default BankAccountForm;
