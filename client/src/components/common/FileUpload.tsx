import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud, File, Loader2, X } from "lucide-react";
import { api } from "@/services/api";

interface FileUploadProps {
    onUploadComplete: (url: string) => void;
    currentUrl?: string;
    label?: string;
    accept?: string;
}

export default function FileUpload({ onUploadComplete, currentUrl, label = "Upload File", accept = "*" }: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(currentUrl || "");
    const [error, setError] = useState("");

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError("");

        try {
            // 1. Get Signature
            // We use the generic upload signature endpoint if available, or just image one if it works for "auto" resource type.
            // Let's assume /upload/image-signature works for general files if we allow it on backend or cloud settings.
            // Ideally we should have a generic one. Let's try image-signature for now, as Cloudinary often handles auto.
            // Actually, let's just use the same endpoint but client sets resource_type to 'auto'
            const sigRes = await api.get('/upload/image-signature');
            const { signature, timestamp, cloudName, apiKey, folder } = sigRes.data.data;

            // 2. Upload to Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', apiKey);
            formData.append('timestamp', timestamp.toString());
            formData.append('signature', signature);
            formData.append('folder', folder);

            const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) {
                throw new Error('Upload failed');
            }

            const data = await uploadRes.json();
            setPreviewUrl(data.secure_url);
            onUploadComplete(data.secure_url);

        } catch (err) {
            console.error("Upload error", err);
            setError("Failed to upload file.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            {previewUrl ? (
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                    <div className="p-2 bg-primary/10 rounded">
                        <File className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate mb-1">File Uploaded</p>
                        <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block">
                            {previewUrl}
                        </a>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => { setPreviewUrl(""); }}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            ) : (
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {isUploading ? (
                                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                            ) : (
                                <>
                                    <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> {label}</p>
                                    <p className="text-xs text-muted-foreground mt-1">PDF, DOC, ZIP, etc.</p>
                                </>
                            )}
                        </div>
                        <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} disabled={isUploading} accept={accept} />
                    </label>
                </div>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}
