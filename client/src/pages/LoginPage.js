"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LoginPage;
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const react_router_dom_1 = require("react-router-dom");
const react_hook_form_1 = require("react-hook-form");
const api_1 = require("@/services/api");
const useAuthStore_1 = require("@/store/useAuthStore");
const react_1 = require("react");
function LoginPage() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const login = (0, useAuthStore_1.useAuthStore)((state) => state.login);
    const { register, handleSubmit } = (0, react_hook_form_1.useForm)();
    const [serverError, setServerError] = (0, react_1.useState)("");
    const onSubmit = async (data) => {
        try {
            setServerError("");
            const res = await api_1.api.post('/auth/login', data);
            login(res.data.data.user);
            // Redirect based on role
            const role = res.data.data.user.role;
            if (role === 'INSTRUCTOR') {
                navigate('/instructor/dashboard');
            }
            else if (role === 'ADMIN') {
                navigate('/admin/dashboard');
            }
            else {
                navigate('/dashboard');
            }
        }
        catch (err) {
            console.error(err);
            setServerError(err.response?.data?.message || "Login failed");
        }
    };
    return (<div className="flex h-[calc(100vh-4rem)] items-center justify-center">
            <card_1.Card className="w-full max-w-sm">
                <card_1.CardHeader>
                    <card_1.CardTitle className="text-2xl">Login</card_1.CardTitle>
                    <card_1.CardDescription>
                        Enter your email below to login to your account.
                    </card_1.CardDescription>
                </card_1.CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <card_1.CardContent className="grid gap-4">
                        {serverError && <div className="text-sm text-red-500">{serverError}</div>}
                        <div className="grid gap-2">
                            <label_1.Label htmlFor="email">Email</label_1.Label>
                            <input_1.Input id="email" type="email" placeholder="m@example.com" required {...register("email")}/>
                        </div>
                        <div className="grid gap-2">
                            <label_1.Label htmlFor="password">Password</label_1.Label>
                            <input_1.Input id="password" type="password" required {...register("password")}/>
                        </div>
                    </card_1.CardContent>
                    <card_1.CardFooter className="flex flex-col gap-4">
                        <button_1.Button className="w-full">Sign In</button_1.Button>
                        <div className="text-center text-sm">
                            Don't have an account?{" "}
                            <react_router_dom_1.Link to="/register" className="underline">
                                Sign Up
                            </react_router_dom_1.Link>
                        </div>
                    </card_1.CardFooter>
                </form>
            </card_1.Card>
        </div>);
}
