package edu.cit.ursulo.bytezone.auth

import android.os.Bundle
import android.text.InputType
import android.util.Log
import android.util.Patterns
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.auth.api.signin.GoogleSignInStatusCodes
import com.google.android.gms.common.api.ApiException
import edu.cit.ursulo.bytezone.R
import edu.cit.ursulo.bytezone.databinding.ActivityRegisterBinding
import edu.cit.ursulo.bytezone.main.MainActivity
import edu.cit.ursulo.bytezone.shared.api.RetrofitClient
import edu.cit.ursulo.bytezone.shared.utils.ErrorUtils
import kotlinx.coroutines.launch

class RegisterActivity : AppCompatActivity() {

    companion object {
        private const val GOOGLE_TAG = "ByteZoneGoogle"
        private const val GOOGLE_SETUP_MESSAGE =
            "Google login setup is incomplete. Please check Android OAuth client, SHA fingerprint, and Web Client ID."
    }

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
            Log.d(GOOGLE_TAG, "Google sign-in completed")
            val idToken = account.idToken
            Log.d(GOOGLE_TAG, "ID token present: ${!idToken.isNullOrBlank()}")
            if (idToken.isNullOrBlank()) {
                Toast.makeText(this, GOOGLE_SETUP_MESSAGE, Toast.LENGTH_LONG).show()
                return@registerForActivityResult
            }
            exchangeGoogleIdToken(idToken)
        } catch (e: ApiException) {
            val status = GoogleSignInStatusCodes.getStatusCodeString(e.statusCode)
            Log.w(GOOGLE_TAG, "Google sign-in failed: ApiException status/message ${e.statusCode}/$status: ${e.message}")
            Toast.makeText(this, GOOGLE_SETUP_MESSAGE, Toast.LENGTH_LONG).show()
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
                    handleEmailRegisterSuccess(response.body()!!, email, password)
                } else {
                    val message = ErrorUtils.parseError(response)
                    if (!tryLoginAfterRegister(email, password)) {
                        Toast.makeText(this@RegisterActivity, message, Toast.LENGTH_LONG).show()
                    }
                }
            } catch (e: Exception) {
                if (!tryLoginAfterRegister(email, password)) {
                    Toast.makeText(this@RegisterActivity, ErrorUtils.CONNECTION_ERROR_MESSAGE, Toast.LENGTH_LONG).show()
                }
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
        Log.d(GOOGLE_TAG, "Google button clicked")
        val clientId = getString(R.string.google_server_client_id).trim()
        Log.d(GOOGLE_TAG, "google_server_client_id loaded: ${clientId.isNotBlank()}")
        if (clientId.isBlank()) {
            Toast.makeText(this, GOOGLE_SETUP_MESSAGE, Toast.LENGTH_LONG).show()
            return
        }

        // Requires Google Cloud Android OAuth for package edu.cit.ursulo.bytezone
        // with debug/release SHA-1 and SHA-256 fingerprints. Use the Web Client ID
        // as google_server_client_id so backend /api/auth/google can verify audience.
        val options = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestEmail()
            .requestProfile()
            .requestIdToken(clientId)
            .build()
        val client = GoogleSignIn.getClient(this, options)
        Log.d(GOOGLE_TAG, "Starting Google sign-in flow")
        client.signOut().addOnCompleteListener {
            googleSignInLauncher.launch(client.signInIntent)
        }
    }

    private fun exchangeGoogleIdToken(idToken: String) {
        lifecycleScope.launch {
            try {
                Log.d(GOOGLE_TAG, "Calling backend /api/auth/google")
                val response = authApi.googleLogin(GoogleLoginRequest(idToken))
                Log.d(GOOGLE_TAG, "Backend Google login response code: ${response.code()}")
                if (response.isSuccessful && response.body() != null) {
                    Log.d(GOOGLE_TAG, "Backend Google login message: success")
                    handleGoogleAuthSuccess(response.body()!!)
                } else {
                    val message = ErrorUtils.parseError(response)
                    Log.w(GOOGLE_TAG, "Backend Google login message: $message")
                    Toast.makeText(this@RegisterActivity, message, Toast.LENGTH_LONG).show()
                }
            } catch (e: Exception) {
                Log.w(GOOGLE_TAG, "Backend Google login message: ${e.javaClass.simpleName}")
                Toast.makeText(this@RegisterActivity, ErrorUtils.CONNECTION_ERROR_MESSAGE, Toast.LENGTH_LONG).show()
            }
        }
    }

    private suspend fun tryLoginAfterRegister(email: String, password: String): Boolean {
        return try {
            val loginResponse = authApi.login(LoginRequest(email = email, password = password))
            val auth = loginResponse.body()
            if (loginResponse.isSuccessful && auth != null && !auth.accessToken.isNullOrBlank()) {
                handleAuthSuccess(auth, "Registration successful")
                true
            } else {
                false
            }
        } catch (ignored: Exception) {
            false
        }
    }

    private fun handleEmailRegisterSuccess(auth: AuthResponse, email: String, password: String) {
        if (!auth.accessToken.isNullOrBlank() && auth.user != null) {
            handleAuthSuccess(auth, "Registration successful")
            return
        }

        lifecycleScope.launch {
            if (!tryLoginAfterRegister(email, password)) {
                Toast.makeText(this@RegisterActivity, "Registration successful. Please log in.", Toast.LENGTH_LONG).show()
                finish()
            }
        }
    }

    private fun handleGoogleAuthSuccess(auth: AuthResponse) {
        handleAuthSuccess(auth, "Google login successful")
    }

    private fun handleAuthSuccess(auth: AuthResponse, successMessage: String) {
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

        Toast.makeText(this, successMessage, Toast.LENGTH_SHORT).show()
        startActivity(android.content.Intent(this, MainActivity::class.java))
        finish()
    }
}
