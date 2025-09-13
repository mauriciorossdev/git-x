import React, { useState } from 'react';

export interface SSHKey {
  id: string;
  name: string;
  type: 'ed25519' | 'rsa' | 'ecdsa';
  email: string;
  filePath: string;
  publicKey: string;
  privateKey: string;
  createdAt: Date;
  isExisting?: boolean;
}

interface SSHKeyGeneratorProps {
  onKeyGenerated: (key: SSHKey) => void;
}

const SSHKeyGenerator: React.FC<SSHKeyGeneratorProps> = ({ onKeyGenerated }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'ed25519' as const,
    email: '',
    filePath: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateSSHKey = async () => {
    if (!formData.name || !formData.email || !formData.filePath) {
      setError('Please complete all fields');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // Usar la API de Electron para generar la clave SSH real
      if (window.electronAPI) {
        const result = await window.electronAPI.generateSSHKey(
          formData.type,
          formData.email,
          formData.filePath
        );

        if (result.success && result.publicKey && result.privateKey) {
          const newSSHKey: SSHKey = {
            id: Date.now().toString(),
            name: formData.name,
            type: formData.type,
            email: formData.email,
            filePath: formData.filePath,
            publicKey: result.publicKey,
            privateKey: result.privateKey,
            createdAt: new Date()
          };

          onKeyGenerated(newSSHKey);

          // Limpiar formulario
          setFormData({
            name: '',
            type: 'ed25519',
            email: '',
            filePath: ''
          });
        } else {
          setError(result.error || 'Error al generar la clave SSH');
        }
      } else {
        // Fallback para desarrollo (datos simulados)
        const mockPublicKey = `ssh-${formData.type} AAAAC3NzaC1lZDI1NTE5AAAAI...`;
        const mockPrivateKey = `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACB...`;

        const newSSHKey: SSHKey = {
          id: Date.now().toString(),
          name: formData.name,
          type: formData.type,
          email: formData.email,
          filePath: formData.filePath,
          publicKey: mockPublicKey,
          privateKey: mockPrivateKey,
          createdAt: new Date()
        };

        onKeyGenerated(newSSHKey);

        // Limpiar formulario
        setFormData({
          name: '',
          type: 'ed25519',
          email: '',
          filePath: ''
        });
      }
    } catch (err) {
      setError('Error al generar la clave SSH');
      console.error('Error generating SSH key:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const getDefaultFilePath = () => {
    // Intentar obtener el directorio home del sistema
    if (window.electronAPI) {
      window.electronAPI.getHomeDirectory().then(homeDir => {
        const defaultPath = `${homeDir}/.ssh/id_${formData.type}_${formData.name.toLowerCase().replace(/\s+/g, '_')}`;
        setFormData(prev => ({ ...prev, filePath: defaultPath }));
      });
    }

    // Fallback
    return `~/.ssh/id_${formData.type}_${formData.name.toLowerCase().replace(/\s+/g, '_')}`;
  };

  return (
    <div className="bg-black rounded-lg border border-gray-700 shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Generate New SSH Key
      </h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-1">
            Key Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ex: personal, work, github"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-200 mb-1">
            Key Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ed25519">ED25519 (Recommended)</option>
            <option value="rsa">RSA</option>
            <option value="ecdsa">ECDSA</option>
          </select>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="tu_email@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="filePath" className="block text-sm font-medium text-gray-200 mb-1">
            File Path
          </label>
          <input
            type="text"
            id="filePath"
            name="filePath"
            value={formData.filePath}
            onChange={handleInputChange}
            placeholder={getDefaultFilePath()}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-200 mt-1">
            Suggested path: {getDefaultFilePath()}
          </p>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md text-white">
            {error}
          </div>
        )}

        <button
          onClick={generateSSHKey}
          disabled={isGenerating}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Generate SSH Key'}
        </button>
      </div>
    </div>
  );
};

export default SSHKeyGenerator;
