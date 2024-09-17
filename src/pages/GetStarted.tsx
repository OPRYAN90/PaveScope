import { useState } from 'react';
import { Button } from "../components/Login/ui/button";
import { Input } from "../components/Login/ui/input";
import { Label } from "../components/Login/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/Login/ui/card";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const isPasswordStrong = (password: string): boolean => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
};

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!isPasswordStrong(password)) {
      setError('Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters');
      return;
    }

    try {
      const response = await axios.post('/api/signup', { email, password });
      if (response.status === 201) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error signing up:', error);
      setError('Sign-up failed. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-blue-700">Get Started</CardTitle>
          <CardDescription className="text-center text-blue-600">Create an account to start using our services</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-blue-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-blue-700">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
              {error && (
                <div className="p-3 bg-red-100 border border-red-400 rounded-md">
                  <p className="text-red-700 text-sm" role="alert">{error}</p>
                </div>
              )}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Sign Up</Button>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-blue-600 text-center w-full">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-700 hover:underline">Login</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}