import React, { useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';

interface BotUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (botData: any) => Promise<void>;
}

export const BotUploadModal: React.FC<BotUploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [xmlContent, setXmlContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setXmlContent(content);
        if (!name) {
          setName(file.name.replace('.xml', ''));
        }
      } catch (err) {
        setError('Failed to read file');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !xmlContent) {
      setError('Please provide bot name and XML content');
      return;
    }

    setIsLoading(true);

    try {
      await onUpload({
        name,
        description,
        xml_content: xmlContent,
        bot_type: 'uploaded_xml',
        is_public: true
      });

      setName('');
      setDescription('');
      setXmlContent('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload bot');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Upload Bot</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded transition"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Bot Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Trading Bot"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your bot strategy..."
              rows={3}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              XML File
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".xml"
                onChange={handleFileUpload}
                className="hidden"
                id="xmlFile"
              />
              <label
                htmlFor="xmlFile"
                className="flex items-center justify-center w-full p-4 border-2 border-dashed border-slate-600 rounded-lg hover:border-blue-500 transition cursor-pointer bg-slate-700 hover:bg-slate-600"
              >
                <div className="text-center">
                  <Upload className="mx-auto mb-2 text-slate-400" size={24} />
                  <p className="text-slate-300 text-sm font-medium">Click to upload XML</p>
                  <p className="text-slate-500 text-xs">or drag and drop</p>
                </div>
              </label>
            </div>

            {xmlContent && (
              <div className="mt-2 p-3 bg-slate-700 rounded border border-slate-600">
                <p className="text-green-400 text-sm font-medium">✓ File loaded successfully</p>
                <p className="text-slate-400 text-xs mt-1">{xmlContent.length} bytes</p>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center space-x-2 bg-red-900/20 border border-red-700/50 rounded-lg p-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition font-medium"
            >
              {isLoading ? 'Uploading...' : 'Upload Bot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
