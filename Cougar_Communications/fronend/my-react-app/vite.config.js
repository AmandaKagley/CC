import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker'

function validateEmail(email) {
  const emailRegex = /^[\w-]+(\.[\w-]+)*@my\.stchas\.edu$/;
  return emailRegex.test(email);
}

function validateStudentStatus(answer) {
  return answer.toLowerCase() === 'yes';
}

function signUpOrSignIn(email, isStudent) {
  if (!validateEmail(email)) {
    console.error('Error: Invalid email format. Email must have the extension "@my.stchas.edu"');
    return;
  }

  if (!validateStudentStatus(isStudent)) {
    console.error('Error: Only students are allowed to sign up for this site.');
    return;
  }

  function validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

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

  // Example usage
  const email = 'example@my.stchas.edu';
  const isStudent = 'yes';
  const password = 'Password123!';
  signUpOrSignIn(email, isStudent, password);
  // ...
}

// Get form elements and profile section
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const userProfileSection = document.getElementById('user-profile-section');
const profilePictureInput = document.getElementById('profile-picture-input');
const profilePicture = document.getElementById('profile-picture');
const saveProfileButton = document.getElementById('save-profile');

// Handle login form submission
loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  // 1. Get user input from form fields
  const username = loginForm.username.value;
  const password = loginForm.password.value;

  // 2. Send login data to your backend (using AJAX or Fetch API)
  fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: username, password: password }),
  })
    .then(response => {
      if (response.ok) {
        // Redirect to the user profile page
        window.location.href = '/account.html'; // Replace with your actual URL
      } else {
        // Handle error (e.g., display an error message)
        console.error('Login failed');
      }
    })
    .catch(error => {
      console.error('Error during login:', error);
    });
});

// Handle signup form submission
signupForm.addEventListener('submit', (event) => {
  event.preventDefault();

  // 1. Get user input from signup form fields
  const username = signupForm.username.value;
  const email = signupForm.email.value;
  const password = signupForm.password.value;

  validateEmail(email) {
    if (!email.endsWith('@my.stchas.edu')) {
      alert("Email must end with '@my.stchas.edu'");
      return; // Prevent submission
    }

    // 3. Send signup data to your backend (using AJAX or Fetch API)
    // Example using Fetch API (replace with your backend URL)
    fetch('/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: username, email: email, password: password }),
    })
      .then(response => {
        if (response.ok) {
          // Redirect to the user profile page
          window.location.href = '/account.html'; // Replace with your actual URL
        } else {
          // Handle error (e.g., display an error message)
          console.error('Signup failed');
        }
      })
      .catch(error => {
        console.error('Error during signup:', error);
      });
  });

// Handle profile picture change
profilePictureInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    profilePicture.src = e.target.result;
  };

  reader.readAsDataURL(file);
});

// Handle profile saving
saveProfileButton.addEventListener('click', () => {
  // 1. Get user input from the profile form
  const bio = document.getElementById('bio').value;
  const classes = document.getElementById('classes').value;

  // 2. Send profile data to your backend (using AJAX or Fetch API)
  // Example using Fetch API (replace with your backend URL)
  fetch('/update-profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bio: bio, classes: classes }),
  })
    .then(response => {
      if (response.ok) {
        console.log('Profile saved successfully');
        // You might want to display a success message
      } else {
        console.error('Profile update failed');
        // Handle error (e.g., display an error message)
      }
    })
    .catch(error => {
      console.error('Error during profile update:', error);
    });
});

// After successful login, hide login/signup section and show user profile
if (/* Check if user is logged in */) { // Add your logic for checking if a user is logged in
  document.getElementById('login-signup-section').style.display = 'none';
  userProfileSection.style.display = 'block';
}
