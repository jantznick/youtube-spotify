import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Send magic token login email with 6-digit code and link
 */
export async function sendMagicTokenLoginEmail(email, username, sixDigitCode, loginLink) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your MusicDocks Login Code',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Login Code</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">MusicDocks</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
              <h2 style="color: #1f2937; margin-top: 0;">Your Login Code</h2>
              <p style="color: #4b5563; font-size: 16px;">Hi ${username},</p>
              <p style="color: #4b5563; font-size: 16px;">Use this code to sign in to your MusicDocks account:</p>
              
              <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${sixDigitCode}
                </div>
              </div>

              <p style="color: #4b5563; font-size: 16px;">Or click the link below to sign in instantly:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${loginLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Sign In to MusicDocks
                </a>
              </div>

              <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                This code will expire in 15 minutes. If you didn't request this code, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
      text: `
        MusicDocks Login Code

        Hi ${username},

        Use this code to sign in to your MusicDocks account: ${sixDigitCode}

        Or click this link to sign in instantly: ${loginLink}

        This code will expire in 15 minutes. If you didn't request this code, you can safely ignore this email.
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending magic token login email:', error);
    return { success: false, error };
  }
}

/**
 * Send magic token registration email with 6-digit code and link
 */
export async function sendMagicTokenRegisterEmail(email, username, sixDigitCode, registerLink) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Complete Your MusicDocks Registration',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Complete Your Registration</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">MusicDocks</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
              <h2 style="color: #1f2937; margin-top: 0;">Complete Your Registration</h2>
              <p style="color: #4b5563; font-size: 16px;">Hi there,</p>
              <p style="color: #4b5563; font-size: 16px;">You're almost done! Use this code to complete your MusicDocks account registration for <strong>${username}</strong>:</p>
              
              <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${sixDigitCode}
                </div>
              </div>

              <p style="color: #4b5563; font-size: 16px;">Or click the link below to complete registration instantly:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${registerLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Complete Registration
                </a>
              </div>

              <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                This code will expire in 15 minutes. If you didn't request this registration, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
      text: `
        Complete Your MusicDocks Registration

        Hi there,

        You're almost done! Use this code to complete your MusicDocks account registration for ${username}: ${sixDigitCode}

        Or click this link to complete registration instantly: ${registerLink}

        This code will expire in 15 minutes. If you didn't request this registration, you can safely ignore this email.
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending magic token register email:', error);
    return { success: false, error };
  }
}

/**
 * Send password reset email with reset link
 */
export async function sendPasswordResetEmail(email, username, resetLink) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset Your MusicDocks Password',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">MusicDocks</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
              <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>
              <p style="color: #4b5563; font-size: 16px;">Hi ${username},</p>
              <p style="color: #4b5563; font-size: 16px;">We received a request to reset your password for your MusicDocks account. Click the button below to create a new password:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Reset Password
                </a>
              </div>

              <p style="color: #4b5563; font-size: 16px;">Or copy and paste this link into your browser:</p>
              <p style="color: #6b7280; font-size: 14px; word-break: break-all; background: #f3f4f6; padding: 12px; border-radius: 6px; margin: 20px 0;">
                ${resetLink}
              </p>

              <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </div>
          </body>
        </html>
      `,
      text: `
        Reset Your MusicDocks Password

        Hi ${username},

        We received a request to reset your password for your MusicDocks account. Click the link below to create a new password:

        ${resetLink}

        This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error };
  }
}
