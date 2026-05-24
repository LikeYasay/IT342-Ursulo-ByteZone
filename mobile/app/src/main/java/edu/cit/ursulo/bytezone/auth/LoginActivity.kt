package edu.cit.ursulo.bytezone.auth

import android.content.Intent
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
import edu.cit.ursulo.bytezone.databinding.ActivityLoginBinding
import edu.cit.ursulo.bytezone.main.MainActivity
import edu.cit.ursulo.bytezone.shared.api.RetrofitClient
import edu.cit.ursulo.bytezone.shared.utils.ErrorUtils
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {

    companion object {
        private const val GOOGLE_TAG = "ByteZoneGoogle"
        private const val GOOGLE_SETUP_MESSAGE =
            "Google login setup is incomplete. Please check Android OAuth client, SHA fingerprint, and Web Client ID."
    }

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
                    handleAuthSuccess(response.body()!!)
                } else {
                    val message = ErrorUtils.parseError(response)
                    Log.w(GOOGLE_TAG, "Backend Google login message: $message")
                    Toast.makeText(this@LoginActivity, message, Toast.LENGTH_LONG).show()
                }
            } catch (e: Exception) {
                Log.w(GOOGLE_TAG, "Backend Google login message: ${e.javaClass.simpleName}")
                Toast.makeText(this@LoginActivity, ErrorUtils.CONNECTION_ERROR_MESSAGE, Toast.LENGTH_LONG).show()
            }
        }
    }
}
