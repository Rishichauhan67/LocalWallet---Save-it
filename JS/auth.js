import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ================= 1. FIREBASE CONFIG ================= //
const firebaseConfig = {
  apiKey: "AIzaSyCLcsIXF1gTG4VzfCL6UjPzSE15XCRM-KI",
  authDomain: "saveanything-storage.firebaseapp.com",
  projectId: "saveanything-storage",
  storageBucket: "saveanything-storage.firebasestorage.app",
  messagingSenderId: "203505194678",
  appId: "1:203505194678:web:f423fa8e883afa29b0b817"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ================= 2. DOM REFERENCES ================= //
const form = document.getElementById("passwordlessForm");
const emailInput = document.getElementById("loginEmail");
const sendBtn = document.getElementById("sendLinkBtn");
const statusMsg = document.getElementById("authStatusMessage");
const authModalEl = document.getElementById("authModal");

function showMessage(text, isError = false) {
  if (!statusMsg) return;
  statusMsg.textContent = text;
  statusMsg.className = isError
    ? "mt-3 text-center small text-danger"
    : "mt-3 text-center small text-success";
  statusMsg.classList.remove("d-none");
}

// Redirect URL configuration (redirects back to the current clean URL)
const actionCodeSettings = {
  url: window.location.origin + window.location.pathname,
  handleCodeInApp: true
};

// ================= 3. SEND SIGN-IN LINK ================= //
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    if (!email) {
      showMessage("Please enter your email address.", true);
      return;
    }

    sendBtn.disabled = true;
    sendBtn.textContent = "Sending link...";
    if (statusMsg) statusMsg.classList.add("d-none");

    try {
      // Send magic link to user email
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);

      // Save email locally to complete login when clicking the link
      window.localStorage.setItem("emailForSignIn", email);

      showMessage("Link sent! Please check your email inbox to log in.");
      form.reset();
    } catch (error) {
      console.error("Firebase send link error:", error);
      if (error.code === "auth/unauthorized-domain") {
        showMessage("Domain/IP not authorized in Firebase Console Settings.", true);
      } else {
        showMessage(error.message, true);
      }
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = "Send Login Link";
    }
  });
}

// ================= 4. VERIFY LINK ON PAGE LOAD ================= //
async function checkEmailSignIn() {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem("emailForSignIn");

    // Fallback: If link was opened on another device/browser
    if (!email) {
      email = window.prompt("Please confirm your email address to complete sign-in:");
    }

    if (email) {
      try {
        const result = await signInWithEmailLink(auth, email, window.location.href);

        window.localStorage.removeItem("emailForSignIn");

        // Clean query tokens from address bar without reloading
        window.history.replaceState({}, document.title, window.location.pathname);

        // Hide modal if open
        if (authModalEl && window.bootstrap) {
          const modalInstance = bootstrap.Modal.getInstance(authModalEl);
          if (modalInstance) modalInstance.hide();
        }

        alert(`Signed in successfully as ${result.user.email}!`);
      } catch (err) {
        console.error("Link verification failed:", err);
        alert(`Authentication failed: ${err.message}`);
      }
    }
  }
}

// Run verification check on page load
checkEmailSignIn();

// ================= 5. SESSION OBSERVER ================= //
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Logged in:", user.email, "UID:", user.uid);
  } else {
    console.log("No active user session.");
  }
});