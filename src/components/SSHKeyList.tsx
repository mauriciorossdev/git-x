import React, { useState } from 'react';
import { SSHKey } from './SSHKeyGenerator';

interface SSHKeyListProps {
  keys: SSHKey[];
  onDelete: (keyId: string) => void;
}

const SSHKeyList: React.FC<SSHKeyListProps> = ({ keys, onDelete }) => {
  const [selectedKey, setSelectedKey] = useState<SSHKey | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getKeyTypeColor = (type: string) => {
    switch (type) {
      case 'ed25519':
        return 'bg-green-100 text-green-800';
      case 'rsa':
        return 'bg-blue-100 text-blue-800';
      case 'ecdsa':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (keys.length === 0) {
    return (
      <div className="bg-black rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-500">No SSH keys generated yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {keys.map((key) => (
        <div key={key.id} className="bg-black rounded-lg border border-gray-700 shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h4 className="text-lg font-semibold text-white">{key.name}</h4>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getKeyTypeColor(key.type)}`}>
                {key.type.toUpperCase()}
              </span>
              {key.isExisting && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                  EXISTING
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedKey(selectedKey?.id === key.id ? null : key)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {selectedKey?.id === key.id ? 'Hide' : 'View Details'}
              </button>
              <button
                onClick={() => onDelete(key.id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium text-white"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-100">Email</p>
              <p className="text-sm font-medium text-gray-200">{key.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-100">File</p>
              <p className="text-sm font-medium text-gray-200 font-mono">{key.filePath}</p>
            </div>
            <div>
              <p className="text-sm text-gray-100">Created</p>
              <p className="text-sm font-medium text-gray-200">{formatDate(key.createdAt)}</p>
            </div>
          </div>

          {selectedKey?.id === key.id && (
            <div className="border-t pt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Public Key</label>
                  <button
                    onClick={() => copyToClipboard(key.publicKey, `public-${key.id}`)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {copiedField === `public-${key.id}` ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <code className="text-xs text-gray-800 break-all">{key.publicKey}</code>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Private Key</label>
                  <button
                    onClick={() => copyToClipboard(key.privateKey, `private-${key.id}`)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {copiedField === `private-${key.id}` ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <code className="text-xs text-gray-800 break-all">{key.privateKey}</code>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Generated command:</strong> ssh-keygen -t {key.type} -C "{key.email}" -f {key.filePath}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SSHKeyList;
