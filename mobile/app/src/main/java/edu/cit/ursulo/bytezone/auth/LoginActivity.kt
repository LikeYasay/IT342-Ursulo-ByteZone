package edu.cit.ursulo.bytezone.auth

import android.content.Intent
import android.os.Bundle
import android.text.InputType
import android.util.Patterns
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import edu.cit.ursulo.bytezone.R
import edu.cit.ursulo.bytezone.databinding.ActivityLoginBinding
import edu.cit.ursulo.bytezone.main.MainActivity
import edu.cit.ursulo.bytezone.shared.api.RetrofitClient
import edu.cit.ursulo.bytezone.shared.utils.ErrorUtils
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding
    private lateinit var sessionManager: SessionManager
    private lateinit var authApi: AuthApiService
    private var passwordVisible = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)
        authApi = RetrofitClient.create(this, AuthApiService::class.java)

        if (sessionManager.isLoggedIn() && sessionManager.isUserSession()) {
            startActivity(Intent(this, MainActivity::class.java))
            finish()
            return
        }

        if (sessionManager.isLoggedIn() && !sessionManager.isUserSession()) {
            sessionManager.clearSession()
        }

        binding.btnLogin.setOnClickListener { loginUser() }
        binding.tvGoToRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
        binding.btnTogglePassword.setOnClickListener { togglePasswordVisibility() }
        binding.btnGoogleLogin.setOnClickListener { startGoogleLogin() }
    }

    private fun loginUser() {
        val email = binding.etEmail.text.toString().trim()
        val password = binding.etPassword.text.toString()

        var hasError = false

        if (email.isEmpty()) {
            binding.etEmail.error = "Email is required"
            hasError = true
        } else if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            binding.etEmail.error = "Invalid email format"
            hasError = true
        }

        if (password.isEmpty()) {
            binding.etPassword.error = "Password is required"
            hasError = true
        }

        if (hasError) return

        binding.btnLogin.isEnabled = false
        binding.btnLogin.text = "Signing in..."

        lifecycleScope.launch {
            try {
                val response = authApi.login(LoginRequest(email = email, password = password))

                if (response.isSuccessful && response.body() != null) {
                    handleAuthSuccess(response.body()!!)
                } else {
                    Toast.makeText(this@LoginActivity, ErrorUtils.parseError(response), Toast.LENGTH_LONG).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@LoginActivity, ErrorUtils.CONNECTION_ERROR_MESSAGE, Toast.LENGTH_LONG).show()
            } finally {
                binding.btnLogin.isEnabled = true
                binding.btnLogin.text = "Sign in"
            }
        }
    }

    private fun handleAuthSuccess(auth: AuthResponse) {
        val user = auth.user
        val token = auth.accessToken

        if (token.isNullOrBlank() || user == null) {
            Toast.makeText(this, "Login failed. Missing session data.", Toast.LENGTH_LONG).show()
            return
        }

        if (user.role != "USER") {
            sessionManager.clearSession()
            Toast.makeText(
                this,
                "Mobile app is for user accounts only. Please use the web admin dashboard.",
                Toast.LENGTH_LONG
            ).show()
            return
        }

        sessionManager.saveSession(
            token = token,
            fullName = user.fullName.orEmpty(),
            email = user.email.orEmpty(),
            role = user.role,
            userId = user.id,
            profileImageUrl = user.profileImageUrl
        )

        Toast.makeText(this, "Login successful", Toast.LENGTH_SHORT).show()
        startActivity(Intent(this, MainActivity::class.java))
        finish()
    }

    private fun togglePasswordVisibility() {
        passwordVisible = !passwordVisible
        binding.etPassword.inputType = if (passwordVisible) {
            InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD
        } else {
            InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD
        }
        binding.btnTogglePassword.setImageResource(if (passwordVisible) R.drawable.ic_eye_off else R.drawable.ic_eye)
        binding.etPassword.setSelection(binding.etPassword.text?.length ?: 0)
    }

    private fun startGoogleLogin() {
        // Android Google login needs a Google Cloud Android OAuth client ID configured
        // with this app package (edu.cit.ursulo.bytezone) and the release/debug SHA-1.
        // Once the ID token is returned by Google Identity Services, pass it to
        // exchangeGoogleIdToken(idToken), which posts to the backend /api/auth/google
        // endpoint and stores the ByteZone JWT. Do not hardcode private secrets here.
        Toast.makeText(
            this,
            "Google login is not configured yet for Android. Please use email login for now.",
            Toast.LENGTH_LONG
        ).show()
    }

    private fun exchangeGoogleIdToken(idToken: String) {
        lifecycleScope.launch {
            try {
                val response = authApi.googleLogin(GoogleLoginRequest(idToken))
                if (response.isSuccessful && response.body() != null) {
                    handleAuthSuccess(response.body()!!)
                } else {
                    Toast.makeText(this@LoginActivity, ErrorUtils.parseError(response), Toast.LENGTH_LONG).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@LoginActivity, ErrorUtils.CONNECTION_ERROR_MESSAGE, Toast.LENGTH_LONG).show()
            }
        }
    }
}
