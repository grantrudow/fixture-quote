'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useSupabase } from '@/context/SupabaseProvider';

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useSupabase();
  
  const allowedFileTypes = ['.step', '.stp', '.iges', '.igs'];
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Check file type
      const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
      if (!allowedFileTypes.includes(fileExtension)) {
        setError(`Invalid file type. Please upload a CAD file (${allowedFileTypes.join(', ')})`);
        setFile(null);
        return;
      }
      
      // Check file size (50MB max)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File is too large. Maximum size is 50MB.');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      
      // Check file type
      const fileExtension = '.' + droppedFile.name.split('.').pop()?.toLowerCase();
      if (!allowedFileTypes.includes(fileExtension)) {
        setError(`Invalid file type. Please upload a CAD file (${allowedFileTypes.join(', ')})`);
        return;
      }
      
      // Check file size (50MB max)
      if (droppedFile.size > 50 * 1024 * 1024) {
        setError('File is too large. Maximum size is 50MB.');
        return;
      }
      
      setFile(droppedFile);
      setError(null);
    }
  };
  
  const uploadFile = async () => {
    if (!file || !user) return;
    
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    setSuccess(false);
    
    try {
      // Create a file path with user ID to ensure uniqueness
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${user.id}/${fileName}`;
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cad-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setUploadProgress(percent);
          },
        });
      
      if (uploadError) throw uploadError;
      
      // Save file metadata to the database
      const { error: dbError } = await supabase
        .from('cad_files')
        .insert({
          user_id: user.id,
          file_name: fileName,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type || 'application/octet-stream',
          original_file_name: file.name,
          status: 'processing',
        });
      
      if (dbError) throw dbError;
      
      // Success! Now call your FastAPI backend to process the file
      // This will be implemented later
      
      setSuccess(true);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          file ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".step,.stp,.iges,.igs"
          className="hidden"
        />
        
        {!file && (
          <div className="space-y-4">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">
              Drag and drop your CAD file here
            </h3>
            <p className="text-sm text-gray-500">
              Or click to browse (STEP, IGES files only, max 50MB)
            </p>
          </div>
        )}
        
        {file && (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <svg 
                className="h-10 w-10 text-blue-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
              <span className="ml-2 text-lg font-medium text-gray-900">
                {file.name}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-3 text-sm text-red-600 text-center">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mt-3 text-sm text-green-600 text-center">
          File uploaded successfully! We&apos;re processing your CAD file.
        </div>
      )}
      
      {file && !uploading && !success && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={uploadFile}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Upload & Process CAD File
          </button>
        </div>
      )}
      
      {uploading && (
        <div className="mt-4 space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-center text-gray-500">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}
    </div>
  );
}