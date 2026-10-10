import React, { useState } from 'react';
import { login } from '../../services/auth';
import { Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage('Username atau password salah.');
      return;
    }

    setIsLoading(true);

    const result = login(username, password);
    setIsLoading(false);

    if (result.success) {
      onLoginSuccess();
    } else {
      setErrorMessage(result.error || 'Username atau password salah.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col justify-center items-center p-4 antialiased text-[#F3F4F6]">
      {/* Centered Login Card */}
      <div className="w-full max-w-sm mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#151619] border border-[#27292E] text-[#818CF8] mb-3 shadow-xs">
            <span className="text-xs font-bold font-mono">TF</span>
          </div>
          <div className="text-xs font-semibold tracking-wider uppercase text-[#6B7280]">
            TaskFlow
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#F3F4F6]">
            Welcome back
          </h1>
          <p className="mt-1 text-xs text-[#9CA3AF]">
            Sign in to continue to your workspace.
          </p>
        </div>

        {/* Login Form Container */}
        <div className="bg-[#151619] border border-[#27292E] rounded-xl p-6 sm:p-7 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Inline Error Message */}
            {errorMessage && (
              <div
                className="flex items-start gap-2.5 p-3 rounded-lg bg-[#F87171]/10 border border-[#F87171]/25 text-[#F87171] text-xs font-medium animate-in fade-in duration-150"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Username Input */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B7280]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter your username"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-[#0A0A0B] text-[#F3F4F6] border border-[#27292E] rounded-lg placeholder-[#6B7280] focus:border-[#818CF8] focus:outline-none focus:ring-1 focus:ring-[#818CF8] transition-colors"
                />
              </div>
            </div>

            {/* Password Input with Show/Hide Toggle */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B7280]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-10 py-2 text-sm bg-[#0A0A0B] text-[#F3F4F6] border border-[#27292E] rounded-lg placeholder-[#6B7280] focus:border-[#818CF8] focus:outline-none focus:ring-1 focus:ring-[#818CF8] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6B7280] hover:text-[#9CA3AF] focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-2 px-4 text-sm font-semibold text-[#0A0A0B] bg-[#818CF8] hover:bg-[#9CA3AF] active:bg-[#6366F1] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#818CF8] disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Login'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <p className="mt-6 text-center text-xs text-[#6B7280]">
          Personal workspace · All data stays in your browser
        </p>
      </div>
    </div>
  );
};
