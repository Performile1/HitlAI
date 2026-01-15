# Email Verification Setup Guide

## Overview

This guide explains how to enable email verification for HitlAI users and customize the email templates with HitlAI branding.

## Features

- ✅ Custom branded email templates (purple gradient design)
- ✅ Email confirmation for new signups
- ✅ Password reset emails
- ✅ Magic link authentication
- ✅ User invitation emails
- ✅ Mobile-responsive design
- ✅ Security warnings and expiration notices

## Email Templates

All templates are located in `supabase/email-templates/`:

1. **`confirmation.html`** - Email verification for new signups
2. **`recovery.html`** - Password reset emails
3. **`magic_link.html`** - Passwordless authentication
4. **`invite.html`** - User invitations

### Template Design

**Brand Colors:**
- Primary Gradient: `#667eea` → `#764ba2` (Purple gradient)
- Background: White with gradient backdrop
- Text: Slate colors for readability

**Features:**
- HitlAI logo and tagline
- Clear call-to-action buttons
- Alternative text links (for email clients that block buttons)
- Security warnings with expiration times
- Mobile-responsive design
- Professional footer with links

## Setup Instructions

### Step 1: Enable Email Confirmation in Supabase

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **Settings**
3. Scroll to **Email Auth** section
4. Toggle **"Enable email confirmations"** to **ON**
5. Set **"Confirm email"** to **Required**

### Step 2: Upload Custom Email Templates

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to **Authentication** → **Email Templates**
2. You'll see 4 template types:
   - Confirm signup
   - Invite user
   - Magic Link
   - Reset password

3. For each template:
   - Click **"Edit"**
   - Copy the content from the corresponding HTML file in `supabase/email-templates/`
   - Paste into the editor
   - Click **"Save"**

**Template Mapping:**
- **Confirm signup** → `confirmation.html`
- **Invite user** → `invite.html`
- **Magic Link** → `magic_link.html`
- **Reset password** → `recovery.html`

**Option B: Via Supabase CLI**

```bash
# Update email templates using CLI
supabase settings email-templates update \
  --template confirm \
  --file supabase/email-templates/confirmation.html

supabase settings email-templates update \
  --template invite \
  --file supabase/email-templates/invite.html

supabase settings email-templates update \
  --template magic_link \
  --file supabase/email-templates/magic_link.html

supabase settings email-templates update \
  --template recovery \
  --file supabase/email-templates/recovery.html
```

### Step 3: Configure Email Settings

**Site URL Configuration:**

1. In Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL** to your production URL: `https://hitlai.com`
3. For development, add: `http://localhost:3000`
4. Add **Redirect URLs**:
   - `https://hitlai.com/auth/callback`
   - `http://localhost:3000/auth/callback`

**Email Rate Limiting:**

1. Go to **Authentication** → **Settings** → **Rate Limits**
2. Recommended settings:
   - Email sends per hour: 10 per user
   - Prevents spam and abuse

### Step 4: Configure SMTP (Optional - For Custom Domain)

By default, Supabase uses their SMTP server. For production, use your own:

1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Enable **"Enable Custom SMTP"**
3. Configure:
   ```
   Host: smtp.gmail.com (or your provider)
   Port: 587
   Username: noreply@hitlai.com
   Password: [your app password]
   Sender email: noreply@hitlai.com
   Sender name: HitlAI
   ```

**Recommended SMTP Providers:**
- **SendGrid** (99% deliverability, free tier: 100 emails/day)
- **Amazon SES** (Very cheap, high volume)
- **Mailgun** (Developer-friendly)
- **Postmark** (Excellent deliverability)

### Step 5: Test Email Verification

**Test Signup Flow:**

1. Go to `/company/signup` or `/tester/signup`
2. Register with a real email address
3. Check your inbox for the confirmation email
4. Click "Confirm Email Address" button
5. Should redirect to dashboard

**Test Password Reset:**

1. Go to `/company/login` (or tester/admin)
2. Click "Forgot Password?"
3. Enter email address
4. Check inbox for reset email
5. Click "Reset Password" button
6. Set new password

**Test from Code:**

```typescript
// Trigger confirmation email
const { data, error } = await supabase.auth.signUp({
  email: 'test@gmail.com',
  password: 'password123',
  options: {
    emailRedirectTo: 'http://localhost:3000/auth/callback'
  }
})

// Trigger password reset email
const { error } = await supabase.auth.resetPasswordForEmail(
  'test@gmail.com',
  { redirectTo: 'http://localhost:3000/auth/reset-password' }
)
```

## Email Template Variables

Supabase provides these variables in email templates:

- `{{ .ConfirmationURL }}` - The confirmation/action link
- `{{ .Token }}` - The verification token
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL
- `{{ .Email }}` - User's email address

**Example Usage:**
```html
<a href="{{ .ConfirmationURL }}">Confirm Email</a>
```

## Customization Options

### Modify Brand Colors

Edit the CSS in each template:

```css
/* Change gradient colors */
background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);

/* Change button colors */
.button {
  background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
}
```

### Add Your Logo

Replace the text logo with an image:

```html
<div class="header">
  <img src="https://hitlai.com/logo.png" alt="HitlAI" style="height: 40px;">
  <p class="tagline">Human-in-the-Loop AI Testing Platform</p>
</div>
```

### Modify Footer Links

Update the footer section:

```html
<div class="footer">
  <p><strong>HitlAI</strong> - Your Tagline</p>
  <p>
    <a href="https://hitlai.com">Website</a> • 
    <a href="https://hitlai.com/blog">Blog</a> • 
    <a href="https://hitlai.com/help">Help Center</a> • 
    <a href="mailto:support@hitlai.com">Support</a>
  </p>
</div>
```

## User Flow with Email Verification

### Company Signup Flow

1. User fills signup form at `/company/signup`
2. Supabase creates user account
3. **Email sent**: Confirmation email with branded template
4. User clicks "Confirm Email Address" in email
5. Redirects to `/auth/callback`
6. User is logged in and redirected to `/company/dashboard`

### Tester Signup Flow

1. User completes 5-step signup at `/tester/signup`
2. Supabase creates user account
3. **Email sent**: Confirmation email
4. User confirms email
5. Redirects to `/tester/dashboard`

### Password Reset Flow

1. User clicks "Forgot Password?" on login page
2. Enters email address
3. **Email sent**: Password reset email
4. User clicks "Reset Password" button
5. Redirects to password reset page
6. User enters new password
7. Redirects to login

## Security Best Practices

### Email Verification

✅ **Enabled:**
- Email confirmation required for new signups
- Links expire after 24 hours (confirmation) or 1 hour (reset)
- Rate limiting on email sends
- Security warnings in emails

✅ **Recommended:**
- Use HTTPS in production
- Set proper redirect URLs
- Monitor failed verification attempts
- Implement CAPTCHA on signup forms

### Email Content Security

✅ **Included in Templates:**
- Clear expiration times
- "If you didn't request this" warnings
- No sensitive information in emails
- Secure HTTPS links only

## Troubleshooting

### Emails Not Sending

**Check:**
1. Email confirmation is enabled in Supabase settings
2. SMTP settings are correct (if using custom SMTP)
3. User's email is valid and not blocked
4. Check Supabase logs for errors
5. Verify email isn't in spam folder

**Solution:**
```sql
-- Check if email was sent
SELECT * FROM auth.audit_log_entries
WHERE payload->>'email' = 'user@example.com'
ORDER BY created_at DESC;
```

### Email Goes to Spam

**Solutions:**
1. Use custom SMTP with verified domain
2. Set up SPF, DKIM, and DMARC records
3. Use professional email service (SendGrid, etc.)
4. Avoid spam trigger words in subject/content
5. Include unsubscribe link (for marketing emails)

### Confirmation Link Expired

**User sees:** "Link expired" or "Invalid token"

**Solution:**
1. User requests new confirmation email
2. Admin can manually verify user:
```sql
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'user@example.com';
```

### Template Not Updating

**Solutions:**
1. Clear browser cache
2. Wait a few minutes for changes to propagate
3. Check template syntax is valid HTML
4. Verify variables are correctly formatted: `{{ .ConfirmationURL }}`

## Testing Checklist

- [ ] Signup confirmation email received
- [ ] Email has HitlAI branding (purple gradient)
- [ ] Confirmation button works
- [ ] Alternative text link works
- [ ] Email displays correctly on mobile
- [ ] Email displays correctly in Gmail
- [ ] Email displays correctly in Outlook
- [ ] Password reset email works
- [ ] Magic link email works (if enabled)
- [ ] Expiration warnings are visible
- [ ] Footer links work
- [ ] Security notes are clear

## Production Deployment

### Pre-Launch Checklist

1. **Email Settings:**
   - [ ] Email confirmation enabled
   - [ ] Custom SMTP configured
   - [ ] Site URL set to production domain
   - [ ] Redirect URLs configured
   - [ ] Rate limiting enabled

2. **DNS Records (for custom SMTP):**
   - [ ] SPF record added
   - [ ] DKIM record added
   - [ ] DMARC record added

3. **Templates:**
   - [ ] All 4 templates uploaded
   - [ ] Branding is correct
   - [ ] Links point to production URLs
   - [ ] Mobile responsive tested

4. **Testing:**
   - [ ] Test signup flow end-to-end
   - [ ] Test password reset flow
   - [ ] Test on multiple email clients
   - [ ] Verify deliverability

## Monitoring

### Key Metrics to Track

1. **Email Deliverability:**
   - Delivery rate (should be >95%)
   - Bounce rate (should be <5%)
   - Spam complaint rate (should be <0.1%)

2. **User Engagement:**
   - Email open rate
   - Confirmation click rate
   - Time to verify email

3. **Supabase Dashboard:**
   - Monitor in **Authentication** → **Users**
   - Check `email_confirmed_at` field
   - Review audit logs for email events

## Support

If users report email issues:

1. Check spam folder
2. Verify email address is correct
3. Resend confirmation email
4. Check Supabase logs
5. Manually verify if needed (admin only)

**Resend Confirmation Email:**
```typescript
const { error } = await supabase.auth.resend({
  type: 'signup',
  email: 'user@example.com'
})
```

## Additional Resources

- [Supabase Email Templates Docs](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Email Deliverability Best Practices](https://sendgrid.com/blog/email-deliverability-best-practices/)
- [HTML Email Design Guide](https://www.campaignmonitor.com/dev-resources/guides/design/)

## Summary

✅ **What You Get:**
- Professional, branded email templates
- Secure email verification flow
- Password reset functionality
- Mobile-responsive design
- Security warnings and best practices

🚀 **Next Steps:**
1. Upload templates to Supabase Dashboard
2. Enable email confirmation
3. Test with real email addresses
4. Configure custom SMTP for production
5. Monitor deliverability and user feedback
