
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, Wallet } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import Logo from "@/components/Logo";
import ReturnsCalculator from "@/components/ReturnsCalculator";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'login' | 'signup' | 'otp'>('login');
  const [value, setValue] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = () => {
    if (currentView === 'login') {
      // Handle login
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        toast.success("Login successful");
        navigate("/dashboard");
      }, 1500);
    } else if (currentView === 'signup') {
      // Move to OTP screen
      if (!email) {
        toast.error("Please enter your email address");
        return;
      }
      setCurrentView('otp');
    } else if (currentView === 'otp') {
      // Verify OTP and log in
      if (value.length !== 6) {
        toast.error("Please enter a valid 6-digit code");
        return;
      }
      
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        toast.success("Account created successfully");
        navigate("/dashboard");
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-teal-900 to-teal-950 text-white">
      {/* Language Selector */}
      <div className="absolute top-6 right-6">
        <Button variant="ghost" className="text-teal-400 hover:text-teal-300">
          English <ChevronRight className="ml-1 h-4 w-4 rotate-90" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-6">
        {/* Left Side - Logo and Tagline */}
        <div className="md:w-1/2 flex flex-col items-center md:items-start mb-10 md:mb-0">
          <Logo className="mb-4" />
          <h2 className="text-xl md:text-2xl text-teal-400 text-center md:text-left mb-8">
            Simple, Fast and Safe Staking<br />for your Digital Assets
          </h2>
          
          {/* Show calculator only on desktop or when not in OTP view */}
          {(window.innerWidth > 768 || currentView !== 'otp') && (
            <ReturnsCalculator />
          )}
        </div>

        {/* Right Side - Auth Form */}
        <div className="md:w-1/2 flex justify-center">
          <div className="w-full max-w-md bg-teal-800/30 backdrop-blur-sm border border-teal-700/30 rounded-xl p-8">
            <div className="text-center mb-8">
              <div className="mb-2">
                <Button 
                  variant="link" 
                  className={`text-lg ${currentView === 'signup' ? 'text-teal-400 underline underline-offset-4' : 'text-gray-300'}`}
                  onClick={() => setCurrentView('signup')}
                >
                  SIGN UP
                </Button>
                <span className="mx-2 text-gray-400">/</span>
                <Button 
                  variant="link" 
                  className={`text-lg ${currentView === 'login' ? 'text-teal-400 underline underline-offset-4' : 'text-gray-300'}`}
                  onClick={() => setCurrentView('login')}
                >
                  LOGIN
                </Button>
              </div>
            </div>

            {currentView === 'otp' ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center">INPUT YOUR CONFIRMATION CODE</h2>
                <p className="text-center text-teal-300">
                  Almost there. Please enter the verification<br />
                  code we sent to your email
                </p>
                <div className="flex justify-center my-6">
                  <InputOTP maxLength={6} value={value} onChange={(value) => setValue(value)}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="border-teal-600 bg-teal-800/30 h-14 w-14" />
                      <InputOTPSlot index={1} className="border-teal-600 bg-teal-800/30 h-14 w-14" />
                      <InputOTPSlot index={2} className="border-teal-600 bg-teal-800/30 h-14 w-14" />
                      <InputOTPSlot index={3} className="border-teal-600 bg-teal-800/30 h-14 w-14" />
                      <InputOTPSlot index={4} className="border-teal-600 bg-teal-800/30 h-14 w-14" />
                      <InputOTPSlot index={5} className="border-teal-600 bg-teal-800/30 h-14 w-14" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <div className="text-center">
                  <Button variant="link" className="text-teal-400">
                    Click to Resend code
                  </Button>
                </div>
                <Button 
                  className="w-full bg-teal-500 hover:bg-teal-400 h-14 text-lg"
                  onClick={handleContinue}
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify & Continue"}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <Input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="bg-teal-800/30 border-teal-600 text-teal-300 placeholder:text-teal-500 h-14"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                {currentView === 'login' && (
                  <div className="relative">
                    <Input 
                      type="password" 
                      placeholder="Password" 
                      className="bg-teal-800/30 border-teal-600 text-teal-300 placeholder:text-teal-500 h-14 pr-12"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 text-teal-400 h-5 w-5" />
                  </div>
                )}
                
                <Button 
                  className="w-full bg-teal-500 hover:bg-teal-400 h-14 text-lg"
                  onClick={handleContinue}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Continue with Email"}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px flex-1 bg-teal-700"></div>
                  <span className="text-teal-400">or</span>
                  <div className="h-px flex-1 bg-teal-700"></div>
                </div>
                
                <Button className="w-full bg-teal-800/40 hover:bg-teal-700/60 text-teal-300 border border-teal-600 h-14 text-lg">
                  Continue with Wallet
                  <Wallet className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6">
        <p className="text-center text-teal-500">© 2020 Network Untop Network. All Rights Reserved</p>
      </div>
    </div>
  );
};

export default Index;
