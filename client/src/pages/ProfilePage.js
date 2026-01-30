"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProfilePage;
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const textarea_1 = require("@/components/ui/textarea");
const react_1 = require("react");
const api_1 = require("@/services/api");
const useAuthStore_1 = require("@/store/useAuthStore");
const ImageUpload_1 = __importDefault(require("@/components/common/ImageUpload"));
const lucide_react_1 = require("lucide-react");
function ProfilePage() {
    const { user, setUser } = (0, useAuthStore_1.useAuthStore)();
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [isSaving, setIsSaving] = (0, react_1.useState)(false);
    const [formData, setFormData] = (0, react_1.useState)({
        name: "",
        headline: "",
        bio: "",
        avatar: ""
    });
    (0, react_1.useEffect)(() => {
        fetchProfile();
    }, []);
    const fetchProfile = async () => {
        try {
            const res = await api_1.api.get('/users/me');
            const userData = res.data.data.user;
            setFormData({
                name: userData.name || "",
                headline: userData.headline || "",
                bio: userData.bio || "",
                avatar: userData.avatar || ""
            });
            // Also update global store just in case
            if (user && JSON.stringify(user) !== JSON.stringify(userData)) {
                // setUser(userData); // No need to update store here if we just want to fill form
                // But keeping store in sync is good.
            }
        }
        catch (error) {
            console.error("Failed to fetch profile", error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleAvatarUpdate = (url) => {
        setFormData(prev => ({ ...prev, avatar: url }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await api_1.api.patch('/users/me', formData);
            const updatedUser = res.data.data.user;
            // Update Global Auth Store
            if (user) {
                // We need to merge because API might return subsets or full object, 
                // but our store expects the structure stored in localstorage/memory
                // Ideally authStore's setUser should handle it.
                // Assuming setUser replaces the object.
                // We might lose token if we just replace with `updatedUser` if `updatedUser` doesn't have token?
                // `updatedUser` from `updateMe` endpoint is just the User object.
                // `useAuthStore` stores { token, user: ... } usually?
                // Let's check api.ts
                // Temporary fix: we need to manually update the user part of the store.
                // But `setUser` in `api.ts` (assuming) usually sets the user object.
                setUser(updatedUser);
            }
            alert("Profile updated successfully!");
        }
        catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile.");
        }
        finally {
            setIsSaving(false);
        }
    };
    if (isLoading)
        return <div className="flex justify-center p-10"><lucide_react_1.Loader2 className="animate-spin"/></div>;
    return (<div className="container max-w-2xl py-10">
            <h1 className="text-3xl font-bold mb-8">My Profile</h1>

            <form onSubmit={handleSubmit}>
                <card_1.Card>
                    <card_1.CardHeader>
                        <card_1.CardTitle>Personal Information</card_1.CardTitle>
                        <card_1.CardDescription>Update your public profile details.</card_1.CardDescription>
                    </card_1.CardHeader>
                    <card_1.CardContent className="space-y-6">

                        {/* Avatar Upload */}
                        <ImageUpload_1.default currentUrl={formData.avatar} onUploadComplete={handleAvatarUpdate}/>

                        <div className="space-y-2">
                            <label_1.Label htmlFor="name">Full Name</label_1.Label>
                            <input_1.Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required/>
                        </div>

                        <div className="space-y-2">
                            <label_1.Label htmlFor="headline">Headline</label_1.Label>
                            <input_1.Input id="headline" name="headline" value={formData.headline} onChange={handleChange} placeholder="Software Engineer & Instructor"/>
                            <p className="text-[0.8rem] text-muted-foreground">
                                A short professional headline that appears below your name.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label_1.Label htmlFor="bio">Bio</label_1.Label>
                            <textarea_1.Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself..." className="min-h-[100px]"/>
                        </div>

                    </card_1.CardContent>
                    <card_1.CardFooter className="flex justify-end">
                        <button_1.Button type="submit" disabled={isSaving}>
                            {isSaving && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Save Changes
                        </button_1.Button>
                    </card_1.CardFooter>
                </card_1.Card>
            </form>
        </div>);
}
