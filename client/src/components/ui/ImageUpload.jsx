import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import Button from './Button';

export function ImageUpload({
    currentImage,
    onUpload,
    className = '',
    size = 'lg',
    shape = 'circle'
}) {
    const [preview, setPreview] = useState(currentImage);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleFileSelect = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        setError('');

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload file
        try {
            setUploading(true);
            await onUpload(file);
        } catch (err) {
            setError(err.message || 'Upload failed');
            setPreview(currentImage);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const sizeClasses = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-32 h-32',
        xl: 'w-40 h-40',
        '2xl': 'w-48 h-48'
    };

    const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';

    return (
        <div className={`relative ${className}`}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                className="hidden"
            />

            <div className={`relative ${sizeClasses[size]} ${shapeClass} overflow-hidden bg-gray-100 border-4 border-white shadow-lg`}>
                {preview ? (
                    <img
                        src={preview.startsWith('http') ? preview : preview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                        <Camera className="w-1/3 h-1/3 text-primary-400" />
                    </div>
                )}

                {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                )}
            </div>

            <div className="absolute bottom-0 right-0 flex gap-2">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-10 h-10 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Upload new photo"
                >
                    <Upload className="w-5 h-5" />
                </button>

                {preview && (
                    <button
                        type="button"
                        onClick={handleRemove}
                        disabled={uploading}
                        className="w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove photo"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {error && (
                <p className="absolute -bottom-6 left-0 right-0 text-xs text-red-500 text-center mt-2">
                    {error}
                </p>
            )}
        </div>
    );
}

export default ImageUpload;
