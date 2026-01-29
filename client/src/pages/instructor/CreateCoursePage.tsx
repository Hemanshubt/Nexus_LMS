import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { api } from "@/services/api"
import FileUpload from "@/components/common/FileUpload"

export default function CreateCoursePage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit } = useForm();
    const [error, setError] = useState("");
    const [thumbnail, setThumbnail] = useState("");

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setError("");
        try {
            await api.post('/courses', { ...data, thumbnail });
            navigate("/instructor/dashboard");
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to create course. Ensure you are an Instructor.");
            // If 403, maybe not an instructor
            if (err.response?.status === 401) {
                navigate("/login");
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="container max-w-2xl py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Create New Course</h1>
                <p className="text-muted-foreground">Basis information for your new course.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {error && <div className="text-red-500">{error}</div>}
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Course Title</Label>
                        <Input id="title" placeholder="e.g. Advanced Web Development" required {...register("title")} />
                        <p className="text-xs text-muted-foreground">
                            This is what students will see in the catalog.
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="Describe what students will learn..." className="min-h-[120px]" {...register("description")} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="price">Price ($)</Label>
                            <Input id="price" type="number" min="0" defaultValue="0" {...register("price")} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Input id="category" placeholder="e.g. Programming" {...register("category")} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Course Thumbnail</Label>
                        <FileUpload
                            onUploadComplete={(url) => setThumbnail(url)}
                            currentUrl={thumbnail}
                            label="Thumbnail Image"
                        />
                        <p className="text-xs text-muted-foreground">
                            Upload a high-quality image (16:9 recommended).
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" type="button" asChild>
                        <Link to="/instructor/dashboard">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Creating..." : "Create Course"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
