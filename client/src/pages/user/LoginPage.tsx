import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login } from '../../apis/userApis';
import { useDispatch, useSelector } from 'react-redux';
import { setAuth } from '../../redux/slices/authSlice';
import type { RootStateType } from '../../redux/store'; // Adjust import path as needed

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get auth state from Redux
  const { user, accessToken } = useSelector((state: RootStateType) => state.auth);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Check if user is already logged in on component mount
  useEffect(() => {
    if (user && accessToken) {
      navigate('/inventory', { replace: true });
    }
  }, [user, accessToken, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await login({ email: data.email, password: data.password });
      dispatch(setAuth({
        user: {
          email: result.data.email,
          role: result.data.role
        },
        accessToken: result.data.accessToken
      }));
      toast.success('Login successful!');
      reset();
      navigate('/inventory', { replace: true });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (user && accessToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Redirecting to inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center p-3">
      <div className="w-full max-w-sm">
        <div className="bg-black rounded-xl shadow-xl border border-red-600/20 p-5 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="mx-auto w-8 h-8 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center mb-3 shadow-md shadow-red-600/30">
              <LogIn className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Welcome Back</h2>
            <p className="text-gray-400 mt-1 text-sm">Sign in to your account</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className={`w-full pl-8 pr-3 py-2 text-sm bg-gray-900 border rounded-md focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all text-white placeholder-gray-500 ${errors.email
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-700 hover:border-gray-600'
                    }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={`w-full pl-8 pr-9 py-2 text-sm bg-gray-900 border rounded-md focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all text-white placeholder-gray-500 ${errors.password
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-700 hover:border-gray-600'
                    }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500 hover:text-red-400 transition-colors" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500 hover:text-red-400 transition-colors" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || isLoading}
              className={`w-full py-2.5 px-4 rounded-md font-medium text-sm text-white transition-all duration-200 ${isSubmitting || isLoading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-black shadow-md shadow-red-600/30'
                }`}
            >
              {isSubmitting || isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-5 text-center">
            <p className="text-xs text-gray-400">
              Don't have an account?{' '}
              <a
                onClick={() => navigate('/signup')}
                className="font-medium text-red-400 hover:text-red-300 transition-colors cursor-pointer"
              >
                Create one
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;