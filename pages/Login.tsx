import { useState } from 'react';
import { Button } from "../components/Login/ui/button";
import { Input } from "../components/Login/ui/input";
import { Label } from "../components/Login/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/Login/ui/card";
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('/api/login', { email, password });
      if (response.status === 200) {
        router.push('/workpage');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Log in to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
          </div>
          {error && (
            <div className="mt-4 text-red-500">
              {error}
            </div>
          )}
          <Button type="submit" className="mt-4 w-full">
            Login
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-blue-500 hover:underline">
            Get Started
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}