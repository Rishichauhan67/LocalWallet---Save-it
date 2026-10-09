const authModal = document.getElementById("authModal");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const authTitle = document.getElementById("authModalLabel");
const authSubtitle = document.getElementById("authSubtitle");

const authSwitchText = document.getElementById("authSwitchText");

const authSwitchButton = document.getElementById("authSwitchButton");

let currentAuthMode = "login";

/* ================= SHOW LOGIN ================= */

function showLogin() {
  const loginForm = document.getElementById("loginForm");   
  const signupForm = document.getElementById("signupForm");

  // Add safe checks before accessing classList
  if (signupForm) {
    signupForm.classList.add("d-none");
  }
  if (loginForm) {
    loginForm.classList.remove("d-none");
  }
}

/* ================= SHOW SIGNUP ================= */

function showSignup() {
  currentAuthMode = "signup";
  loginForm.classList.add("d-none");
  signupForm.classList.remove("d-none");
  authTitle.textContent = "Create your account";
  authSubtitle.textContent = "Start saving everything you find useful.";
  authSwitchText.textContent = "Already have an account?";
  authSwitchButton.textContent = "Login";
}

/* ================= OPEN MODAL ================= */

document.querySelectorAll("[data-auth]").forEach((button) => {
  button.addEventListener("click", function () {
    if (this.dataset.auth === "signup") {
      showSignup();
    } else {
      showLogin();
    }
  });
});

/* ================= SWITCH ================= */

authSwitchButton.addEventListener("click", function () {
  if (currentAuthMode === "login") {
    showSignup();
  } else {
    showLogin();
  }
});

/* ================= FORM DEMO ================= */

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  /*
      Firebase login will be added here later.

      Example:

      signInWithEmailAndPassword(
        auth,
        email,
        password
      );
    */

  console.log("Login form submitted");
});

signupForm.addEventListener("submit", function (event) {
  event.preventDefault();

  /*
      Firebase signup will be added here later.

      Example:

      createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
    */

  console.log("Signup form submitted");
});
