import React, { useState, useEffect } from 'react';
import SSHKeyGenerator from './SSHKeyGenerator';
import SSHKeyList from './SSHKeyList';
import { SSHKey } from './SSHKeyGenerator';

const SSHKeyManager: React.FC = () => {
  const [keys, setKeys] = useState<SSHKey[]>([]);
  const [showGenerator, setShowGenerator] = useState(false);

  useEffect(() => {
    loadSSHKeys();
    syncExistingSSHKeys();
  }, []);

  const loadSSHKeys = () => {
    try {
      const savedKeys = localStorage.getItem('ssh-keys');
      if (savedKeys) {
        const parsedKeys = JSON.parse(savedKeys);
        // Convertir las fechas de string a Date
        const keysWithDates = parsedKeys.map((key: any) => ({
          ...key,
          createdAt: new Date(key.createdAt)
        }));
        setKeys(keysWithDates);
      }
    } catch (error) {
      console.error('Error loading SSH keys:', error);
    }
  };

  const syncExistingSSHKeys = async () => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.scanSSHDirectory();
        
        if (result.success && result.keys) {
          // Filter keys that are not already in localStorage
          const existingKeys = result.keys.filter(existingKey => 
            !keys.some(savedKey => savedKey.filePath === existingKey.filePath)
          );

          if (existingKeys.length > 0) {
            // Add ID and creation date to existing keys
            const keysWithMetadata: SSHKey[] = existingKeys.map(key => ({
              ...key,
              id: `existing-${Date.now()}-${Math.random()}`,
              createdAt: new Date(),
              type: key.type as 'ed25519' | 'rsa' | 'ecdsa'
            }));

            const updatedKeys = [...keys, ...keysWithMetadata];
            setKeys(updatedKeys);
            localStorage.setItem('ssh-keys', JSON.stringify(updatedKeys));
            
            console.log(`Sincronizadas ${existingKeys.length} claves SSH existentes`);
          }
        }
      }
    } catch (error) {
      console.error('Error syncing existing SSH keys:', error);
    }
  };

  const handleKeyGenerated = (newKey: SSHKey) => {
    const updatedKeys = [...keys, newKey];
    setKeys(updatedKeys);
    localStorage.setItem('ssh-keys', JSON.stringify(updatedKeys));
    setShowGenerator(false);
  };

  const handleDeleteKey = (keyId: string) => {
    const updatedKeys = keys.filter(key => key.id !== keyId);
    setKeys(updatedKeys);
    localStorage.setItem('ssh-keys', JSON.stringify(updatedKeys));
  };

  const exportKeysToJSON = () => {
    try {
      const dataStr = JSON.stringify(keys, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ssh-keys.json';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting keys:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-200">SSH Key Manager</h2>
          <p className="text-gray-200">Generate and manage your SSH keys</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={syncExistingSSHKeys}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            🔄 Sync Existing Keys
          </button>
          {keys.length > 0 && (
            <button
              onClick={exportKeysToJSON}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Export JSON
            </button>
          )}
          <button
            onClick={() => setShowGenerator(!showGenerator)}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {showGenerator ? 'Cancel' : 'New SSH Key'}
          </button>
        </div>
      </div>

      {showGenerator && (
        <SSHKeyGenerator onKeyGenerated={handleKeyGenerated} />
      )}

      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-4">
          SSH Keys ({keys.length})
        </h3>
        <SSHKeyList keys={keys} onDelete={handleDeleteKey} />
      </div>
    </div>
  );
};

export default SSHKeyManager;
