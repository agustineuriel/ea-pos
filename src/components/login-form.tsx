"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from 'react'; // Import useEffect
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import { signIn, useSession } from 'next-auth/react'; // Import useSession
import LoadingSpinner from "./loading-indicator";

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { data: session, status } = useSession(); // Get session status

    useEffect(() => {
        if (status === 'authenticated') {
            router.push('/'); // Redirect to homepage if already logged in
        }
    }, [status, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!email || !password) {
            toast.error("Please enter both email and password");
            setIsLoading(false);
            return;
        }

        const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
            callbackUrl: '/',
        });

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Login successful!");
            router.push(result?.url || '/');
        }

        setIsLoading(false);
    };

    // While checking authentication status, you might want to display a loading indicator
    if (status === 'loading') {
        return <LoadingSpinner/>; // Or a more visual loader
    }

    // If already authenticated, the useEffect hook will redirect, so we don't need to render the form
    if (status === 'authenticated') {
        return null; // Or maybe a message like "Redirecting..."
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Toaster richColors />
            <Card>
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? 'Loading...' : 'Login'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}