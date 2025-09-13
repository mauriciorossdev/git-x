// Service to get and configure Git information

export interface GitConfigInfo {
  name: string;
  email: string;
  username?: string;
}

export interface GitConfigResult {
  success: boolean;
  data?: GitConfigInfo;
  error?: string;
}

// Type declaration for Electron API
declare global {
  interface Window {
    electronAPI: {
      executeCommand: (command: string, args: string[]) => Promise<any>;
    };
  }
}

class GitConfigService {
  /**
   * Gets current Git configuration (name and email)
   */
  async getCurrentConfig(): Promise<GitConfigResult> {
    try {
      console.log('Getting current Git configuration...');
      
      if (!window.electronAPI) {
        console.warn('Electron API not available, using mock data');
        return this.getMockConfig();
      }

      // Get username
      const nameResult = await window.electronAPI.executeCommand('git', ['config', '--global', 'user.name']);
      // Get email
      const emailResult = await window.electronAPI.executeCommand('git', ['config', '--global', 'user.email']);

      if (nameResult.success && emailResult.success) {
        const config: GitConfigInfo = {
          name: (nameResult.output?.trim()) || 'Not configured',
          email: (emailResult.output?.trim()) || 'Not configured'
        };

        // Try to get username from email (part before @)
        if (config.email && config.email !== 'Not configured' && config.email.includes('@')) {
          config.username = config.email.split('@')[0];
        }

        console.log('Git configuration obtained:', config);
        return {
          success: true,
          data: config
        };
      } else {
        console.warn('Error getting Git configuration, using mock data');
        return this.getMockConfig();
      }
    } catch (error) {
      console.error('Error getting Git configuration:', error);
      return {
        success: false,
        error: 'Error getting Git configuration'
      };
    }
  }

  /**
   * Configures Git with provided information
   */
  async setConfig(name: string, email: string): Promise<GitConfigResult> {
    try {
      console.log(`Configuring Git: ${name} <${email}>`);
      
      if (!window.electronAPI) {
        console.warn('Electron API not available, simulating configuration');
        return {
          success: true,
          data: { name, email, username: email.split('@')[0] }
        };
      }

      // Configure username
      const nameResult = await window.electronAPI.executeCommand('git', [
        'config', '--global', 'user.name', name
      ]);
      
      // Configure email
      const emailResult = await window.electronAPI.executeCommand('git', [
        'config', '--global', 'user.email', email
      ]);

      if (nameResult.success && emailResult.success) {
        const config: GitConfigInfo = {
          name,
          email,
          username: email.split('@')[0]
        };

        console.log('Git configured successfully:', config);
        return {
          success: true,
          data: config
        };
      } else {
        return {
          success: false,
          error: 'Error configuring Git'
        };
      }
    } catch (error) {
      console.error('Error configuring Git:', error);
      return {
        success: false,
        error: 'Error configuring Git'
      };
    }
  }

  /**
   * Checks if Git is configured correctly
   */
  async isConfigured(): Promise<boolean> {
    try {
      const config = await this.getCurrentConfig();
      return Boolean(config.success && 
             config.data && 
             config.data.name !== 'Not configured' && 
             config.data.email !== 'Not configured');
    } catch (error) {
      console.error('Error checking Git configuration:', error);
      return false;
    }
  }

  /**
   * Gets mock data when API is not available
   */
  private getMockConfig(): GitConfigResult {
    const mockConfig: GitConfigInfo = {
      name: 'Git User',
      email: 'user@example.com',
      username: 'user'
    };

    return {
      success: true,
      data: mockConfig
    };
  }

  /**
   * Gets additional information from current repository (if exists)
   */
  async getRepositoryInfo(): Promise<{ isRepository: boolean; remoteUrl?: string; branch?: string }> {
    try {
      if (!window.electronAPI) {
        return { isRepository: false };
      }

      // Check if we are in a Git repository
      const isRepoResult = await window.electronAPI.executeCommand('git', ['rev-parse', '--is-inside-work-tree']);
      
      if (!isRepoResult.success) {
        return { isRepository: false };
      }

      // Get remote origin URL
      const remoteResult = await window.electronAPI.executeCommand('git', ['config', '--get', 'remote.origin.url']);
      const remoteUrl = remoteResult.success ? remoteResult.output?.trim() : undefined;

      // Get current branch
      const branchResult = await window.electronAPI.executeCommand('git', ['branch', '--show-current']);
      const branch = branchResult.success ? branchResult.output?.trim() : undefined;

      return {
        isRepository: true,
        remoteUrl,
        branch
      };
    } catch (error) {
      console.error('Error getting repository information:', error);
      return { isRepository: false };
    }
  }
}

export default new GitConfigService();
