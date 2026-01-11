'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface AppUploadProps {
  onUploadComplete: (fileUrl: string, fileType: string) => void;
}

export default function AppUpload({ onUploadComplete }: AppUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const supabase = createClient();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileType === 'apk' || fileType === 'ipa') {
        setFile(selectedFile);
      } else {
        alert('Please select a valid .apk or .ipa file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `app-uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from('test-apps')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('test-apps')
        .getPublicUrl(filePath);

      setUploadProgress(100);
      onUploadComplete(publicUrl, fileExt || 'unknown');
      
      setTimeout(() => {
        setFile(null);
        setUploadProgress(0);
        setUploading(false);
      }, 1000);
    } catch (error) {
      alert(`Upload failed: ${error}`);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="p-6 bg-slate-800 rounded-lg border border-slate-700 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Upload Mobile App</h3>
        <p className="text-sm text-slate-400">Upload .apk (Android) or .ipa (iOS) file for testing</p>
      </div>

      {!file ? (
        <div className="relative">
          <input
            type="file"
            accept=".apk,.ipa"
            onChange={handleFileSelect}
            className="hidden"
            id="app-upload"
            disabled={uploading}
          />
          <label
            htmlFor="app-upload"
            className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-indigo-600 transition-colors"
          >
            <svg
              className="w-16 h-16 text-slate-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-slate-300 font-semibold mb-1">Click to upload app file</p>
            <p className="text-sm text-slate-500">APK or IPA (max 500MB)</p>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">{file.name}</p>
                <p className="text-sm text-slate-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              {!uploading && (
                <button
                  onClick={() => setFile(null)}
                  className="text-rose-400 hover:text-rose-300"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Uploading...</span>
                <span className="text-indigo-400 font-semibold">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {!uploading && (
            <button
              onClick={handleUpload}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors"
            >
              Upload App
            </button>
          )}
        </div>
      )}

      <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
        <h4 className="text-sm font-semibold text-slate-400 mb-2">Security Notice</h4>
        <p className="text-xs text-slate-500">
          All uploaded files are scanned for malware before testing. Files are stored securely and deleted after 30 days.
        </p>
      </div>
    </div>
  );
}
