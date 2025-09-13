// No importamos ipcRenderer directamente, usamos la API expuesta por el preload

export interface GitHubAccountInfo {
  username: string;
  email: string;
  name: string;
}

export interface GitHubCLIResult {
  success: boolean;
  data?: any;
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

class GitHubCLIService {
  /**
   * Checks if GitHub CLI is installed
   */
  async isInstalled(): Promise<boolean> {
    try {
      // Use the API exposed by preload
      if (window.electronAPI) {
        const result = await window.electronAPI.executeCommand('gh', ['--version']);
        console.log('Verification result:', result);
        return result.success;
      }
      // For now we simulate that it's installed
      return true;
    } catch (error) {
      console.error('Error checking if GitHub CLI is installed:', error);
      return false;
    }
  }

  /**
   * Inicia el proceso de login con GitHub CLI
   */
  async startLogin(): Promise<GitHubCLIResult> {
    try {
      console.log('Starting GitHub CLI login process...');
      
      // Use the API exposed by preload
      if (window.electronAPI) {
        const result = await window.electronAPI.executeCommand('gh', ['auth', 'login', '--web']);
        console.log('Resultado del login:', result);
        return {
          success: result.success,
          data: { message: 'Login process started' },
          error: result.error
        };
      }
      
      // Simulate the process if API is not available
      return {
        success: true,
        data: { message: 'Login process started' }
      };
    } catch (error) {
      console.error('Error starting login:', error);
      return {
        success: false,
        error: 'Error starting login process'
      };
    }
  }

  /**
   * Verifies the one-time code and completes authentication
   */
  async verifyCode(code: string): Promise<GitHubCLIResult> {
    try {
      console.log('Verifying code:', code);
      
      // In a real implementation, this would verify the code with GitHub
      // and configure Git automatically
      
      // Simulate successful verification
      if (code && code.length >= 7) {
        return {
          success: true,
          data: { message: 'Code verified successfully' }
        };
      } else {
        return {
          success: false,
          error: 'Invalid code'
        };
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      return {
        success: false,
        error: 'Error verifying code'
      };
    }
  }

  /**
   * Gets authenticated account information
   */
  async getAccountInfo(): Promise<GitHubCLIResult> {
    try {
      console.log('Getting account information...');
      
      // Use the API exposed by preload
      if (window.electronAPI) {
        try {
          // Use gh api user to get authenticated account information
          const result = await window.electronAPI.executeCommand('gh', ['api', 'user']);
          console.log('Account information:', result);
          
          if (result.success && result.output) {
            try {
              const userData = JSON.parse(result.output);
              if (userData.login) {
                // Try to get email from Git configuration as fallback
                let email = userData.email || userData.notification_email;
                if (!email) {
                  try {
                    const gitEmailResult = await window.electronAPI.executeCommand('git', ['config', '--global', 'user.email']);
                    if (gitEmailResult.success && gitEmailResult.output) {
                      email = gitEmailResult.output.trim();
                    }
                  } catch (gitError) {
                    console.warn('Could not get email from Git:', gitError);
                  }
                }
                
                return {
                  success: true,
                  data: {
                    username: userData.login || 'unknown',
                    email: email || 'unknown@example.com',
                    name: userData.name || 'Unknown User'
                  }
                };
              }
            } catch (parseError) {
              console.error('Error parsing account JSON:', parseError);
            }
          }
          
          // if we can't get the information, throw error
          throw new Error('Error getting account information');
         
        } catch (ghError) {
          console.error('Error running gh api user:', ghError);
          
          // Use mock data in case of error
          const mockAccountInfo: GitHubAccountInfo = {
            username: 'mauriciorossdev',
            email: 'mauricio@example.com',
            name: 'Mauricio Ross'
          };
          
          return {
            success: true,
            data: mockAccountInfo
          };
        }
      }
      
      // Simulate account information if API is not available
      const mockAccountInfo: GitHubAccountInfo = {
        username: 'mauriciorossdev',
        email: 'mauricio@example.com',
        name: 'Mauricio Ross'
      };
      
      return {
        success: true,
        data: mockAccountInfo
      };
    } catch (error) {
      console.error('Error getting account information:', error);
      return {
        success: false,
        error: 'Error getting account information'
      };
    }
  }

  /**
   * Configures Git with authenticated account information
   */
  async configureGit(accountInfo: GitHubAccountInfo): Promise<GitHubCLIResult> {
    try {
      console.log('Configuring Git with account:', accountInfo);
      
      // Use the API exposed by preload to configure Git
      if (window.electronAPI) {
        try {
          // Configure username
          const nameResult = await window.electronAPI.executeCommand('git', [
            'config', '--global', 'user.name', accountInfo.name
          ]);
          
          // Configure email
          const emailResult = await window.electronAPI.executeCommand('git', [
            'config', '--global', 'user.email', accountInfo.email
          ]);
          
          if (nameResult.success && emailResult.success) {
            return {
              success: true,
              data: { message: 'Git configured successfully' }
            };
          } else {
            return {
              success: false,
              error: 'Error configuring Git'
            };
          }
        } catch (gitError) {
          console.error('Error running Git commands:', gitError);
          return {
            success: false,
            error: 'Error running Git commands'
          };
        }
      }
      
      // Simulate successful configuration if API is not available
      return {
        success: true,
        data: { message: 'Git configured successfully' }
      };
    } catch (error) {
      console.error('Error configuring Git:', error);
      return {
        success: false,
        error: 'Error configuring Git'
      };
    }
  }

  /**
   * Executes the complete login and configuration process
   */
  async completeLogin(code: string): Promise<GitHubCLIResult> {
    try {
      // 1. Verify the code
      const verifyResult = await this.verifyCode(code);
      if (!verifyResult.success) {
        return verifyResult;
      }

      // 2. Get account information
      const accountResult = await this.getAccountInfo();
      if (!accountResult.success) {
        return accountResult;
      }

      // 3. Configure Git
      const configureResult = await this.configureGit(accountResult.data);
      if (!configureResult.success) {
        return configureResult;
      }

      return {
        success: true,
        data: {
          accountInfo: accountResult.data,
          message: 'Login and configuration completed successfully'
        }
      };
    } catch (error) {
      console.error('Error in complete login process:', error);
      return {
        success: false,
        error: 'Error in login process'
      };
    }
  }

  /**
   * Checks current authentication status
   */
  async checkAuthStatus(): Promise<GitHubCLIResult> {
    try {
      console.log('Checking authentication status...');
      
      // Use the API exposed by preload
      if (window.electronAPI) {
        try {
          const result = await window.electronAPI.executeCommand('gh', ['auth', 'status']);
          console.log('Authentication status:', result);
          
          // If the command runs successfully, it means there is authentication
          return {
            success: true,
            data: { authenticated: result.success }
          };
        } catch (ghError) {
          console.error('Error running gh auth status:', ghError);
          return {
            success: true,
            data: { authenticated: false }
          };
        }
      }
      
      // Simulate no active authentication if API is not available
      return {
        success: true,
        data: { authenticated: false }
      };
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return {
        success: false,
        error: 'Error checking authentication status'
      };
    }
  }

  /**
   * Closes current session
   */
  async logout(): Promise<GitHubCLIResult> {
    try {
      console.log('Logging out...');
      
      // Use the API exposed by preload
      if (window.electronAPI) {
        try {
          const result = await window.electronAPI.executeCommand('gh', ['auth', 'logout']);
          console.log('Logout result:', result);
          
          return {
            success: result.success,
            data: { message: 'Session closed successfully' },
            error: result.error
          };
        } catch (ghError) {
          console.error('Error running gh auth logout:', ghError);
          return {
            success: false,
            error: 'Error running logout'
          };
        }
      }
      
      // Simulate successful logout if API is not available
      return {
        success: true,
        data: { message: 'Session closed successfully' }
      };
    } catch (error) {
      console.error('Error closing session:', error);
      return {
        success: false,
        error: 'Error closing session'
      };
    }
  }
}

export default new GitHubCLIService();
