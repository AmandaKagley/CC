import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';


// Validate email format (must end with @my.stchas.edu)
function validateEmail(email) {
  const emailRegex = /^[\w-]+(\.[\w-]+)*@my\.stchas\.edu$/;
  return emailRegex.test(email);
}

// Validate student status (must answer "yes")
function validateStudentStatus(answer) {
  return answer.toLowerCase() === 'yes';
}

// Validate password strength
function validatePassword(password) {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

// Function to handle sign up or sign in
function signUpOrSignIn(email, isStudent, password) {
  if (!validateEmail(email)) {
    console.error('Error: Invalid email format. Email must have the extension "@my.stchas.edu"');
    return;
  }

  if (!validateStudentStatus(isStudent)) {
    console.error('Error: Only students are allowed to sign up for this site.');
    return;
  }

  if (!validatePassword(password)) {
    console.error('Error: Password must have at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character.');
    return;
  }

  // Proceed with sign up or sign in logic
}

// ... (rest of your code for form handling, etc.)

export default defineConfig({
  plugins: [react()],
});

// After successful login, hide login/signup section and show user profile
// (Replace with your actual logic to check for login status)
if (/* Check if user is logged in */) {
  document.getElementById('login-signup-section').style.display = 'none';
  userProfileSection.style.display = 'block';
}
