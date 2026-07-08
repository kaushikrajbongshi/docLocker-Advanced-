export function generateOTPEmail(type, otp) {
  let subject, heading, description;

  switch (type) {
    case "register":
      subject = "Complete Your Registration • DocLocker";
      heading = "Welcome to DocLocker 👋";
      description =
        "Thank you for creating your DocLocker account. Use the verification code below to complete your registration.";
      break;

    case "login":
      subject = "Login Verification • DocLocker";
      heading = "Verify Your Login";
      description =
        "We received a login request for your DocLocker account. Enter the verification code below to continue securely.";
      break;

    case "reset":
      subject = "Password Reset • DocLocker";
      heading = "Reset Your Password";
      description =
        "We received a request to reset your password. Use the verification code below to continue.";
      break;

    default:
      throw new Error("Invalid OTP type");
  }

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>DocLocker OTP</title>
</head>

<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
<tr><td align="center">

<table width="600" cellpadding="0" cellspacing="0"
style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 8px 25px rgba(0,0,0,.08);">

<tr>
<td style="background:#2563eb;padding:30px;text-align:center;color:#fff;">
<h1 style="margin:0;">🔐 DocLocker</h1>
<p>Secure Document Management</p>
</td>
</tr>

<tr>
<td style="padding:40px;">

<h2>${heading}</h2>

<p>${description}</p>

<div style="
margin:35px auto;
background:#eff6ff;
border:2px dashed #2563eb;
padding:20px;
max-width:260px;
text-align:center;
border-radius:10px;
">

<div style="
font-size:34px;
font-weight:bold;
letter-spacing:8px;
color:#2563eb;
">

${otp}

</div>

</div>

<p>
This verification code is valid for
<strong>5 minutes</strong>.
</p>

<p style="color:#dc2626;">
Never share this OTP with anyone.
</p>

<hr>

<p>
If you didn't request this action,
you can safely ignore this email.
</p>

</td>
</tr>

<tr>
<td style="
background:#f9fafb;
padding:20px;
text-align:center;
font-size:13px;
color:#666;
">

<strong>DocLocker</strong><br>

© ${new Date().getFullYear()} DocLocker

</td>
</tr>

</table>

</td></tr>
</table>

</body>
</html>
`;

  return {
    subject,
    htmlContent,
  };
}