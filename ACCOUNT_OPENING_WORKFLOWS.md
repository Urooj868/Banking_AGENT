# 🏦 Account Opening Workflows

## Overview

There are now **TWO ways** to open an account in the Vault banking system:

1. **Option A: Full Form Workflow** - For maximum data collection
2. **Option B: Fast-Track Workflow** - Direct account creation after biometric

---

## ✅ Option A: Full Form Workflow (With Form)

This is the traditional multi-step approach that collects all details via a form.

### Flow

```
User: "I want to open an account"
          ↓
    [BIOMETRIC VERIFICATION]
    (Camera scan for identity verification)
          ↓
    [COLLECT ACCOUNT DETAILS]
    (Form: Name, ID, Account Type, Employment/Passport info)
          ↓
    [NADRA VERIFICATION]
    (Validate ID in national database)
          ↓
    [CREATE ACCOUNT]
    (Account successfully created)
```

### When to Use

- ✅ When you want to collect all details step by step
- ✅ When user hasn't provided all information yet
- ✅ When you want a guided, user-friendly experience
- ✅ Standard new account opening

### Steps

1. **Biometric Verification**
   - User scans their face
   - System confirms identity
   - Returns: Biometric match confirmed

2. **Collect Account Details**
   - Form displays with fields:
     - Full Name
     - ID Number
     - Account Type (LOCAL / NON_LOCAL)
     - Employment details (if LOCAL)
     - Passport info (if NON_LOCAL)
   - Returns: Form data

3. **NADRA Verification** ⚠️ Called ONCE
   - Uses ID from the form
   - Checks against national database
   - Verifies user doesn't already have account
   - Returns: SUCCESS/FAILURE

4. **Create Account**
   - Uses all collected data
   - Creates account
   - Returns: Account created successfully

---

## 🚀 Option B: Fast-Track Workflow (Biometric Only)

This is the new fast way to open an account using data from biometric verification.

### Flow

```
User: "I want to open an account"
          ↓
    [BIOMETRIC VERIFICATION]
    (Camera scan + extract name, ID, details)
          ↓
    [NADRA VERIFICATION]
    (Validate ID in national database)
          ↓
    [CREATE ACCOUNT]
    (Account successfully created)
          ↓
✅ ACCOUNT OPENING COMPLETE (3 steps!)
```

### When to Use

- ✅ When biometric scan includes user data (name, ID)
- ✅ When you want fastest account opening
- ✅ When user has all required documents on-site
- ✅ High-volume quick enrollments
- ✅ Mobile banking signup flows

### Steps

1. **Biometric Verification**
   - User scans their face
   - System confirms identity
   - **Returns: Biometric data + User info** (Name, ID, Details)
   - ⭐ This step now provides the account information!

2. **NADRA Verification** ⚠️ Called ONCE
   - Uses ID from biometric result
   - Checks against national database
   - Verifies user doesn't already have account
   - Returns: SUCCESS/FAILURE

3. **Create Account**
   - Uses data from biometric result
   - Creates account directly
   - Returns: Account created successfully

---

## 🔑 Key Differences

| Aspect | Option A (Form) | Option B (Fast-Track) |
|--------|-----------------|----------------------|
| **Steps** | 4 | 3 |
| **Form Required** | ✅ Yes | ❌ No |
| **Data From** | User input + form | Biometric scan |
| **Speed** | Slower | ⚡ Faster |
| **Best For** | Detailed collection | Quick enrollment |
| **NADRA Calls** | 1 | 1 |
| **Account Creation** | After form filled | After biometric data extracted |

---

## ⚠️ Critical Rules (Both Options)

### NADRA Verification - Called EXACTLY ONCE

```typescript
// ✅ CORRECT - Called once after getting ID
trigger_biometric_verification()  // Get ID
verify_with_nadra({identityCard})  // Call ONCE
create_account()                    // Create account

// ❌ WRONG - Multiple NADRA calls
verify_with_nadra()  // Call 1
verify_with_nadra()  // ❌ BLOCKED - Already called!
```

### System Prevents Duplicate NADRA Calls

The system has built-in protection:

```typescript
if (toolName === "verify_with_nadra") {
  if (this.toolsCalledThisConversation.has(toolName)) {
    console.warn(`BLOCKED: verify_with_nadra already called once`);
    continue; // Skip duplicate call
  }
}
```

### Always Wait Between Steps

```
1. Biometric call
2. ⏸️ STOP - Wait for result
3. Form/NADRA call
4. ⏸️ STOP - Wait for result
5. Account creation call
6. ⏸️ STOP - Done
```

---

## 💡 How the System Chooses

The AI agent automatically selects Option A or B based on biometric result:

```typescript
// Pseudocode logic
if (biometricResult.hasUserData) {
  // Option B: Fast-track
  call verify_with_nadra()
  call create_account()
} else {
  // Option A: Form
  call collect_account_details()
  call verify_with_nadra()
  call create_account()
}
```

---

## 📊 Example Conversations

### Option A Example
```
User: I want to open an account
AI: I'll help you open an account. Let me verify your identity first.
    [Biometric scan...]
    Great! Now I need your account details.
    [Form shows up]
    
User: [Fills form with Name: Ali, ID: 12345, Type: LOCAL]

AI: Verifying your identity in our system.
    [NADRA check...]
    Creating your account now.
    [Account created!]
```

### Option B Example
```
User: I want to open an account
AI: I'll help you open an account. Let me verify your identity first.
    [Biometric scan: Face matched! Found name: Ali, ID: 12345]
    
AI: Great! I have your details. Verifying with our system.
    [NADRA check...]
    Creating your account now.
    [Account created!]
```

---

## 🎯 Summary

| Choice | Use Case | Path |
|--------|----------|------|
| **Option A** | Traditional account opening | Biometric → Form → NADRA → Create |
| **Option B** | Fast enrollment | Biometric → NADRA → Create |

**Answer to Your Question:**
✅ **YES! Account opening CAN be called right after biometric** if the biometric result includes user data (Option B).
✅ **NO! Account opening CANNOT skip NADRA** - it must always be verified first.

---

## 🔧 Configuration

To use these workflows, no configuration needed! The system:
- ✅ Automatically detects biometric data availability
- ✅ Selects appropriate workflow
- ✅ Prevents duplicate NADRA calls
- ✅ Handles errors gracefully

Just let the user start: **"I want to open an account"**
