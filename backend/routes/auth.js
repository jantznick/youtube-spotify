import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '../server.js';
import { sendMagicTokenLoginEmail, sendMagicTokenRegisterEmail, sendPasswordResetEmail } from '../services/emailService.js';

const router = express.Router();

// Generate a 6-digit token
const generateSixDigitToken = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate a UUID token for link-based login
const generateUUIDToken = () => {
  return crypto.randomUUID();
};

// Clean up expired tokens (run periodically)
const cleanupExpiredTokens = async () => {
  try {
    await prisma.magicToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    await prisma.passwordResetToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupExpiredTokens, 5 * 60 * 1000);

// Register
router.post('/register', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: 'Username or email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Determine if it's an email or username
    const isEmail = usernameOrEmail.includes('@');
    
    // Validate email format if it looks like an email
    if (isEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(usernameOrEmail)) {
        return res.status(400).json({ error: 'Please enter a valid email address' });
      }
    }

    // If email provided, use email only (no username generation)
    // If username provided, use it
    let finalUsername = isEmail ? null : usernameOrEmail;
    let finalEmail = isEmail ? usernameOrEmail : null;

    // Check if username already exists (if provided)
    if (finalUsername) {
      const existingUser = await prisma.user.findUnique({
        where: { username: finalUsername },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
    }

    // Check if email is already taken (if provided)
    if (finalEmail) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: finalEmail },
      });

      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: finalUsername,
        email: finalEmail,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    // Set session
    req.session.userId = user.id;
    if (user.username) {
      req.session.username = user.username;
    }

    res.status(201).json({ user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: 'Username or email and password are required' });
    }

    // Determine if it's an email or username
    const isEmail = usernameOrEmail.includes('@');

    // Find user by username or email
    let user;
    if (isEmail) {
      user = await prisma.user.findUnique({
        where: { email: usernameOrEmail },
        select: {
          id: true,
          username: true,
          email: true,
          password: true, // Need password for verification
          createdAt: true,
        },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { username: usernameOrEmail },
        select: {
          id: true,
          username: true,
          email: true,
          password: true, // Need password for verification
          createdAt: true,
        },
      });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Regenerate session to ensure cookie is set
    await new Promise((resolve, reject) => {
      req.session.regenerate((err) => {
        if (err) {
          console.error('[LOGIN] Session regenerate error:', err);
          reject(err);
        } else {
          console.log('[LOGIN] Session regenerated, new sessionID:', req.sessionID);
          resolve();
        }
      });
    });

    // Set session data
    console.log('[LOGIN] Setting session for user:', user.id);
    req.session.userId = user.id;
    if (user.username) {
      req.session.username = user.username;
    }
    console.log('[LOGIN] Session data set:', {
      userId: req.session.userId,
      username: req.session.username,
      sessionID: req.sessionID,
    });
    
    // Save session and send response INSIDE the callback (like parlay-streak)
    req.session.save((err) => {
      if (err) {
        console.error('[LOGIN] Session save error:', err);
        return res.status(500).json({ error: 'Failed to save session' });
      }
      
      console.log('[LOGIN] Session saved successfully, sessionID:', req.sessionID);
      console.log('[LOGIN] Cookie config:', {
        domain: req.session.cookie.domain,
        secure: req.session.cookie.secure,
        sameSite: req.session.cookie.sameSite,
        httpOnly: req.session.cookie.httpOnly,
        maxAge: req.session.cookie.maxAge,
      });
      
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

// Check session
router.get('/me', async (req, res) => {
  if (req.session && req.session.userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.session.userId },
        select: {
          id: true,
          username: true,
          email: true,
        },
      });
      res.json({ user });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get user' });
    }
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Request magic token
router.post('/magic-token/request', async (req, res) => {
  try {
    const { usernameOrEmail } = req.body;

    if (!usernameOrEmail) {
      return res.status(400).json({ error: 'Username or email is required' });
    }

    // Determine if it's an email or username
    const isEmail = usernameOrEmail.includes('@');
    
    // Validate email format if it looks like an email
    if (isEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(usernameOrEmail)) {
        return res.status(400).json({ error: 'Please enter a valid email address' });
      }
    }

    // Find user by email or username
    let user;
    if (isEmail) {
      user = await prisma.user.findUnique({
        where: { email: usernameOrEmail },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { username: usernameOrEmail },
      });
    }

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ message: 'If the account exists, a magic token has been generated' });
    }

    // For magic links, we need an email address
    // If username was provided, check if user has an email
    let userEmail;
    if (isEmail) {
      userEmail = usernameOrEmail;
    } else {
      // Username was provided - require user to have an email for magic links
      if (!user.email) {
        return res.status(400).json({ error: 'This account does not have an email address. Please provide an email address or add one to your account.' });
      }
      userEmail = user.email;
    }

    // Generate both 6-digit code and UUID link
    const sixDigitCode = generateSixDigitToken();
    const uuidToken = generateUUIDToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Delete any existing tokens for this user
    await prisma.magicToken.deleteMany({
      where: { userId: user.id },
    });

    // Store both tokens - 6-digit code as primary token, UUID as alternative
    await prisma.magicToken.create({
      data: {
        token: sixDigitCode,
        userId: user.id,
        expiresAt,
      },
    });

    // Also store UUID token for link-based login
    await prisma.magicToken.create({
      data: {
        token: uuidToken,
        userId: user.id,
        expiresAt,
      },
    });

    const loginLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?token=${uuidToken}`;

    // Send email if email is available
    if (userEmail) {
      const emailResult = await sendMagicTokenLoginEmail(userEmail, user.username, sixDigitCode, loginLink);
      if (emailResult.success) {
        console.log(`Magic token email sent to ${userEmail}`);
      } else {
        console.error('Failed to send magic token email:', emailResult.error);
        // Fall through to console logging
      }
    }

    // Always print tokens to console as fallback
    console.log('\n=== MAGIC TOKEN ===');
    console.log(`Username: ${user.username}`);
    if (userEmail) {
      console.log(`Email: ${userEmail}`);
    }
    console.log(`6-Digit Code: ${sixDigitCode}`);
    console.log(`Login Link: ${loginLink}`);
    console.log(`UUID Token: ${uuidToken}`);
    console.log(`Expires at: ${expiresAt.toISOString()}`);
    console.log('==================\n');

    res.json({ 
      message: 'If the username exists, a magic token has been generated',
    });
  } catch (error) {
    console.error('Magic token request error:', error);
    res.status(500).json({ error: 'Failed to generate magic token' });
  }
});

// Request magic token for registration
router.post('/magic-token/request-register', async (req, res) => {
  try {
    const { usernameOrEmail } = req.body;

    if (!usernameOrEmail) {
      return res.status(400).json({ error: 'Username or email is required' });
    }

    // Determine if it's an email or username
    const isEmail = usernameOrEmail.includes('@');
    
    // For magic link registration, we require an email address
    if (!isEmail) {
      return res.status(400).json({ error: 'Email address is required for magic link registration' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(usernameOrEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Use email only (no username generation)
    let finalUsername = null;
    let finalEmail = usernameOrEmail;

    // Check if username already exists (if provided)
    if (finalUsername) {
      const existingUser = await prisma.user.findUnique({
        where: { username: finalUsername },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
    }

    // Check if email is already taken (if provided)
    if (finalEmail) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: finalEmail },
      });

      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Generate both 6-digit code and UUID link
    const sixDigitCode = generateSixDigitToken();
    const uuidToken = generateUUIDToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Delete any existing registration tokens for this username/email
    await prisma.magicToken.deleteMany({
      where: { 
        OR: [
          { username: finalUsername, userId: null },
          { email: finalEmail, userId: null },
        ],
      },
    });

    // Store both tokens for registration
    // Store username and/or email
    await prisma.magicToken.create({
      data: {
        token: sixDigitCode,
        username: finalUsername,
        email: finalEmail,
        expiresAt,
      },
    });

    await prisma.magicToken.create({
      data: {
        token: uuidToken,
        username: finalUsername,
        email: finalEmail,
        expiresAt,
      },
    });

    const registerLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register?token=${uuidToken}`;

    // Send email if email is provided
    if (finalEmail) {
      const emailResult = await sendMagicTokenRegisterEmail(finalEmail, finalUsername || finalEmail.split('@')[0], sixDigitCode, registerLink);
      if (emailResult.success) {
        console.log(`Registration magic token email sent to ${finalEmail}`);
      } else {
        console.error('Failed to send registration magic token email:', emailResult.error);
        // Fall through to console logging
      }
    }

    // Always print tokens to console as fallback
    console.log('\n=== REGISTRATION MAGIC TOKEN ===');
    if (finalUsername) {
      console.log(`Username: ${finalUsername}`);
    }
    if (finalEmail) {
      console.log(`Email: ${finalEmail}`);
    }
    console.log(`6-Digit Code: ${sixDigitCode}`);
    console.log(`Register Link: ${registerLink}`);
    console.log(`UUID Token: ${uuidToken}`);
    console.log(`Expires at: ${expiresAt.toISOString()}`);
    console.log('==================================\n');

    res.json({ 
      message: 'Registration magic token has been generated',
    });
  } catch (error) {
    console.error('Registration magic token request error:', error);
    res.status(500).json({ error: 'Failed to generate registration magic token' });
  }
});

// Register with magic token
router.post('/magic-token/register', async (req, res) => {
  try {
    let { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Ensure token is a string (handle array case)
    if (Array.isArray(token)) {
      token = token.join('');
    }
    token = String(token);

    // Find registration token
    const magicToken = await prisma.magicToken.findUnique({
      where: { token },
    });

    if (!magicToken) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Check if token is expired
    if (magicToken.expiresAt < new Date()) {
      await prisma.magicToken.delete({
        where: { id: magicToken.id },
      });
      return res.status(401).json({ error: 'Token has expired' });
    }

    // Check if this is a registration token (has username or email but no userId)
    if ((!magicToken.username && !magicToken.email) || magicToken.userId) {
      return res.status(400).json({ error: 'Invalid registration token' });
    }

    // Check if username still available (if provided)
    if (magicToken.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: magicToken.username },
      });

      if (existingUser) {
        // Clean up token
        await prisma.magicToken.delete({
          where: { id: magicToken.id },
        });
        return res.status(400).json({ error: 'Username is no longer available' });
      }
    }

    // Check if email already exists (if provided)
    if (magicToken.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: magicToken.email },
      });

      if (existingEmail) {
        // Clean up token
        await prisma.magicToken.delete({
          where: { id: magicToken.id },
        });
        return res.status(400).json({ error: 'Email is already registered' });
      }
    }

    // Create user without password (passwordless account)
    const hashedPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10); // Random password since they won't use it

    const user = await prisma.user.create({
      data: {
        username: magicToken.username,
        email: magicToken.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    // Delete all registration tokens for this username/email
    await prisma.magicToken.deleteMany({
      where: {
        OR: [
          { username: magicToken.username, userId: null },
          { email: magicToken.email, userId: null },
        ],
      },
    });

    // Regenerate session to ensure cookie is set
    await new Promise((resolve, reject) => {
      req.session.regenerate((err) => {
        if (err) {
          console.error('[MAGIC-TOKEN-REGISTER] Session regenerate error:', err);
          reject(err);
        } else {
          console.log('[MAGIC-TOKEN-REGISTER] Session regenerated, new sessionID:', req.sessionID);
          resolve();
        }
      });
    });

    // Set session data
    console.log('[MAGIC-TOKEN-REGISTER] Setting session for new user:', user.id);
    req.session.userId = user.id;
    if (user.username) {
      req.session.username = user.username;
    }
    console.log('[MAGIC-TOKEN-REGISTER] Session data set:', {
      userId: req.session.userId,
      username: req.session.username,
      sessionID: req.sessionID,
    });
    
    // Save session and send response INSIDE the callback (like parlay-streak)
    req.session.save((err) => {
      if (err) {
        console.error('[MAGIC-TOKEN-REGISTER] Session save error:', err);
        return res.status(500).json({ error: 'Failed to save session' });
      }
      
      console.log('[MAGIC-TOKEN-REGISTER] Session saved successfully, sessionID:', req.sessionID);
      console.log('[MAGIC-TOKEN-REGISTER] Cookie config:', {
        domain: req.session.cookie.domain,
        secure: req.session.cookie.secure,
        sameSite: req.session.cookie.sameSite,
        httpOnly: req.session.cookie.httpOnly,
        maxAge: req.session.cookie.maxAge,
      });
      
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    });
  } catch (error) {
    console.error('Magic token register error:', error);
    res.status(500).json({ error: 'Failed to register with magic token' });
  }
});

// Login with magic token
router.post('/magic-token/login', async (req, res) => {
  try {
    let { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Ensure token is a string (handle array case)
    if (Array.isArray(token)) {
      token = token.join('');
    }
    token = String(token);

    // Find token with user data (excluding password)
    const magicToken = await prisma.magicToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    if (!magicToken) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Check if token is expired
    if (magicToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.magicToken.delete({
        where: { id: magicToken.id },
      });
      return res.status(401).json({ error: 'Token has expired' });
    }

    // Delete used token first
    await prisma.magicToken.delete({
      where: { id: magicToken.id },
    });

    // Regenerate session to ensure cookie is set
    await new Promise((resolve, reject) => {
      req.session.regenerate((err) => {
        if (err) {
          console.error('[MAGIC-TOKEN-LOGIN] Session regenerate error:', err);
          reject(err);
        } else {
          console.log('[MAGIC-TOKEN-LOGIN] Session regenerated, new sessionID:', req.sessionID);
          resolve();
        }
      });
    });

    // Set session data - this marks the session as modified
    console.log('[MAGIC-TOKEN-LOGIN] Setting session for user:', magicToken.user.id);
    req.session.userId = magicToken.user.id;
    req.session.username = magicToken.user.username;
    
    // Touch the session to ensure it's marked as needing a cookie
    req.session.touch();
    
    console.log('[MAGIC-TOKEN-LOGIN] Session data set:', {
      userId: req.session.userId,
      username: req.session.username,
      sessionID: req.sessionID,
      cookieExpires: req.session.cookie.expires,
    });

    // Save session and send response INSIDE the callback (like parlay-streak)
    req.session.save((err) => {
      if (err) {
        console.error('[MAGIC-TOKEN-LOGIN] Session save error:', err);
        return res.status(500).json({ error: 'Failed to save session' });
      }
      
      console.log('[MAGIC-TOKEN-LOGIN] Session saved successfully, sessionID:', req.sessionID);
      console.log('[MAGIC-TOKEN-LOGIN] Cookie config:', {
        domain: req.session.cookie.domain,
        secure: req.session.cookie.secure,
        sameSite: req.session.cookie.sameSite,
        httpOnly: req.session.cookie.httpOnly,
        maxAge: req.session.cookie.maxAge,
      });
      
      res.json({
        user: {
          id: magicToken.user.id,
          username: magicToken.user.username,
          email: magicToken.user.email,
          createdAt: magicToken.user.createdAt,
        },
      });
    });
  } catch (error) {
    console.error('Magic token login error:', error);
    res.status(500).json({ error: 'Failed to login with magic token' });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email && !username) {
      return res.status(400).json({ error: 'Email or username is required' });
    }

    // Find user by email or username
    let user;
    if (email) {
      user = await prisma.user.findUnique({
        where: { email },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { username },
      });
    }

    // Don't reveal if user exists or not for security
    if (!user || !user.email) {
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent' 
      });
    }

    // Generate reset token
    const resetToken = generateUUIDToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Store reset token
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt,
      },
    });

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    // Send email
    const emailResult = await sendPasswordResetEmail(user.email, user.username, resetLink);
    if (emailResult.success) {
      console.log(`Password reset email sent to ${user.email}`);
    } else {
      console.error('Failed to send password reset email:', emailResult.error);
      // Fall through to console logging
    }

    // Always print to console as fallback
    console.log('\n=== PASSWORD RESET TOKEN ===');
    console.log(`Username: ${user.username}`);
    console.log(`Email: ${user.email}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log(`Token: ${resetToken}`);
    console.log(`Expires at: ${expiresAt.toISOString()}`);
    console.log('============================\n');

    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Find reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return res.status(401).json({ error: 'Invalid or expired reset token' });
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      return res.status(401).json({ error: 'Reset token has expired' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Delete used reset token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    // Invalidate all sessions for security (optional - you might want to keep sessions)
    // For now, we'll just return success

    res.json({ 
      message: 'Password has been reset successfully. You can now login with your new password.',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router;
