
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomDurationSelector from "@/components/CustomDurationSelector";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Clock, Coins, Landmark, PiggyBank } from "lucide-react";

// Define form schema with Zod
const formSchema = z.object({
  goalName: z.string().min(3, { message: "Goal name must be at least 3 characters" }),
  amount: z.coerce.number().min(1, { message: "Amount must be at least 1 USDC" }),
  chain: z.enum(["ethereum", "base", "polygon"], { 
    required_error: "Please select a blockchain network" 
  }),
  duration: z.object({
    type: z.enum(["preset", "custom"]),
    value: z.string().or(z.number()),
    unit: z.enum(["days", "weeks", "months"]).optional(),
  }),
  note: z.string().optional(),
});

const presetDurations = [
  { label: "3 Days", value: "3_days" },
  { label: "1 Week", value: "1_week" },
  { label: "2 Weeks", value: "2_weeks" },
  { label: "1 Month", value: "1_month" },
  { label: "3 Months", value: "3_months" },
  { label: "6 Months", value: "6_months" },
  { label: "12 Months", value: "12_months" },
];

const useCaseTemplates = [
  { name: "Rent", duration: "1_month", icon: <Landmark className="h-5 w-5" /> },
  { name: "School Fees", duration: "3_months", icon: <Coins className="h-5 w-5" /> },
  { name: "Medical Fund", duration: "6_months", icon: <CheckCircle className="h-5 w-5" /> },
  { name: "Travel", duration: "6_months", icon: <Coins className="h-5 w-5" /> },
  { name: "Business Capital", duration: "12_months", icon: <Coins className="h-5 w-5" /> },
];

const CreateGoal = () => {
  const navigate = useNavigate();
  const [durationType, setDurationType] = useState("preset");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goalName: "",
      amount: undefined,
      chain: "ethereum",
      duration: {
        type: "preset",
        value: "1_month",
      },
      note: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // This would be replaced with actual API call to smart contract
      console.log("Form submitted with values:", values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Savings goal created successfully!", {
        description: `Your ${values.goalName} goal has been created.`,
      });
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to create savings goal", {
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Apply a template
  const applyTemplate = (template: (typeof useCaseTemplates)[0]) => {
    form.setValue("goalName", template.name);
    form.setValue("duration.type", "preset");
    form.setValue("duration.value", template.duration);
    setDurationType("preset");
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Create New Savings Goal</h1>
        <p className="mt-1 text-teal-400">Set up a custom savings goal with flexible lock duration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="bg-teal-800/30 backdrop-blur-sm border border-teal-700/30 text-white">
            <CardHeader>
              <CardTitle>Goal Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="goalName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-teal-300">Goal Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. New Car, Education, Vacation" 
                            className="bg-teal-800/30 border-teal-600 text-teal-300 placeholder:text-teal-500"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription className="text-teal-500">
                          Give your savings goal a meaningful name
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-teal-300">Amount (USDC)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              className="bg-teal-800/30 border-teal-600 text-teal-300 placeholder:text-teal-500 pl-10"
                              {...field} 
                            />
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-500">
                              $
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription className="text-teal-500">
                          Amount of USDC to save
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="chain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-teal-300">Blockchain Network</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-teal-800/30 border-teal-600 text-teal-300">
                              <SelectValue placeholder="Select a network" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-teal-800 border-teal-600">
                            <SelectItem value="ethereum" className="text-teal-300">Ethereum</SelectItem>
                            <SelectItem value="base" className="text-teal-300">Base</SelectItem>
                            <SelectItem value="polygon" className="text-teal-300">Polygon</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-teal-500">
                          Select the blockchain network for your savings
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormLabel className="text-teal-300">Lock Duration</FormLabel>
                    <Tabs 
                      defaultValue="preset" 
                      onValueChange={(value) => {
                        setDurationType(value);
                        form.setValue("duration.type", value as "preset" | "custom");
                      }}
                      className="w-full"
                    >
                      <TabsList className="grid grid-cols-2 bg-teal-800/30">
                        <TabsTrigger 
                          value="preset"
                          className="data-[state=active]:bg-teal-600 data-[state=active]:text-white"
                        >
                          Preset Durations
                        </TabsTrigger>
                        <TabsTrigger 
                          value="custom"
                          className="data-[state=active]:bg-teal-600 data-[state=active]:text-white"
                        >
                          Custom Duration
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="preset" className="mt-4">
                        <FormField
                          control={form.control}
                          name="duration.value"
                          render={({ field }) => (
                            <FormItem>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {presetDurations.map((duration) => (
                                  <Button
                                    key={duration.value}
                                    type="button"
                                    variant="outline"
                                    className={`flex items-center justify-center h-14 border-teal-600 hover:bg-teal-700/40 ${
                                      field.value === duration.value
                                        ? "bg-teal-600 text-white border-teal-500"
                                        : "bg-teal-800/30 text-teal-300"
                                    }`}
                                    onClick={() => field.onChange(duration.value)}
                                  >
                                    <Clock className="mr-2 h-4 w-4" />
                                    {duration.label}
                                  </Button>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      <TabsContent value="custom" className="mt-4">
                        <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <CustomDurationSelector
                                onChange={(customDuration) => {
                                  field.onChange({
                                    type: "custom",
                                    value: customDuration.value,
                                    unit: customDuration.unit,
                                  });
                                }}
                                className="bg-teal-800/30 border-teal-600 text-teal-300"
                              />
                              <FormDescription className="text-teal-500 mt-2">
                                Set a custom duration in days, weeks, or months
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>

                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-teal-300">Note (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add a note about this savings goal" 
                            className="bg-teal-800/30 border-teal-600 text-teal-300 placeholder:text-teal-500 min-h-24"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4 border-t border-teal-700/30 flex justify-end">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="mr-4 border-teal-600 text-teal-300 hover:bg-teal-700/40"
                      onClick={() => navigate("/dashboard")}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-teal-500 hover:bg-teal-400 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating..." : "Create Savings Goal"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-teal-800/30 backdrop-blur-sm border border-teal-700/30 text-white sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <PiggyBank className="mr-2 h-5 w-5 text-teal-400" />
                Use Case Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {useCaseTemplates.map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left border-teal-600 bg-teal-800/30 hover:bg-teal-700/40 text-teal-300 h-auto py-3"
                    onClick={() => applyTemplate(template)}
                  >
                    <div className="mr-3 p-2 bg-teal-700/40 rounded-full">
                      {template.icon}
                    </div>
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-teal-500">
                        {presetDurations.find(d => d.value === template.duration)?.label}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>

              <div className="mt-6 p-4 bg-teal-700/20 rounded-lg">
                <h3 className="font-medium text-teal-300 mb-2">About Early Withdrawal</h3>
                <p className="text-sm text-teal-400">
                  If you withdraw before your lock period ends, a 5% fee will be deducted from your savings.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateGoal;
