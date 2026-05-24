package edu.cit.ursulo.bytezone.auth

import android.os.Bundle
import android.text.InputType
import android.util.Patterns
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import edu.cit.ursulo.bytezone.R
import edu.cit.ursulo.bytezone.databinding.ActivityRegisterBinding
import edu.cit.ursulo.bytezone.shared.api.RetrofitClient
import edu.cit.ursulo.bytezone.shared.utils.ErrorUtils
import kotlinx.coroutines.launch

class RegisterActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRegisterBinding
    private lateinit var authApi: AuthApiService
    private var passwordVisible = false
    private var confirmPasswordVisible = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)

        authApi = RetrofitClient.create(this, AuthApiService::class.java)

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
        // Android Google login needs a Google Cloud Android OAuth client ID configured
        // with this app package (edu.cit.ursulo.bytezone) and the release/debug SHA-1.
        // Once Google Identity Services returns an ID token, send it through
        // AuthApiService.googleLogin to exchange it at backend /api/auth/google.
        // Do not hardcode private client secrets in the Android app.
        Toast.makeText(
            this,
            "Google login is not configured yet for Android. Please use email login for now.",
            Toast.LENGTH_LONG
        ).show()
    }
}
