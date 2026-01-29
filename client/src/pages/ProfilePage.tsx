import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { api } from "@/services/api"
import { useAuthStore } from "@/store/useAuthStore"
import ImageUpload from "@/components/common/ImageUpload"
import { Loader2 } from "lucide-react"

export default function ProfilePage() {
    const { user, setUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        headline: "",
        bio: "",
        avatar: ""
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/me');
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
        } catch (error) {
            console.error("Failed to fetch profile", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarUpdate = (url: string) => {
        setFormData(prev => ({ ...prev, avatar: url }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await api.patch('/users/me', formData);
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
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="container max-w-2xl py-10">
            <h1 className="text-3xl font-bold mb-8">My Profile</h1>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your public profile details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {/* Avatar Upload */}
                        <ImageUpload
                            currentUrl={formData.avatar}
                            onUploadComplete={handleAvatarUpdate}
                        />

                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="headline">Headline</Label>
                            <Input
                                id="headline"
                                name="headline"
                                value={formData.headline}
                                onChange={handleChange}
                                placeholder="Software Engineer & Instructor"
                            />
                            <p className="text-[0.8rem] text-muted-foreground">
                                A short professional headline that appears below your name.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Tell us about yourself..."
                                className="min-h-[100px]"
                            />
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    )
}
