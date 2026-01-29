import { useState } from 'react';
import axios from 'axios';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UploadCloud, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
    onUploadComplete: (url: string) => void;
    currentUrl?: string;
    label?: string;
}

export default function ImageUpload({ onUploadComplete, currentUrl, label = "Profile Image" }: ImageUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [preview, setPreview] = useState(currentUrl || "");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            setFile(f);

            // Local preview
            const objectUrl = URL.createObjectURL(f);
            setPreview(objectUrl);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setProgress(0);

        try {
            // 1. Get Signature from Backend
            const signRes = await api.get('/upload/image-signature');
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
            setPreview(secureUrl); // Update preview to remote URL
            onUploadComplete(secureUrl);
        } catch (error) {
            console.error('Upload failed', error);
            alert('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4">
                <Label htmlFor="image-upload">{label}</Label>

                <div className="flex items-start gap-4">
                    {/* Preview Circle/Box */}
                    <div className="w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden bg-muted shrink-0 relative">
                        {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold">
                                {progress}%
                            </div>
                        )}
                    </div>

                    <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                            <Input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={isUploading}
                                className="max-w-[250px]"
                            />
                            <Button onClick={handleUpload} disabled={!file || isUploading} size="icon">
                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Upload a JPG or PNG. Max size 2MB.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
