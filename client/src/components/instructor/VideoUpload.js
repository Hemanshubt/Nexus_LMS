"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VideoUpload;
const react_1 = require("react");
const axios_1 = __importDefault(require("axios"));
const api_1 = require("@/services/api");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const progress_1 = require("@/components/ui/progress");
const lucide_react_1 = require("lucide-react");
function VideoUpload({ onUploadComplete, currentUrl }) {
    const [file, setFile] = (0, react_1.useState)(null);
    const [isUploading, setIsUploading] = (0, react_1.useState)(false);
    const [progress, setProgress] = (0, react_1.useState)(0);
    const [url, setUrl] = (0, react_1.useState)(currentUrl || "");
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };
    const handleUpload = async () => {
        if (!file)
            return;
        setIsUploading(true);
        setProgress(0);
        try {
            // 1. Get Signature from Backend
            const signRes = await api_1.api.get('/upload/signature');
            const { signature, timestamp, cloudName, apiKey, folder } = signRes.data.data;
            // 2. Upload to Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', apiKey);
            formData.append('timestamp', timestamp.toString());
            formData.append('signature', signature);
            formData.append('folder', folder);
            const uploadRes = await axios_1.default.post(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, formData, {
                onUploadProgress: (event) => {
                    if (event.total) {
                        const percent = Math.round((event.loaded * 100) / event.total);
                        setProgress(percent);
                    }
                },
            });
            const secureUrl = uploadRes.data.secure_url;
            setUrl(secureUrl);
            onUploadComplete(secureUrl);
        }
        catch (error) {
            console.error('Upload failed', error);
            alert('Upload failed. Please try again.'); // Simple error handling for now
        }
        finally {
            setIsUploading(false);
        }
    };
    return (<div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <label_1.Label htmlFor="video">Video Lesson</label_1.Label>
                <div className="flex gap-2">
                    <input_1.Input id="video" type="file" accept="video/*" onChange={handleFileChange} disabled={isUploading}/>
                    <button_1.Button onClick={handleUpload} disabled={!file || isUploading}>
                        {isUploading ? <lucide_react_1.Loader2 className="h-4 w-4 animate-spin"/> : <lucide_react_1.UploadCloud className="h-4 w-4"/>}
                    </button_1.Button>
                </div>
            </div>

            {isUploading && (<div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Uploading... {progress}%</span>
                    <progress_1.Progress value={progress} className="h-2"/>
                </div>)}

            {(url || currentUrl) && (<div className="rounded-md border bg-muted/50 p-2 text-sm text-green-700 break-all">
                    <span className="font-semibold block mb-1">Current Video URL:</span>
                    {url || currentUrl}
                </div>)}
        </div>);
}
