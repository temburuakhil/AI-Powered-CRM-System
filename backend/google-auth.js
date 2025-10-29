const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class GoogleCalendarAuth {
  constructor() {
    this.oauth2Client = null;
    this.tokenPath = path.join(__dirname, 'google-tokens.json');
    this.credentialsPath = path.join(__dirname, 'google-credentials.json');
  }

  // Initialize OAuth2 client with credentials
  initialize() {
    try {
      // Check if credentials file exists
      if (!fs.existsSync(this.credentialsPath)) {
        console.log('⚠️  Google credentials file not found. Calendar integration disabled.');
        console.log('   Create google-credentials.json with your OAuth 2.0 credentials.');
        return false;
      }

      const credentials = JSON.parse(fs.readFileSync(this.credentialsPath, 'utf-8'));
      
      const { client_id, client_secret, redirect_uris } = 
        credentials.web || credentials.installed || {};

      if (!client_id || !client_secret) {
        console.log('⚠️  Invalid credentials format in google-credentials.json');
        return false;
      }

      this.oauth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0] || process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/oauth2callback'
      );

      // Load saved tokens if they exist
      if (fs.existsSync(this.tokenPath)) {
        const tokens = JSON.parse(fs.readFileSync(this.tokenPath, 'utf-8'));
        this.oauth2Client.setCredentials(tokens);
        console.log('✅ Google Calendar authentication loaded');
      } else {
        console.log('⚠️  No saved tokens found. Run authentication flow first.');
      }

      return true;
    } catch (error) {
      console.error('❌ Error initializing Google Calendar auth:', error.message);
      return false;
    }
  }

  // Generate authentication URL for initial setup
  getAuthUrl() {
    if (!this.oauth2Client) {
      throw new Error('OAuth client not initialized');
    }

    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent', // Force consent to get refresh token
    });
  }

  // Exchange authorization code for tokens
  async getTokensFromCode(code) {
    if (!this.oauth2Client) {
      throw new Error('OAuth client not initialized');
    }

    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    
    // Save tokens to file
    fs.writeFileSync(this.tokenPath, JSON.stringify(tokens, null, 2));
    console.log('✅ Google Calendar tokens saved successfully');
    
    return tokens;
  }

  // Refresh access token if expired
  async refreshAccessToken() {
    if (!this.oauth2Client) {
      throw new Error('OAuth client not initialized');
    }

    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      this.oauth2Client.setCredentials(credentials);
      
      // Update saved tokens
      if (fs.existsSync(this.tokenPath)) {
        const existingTokens = JSON.parse(fs.readFileSync(this.tokenPath, 'utf-8'));
        const updatedTokens = { ...existingTokens, ...credentials };
        fs.writeFileSync(this.tokenPath, JSON.stringify(updatedTokens, null, 2));
      }
      
      return credentials;
    } catch (error) {
      console.error('❌ Error refreshing access token:', error.message);
      throw error;
    }
  }

  // Get authenticated Calendar API client
  getCalendarClient() {
    if (!this.oauth2Client) {
      throw new Error('OAuth client not initialized');
    }

    return google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  // Check if authentication is valid
  isAuthenticated() {
    if (!this.oauth2Client) return false;
    
    const credentials = this.oauth2Client.credentials;
    return credentials && (credentials.access_token || credentials.refresh_token);
  }

  // Revoke authentication (logout)
  async revokeAuth() {
    if (this.oauth2Client && this.oauth2Client.credentials.access_token) {
      await this.oauth2Client.revokeCredentials();
    }
    
    // Delete saved tokens
    if (fs.existsSync(this.tokenPath)) {
      fs.unlinkSync(this.tokenPath);
    }
    
    console.log('✅ Google Calendar authentication revoked');
  }
}

// Singleton instance
const googleAuth = new GoogleCalendarAuth();

module.exports = googleAuth;
