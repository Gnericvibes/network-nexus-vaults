
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { ArrowUpRight, Plus, PiggyBank, Clock, Calendar } from "lucide-react";

const Dashboard = () => {
  const [goals, setGoals] = useState<any[]>([]);

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Your Savings Goals</h1>
          <p className="mt-1 text-teal-400">Create and manage your savings goals</p>
        </div>
        <Link to="/create-goal">
          <Button className="bg-teal-500 hover:bg-teal-400">
            <Plus className="mr-2 h-4 w-4" /> Create New Goal
          </Button>
        </Link>
      </div>

      {goals.length === 0 ? (
        <Card className="bg-teal-800/30 backdrop-blur-sm border border-teal-700/30 text-white">
          <CardHeader>
            <CardTitle className="text-center text-2xl">No Savings Goals Yet</CardTitle>
            <CardDescription className="text-center text-teal-400">
              Start saving by creating your first goal
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center p-6">
            <div className="mb-6 p-6 bg-teal-700/20 rounded-full">
              <PiggyBank className="h-16 w-16 text-teal-400" />
            </div>
            <p className="mb-6 text-center max-w-md text-teal-300">
              Create custom savings goals with flexible lock periods and earn rewards through decentralized staking.
            </p>
            <Link to="/create-goal">
              <Button className="bg-teal-500 hover:bg-teal-400 h-12 px-6">
                <Plus className="mr-2 h-4 w-4" /> Create Your First Goal
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Goals will be mapped here once implemented */}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
