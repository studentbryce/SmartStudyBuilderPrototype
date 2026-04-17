const loginForm = document.getElementById('login-form');
const studentIdInput = document.getElementById('student-id');
const passwordInput = document.getElementById('password');
const togglePasswordButton = document.getElementById('toggle-password');
const loginButton = document.getElementById('login-button');
const formMessage = document.getElementById('form-message');

function showMessage(message, isSuccess = false) {
    formMessage.textContent = message;
    formMessage.classList.toggle('success', isSuccess);
}

togglePasswordButton.addEventListener('click', function () {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePasswordButton.textContent = isPassword ? 'Hide' : 'Show';
    togglePasswordButton.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
});

loginForm.addEventListener('submit', function (event) {
    event.preventDefault();
    showMessage('');

    loginButton.disabled = true;
    loginButton.textContent = 'Signing In...';
    showMessage('Login successful. Redirecting to Hub...', true);

    setTimeout(function () {
        sessionStorage.setItem('hubLoggedIn', 'true');
        window.location.href = 'hub.html';
    }, 900);
});
