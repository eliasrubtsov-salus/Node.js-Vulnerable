# Vulnerable Node.js Test Application

**⚠️ WARNING: This application contains intentional security vulnerabilities for testing purposes only. DO NOT deploy to production or expose to the internet!**

## Purpose

This application is designed to test vulnerability detection and elimination agents. It contains multiple common security vulnerabilities found in real-world applications.

## Vulnerabilities Included

### 1. **Hardcoded Credentials** (CWE-798)
- **Location**: Lines 11-16, 18
- **Issue**: Database credentials and JWT secret hardcoded in source code
- **Risk**: High - Credentials exposed in version control

### 2. **SQL Injection** (CWE-89)
- **Location**: `/login` endpoint (lines 20-42)
- **Issue**: Direct string concatenation in SQL queries
- **Risk**: Critical - Allows arbitrary database access
- **Test**: `username: admin' OR '1'='1' --`

### 3. **Command Injection** (CWE-78)
- **Location**: `/ping` endpoint (lines 44-55)
- **Issue**: Unsanitized user input passed to `exec()`
- **Risk**: Critical - Allows arbitrary system commands
- **Test**: `host: "google.com; cat /etc/passwd"`

### 4. **Path Traversal** (CWE-22)
- **Location**: `/files/:filename` endpoint (lines 57-69)
- **Issue**: No validation of file path
- **Risk**: High - Access to arbitrary files
- **Test**: `filename: ../../../../etc/passwd`

### 5. **XXE (XML External Entity)** (CWE-611)
- **Location**: `/parse-xml` endpoint (lines 71-84)
- **Issue**: XML parser allows external entities
- **Risk**: High - File disclosure, SSRF, DoS

### 6. **Code Injection via eval()** (CWE-94)
- **Location**: `/calculate` endpoint (lines 86-97)
- **Issue**: Direct use of `eval()` on user input
- **Risk**: Critical - Arbitrary code execution
- **Test**: `expression: "require('child_process').execSync('whoami').toString()"`

### 7. **SSRF (Server-Side Request Forgery)** (CWE-918)
- **Location**: `/fetch-url` endpoint (lines 99-110)
- **Issue**: No URL validation before fetching
- **Risk**: High - Access to internal resources
- **Test**: `url: "http://169.254.169.254/latest/meta-data/"`

### 8. **Insecure JWT Verification** (CWE-347)
- **Location**: `/profile` endpoint (lines 112-127)
- **Issue**: Allows 'none' algorithm in JWT verification
- **Risk**: High - Authentication bypass

### 9. **NoSQL Injection** (CWE-943)
- **Location**: `/search` endpoint (lines 129-135)
- **Issue**: Unsanitized queries (example provided)
- **Risk**: High - Database manipulation

### 10. **Weak Cryptographic Hash** (CWE-916)
- **Location**: `/register` endpoint (lines 137-154)
- **Issue**: bcrypt rounds = 4 (too low, should be 10-12)
- **Risk**: Medium - Password brute-force attacks

### 11. **Information Disclosure** (CWE-209)
- **Location**: `/error-test` endpoint (lines 156-168)
- **Issue**: Exposing sensitive error details, stack traces, credentials
- **Risk**: Medium - Information leakage

### 12. **Missing Security Headers & HTTPS** (CWE-319)
- **Location**: Server configuration (lines 170-175)
- **Issue**: No HTTPS, no helmet middleware
- **Risk**: Medium - Man-in-the-middle attacks

## Dependency Vulnerabilities

The `package.json` includes outdated packages with known CVEs:

- **express 4.17.1**: Multiple CVEs
- **lodash 4.17.19**: Prototype pollution (CVE-2020-8203)
- **mongoose 5.9.10**: Multiple vulnerabilities
- **axios 0.19.2**: SSRF vulnerabilities
- **moment 2.24.0**: ReDoS vulnerabilities
- **validator 10.11.0**: Multiple issues
- **mysql 2.18.1**: SQL injection helpers missing
- **xml2js 0.4.19**: XXE vulnerabilities

## Setup

```bash
# Install dependencies (will install vulnerable versions)
npm install

# Run the application
npm start
```

## Testing Your Agent

Your vulnerability elimination agent should detect and fix:

1. **Code-level vulnerabilities**: SQL injection, command injection, path traversal, etc.
2. **Dependency vulnerabilities**: Outdated packages with known CVEs
3. **Configuration issues**: Hardcoded secrets, missing security headers
4. **Cryptographic weaknesses**: Weak hashing, insecure JWT handling

## Expected Fixes

Your agent should:

1. Replace hardcoded credentials with environment variables
2. Use parameterized queries for SQL
3. Implement input validation and sanitization
4. Add path sanitization and whitelist validation
5. Configure XML parser to disable external entities
6. Remove `eval()` and use safer alternatives
7. Implement URL validation and whitelist for SSRF protection
8. Fix JWT verification to disallow 'none' algorithm
9. Increase bcrypt rounds to 12
10. Implement proper error handling without information leakage
11. Add security headers (helmet middleware)
12. Update all dependencies to latest secure versions

## License

MIT (for testing purposes only)
