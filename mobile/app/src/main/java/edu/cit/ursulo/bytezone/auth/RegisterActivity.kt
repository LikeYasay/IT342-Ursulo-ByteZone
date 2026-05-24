package edu.cit.ursulo.bytezone.auth

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
import edu.cit.ursulo.bytezone.databinding.ActivityRegisterBinding
import edu.cit.ursulo.bytezone.main.MainActivity
import edu.cit.ursulo.bytezone.shared.api.RetrofitClient
import edu.cit.ursulo.bytezone.shared.utils.ErrorUtils
import kotlinx.coroutines.launch

class RegisterActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRegisterBinding
    private lateinit var authApi: AuthApiService
    private lateinit var sessionManager: SessionManager
    private var passwordVisible = false
    private var confirmPasswordVisible = false
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
        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)

        authApi = RetrofitClient.create(this, AuthApiService::class.java)
        sessionManager = SessionManager(this)

        binding.btnRegister.setOnClickListener { registerUser() }
        binding.tvGoToLogin.setOnClickListener { finish() }
        binding.btnTogglePassword.setOnClickListener { togglePasswordVisibility() }
        binding.btnToggleConfirmPassword.setOnClickListener { toggleConfirmPasswordVisibility() }
        binding.btnGoogleRegister.setOnClickListener { startGoogleSignIn() }
    }

    private fun registerUser() {
        val fullName = binding.etFullName.text.toString().trim()
        val email = binding.etEmail.text.toString().trim()
        val password = binding.etPassword.text.toString()
        val confirmPassword = binding.etConfirmPassword.text.toString()

        var hasError = false

        if (fullName.isEmpty()) {
            binding.etFullName.error = "Full name is required"
            hasError = true
        }

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
        } else if (password.length < 8) {
            binding.etPassword.error = "Password must be at least 8 characters"
            hasError = true
        }

        if (confirmPassword.isEmpty()) {
            binding.etConfirmPassword.error = "Confirm your password"
            hasError = true
        } else if (password != confirmPassword) {
            binding.etConfirmPassword.error = "Passwords do not match"
            hasError = true
        }

        if (hasError) return

        binding.btnRegister.isEnabled = false
        binding.btnRegister.text = "Creating..."

        lifecycleScope.launch {
            try {
                val response = authApi.register(
                    RegisterRequest(fullName = fullName, email = email, password = password)
                )

                if (response.isSuccessful && response.body() != null) {
                    Toast.makeText(this@RegisterActivity, "Registration successful", Toast.LENGTH_LONG).show()
                    finish()
                } else {
                    Toast.makeText(this@RegisterActivity, ErrorUtils.parseError(response), Toast.LENGTH_LONG).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@RegisterActivity, ErrorUtils.CONNECTION_ERROR_MESSAGE, Toast.LENGTH_LONG).show()
            } finally {
                binding.btnRegister.isEnabled = true
                binding.btnRegister.text = "Create account"
            }
        }
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

    private fun toggleConfirmPasswordVisibility() {
        confirmPasswordVisible = !confirmPasswordVisible
        binding.etConfirmPassword.inputType = if (confirmPasswordVisible) {
            InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD
        } else {
            InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD
        }
        binding.btnToggleConfirmPassword.setImageResource(
            if (confirmPasswordVisible) R.drawable.ic_eye_off else R.drawable.ic_eye
        )
        binding.etConfirmPassword.setSelection(binding.etConfirmPassword.text?.length ?: 0)
    }

    private fun startGoogleSignIn() {
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
                    handleGoogleAuthSuccess(response.body()!!)
                } else {
                    Toast.makeText(this@RegisterActivity, ErrorUtils.parseError(response), Toast.LENGTH_LONG).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@RegisterActivity, ErrorUtils.CONNECTION_ERROR_MESSAGE, Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun handleGoogleAuthSuccess(auth: AuthResponse) {
        val user = auth.user
        val token = auth.accessToken

        if (token.isNullOrBlank() || user == null) {
            Toast.makeText(this, "Google login failed. Missing session data.", Toast.LENGTH_LONG).show()
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

        Toast.makeText(this, "Google login successful", Toast.LENGTH_SHORT).show()
        startActivity(android.content.Intent(this, MainActivity::class.java))
        finish()
    }
}
