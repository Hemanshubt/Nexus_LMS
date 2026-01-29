import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { api } from "@/services/api"
import { useAuthStore } from "@/store/useAuthStore"
import { useState } from "react"

export default function RegisterPage() {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const { register, handleSubmit } = useForm();
    const [serverError, setServerError] = useState("");

    const onSubmit = async (data: any) => {
        try {
            setServerError("");
            // Defaulting to STUDENT role. In a real app, maybe a selection or separate flow for Instructor.
            const res = await api.post('/auth/register', { ...data, role: 'STUDENT' });
            login(res.data.data.user);
            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            setServerError(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Register</CardTitle>
                    <CardDescription>
                        Enter your email below to create your account.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="grid gap-4">
                        {serverError && <div className="text-sm text-red-500">{serverError}</div>}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" type="text" placeholder="John Doe" required {...register("name")} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="m@example.com" required {...register("email")} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" required {...register("password")} />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full">Sign Up</Button>
                        <div className="text-center text-sm">
                            Already have an account?{" "}
                            <Link to="/login" className="underline">
                                Log in
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
