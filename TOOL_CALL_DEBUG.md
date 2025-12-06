# Tool Call Debugging Guide

## Current Issue

The AI is NOT calling `collect_account_details` tool after biometric verification. It's just talking about it instead of executing it.

## What's Happening

1. ✅ Biometric verification completes successfully
2. ❌ Model returns text about collecting details instead of calling the tool
3. ❌ `collect_account_details` tool is never triggered
4. ❌ Account form never appears

## How to Debug

### Step 1: Open Browser Console

1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. Keep this open while testing

### Step 2: Look for Tool Call Logs

The app will now log:

- `[GemmaService] Initialized with Llama.cpp proxy at /api/llama`
- `[GemmaService] Model response: <response text>`
- `[GemmaService] Parsed tool call: <tool_name>` (if tool detected)
- `[GemmaService] Tool Call: <tool_name>` (when tool is executed)

### Step 3: Check What Format Model is Using

Copy the model response and look for:

- `[TOOL_CALL: collect_account_details({})]` - Format 1 (expected)
- `<tool_call>collect_account_details({})</tool_call>` - Format 2
- `{{collect_account_details}}({})` - Format 3
- `` `collect_account_details({})` `` - Format 4

If you see ANY of these formats, the tool should be detected.

If you see text like:

```
"Please fill out the form..."
"**Your task:** Proceed to collect account details."
```

But NO tool call, that's the problem.

## The Fix Applied

### 1. Enhanced System Instruction

- Added explicit tool call format examples
- Added "ALWAYS call tools when appropriate" rule

### 2. Multiple Format Support

The service now recognizes multiple tool call formats:

- `[TOOL_CALL: name({})]`
- `<tool_call>name({})</tool_call>`
- `{{name}}({})`
- `` `name({})` ``

### 3. Better Logging

Console now shows:

- Model responses in full
- Number of tool calls detected
- Tool parameters parsed

## Testing the Fix

1. **Refresh browser** (Ctrl+Shift+R)
2. **Open Console** (F12)
3. **Type message**: "Hey, I want to create a bank account"
4. **Wait for biometric** (use Demo Mode if no camera)
5. **Check console** for tool call logs

Expected sequence:

```
[GemmaService] Model response: "Now I need to collect your account details..."
[GemmaService] Found 1 tool calls in response
[GemmaService] Parsed tool call: collect_account_details {}
[GemmaService] Tool Call: collect_account_details {}
```

## If Still Not Working

The issue might be that Gemma 2 2B model is too small. Try:

1. **Check model size** in Llama.cpp:

```bash
ps aux | grep llama
```

2. **If using 2B model**, try upgrading to:

   - `gemma-2-9b-it` (9 billion parameters - better)
   - `llama-2-13b` (13 billion - even better)

3. **Larger models follow instructions better** and understand tool calling patterns.

## Workaround for Testing

If Gemma doesn't call tools, you can:

1. Manually edit the chat to type the action
2. Or add a "Next Step" button in the UI
3. Or use function calling with specific prompt engineering

## Files Modified

- `services/gemmaService.ts` - Enhanced tool parsing and system prompt
