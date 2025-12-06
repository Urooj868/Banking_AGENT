# Biometric Scanner - Camera Permission Guide

## What's Happening

Your neobank-ai-agent app requires camera access for biometric (facial) verification. The app is asking for permission to use your webcam.

## Fix for Camera Permission Issues

### Option 1: Grant Camera Permission (Recommended)

#### For Chrome/Chromium:

1. Look at the browser address bar (top left)
2. You should see a camera icon 🎥 or a warning/info icon
3. Click it and select **"Allow"** to grant camera access
4. Refresh the page (Ctrl+R or Cmd+R)
5. Try the biometric verification again

#### For Firefox:

1. Click the address bar and look for a permissions panel
2. Check the camera icon
3. Select **"Allow"**
4. Refresh the page
5. Try again

#### For Safari:

1. Go to Safari → Settings (Preferences)
2. Go to **Privacy** tab
3. Find **Camera** section
4. Add localhost or your domain to allowed list
5. Refresh and try again

### Option 2: Use Demo Mode (Testing Without Camera)

When the camera fails, you'll see these buttons:

- **"Retry Camera Access"** - Try again after enabling permission
- **"Continue (Demo Mode)"** - Skip camera verification for testing

Click "Continue (Demo Mode)" to proceed without camera access (for development/testing only).

## Browser Requirements

✅ **Supported Browsers:**

- Chrome/Chromium (v56+)
- Firefox (v55+)
- Safari (v11+)
- Edge (v79+)

⚠️ **Important Notes:**

- Camera access works best on `localhost` (no HTTPS required)
- For remote access, you need HTTPS
- Some corporate networks may block camera access
- Virtual machines may have camera access issues

## Troubleshooting

### Error: "Camera permission denied"

- Check your browser permissions settings
- Try a different browser
- Restart your browser completely
- Check if another app is using the camera

### Error: "No camera device found"

- Connect a webcam to your computer
- Check device manager to see if camera is detected
- Try restarting your computer

### Error: "Camera is in use by another application"

- Close other apps using the camera (Zoom, Teams, etc.)
- Restart your browser
- Try again

### Error: "Camera access blocked by security policy"

- You're likely accessing from HTTPS
- For localhost development, this shouldn't happen
- Make sure you're using `http://localhost:3000`, not `https://`

## How It Works in the App

1. **Click "Create Bank Account"** in the chat
2. Vault AI asks for biometric verification
3. Camera permission dialog appears
4. **Grant permission** to proceed
5. Webcam feed starts (you'll see yourself)
6. System scans your face for 3-4 seconds
7. Green checkmark = Verification successful ✓
8. Continue with account opening

## Development/Testing

If you're testing and don't have a camera available:

1. Click the biometric screen when it appears
2. Look for the **"Continue (Demo Mode)"** button
3. Click it to skip camera verification
4. The app will proceed as if verification was successful

This allows you to test the full banking flow without a camera.

## Still Having Issues?

1. **Open browser Developer Tools**: Press F12
2. **Go to Console tab**
3. Look for error messages starting with `[BiometricScanner]`
4. These messages will tell you exactly what's wrong
5. Share these errors if you need help

## Environment Check

To verify your setup is correct:

```bash
# Check if Llama.cpp server is running
curl http://localhost:8080/v1/completions

# Check if dev server is running
curl http://localhost:3000
```

Both should respond without errors.
