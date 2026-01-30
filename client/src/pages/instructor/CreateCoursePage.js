"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CreateCoursePage;
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const textarea_1 = require("@/components/ui/textarea");
const react_router_dom_1 = require("react-router-dom");
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const api_1 = require("@/services/api");
const FileUpload_1 = __importDefault(require("@/components/common/FileUpload"));
function CreateCoursePage() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const { register, handleSubmit } = (0, react_hook_form_1.useForm)();
    const [error, setError] = (0, react_1.useState)("");
    const [thumbnail, setThumbnail] = (0, react_1.useState)("");
    const onSubmit = async (data) => {
        setIsLoading(true);
        setError("");
        try {
            await api_1.api.post('/courses', { ...data, thumbnail });
            navigate("/instructor/dashboard");
        }
        catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to create course. Ensure you are an Instructor.");
            // If 403, maybe not an instructor
            if (err.response?.status === 401) {
                navigate("/login");
            }
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<div className="container max-w-2xl py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Create New Course</h1>
                <p className="text-muted-foreground">Basis information for your new course.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {error && <div className="text-red-500">{error}</div>}
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <label_1.Label htmlFor="title">Course Title</label_1.Label>
                        <input_1.Input id="title" placeholder="e.g. Advanced Web Development" required {...register("title")}/>
                        <p className="text-xs text-muted-foreground">
                            This is what students will see in the catalog.
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <label_1.Label htmlFor="description">Description</label_1.Label>
                        <textarea_1.Textarea id="description" placeholder="Describe what students will learn..." className="min-h-[120px]" {...register("description")}/>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label_1.Label htmlFor="price">Price ($)</label_1.Label>
                            <input_1.Input id="price" type="number" min="0" defaultValue="0" {...register("price")}/>
                        </div>
                        <div className="grid gap-2">
                            <label_1.Label htmlFor="category">Category</label_1.Label>
                            <input_1.Input id="category" placeholder="e.g. Programming" {...register("category")}/>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label_1.Label>Course Thumbnail</label_1.Label>
                        <FileUpload_1.default onUploadComplete={(url) => setThumbnail(url)} currentUrl={thumbnail} label="Thumbnail Image"/>
                        <p className="text-xs text-muted-foreground">
                            Upload a high-quality image (16:9 recommended).
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button_1.Button variant="outline" type="button" asChild>
                        <react_router_dom_1.Link to="/instructor/dashboard">Cancel</react_router_dom_1.Link>
                    </button_1.Button>
                    <button_1.Button type="submit" disabled={isLoading}>
                        {isLoading ? "Creating..." : "Create Course"}
                    </button_1.Button>
                </div>
            </form>
        </div>);
}
