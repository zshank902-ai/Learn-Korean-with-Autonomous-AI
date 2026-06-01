import os

import resend
from fastapi import HTTPException


# Configure Resend with the API key from environment
resend.api_key = os.getenv("RESEND_API_KEY")


async def send_verification_email(
    to_email: str, token: str, frontend_url: str = "http://localhost:3000"
):
    """
    Sends a branded verification email to the user using the Resend SDK.
    """
    if not resend.api_key:
        print("WARNING: RESEND_API_KEY is not set. Email not actually sent.")
        # Fallback to just logging it if key is missing during development
        print(
            f"MOCK EMAIL: Would have sent verification link to {to_email}: {frontend_url}/verify-email?token={token}"
        )
        return True

    verify_link = f"{frontend_url}/verify-email?token={token}"

    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #1E1B4B; border-radius: 16px; overflow: hidden;">
        <div style="background-color: #6C63FF; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to K-Mastery</h1>
        </div>
        <div style="padding: 30px; background-color: #EEF2FF; color: #1E1B4B;">
            <h2 style="margin-top: 0;">Verify your email address</h2>
            <p>Thanks for joining the world's most advanced autonomous Korean learning OS!</p>
            <p>Please click the button below to verify your email address and unlock all features.</p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="{verify_link}" style="background-color: #FF6B35; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; border: 2px solid #1E1B4B; box-shadow: 4px 4px 0px #1E1B4B;">
                    Verify My Email
                </a>
            </div>

            <p style="font-size: 14px; color: #666;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
    </div>
    """

    try:
        _ = resend.Emails.send(
            {
                "from": "K-Mastery <noreply@yourdomain.com>",
                "to": to_email,
                "subject": "Verify your K-Mastery email",
                "html": html_content,
            }
        )
        return True
    except Exception as e:
        print(f"Failed to send email via Resend: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to send verification email."
        )
