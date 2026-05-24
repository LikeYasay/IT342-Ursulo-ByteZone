package edu.cit.ursulo.bytezone.auth

import android.content.Intent
import android.os.Bundle
import android.text.InputType
import android.util.Patterns
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
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
    private val googleSignInLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
        try {
            val account = task.getResult(ApiException::class.java)
            val idToken = account.idToken
            if (idToken.isNullOrBlank()) {
                Toast.makeText(this, "Google login did not return an ID token.", Toast.LENGTH_LONG).show()
                return@registerForActivityResult
            }
            exchangeGoogleIdToken(idToken)
        } catch (e: ApiException) {
            Toast.makeText(this, "Google login was cancelled or unavailable.", Toast.LENGTH_LONG).show()
        }
    }

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
        val clientId = getString(R.string.google_server_client_id).trim()
        if (clientId.isBlank()) {
            // Google login needs an OAuth client ID that the backend accepts, plus the
            // Android package name (edu.cit.ursulo.bytezone) and debug/release SHA-1
            // registered in Google Cloud. The returned ID token is exchanged through
            // backend /api/auth/google; never hardcode private secrets in the app.
            Toast.makeText(
                this,
                "Google login is not configured yet for Android. Please use email login for now.",
                Toast.LENGTH_LONG
            ).show()
            return
        }

        val options = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestEmail()
            .requestIdToken(clientId)
            .build()
        val client = GoogleSignIn.getClient(this, options)
        googleSignInLauncher.launch(client.signInIntent)
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
