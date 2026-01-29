import { useState } from 'react';
import axios from 'axios';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from "@/components/ui/progress"
import { Loader2, UploadCloud } from 'lucide-react';

interface VideoUploadProps {
    onUploadComplete: (url: string) => void;
    currentUrl?: string;
}

export default function VideoUpload({ onUploadComplete, currentUrl }: VideoUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [url, setUrl] = useState(currentUrl || "");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setProgress(0);

        try {
            // 1. Get Signature from Backend
            const signRes = await api.get('/upload/signature');
            const { signature, timestamp, cloudName, apiKey, folder } = signRes.data.data;

            // 2. Upload to Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', apiKey);
            formData.append('timestamp', timestamp.toString());
            formData.append('signature', signature);
            formData.append('folder', folder);

            const uploadRes = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
                formData,
                {
                    onUploadProgress: (event) => {
                        if (event.total) {
                            const percent = Math.round((event.loaded * 100) / event.total);
                            setProgress(percent);
                        }
                    },
                }
            );

            const secureUrl = uploadRes.data.secure_url;
            setUrl(secureUrl);
            onUploadComplete(secureUrl);
        } catch (error) {
            console.error('Upload failed', error);
            alert('Upload failed. Please try again.'); // Simple error handling for now
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="video">Video Lesson</Label>
                <div className="flex gap-2">
                    <Input
                        id="video"
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                    <Button onClick={handleUpload} disabled={!file || isUploading}>
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {isUploading && (
                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Uploading... {progress}%</span>
                    <Progress value={progress} className="h-2" />
                </div>
            )}

            {(url || currentUrl) && (
                <div className="rounded-md border bg-muted/50 p-2 text-sm text-green-700 break-all">
                    <span className="font-semibold block mb-1">Current Video URL:</span>
                    {url || currentUrl}
                </div>
            )}
        </div>
    );
}
