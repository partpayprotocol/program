'use client'
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useVendorAccount } from '@/app/hooks/useVendor';

export default function VendorComponent() {
    const { publicKey, connected } = useWallet();
    const { initializeVendor, getVendor } = useVendorAccount();
  
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [previewUri, setPreviewUri] = useState<string | null>(null);
  
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setImage(e.target.files[0]);
      }
    };
  
    const handlePreview = async (e: React.FormEvent) => {
      e.preventDefault();
  
      if (!publicKey || !connected) {
        toast.error('Please connect your wallet');
        return;
      }
  
      if (!name.trim() || !description.trim() || !image) {
        toast.error('Name, description, and image are required');
        return;
      }
  
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('image', image);
  
        const response = await axios.post('/api/metaplex/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const uri = response.data.uri;
  
        if (!uri) {
          throw new Error('Failed to get URI from Metaplex');
        }
  
        setPreviewUri(uri);
        setIsPreviewing(true);
      } catch (error) {
        toast.error(`Error uploading metadata: ${error}`);
      } finally {
        setIsUploading(false);
      }
    };
  
    const handleEdit = () => {
      setIsPreviewing(false);
      setPreviewUri(null); // Reset URI to allow re-upload if image changes
    };
  
    const handleConfirm = async () => {
      if (!publicKey || !connected || !previewUri) {
        toast.error('Cannot confirm: Wallet not connected or no URI');
        return;
      }
  
      setIsUploading(true);
      try {
        const additionInfo = {
          description,
          createdAt: new Date().toISOString(),
          owner: publicKey.toBase58(),
        };
  
        await initializeVendor.mutateAsync({
          wallet: { publicKey },
          name,
          uri: previewUri,
          additionInfo,
        });
  
        // Clear form after successful submission
        setName('');
        setDescription('');
        setImage(null);
        setPreviewUri(null);
        setIsPreviewing(false);
      } catch (error) {
        toast.error(`Error creating vendor: ${error}`);
      } finally {
        setIsUploading(false);
      }
    };
  
    return (
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Create Your Vendor Shop</h1>
  
        {!isPreviewing ? (
          <form onSubmit={handlePreview} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Shop Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter shop name"
                disabled={initializeVendor.isPending || isUploading}
              />
            </div>
  
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Shop Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Describe your shop"
                rows={4}
                disabled={initializeVendor.isPending || isUploading}
              />
            </div>
  
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                Shop Image
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                disabled={initializeVendor.isPending || isUploading}
              />
            </div>
  
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
              disabled={initializeVendor.isPending || isUploading}
            >
              {initializeVendor.isPending || isUploading ? 'Processing...' : 'Preview Shop Details'}
            </button>
          </form>
        ) : (
          /* Preview Section */
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Preview Your Shop</h2>
            <div>
              <p><strong>Name:</strong> {name}</p>
              <p><strong>Description:</strong> {description}</p>
              {image && (
                <div>
                  <p><strong>Image Preview:</strong></p>
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Shop preview"
                    className="mt-2 max-w-full h-auto rounded-md"
                  />
                </div>
              )}
              <p><strong>URI (Generated):</strong> {previewUri}</p>
              <p><strong>Additional Info:</strong></p>
              <pre className="bg-gray-100 p-2 rounded-md">
                {JSON.stringify({ description, createdAt: new Date().toISOString(), owner: publicKey?.toBase58() }, null, 2)}
              </pre>
            </div>
  
            <div className="flex space-x-4">
              <button
                onClick={handleEdit}
                className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 disabled:bg-gray-400"
                disabled={initializeVendor.isPending || isUploading}
              >
                Edit Details
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                disabled={initializeVendor.isPending || isUploading}
              >
                {initializeVendor.isPending || isUploading ? 'Submitting...' : 'Confirm and Create'}
              </button>
            </div>
          </div>
        )}
  
        {getVendor.isPending && <p className="mt-4">Loading vendor data...</p>}
        {getVendor.isSuccess && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold">Your Vendor Shop</h2>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
              {JSON.stringify(getVendor.data, null, 2)}
            </pre>
          </div>
        )}
        {getVendor.isError && (
          <p className="mt-4 text-red-500">Error: {getVendor.error?.message}</p>
        )}
      </div>
    );
  }