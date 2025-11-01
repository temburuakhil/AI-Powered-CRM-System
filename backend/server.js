const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const passport = require('./config/passport');
const { google } = require('googleapis');
const googleAuth = require('./google-auth');
const { Retell } = require('retell-sdk');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bput-hackathon';

mongoose.connect(MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Retell SDK client
const retellClient = new Retell({
  apiKey: 'key_7ae2ac651390bd59ee2c6cea4c40',
});

// API Hit Counter
let apiHitCount = 0;

// Initialize Google Calendar authentication
const calendarEnabled = googleAuth.initialize();
if (calendarEnabled) {
  console.log('📅 Google Calendar integration: ENABLED');
} else {
  console.log('📅 Google Calendar integration: DISABLED (configure credentials to enable)');
}

// Middleware
app.use(cors({
  origin: 'http://localhost:8081',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'bput-hackathon-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    touchAfter: 24 * 3600 // lazy session update (24 hours)
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// API Hit Counter Middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    apiHitCount++;
  }
  next();
});

// Auth routes
const { router: authRouter } = require('./routes/auth');
app.use('/api/auth', authRouter);

// Get API hit count endpoint
app.get('/api/hit-count', (req, res) => {
  res.json({ count: apiHitCount });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Email backend is running' });
});

// Send email endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, body, from, smtp, attachments, projectName } = req.body;

    // Validate required fields
    if (!to || !subject || !body || !smtp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Create transporter with SMTP config
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: parseInt(smtp.port),
      secure: false, // true for 465, false for other ports
      auth: {
        user: smtp.user,
        pass: smtp.password,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify transporter configuration
    await transporter.verify();
    console.log('SMTP connection verified');

    // Prepare attachments
    const emailAttachments = attachments ? attachments.map(att => ({
      filename: att.filename,
      content: att.content,
      encoding: att.encoding || 'base64'
    })) : [];

    // Prepare email options
    const mailOptions = {
      from: `"${projectName || 'Project Team'}" <${smtp.user}>`,
      to: to,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${body.split('\n').map(para => `<p style="line-height: 1.6;">${para}</p>`).join('')}
          ${attachments && attachments.length > 0 ? `
            <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
              <h3 style="margin-top: 0; color: #333;">📎 Attached Files:</h3>
              <ul style="list-style-type: none; padding-left: 0;">
                ${attachments.map(att => `<li style="padding: 5px 0;">• ${att.filename}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>This is an automated email from ${projectName || 'Project Management System'}.</p>
          </div>
        </div>
      `,
      text: body, // Plain text version
      attachments: emailAttachments
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

    res.json({ 
      success: true, 
      message: 'Email sent successfully',
      messageId: info.messageId 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to send email',
      error: error.toString()
    });
  }
});

// Send manager credentials email endpoint
app.post('/api/send-manager-credentials', async (req, res) => {
  try {
    const { email, fullName, username, password } = req.body;

    // Validate required fields
    if (!email || !fullName || !username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Get SMTP config from environment variables
    const smtpConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.replace(/\s+/g, '') : null,
    };

    if (!smtpConfig.user || !smtpConfig.password) {
      console.error('SMTP credentials not configured in environment variables');
      console.error('SMTP_USER:', smtpConfig.user ? 'Set' : 'Missing');
      console.error('SMTP_PASSWORD:', smtpConfig.password ? 'Set' : 'Missing');
      return res.status(500).json({ 
        success: false, 
        message: 'Email service not configured. Please contact administrator.' 
      });
    }

    console.log('SMTP Configuration:', {
      host: smtpConfig.host,
      port: smtpConfig.port,
      user: smtpConfig.user,
      passwordLength: smtpConfig.password.length
    });

    // Create transporter with SMTP config
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: false, // true for 465, false for other ports
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.password,
      },
      tls: {
        rejectUnauthorized: false
      },
      debug: true, // Enable debug output
      logger: true // Log to console
    });

    // Verify transporter configuration
    try {
      await transporter.verify();
      console.log('✅ SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('❌ SMTP verification failed:', verifyError);
      throw new Error('SMTP connection failed: ' + verifyError.message);
    }

    // Prepare email content
    const mailOptions = {
      from: `"CRM Admin" <${smtpConfig.user}>`,
      to: email,
      subject: '🔐 Your Manager Account Credentials - CRM Portal',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; border-radius: 10px;">
          <div style="background: white; border-radius: 8px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px;">🔐</span>
              </div>
              <h1 style="color: #333; margin: 0; font-size: 28px; font-weight: 600;">Welcome to CRM Portal!</h1>
            </div>
            
            <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Hello <strong style="color: #333;">${fullName}</strong>,</p>
              <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">Your manager account has been created successfully. Below are your login credentials for the CRM system.</p>
            </div>

            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px; margin: 30px 0;">
              <h2 style="color: white; margin: 0 0 20px 0; font-size: 18px; text-align: center;">Your Login Credentials</h2>
              
              <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 6px; margin-bottom: 15px;">
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 20px; margin-right: 10px;">👤</span>
                  <strong style="color: #555; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Username</strong>
                </div>
                <div style="background: white; padding: 12px 15px; border-radius: 4px; border: 2px solid #667eea;">
                  <code style="font-family: 'Courier New', monospace; font-size: 16px; color: #333; font-weight: 600;">${username}</code>
                </div>
              </div>

              <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 6px;">
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 20px; margin-right: 10px;">🔑</span>
                  <strong style="color: #555; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Password</strong>
                </div>
                <div style="background: white; padding: 12px 15px; border-radius: 4px; border: 2px solid #764ba2;">
                  <code style="font-family: 'Courier New', monospace; font-size: 16px; color: #333; font-weight: 600;">${password}</code>
                </div>
              </div>
            </div>

            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: #856404; font-size: 13px; line-height: 1.6;">
                <strong>⚠️ Security Notice:</strong> Please keep these credentials secure and do not share them with anyone. We recommend changing your password after your first login.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:8081/landing" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                Login to Your Account →
              </a>
            </div>

            <div style="border-top: 1px solid #e0e0e0; padding-top: 25px; margin-top: 30px;">
              <h3 style="color: #333; font-size: 16px; margin: 0 0 15px 0;">📋 Quick Start Guide:</h3>
              <ol style="color: #666; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0;">
                <li>Visit the login page using the button above</li>
                <li>Select the <strong>Manager</strong> tab</li>
                <li>Enter your username and password</li>
                <li>Access your department's dashboard</li>
              </ol>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This is an automated email from CRM Portal.<br>
                If you did not request this account, please contact your administrator immediately.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
Welcome to CRM Portal!

Hello ${fullName},

Your manager account has been created successfully. Below are your login credentials:

Username: ${username}
Password: ${password}

Login URL: http://localhost:8081/landing

Quick Start:
1. Visit the login page
2. Select the Manager tab
3. Enter your credentials
4. Access your department's dashboard

Security Notice: Please keep these credentials secure and change your password after first login.

---
This is an automated email from CRM Portal.
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Manager credentials email sent successfully:', info.messageId);
    console.log('Sent to:', email);

    res.json({ 
      success: true, 
      message: 'Credentials email sent successfully',
      messageId: info.messageId 
    });

  } catch (error) {
    console.error('Error sending manager credentials email:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to send credentials email',
      error: error.toString()
    });
  }
});

// Update Google Sheets endpoint
app.post('/api/update-sheet', async (req, res) => {
  try {
    const { sheetUrl, updates } = req.body;

    // Extract sheet ID and GID from URL
    const sheetId = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    const gid = sheetUrl.match(/[#&]gid=([0-9]+)/)?.[1] || "0";

    if (!sheetId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid sheet URL' 
      });
    }

    console.log('Sheet update requested:', { 
      sheetId, 
      gid, 
      updateCount: updates?.length || 0 
    });

    // Method 1: Using Google Apps Script Web App (Recommended for simple updates)
    // You can create a Google Apps Script to handle updates via webhook
    // See GOOGLE_SHEETS_AUTO_UPDATE.md for setup instructions
    
    const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_WEBHOOK;
    
    if (GOOGLE_APPS_SCRIPT_URL) {
      // Send update request to Google Apps Script webhook
      const scriptResponse = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetId,
          gid,
          updates
        })
      });

      if (scriptResponse.ok) {
        const result = await scriptResponse.json();
        console.log('Google Sheets updated via Apps Script:', result);
        return res.json({ 
          success: true, 
          message: 'Google Sheets updated successfully',
          updatedCount: updates.length
        });
      }
    }

    // Method 2: Manual update notification (fallback)
    // Log updates for manual processing
    console.log('Updates to apply manually:', updates);
    
    res.json({ 
      success: true, 
      message: 'Email statuses updated locally (Google Sheets API not configured)',
      note: 'Set GOOGLE_APPS_SCRIPT_WEBHOOK in .env for automatic sheet updates',
      updates: updates
    });

  } catch (error) {
    console.error('Error updating sheet:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to update sheet'
    });
  }
});

// Retell AI - Configure SIP Trunk endpoint
app.post('/api/retell/configure-sip', async (req, res) => {
  try {
    const { apiKey, phoneNumber, terminationUri, sipUsername, sipPassword, nickname } = req.body;

    if (!apiKey || !phoneNumber || !terminationUri) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: apiKey, phoneNumber, terminationUri',
      });
    }

    const sipConfig = {
      phone_number: phoneNumber,
      termination_uri: terminationUri,
      nickname: nickname || `Phone ${phoneNumber}`,
    };

    if (sipUsername && sipPassword) {
      sipConfig.sip_trunk_auth_username = sipUsername;
      sipConfig.sip_trunk_auth_password = sipPassword;
    }

    console.log('Configuring SIP trunk:', phoneNumber);

    const retellResponse = await fetch('https://api.retellai.com/import-phone-number', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sipConfig),
    });

    console.log('Retell API response status:', retellResponse.status);
    console.log('Retell API response content-type:', retellResponse.headers.get('content-type'));

    // Check if response is JSON
    const contentType = retellResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await retellResponse.text();
      console.error('Retell API returned non-JSON response:', text.substring(0, 500));
      return res.status(502).json({
        success: false,
        message: 'Retell API returned invalid response. The endpoint might not exist or API key is invalid.',
        error: text.substring(0, 200),
      });
    }

    const responseData = await retellResponse.json();

    if (!retellResponse.ok) {
      console.error('Retell SIP configuration error:', responseData);
      return res.status(retellResponse.status).json({
        success: false,
        message: responseData.message || 'Failed to configure SIP trunk',
        error: responseData,
      });
    }

    console.log('SIP trunk configured successfully:', responseData.phone_number);

    res.json({
      success: true,
      phone: responseData,
    });
  } catch (error) {
    console.error('Error configuring SIP trunk:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
});

// Retell AI - List Phone Numbers endpoint
app.get('/api/retell/phone-numbers', async (req, res) => {
  try {
    const apiKey = req.headers.authorization?.replace('Bearer ', '');

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: 'Missing API key in Authorization header',
      });
    }

    console.log('Fetching registered phone numbers from Retell...');

    const retellResponse = await fetch('https://api.retellai.com/list-phone-numbers', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Retell API response status:', retellResponse.status);

    const contentType = retellResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await retellResponse.text();
      console.error('Retell API returned non-JSON response:', text.substring(0, 500));
      return res.status(502).json({
        success: false,
        message: 'Retell API returned invalid response',
        error: text.substring(0, 200),
      });
    }

    const responseData = await retellResponse.json();

    if (!retellResponse.ok) {
      console.error('Retell phone numbers fetch error:', responseData);
      return res.status(retellResponse.status).json({
        success: false,
        message: responseData.message || 'Failed to fetch phone numbers',
        error: responseData,
      });
    }

    console.log(`Found ${responseData.length || 0} registered phone numbers`);

    res.json({
      success: true,
      phone_numbers: responseData,
    });
  } catch (error) {
    console.error('Error fetching phone numbers:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
});

// Retell AI - List Agents endpoint
app.get('/api/retell/agents', async (req, res) => {
  try {
    const apiKey = req.headers.authorization?.replace('Bearer ', '');

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required in Authorization header',
      });
    }

    console.log('Fetching agents from Retell...');

    const retellResponse = await fetch('https://api.retellai.com/list-agents', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Retell API response status:', retellResponse.status);

    const contentType = retellResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await retellResponse.text();
      console.error('Retell API returned non-JSON response:', text.substring(0, 500));
      return res.status(502).json({
        success: false,
        message: 'Retell API returned invalid response',
        error: text.substring(0, 200),
      });
    }

    const responseData = await retellResponse.json();

    if (!retellResponse.ok) {
      console.error('Retell agents fetch error:', responseData);
      return res.status(retellResponse.status).json({
        success: false,
        message: responseData.message || 'Failed to fetch agents',
        error: responseData,
      });
    }

    console.log(`Found ${responseData.length || 0} agents`);

    res.json({
      success: true,
      agents: responseData,
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
});

// Retell AI - Create LLM endpoint (required before creating agent)
app.post('/api/retell/create-llm', async (req, res) => {
  try {
    const { apiKey, generalPrompt, beginMessage, knowledgeBaseIds, transferPhoneNumber } = req.body;

    if (!apiKey || !generalPrompt) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: apiKey, generalPrompt',
      });
    }

    const requestBody = {
      start_speaker: 'agent',  // Required field: who starts the conversation
      general_prompt: generalPrompt,
      begin_message: beginMessage || null,
      general_tools: [
        {
          type: 'end_call',
          name: 'end_call',
          description: 'End the call when the conversation is complete, user wants to hang up, or the purpose of the call has been fulfilled.',
        }
      ],  // Add end_call tool for single-prompt agent
      states: [],  // Empty for single-prompt agent (no multi-state)
      starting_state: null,  // No states for single-prompt agent
    };

    // Add transfer_call tool if transfer phone number is provided
    if (transferPhoneNumber) {
      const transferTool = {
        type: 'transfer_call',
        name: 'transfer_to_authority',
        description: 'Transfer the call to a higher authority or supervisor when the user requests to speak with someone in charge, needs escalation, or the agent cannot handle the request. Use this when the caller explicitly asks for a manager or supervisor.',
        transfer_destination: {
          type: 'predefined',
          number: transferPhoneNumber,
        },
        transfer_option: {
          type: 'warm_transfer',
          show_transferee_as_caller: true,
        }
      };
      requestBody.general_tools.push(transferTool);
      console.log('✅ Adding transfer_call tool with number:', transferPhoneNumber);
      console.log('Transfer tool config:', JSON.stringify(transferTool, null, 2));
    }

    // Add knowledge base IDs if provided
    if (knowledgeBaseIds && knowledgeBaseIds.length > 0) {
      requestBody.knowledge_base_ids = knowledgeBaseIds;
      console.log('Attaching knowledge bases:', knowledgeBaseIds);
    }

    console.log('Creating single-prompt Retell LLM with prompt:', generalPrompt.substring(0, 100) + '...');

    const retellResponse = await fetch('https://api.retellai.com/create-retell-llm', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Retell LLM API response status:', retellResponse.status);

    const contentType = retellResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await retellResponse.text();
      console.error('Retell API returned non-JSON response:', text.substring(0, 500));
      return res.status(502).json({
        success: false,
        message: 'Retell API returned invalid response',
        error: text.substring(0, 200),
      });
    }

    const responseData = await retellResponse.json();

    if (!retellResponse.ok) {
      console.error('Retell LLM creation error:', responseData);
      return res.status(retellResponse.status).json({
        success: false,
        message: responseData.message || 'Failed to create LLM',
        error: responseData,
      });
    }

    console.log('✅ Single-prompt LLM created successfully:', responseData.llm_id);
    if (knowledgeBaseIds && knowledgeBaseIds.length > 0) {
      console.log('Knowledge bases attached:', knowledgeBaseIds.join(', '));
    }

    res.json({
      success: true,
      llm_id: responseData.llm_id,
      data: responseData,
    });
  } catch (error) {
    console.error('Error creating LLM:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
});

// Retell AI - Create Agent endpoint
app.post('/api/retell/create-agent', async (req, res) => {
  try {
    const { apiKey, agentName, systemPrompt, voiceId, language, llmId, outboundPhoneNumber } = req.body;

    // Validate required fields
    if (!apiKey || !agentName || !systemPrompt) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: apiKey, agentName, systemPrompt' 
      });
    }

    // Note: systemPrompt should be used in the LLM configuration, not in agent creation
    // For now, we'll create a basic agent. The LLM should be created separately with the prompt.
    
    // Prepare request body for Retell API (single-prompt agent)
    const requestBody = {
      agent_name: agentName,
      voice_id: voiceId || "11labs-Adrian",
      language: language || "en-US",
      response_engine: {
        type: "retell-llm",
        llm_id: llmId || "llm_default",  // User must provide valid LLM ID
      },
      enable_backchannel: true,
      ambient_sound: "coffee-shop",
      ambient_sound_volume: 0.1,
      boosted_keywords: [],
      responsiveness: 1,
      interruption_sensitivity: 1,
      normalize_for_speech: true,
      reminder_trigger_ms: 10000,
      reminder_max_count: 2,
      fallback_voice_ids: [],
      voice_temperature: 1,
      voice_speed: 1,
      end_call_after_silence_ms: 600000,
      max_call_duration_ms: 3600000,
    };

    // Set outbound phone number if provided (SIP trunk number)
    if (outboundPhoneNumber) {
      requestBody.default_outbound_phone_number = outboundPhoneNumber;
      console.log('Setting outbound phone number:', outboundPhoneNumber);
    }

    console.log('Creating single-prompt Retell AI agent:', agentName);
    console.log('LLM ID:', llmId);

    // Make API call to Retell
    const retellResponse = await fetch('https://api.retellai.com/create-agent', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Retell API response status:', retellResponse.status);
    
    // Check if response is JSON
    const contentType = retellResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await retellResponse.text();
      console.error('Retell API returned non-JSON response:', text.substring(0, 500));
      return res.status(502).json({
        success: false,
        message: 'Retell API returned invalid response',
        error: text.substring(0, 200),
      });
    }

    const responseData = await retellResponse.json();

    if (!retellResponse.ok) {
      console.error('Retell API error:', responseData);
      return res.status(retellResponse.status).json({
        success: false,
        message: responseData.message || 'Failed to create agent with Retell AI',
        error: responseData,
      });
    }

    console.log('✅ Single-prompt agent created successfully:', responseData.agent_id);
    if (outboundPhoneNumber) {
      console.log('Outbound number configured:', outboundPhoneNumber);
    }

    res.json({
      success: true,
      message: 'Single-prompt agent created successfully',
      agent_id: responseData.agent_id,
      agent_name: responseData.agent_name,
      voice_id: responseData.voice_id,
      language: responseData.language,
      outbound_phone_number: outboundPhoneNumber,
      data: responseData,
    });

  } catch (error) {
    console.error('Error creating Retell agent:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create agent',
      error: error.toString()
    });
  }
});

// Retell AI - Update Agent endpoint (add end_call tool to existing agents)
app.patch('/api/retell/update-agent/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { apiKey, llmId, outboundPhoneNumber } = req.body;

    if (!apiKey) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required field: apiKey' 
      });
    }

    // Prepare update body
    const updateBody = {};

    // Update response engine if LLM ID provided
    if (llmId) {
      updateBody.response_engine = {
        type: 'retell-llm',
        llm_id: llmId,
      };
    }

    // Update outbound phone number if provided
    if (outboundPhoneNumber) {
      updateBody.default_outbound_phone_number = outboundPhoneNumber;
    }

    console.log('Updating agent:', agentId);

    const retellResponse = await fetch(`https://api.retellai.com/update-agent/${agentId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateBody),
    });

    const contentType = retellResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await retellResponse.text();
      console.error('Retell API returned non-JSON response:', text.substring(0, 500));
      return res.status(502).json({
        success: false,
        message: 'Retell API returned invalid response',
        error: text.substring(0, 200),
      });
    }

    const responseData = await retellResponse.json();

    if (!retellResponse.ok) {
      console.error('Agent update error:', responseData);
      return res.status(retellResponse.status).json({
        success: false,
        message: responseData.message || 'Failed to update agent',
        error: responseData,
      });
    }

    console.log('✅ Agent updated successfully:', agentId);

    res.json({
      success: true,
      message: 'Agent updated successfully',
      agent_id: responseData.agent_id,
      data: responseData,
    });

  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to update agent',
      error: error.toString()
    });
  }
});

// Retell AI - Update Retell LLM endpoint (add end_call tool to existing LLM)
app.patch('/api/retell/update-llm/:llmId', async (req, res) => {
  try {
    const { llmId } = req.params;
    const { apiKey, knowledgeBaseIds, addEndCallTool } = req.body;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: apiKey',
      });
    }

    // Prepare update body
    const updateBody = {};

    // Add knowledge base IDs if provided
    if (knowledgeBaseIds && knowledgeBaseIds.length > 0) {
      updateBody.knowledge_base_ids = knowledgeBaseIds;
      console.log('Adding knowledge bases to LLM:', knowledgeBaseIds);
    }

    // Add end_call tool if requested
    if (addEndCallTool) {
      updateBody.general_tools = [
        {
          type: 'end_call',
          name: 'end_call',
          description: 'End the call when the conversation is complete, user wants to hang up, or the purpose of the call has been fulfilled.',
        }
      ];
    }

    console.log('Updating LLM:', llmId);

    const retellResponse = await fetch(`https://api.retellai.com/update-retell-llm/${llmId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateBody),
    });

    const contentType = retellResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await retellResponse.text();
      console.error('Retell API returned non-JSON response:', text.substring(0, 500));
      return res.status(502).json({
        success: false,
        message: 'Retell API returned invalid response',
        error: text.substring(0, 200),
      });
    }

    const responseData = await retellResponse.json();

    if (!retellResponse.ok) {
      console.error('LLM update error:', responseData);
      return res.status(retellResponse.status).json({
        success: false,
        message: responseData.message || 'Failed to update LLM',
        error: responseData,
      });
    }

    console.log('✅ LLM updated successfully:', llmId);

    res.json({
      success: true,
      llm_id: responseData.llm_id,
      data: responseData,
    });
  } catch (error) {
    console.error('Error updating LLM:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
});

// Retell AI - Create Phone Call endpoint
app.post('/api/retell/create-call', async (req, res) => {
  try {
    const { apiKey, fromNumber, toNumber, agentId, metadata, dynamicVariables, agentVersion } = req.body;

    // Validate required fields
    if (!apiKey || !fromNumber || !toNumber || !agentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: apiKey, fromNumber, toNumber, agentId' 
      });
    }

    // Prepare request body for Retell API
    const requestBody = {
      from_number: fromNumber,
      to_number: toNumber,
      override_agent_id: agentId,
    };

    // Add optional fields
    if (agentVersion) {
      requestBody.override_agent_version = agentVersion;
    }

    if (metadata) {
      requestBody.metadata = metadata;
    }

    if (dynamicVariables) {
      requestBody.retell_llm_dynamic_variables = dynamicVariables;
    }

    console.log('Creating Retell AI call:', { from: fromNumber, to: toNumber, agent: agentId });

    // Make API call to Retell
    const retellResponse = await fetch('https://api.retellai.com/v2/create-phone-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await retellResponse.json();

    if (!retellResponse.ok) {
      console.error('Retell API error:', responseData);
      return res.status(retellResponse.status).json({
        success: false,
        message: responseData.message || 'Failed to create call with Retell AI',
        error: responseData,
      });
    }

    console.log('Call created successfully:', responseData.call_id);

    // Save call record to dashboard with contact information
    const contactName = metadata?.recipient_name || metadata?.name || 'Unknown';
    const sheetName = metadata?.project_name || 'Voice Campaign';
    
    callRecords.push({
      id: `call-${responseData.call_id}`,
      name: contactName,
      phone: toNumber,
      status: 'ongoing',
      duration: null,
      timestamp: new Date().toISOString(),
      sheetName: sheetName,
      callId: responseData.call_id,
      sentiment: null,
      summary: null
    });
    
    console.log('📞 Call record created for dashboard:', contactName, toNumber);

    res.json({
      success: true,
      message: 'Call created successfully',
      call_id: responseData.call_id,
      call_status: responseData.call_status,
      agent_id: responseData.agent_id,
      from_number: responseData.from_number,
      to_number: responseData.to_number,
      start_timestamp: responseData.start_timestamp,
      data: responseData,
    });

  } catch (error) {
    console.error('Error creating Retell call:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create call',
      error: error.toString()
    });
  }
});

// Retell AI - Get Call Details endpoint
app.get('/api/retell/call/:callId', async (req, res) => {
  try {
    const { callId } = req.params;
    const apiKey = req.headers['x-retell-api-key'];

    if (!apiKey) {
      return res.status(401).json({ 
        success: false, 
        message: 'Retell API key required in x-retell-api-key header' 
      });
    }

    const retellResponse = await fetch(`https://api.retellai.com/v2/get-call/${callId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const responseData = await retellResponse.json();

    if (!retellResponse.ok) {
      return res.status(retellResponse.status).json({
        success: false,
        message: 'Failed to get call details',
        error: responseData,
      });
    }

    res.json({
      success: true,
      data: responseData,
    });

  } catch (error) {
    console.error('Error getting call details:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to get call details',
      error: error.toString()
    });
  }
});

// Retell AI - List Calls endpoint
app.get('/api/retell/calls', async (req, res) => {
  try {
    const apiKey = req.headers['x-retell-api-key'];
    const { limit = 100, sort_order = 'descending' } = req.query;

    if (!apiKey) {
      return res.status(401).json({ 
        success: false, 
        message: 'Retell API key required in x-retell-api-key header' 
      });
    }

    const retellResponse = await fetch(
      `https://api.retellai.com/v2/list-calls?limit=${limit}&sort_order=${sort_order}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    const responseData = await retellResponse.json();

    if (!retellResponse.ok) {
      return res.status(retellResponse.status).json({
        success: false,
        message: 'Failed to list calls',
        error: responseData,
      });
    }

    res.json({
      success: true,
      calls: responseData,
    });

  } catch (error) {
    console.error('Error listing calls:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to list calls',
      error: error.toString()
    });
  }
});

// In-memory storage for call records (replace with database in production)
let callRecords = [];

// Helper function to sync Google Sheets status to call records
const syncSheetStatusToCallRecords = async (sheetData, sheetName) => {
  if (!Array.isArray(sheetData) || sheetData.length === 0) return;
  
  console.log(`📊 Syncing ${sheetName}: ${sheetData.length} rows`);
  
  // Assuming first row is headers
  const headers = sheetData[0];
  const phoneIndex = headers.findIndex(h => h && (h.toLowerCase().includes('phone') || h.toLowerCase().includes('mobile') || h.toLowerCase().includes('number')));
  const nameIndex = headers.findIndex(h => h && h.toLowerCase().includes('name'));
  const statusIndex = headers.findIndex(h => h && (h.toLowerCase().includes('call') && h.toLowerCase().includes('status')));
  
  console.log(`📊 Found columns - Phone: ${phoneIndex}, Name: ${nameIndex}, Status: ${statusIndex}`);
  
  if (phoneIndex === -1) {
    console.log('⚠️ No phone column found in sheet');
    return;
  }
  
  let syncedCount = 0;
  
  // Process each row (skip header)
  for (let i = 1; i < sheetData.length; i++) {
    const row = sheetData[i];
    const phone = row[phoneIndex];
    const name = nameIndex !== -1 ? row[nameIndex] : 'Unknown';
    const status = statusIndex !== -1 ? row[statusIndex] : null;
    
    if (!phone) continue;
    
    // If status is "Completed", update or create call record
    if (status && status.toLowerCase() === 'completed') {
      const existingIndex = callRecords.findIndex(r => 
        r.phone === phone || 
        r.phone.replace(/\D/g, '').endsWith(phone.replace(/\D/g, '')) ||
        phone.replace(/\D/g, '').endsWith(r.phone.replace(/\D/g, ''))
      );
      
      if (existingIndex >= 0) {
        // Update existing record
        callRecords[existingIndex].status = 'completed';
        callRecords[existingIndex].name = name;
        callRecords[existingIndex].sheetName = sheetName;
        console.log(`✅ Updated: ${name} (${phone}) - ${status}`);
      } else {
        // Create new record
        callRecords.push({
          id: `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: name,
          phone: phone,
          status: 'completed',
          duration: null,
          timestamp: new Date().toISOString(),
          sheetName: sheetName,
          callId: null,
          sentiment: null,
          summary: null
        });
        console.log(`📞 Created: ${name} (${phone}) - ${status}`);
      }
      syncedCount++;
    }
  }
  
  console.log(`📊 Sync complete: ${syncedCount} records updated/created`);
};

// API endpoint to sync Google Sheets data
app.post('/api/sync-sheet-status', async (req, res) => {
  try {
    const { sheetData, sheetName } = req.body;
    
    console.log('📥 Received sync request for:', sheetName);
    console.log('📥 Data length:', sheetData?.length);
    
    if (!sheetData || !Array.isArray(sheetData)) {
      console.log('❌ Invalid sheet data');
      return res.status(400).json({
        success: false,
        message: 'Invalid sheet data'
      });
    }
    
    if (sheetData.length > 0) {
      console.log('📥 Headers:', sheetData[0]);
      console.log('📥 Sample row:', sheetData[1]);
    }
    
    await syncSheetStatusToCallRecords(sheetData, sheetName || 'Training');
    
    console.log('✅ Total call records now:', callRecords.length);
    
    res.json({
      success: true,
      message: 'Sheet status synced to call records',
      totalRecords: callRecords.length
    });
  } catch (error) {
    console.error('Error syncing sheet status:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// API endpoint to get call records
app.get('/api/call-records', (req, res) => {
  res.json({
    success: true,
    records: callRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  });
});

// API endpoint to add a call record (called from voice campaign or webhook)
app.post('/api/call-records', (req, res) => {
  try {
    const { name, phone, status, duration, sheetName, callId, sentiment, summary } = req.body;
    
    const record = {
      id: `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name || 'Unknown',
      phone: phone || 'N/A',
      status: status || 'completed',
      duration: duration || null,
      timestamp: new Date().toISOString(),
      sheetName: sheetName || 'Unknown Source',
      callId: callId || null,
      sentiment: sentiment || null,
      summary: summary || null
    };
    
    callRecords.push(record);
    
    // Keep only last 1000 records to prevent memory issues
    if (callRecords.length > 1000) {
      callRecords = callRecords.slice(-1000);
    }
    
    console.log('📞 New call record added:', record.name, record.phone, record.status);
    
    res.json({
      success: true,
      record
    });
  } catch (error) {
    console.error('Error adding call record:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// API endpoint to update call record status
app.patch('/api/call-records/status', (req, res) => {
  try {
    const { phone, status, name, sheetName } = req.body;
    
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }
    
    // Find the most recent call record for this phone number
    const recordIndex = callRecords.findIndex(r => r.phone === phone || r.phone.includes(phone) || phone.includes(r.phone));
    
    if (recordIndex >= 0) {
      // Update existing record
      callRecords[recordIndex].status = status || callRecords[recordIndex].status;
      if (name) callRecords[recordIndex].name = name;
      if (sheetName) callRecords[recordIndex].sheetName = sheetName;
      
      console.log('📞 Updated call status:', callRecords[recordIndex].name, phone, 'to', status);
      
      res.json({
        success: true,
        record: callRecords[recordIndex]
      });
    } else {
      // Create new record if not found
      const newRecord = {
        id: `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: name || 'Unknown',
        phone: phone,
        status: status || 'completed',
        duration: null,
        timestamp: new Date().toISOString(),
        sheetName: sheetName || 'Unknown Source',
        callId: null,
        sentiment: null,
        summary: null
      };
      
      callRecords.push(newRecord);
      console.log('📞 Created new call record:', newRecord.name, phone, status);
      
      res.json({
        success: true,
        record: newRecord
      });
    }
  } catch (error) {
    console.error('Error updating call status:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Hugging Face API configuration
const HF_API_URL = 'https://api-inference.huggingface.co/models/SamLowe/roberta-base-go_emotions';
// Note: Hugging Face Inference API works without authentication but has rate limits
// For production, get a free API key at https://huggingface.co/settings/tokens and add to .env
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

// Analyze sentiment using Hugging Face RoBERTa model
async function analyzeSentimentHF(text) {
  if (!text || text.trim().length === 0) {
    return null;
  }

  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Add authorization if API key is available
    if (HF_API_KEY) {
      headers['Authorization'] = `Bearer ${HF_API_KEY}`;
    }

    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        inputs: text.substring(0, 512) // Limit to 512 characters for RoBERTa
      })
    });

    if (!response.ok) {
      console.error('HF API error:', response.status, response.statusText);
      return null;
    }

    const result = await response.json();
    
    // Handle model loading state (HF Inference API may need time to load model)
    if (result.error && result.error.includes('loading')) {
      console.log('HuggingFace model is loading, will retry on next call...');
      return null;
    }
    
    // Result is array of arrays with label-score pairs
    if (Array.isArray(result) && result[0]) {
      // Sort by score to get top emotions
      const emotions = result[0].sort((a, b) => b.score - a.score);
      return emotions;
    }
    
    return null;
  } catch (error) {
    console.error('Error calling Hugging Face API:', error.message);
    return null;
  }
}

// Calculate lead score using ONLY HuggingFace AI model (1-10 scale)
// Returns null if no transcript is available
async function calculateLeadScore(call) {
  // Only calculate score if transcript exists
  if (!call.transcript || call.transcript.trim().length === 0) {
    return null; // No transcript = no score
  }

  let score = 5; // Base score for calls with transcripts
  
  // Factor 1: HuggingFace AI sentiment analysis (PRIMARY - up to 5 points)
  const emotions = await analyzeSentimentHF(call.transcript);
  
  if (emotions && emotions.length > 0) {
    // Categorize emotions using go_emotions model (28 categories)
    const positiveEmotions = ['admiration', 'amusement', 'approval', 'caring', 'desire', 
                              'excitement', 'gratitude', 'joy', 'love', 'optimism', 
                              'pride', 'relief'];
    const negativeEmotions = ['anger', 'annoyance', 'disappointment', 'disapproval', 
                              'disgust', 'embarrassment', 'fear', 'grief', 'nervousness', 
                              'remorse', 'sadness'];
    
    // Get top 3 emotions from HuggingFace model
    const topEmotions = emotions.slice(0, 3);
    let sentimentScore = 0;
    
    console.log(`🤖 HF Emotions for call: ${topEmotions.map(e => `${e.label}(${e.score.toFixed(2)})`).join(', ')}`);
    
    for (const emotion of topEmotions) {
      if (positiveEmotions.includes(emotion.label)) {
        sentimentScore += emotion.score * 2; // Weight positive emotions heavily
      } else if (negativeEmotions.includes(emotion.label)) {
        sentimentScore -= emotion.score * 1.5; // Penalize negative emotions
      }
    }
    
    // Convert HF sentiment to score points (0-5 range based on AI analysis)
    if (sentimentScore > 0.8) {
      score += 5; // Extremely positive
    } else if (sentimentScore > 0.4) {
      score += 4; // Very positive
    } else if (sentimentScore > 0.1) {
      score += 3; // Positive
    } else if (sentimentScore > -0.1) {
      score += 2; // Neutral
    } else if (sentimentScore > -0.4) {
      score += 1; // Slightly negative
    } else if (sentimentScore > -0.8) {
      score -= 1; // Negative
    } else {
      score -= 2; // Very negative
    }
  } else {
    // HF model failed, use basic heuristics
    console.log('⚠️  HF model unavailable, using basic scoring');
    
    // Factor 2: Call success (0-2 points)
    if (call.call_analysis?.call_successful === true) {
      score += 2;
    }
    
    // Factor 3: Call duration (0-2 points)
    if (call.duration_ms) {
      const durationSeconds = call.duration_ms / 1000;
      if (durationSeconds > 120) { // Over 2 minutes
        score += 2;
      } else if (durationSeconds > 60) { // Over 1 minute
        score += 1;
      }
    }
  }
  
  // Factor 4: Transcript engagement analysis (0-1 points)
  const wordCount = call.transcript.split(/\s+/).length;
  if (wordCount > 200) { // Long, engaged conversation
    score += 1;
  } else if (wordCount < 20) { // Very short conversation - likely poor lead
    score -= 1;
  }
  
  // Ensure score is between 1 and 10, round to whole number
  score = Math.max(1, Math.min(10, Math.round(score)));
  
  console.log(`📊 Lead Score: ${score}/10`);
  
  return score;
}

// Fetch recent calls from Retell AI API using SDK
app.post('/api/retell/list-calls', async (req, res) => {
  try {
    const { limit = 1000 } = req.body;
    
    console.log(`📞 Fetching ${limit} recent calls from Retell AI using SDK...`);
    
    // Use Retell SDK to list calls
    const callResponses = await retellClient.call.list({
      sort_order: 'descending',
      limit: limit
    });
    
    console.log(`✅ Retrieved ${callResponses.length || 0} calls from Retell AI`);
    
    // Transform the calls to include all necessary fields with async lead scoring
    const transformedCalls = await Promise.all(callResponses.map(async (call) => ({
      call_id: call.call_id,
      call_type: call.call_type,
      call_status: call.call_status,
      start_timestamp: call.start_timestamp,
      end_timestamp: call.end_timestamp,
      duration_ms: call.duration_ms,
      from_number: call.from_number,
      to_number: call.to_number,
      disconnection_reason: call.disconnection_reason,
      call_analysis: call.call_analysis,
      transcript: call.transcript,
      recording_url: call.recording_url,
      public_log_url: call.public_log_url,
      agent_id: call.agent_id,
      metadata: call.metadata,
      lead_score: await calculateLeadScore(call)
    })));
    
    console.log(`✅ Transformed ${transformedCalls.length} calls`);
    
    res.json({
      success: true,
      calls: transformedCalls,
      total: transformedCalls.length
    });
  } catch (error) {
    console.error('Error fetching Retell calls:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Retell AI webhook endpoint (for call events)
app.post('/api/retell/webhook', async (req, res) => {
  try {
    const event = req.body;
    
    console.log('Retell webhook received:', event.event);
    console.log('Call ID:', event.call?.call_id);
    console.log('Call Status:', event.call?.call_status);
    console.log('Metadata:', event.call?.metadata);

    // Extract contact info from metadata
    const contactName = event.call?.metadata?.recipient_name || 
                       event.call?.metadata?.name || 
                       event.call?.to_number || 
                       'Unknown';
    const sheetName = event.call?.metadata?.project_name || 'Voice Campaign';

    // Handle different event types
    switch (event.event) {
      case 'call_started':
        console.log('Call started:', event.call.call_id);
        console.log('Contact:', contactName);
        
        // Check if record already exists (from create-call)
        const startedIndex = callRecords.findIndex(r => r.callId === event.call.call_id);
        if (startedIndex >= 0) {
          // Update existing record with more info
          callRecords[startedIndex].name = contactName;
          callRecords[startedIndex].sheetName = sheetName;
          console.log('📞 Updated existing call record:', contactName);
        } else {
          // Create new record if not exists
          callRecords.push({
            id: `call-${event.call.call_id}`,
            name: contactName,
            phone: event.call.to_number || 'N/A',
            status: 'ongoing',
            duration: null,
            timestamp: new Date().toISOString(),
            sheetName: sheetName,
            callId: event.call.call_id,
            sentiment: null,
            summary: null
          });
          console.log('📞 Created new call record:', contactName);
        }
        break;
      
      case 'call_ended':
        console.log('Call ended:', event.call.call_id);
        console.log('Duration:', event.call.duration_ms, 'ms');
        console.log('Disconnection reason:', event.call.disconnection_reason);
        
        // Update existing record or create new one
        const existingIndex = callRecords.findIndex(r => r.callId === event.call.call_id);
        const durationSeconds = Math.round((event.call.duration_ms || 0) / 1000);
        const status = event.call.call_status === 'ended' ? 'completed' : 'failed';
        
        if (existingIndex >= 0) {
          callRecords[existingIndex].status = status;
          callRecords[existingIndex].duration = `${durationSeconds}s`;
          callRecords[existingIndex].name = contactName; // Update with metadata name
          callRecords[existingIndex].sheetName = sheetName;
          console.log('📞 Updated call to', status, ':', contactName);
        } else {
          callRecords.push({
            id: `call-${event.call.call_id}`,
            name: contactName,
            phone: event.call.to_number || 'N/A',
            status: status,
            duration: `${durationSeconds}s`,
            timestamp: new Date().toISOString(),
            sheetName: sheetName,
            callId: event.call.call_id,
            sentiment: null,
            summary: null
          });
          console.log('📞 Created call record on end:', contactName);
        }
        break;
      
      case 'call_analyzed':
        console.log('Call analyzed:', event.call.call_id);
        console.log('Summary:', event.call.call_analysis?.call_summary);
        console.log('Sentiment:', event.call.call_analysis?.user_sentiment);
        
        // Update with analysis data
        const analyzedIndex = callRecords.findIndex(r => r.callId === event.call.call_id);
        if (analyzedIndex >= 0) {
          callRecords[analyzedIndex].sentiment = event.call.call_analysis?.user_sentiment || null;
          callRecords[analyzedIndex].summary = event.call.call_analysis?.call_summary || null;
        }
        break;
      
      default:
        console.log('Unknown event type:', event.event);
    }

    // Always respond with 200 OK to acknowledge receipt
    res.json({ received: true });

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Retell AI - Create Knowledge Base endpoint
app.post('/api/retell/create-knowledge-base', async (req, res) => {
  try {
    const { apiKey, knowledgeBaseName, texts, urls, enableAutoRefresh } = req.body;

    if (!apiKey || !knowledgeBaseName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: apiKey, knowledgeBaseName',
      });
    }

    // Use fetch with FormData for proper multipart/form-data encoding
    const FormData = require('form-data');
    const formData = new FormData();
    
    formData.append('knowledge_base_name', knowledgeBaseName);
    
    // Add texts if provided
    if (texts && texts.length > 0) {
      texts.forEach((text, index) => {
        if (typeof text === 'string') {
          formData.append(`knowledge_base_texts[${index}][text]`, text);
        } else {
          formData.append(`knowledge_base_texts[${index}][text]`, text.text || '');
          if (text.title) {
            formData.append(`knowledge_base_texts[${index}][title]`, text.title);
          }
        }
      });
    }

    // Add URLs if provided
    if (urls && urls.length > 0) {
      urls.forEach((url, index) => {
        formData.append(`knowledge_base_urls[${index}]`, url);
      });
    }

    // Enable auto refresh if specified
    if (enableAutoRefresh !== undefined) {
      formData.append('enable_auto_refresh', enableAutoRefresh.toString());
    }

    console.log('Creating knowledge base:', knowledgeBaseName);
    console.log('Texts:', texts?.length || 0, 'URLs:', urls?.length || 0);
    if (texts && texts.length > 0) {
      console.log('Sample text:', texts[0]);
    }

    const retellResponse = await fetch('https://api.retellai.com/create-knowledge-base', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    console.log('Knowledge base API response status:', retellResponse.status);

    const contentType = retellResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await retellResponse.text();
      console.error('Retell API returned non-JSON response:', text.substring(0, 500));
      return res.status(502).json({
        success: false,
        message: 'Retell API returned invalid response',
        error: text.substring(0, 200),
      });
    }

    const responseData = await retellResponse.json();
    console.log('Knowledge base response:', responseData);

    if (!retellResponse.ok) {
      console.error('Knowledge base creation error:', responseData);
      return res.status(retellResponse.status).json({
        success: false,
        message: responseData.message || 'Failed to create knowledge base',
        error: responseData,
      });
    }

    console.log('✅ Knowledge base created:', responseData.knowledge_base_id);
    console.log('Status:', responseData.status);

    res.json({
      success: true,
      knowledge_base_id: responseData.knowledge_base_id,
      status: responseData.status,
      data: responseData,
    });
  } catch (error) {
    console.error('Error creating knowledge base:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
});

// Google Calendar - Create Event endpoint (Production-Ready)
app.post('/api/create-calendar-event', async (req, res) => {
  try {
    // Check if Calendar integration is enabled
    if (!googleAuth.isAuthenticated()) {
      return res.status(503).json({
        success: false,
        message: 'Google Calendar integration not configured',
        error: 'Please complete OAuth setup first',
      });
    }

    const { 
      summary, 
      description, 
      startDateTime, 
      endDateTime, 
      attendeeEmail,
      timeZone 
    } = req.body;

    // Validate required fields
    if (!summary || !startDateTime || !endDateTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: summary, startDateTime, endDateTime' 
      });
    }

    // Get authenticated calendar client
    const calendar = googleAuth.getCalendarClient();

    console.log('Calendar event request:', {
      summary,
      startDateTime,
      endDateTime,
      timeZone: timeZone || 'Asia/Kolkata'
    });

    // Prepare event details
    const event = {
      summary: summary,
      description: description,
      start: {
        dateTime: startDateTime,
        timeZone: timeZone || 'Asia/Kolkata',
      },
      end: {
        dateTime: endDateTime,
        timeZone: timeZone || 'Asia/Kolkata',
      },
      attendees: attendeeEmail ? [{ email: attendeeEmail }] : [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },  // 1 day before
          { method: 'popup', minutes: 30 },        // 30 minutes before
        ],
      },
      conferenceData: {
        createRequest: {
          requestId: `task-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    };

    console.log('Creating Google Calendar event:', summary);
    console.log('Event start:', event.start);
    console.log('Event end:', event.end);
    if (attendeeEmail) {
      console.log('Adding attendee:', attendeeEmail);
    }

    // Create event with automatic token refresh
    const response = await calendar.events.insert({
      calendarId: 'primary',
      sendUpdates: attendeeEmail ? 'all' : 'none',
      conferenceDataVersion: 1,
      resource: event,
    });

    console.log('✅ Calendar event created:', response.data.id);
    console.log('Event link:', response.data.htmlLink);

    res.json({
      success: true,
      message: 'Calendar event created successfully',
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
      meetLink: response.data.hangoutLink || null,
      data: response.data,
    });

  } catch (error) {
    console.error('Error creating calendar event:', error);
    
    // Handle specific Google API errors
    if (error.code === 401 || error.code === 403) {
      // Try to refresh token
      try {
        await googleAuth.refreshAccessToken();
        return res.status(401).json({
          success: false,
          message: 'Authentication expired. Please try again.',
          error: 'Token refreshed, retry request',
        });
      } catch (refreshError) {
        return res.status(401).json({
          success: false,
          message: 'Google Calendar authentication failed. Please re-authenticate.',
          error: 'Invalid or expired refresh token',
          needsReauth: true,
        });
      }
    }

    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create calendar event',
      error: error.toString()
    });
  }
});

// Google Calendar - OAuth2 Callback (Production Setup)
app.get('/oauth2callback', async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>OAuth Error</title>
          <style>
            body { font-family: Arial; padding: 40px; text-align: center; background: #f44336; color: white; }
            .container { background: white; color: #333; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Authorization Failed</h1>
            <p>No authorization code received.</p>
            <p><a href="/google-calendar-setup">Try again</a></p>
          </div>
        </body>
        </html>
      `);
    }

    // Exchange code for tokens
    await googleAuth.getTokensFromCode(code);

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Calendar Setup Complete</title>
        <style>
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            padding: 0; 
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .container { 
            background: white; 
            padding: 50px; 
            border-radius: 15px; 
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 600px;
            text-align: center;
          }
          .checkmark {
            font-size: 80px;
            color: #4CAF50;
            margin-bottom: 20px;
            animation: scaleIn 0.5s ease-out;
          }
          @keyframes scaleIn {
            from { transform: scale(0); }
            to { transform: scale(1); }
          }
          h1 { color: #333; margin-bottom: 10px; }
          p { color: #666; line-height: 1.8; font-size: 16px; }
          .success-box {
            background: #e8f5e9;
            border-left: 4px solid #4CAF50;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
            text-align: left;
          }
          .next-steps {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 5px;
            margin-top: 20px;
            text-align: left;
          }
          .next-steps h3 { margin-top: 0; color: #333; }
          .next-steps ol { color: #666; line-height: 2; }
          .button {
            display: inline-block;
            background: #4CAF50;
            color: white;
            padding: 12px 30px;
            border-radius: 5px;
            text-decoration: none;
            margin-top: 20px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="checkmark">✓</div>
          <h1>🎉 Google Calendar Setup Complete!</h1>
          
          <div class="success-box">
            <strong>✅ Authentication Successful</strong><br>
            Your application can now create calendar events automatically.
          </div>

          <div class="next-steps">
            <h3>📋 Next Steps:</h3>
            <ol>
              <li>Calendar integration is now active</li>
              <li>Create or edit tasks in Kanban board</li>
              <li>Add start/end dates and times</li>
              <li>Events will sync to your Google Calendar</li>
            </ol>
          </div>

          <p style="margin-top: 30px; color: #999; font-size: 14px;">
            You can safely close this window now.
          </p>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Setup Error</title>
        <style>
          body { font-family: Arial; padding: 40px; text-align: center; background: #f44336; color: white; }
          .container { background: white; color: #333; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; }
          .error { color: #f44336; background: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>❌ Setup Error</h1>
          <div class="error">${error.message}</div>
          <p><a href="/google-calendar-setup">Try again</a></p>
        </div>
      </body>
      </html>
    `);
  }
});

// Google Calendar - Setup Page (Production Interface)
app.get('/google-calendar-setup', (req, res) => {
  try {
    if (googleAuth.isAuthenticated()) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Calendar Already Configured</title>
          <style>
            body { 
              font-family: Arial; 
              padding: 40px; 
              text-align: center; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              margin: 0;
            }
            .container { 
              background: white; 
              padding: 50px; 
              border-radius: 15px; 
              max-width: 600px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            .status { color: #4CAF50; font-size: 60px; margin-bottom: 20px; }
            h1 { color: #333; }
            p { color: #666; line-height: 1.8; }
            .button {
              display: inline-block;
              background: #f44336;
              color: white;
              padding: 12px 30px;
              border-radius: 5px;
              text-decoration: none;
              margin-top: 20px;
              font-weight: bold;
            }
            .info-box {
              background: #e3f2fd;
              border-left: 4px solid #2196F3;
              padding: 15px;
              margin: 20px 0;
              text-align: left;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="status">✓</div>
            <h1>Calendar Integration Active</h1>
            <p>Google Calendar is already configured and working.</p>
            
            <div class="info-box">
              <strong>📅 Status:</strong> Connected<br>
              <strong>🔑 Authentication:</strong> Valid<br>
              <strong>✉️ Events:</strong> Will be created automatically
            </div>

            <p>To reconfigure authentication:</p>
            <a href="/google-calendar-revoke" class="button">Revoke & Reconfigure</a>
          </div>
        </body>
        </html>
      `);
    }

    const authUrl = googleAuth.getAuthUrl();

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Google Calendar Setup</title>
        <style>
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            padding: 0; 
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .container { 
            background: white; 
            padding: 50px; 
            border-radius: 15px; 
            max-width: 700px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          }
          h1 { color: #333; margin-bottom: 10px; }
          .subtitle { color: #666; margin-bottom: 30px; font-size: 18px; }
          .steps {
            background: #f5f5f5;
            padding: 25px;
            border-radius: 10px;
            margin: 30px 0;
            text-align: left;
          }
          .steps h3 { margin-top: 0; color: #333; }
          .steps ol { color: #666; line-height: 2; padding-left: 20px; }
          .steps li { margin: 10px 0; }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 40px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 18px;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transition: transform 0.2s;
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ff9800;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .icon { font-size: 48px; text-align: center; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">📅</div>
          <h1>Google Calendar Integration Setup</h1>
          <p class="subtitle">Connect your Google Calendar to automatically create events from tasks</p>

          <div class="steps">
            <h3>🚀 What This Does:</h3>
            <ol>
              <li><strong>Automatic Events:</strong> Tasks with dates create calendar events</li>
              <li><strong>Email Invites:</strong> Assignees receive calendar invitations</li>
              <li><strong>Smart Reminders:</strong> Auto-configured email & popup alerts</li>
              <li><strong>Google Meet:</strong> Video call links added automatically</li>
            </ol>
          </div>

          <div class="warning">
            <strong>⚠️ Important:</strong> Click the button below to authorize calendar access. 
            You'll be redirected to Google to grant permissions.
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${authUrl}" class="button">
              🔐 Connect Google Calendar
            </a>
          </div>

          <p style="text-align: center; margin-top: 30px; color: #999; font-size: 14px;">
            Your credentials are stored securely on this server.<br>
            You can revoke access anytime from your Google Account settings.
          </p>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial; padding: 40px; text-align: center;">
        <h1 style="color: #f44336;">❌ Setup Error</h1>
        <p>Google Calendar integration is not properly configured.</p>
        <p style="color: #666;">Error: ${error.message}</p>
        <p style="margin-top: 30px;">
          <strong>Please ensure:</strong><br>
          1. google-credentials.json file exists in backend folder<br>
          2. File contains valid OAuth 2.0 credentials<br>
          3. Google Calendar API is enabled in Cloud Console
        </p>
      </body>
      </html>
    `);
  }
});

// Google Calendar - Revoke Authentication
app.get('/google-calendar-revoke', async (req, res) => {
  try {
    await googleAuth.revokeAuth();
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Revoked</title>
        <style>
          body { 
            font-family: Arial; 
            padding: 40px; 
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0;
          }
          .container { 
            background: white; 
            padding: 50px; 
            border-radius: 15px; 
            max-width: 500px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          }
          .icon { font-size: 60px; color: #ff9800; margin-bottom: 20px; }
          h1 { color: #333; }
          p { color: #666; line-height: 1.8; }
          .button {
            display: inline-block;
            background: #4CAF50;
            color: white;
            padding: 12px 30px;
            border-radius: 5px;
            text-decoration: none;
            margin-top: 20px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">🔓</div>
          <h1>Authentication Revoked</h1>
          <p>Google Calendar access has been removed.</p>
          <p>To use calendar integration again, complete the setup process.</p>
          <a href="/google-calendar-setup" class="button">Setup Again</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send('Error revoking authentication: ' + error.message);
  }
});

// Google Calendar - Status Check API
app.get('/api/calendar-status', (req, res) => {
  res.json({
    enabled: calendarEnabled,
    authenticated: googleAuth.isAuthenticated(),
    setupUrl: '/google-calendar-setup'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Email backend server is running on http://localhost:${PORT}`);
  console.log(`📧 Ready to send emails with attachments`);
  console.log(`📞 Retell AI voice calling enabled`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎙️  Voice API: http://localhost:${PORT}/api/retell/create-call`);
  console.log(`📊 Webhook: http://localhost:${PORT}/api/retell/webhook`);
});
