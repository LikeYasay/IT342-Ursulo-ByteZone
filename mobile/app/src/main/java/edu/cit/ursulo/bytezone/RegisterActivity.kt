package edu.cit.ursulo.bytezone

import android.os.Bundle
import android.util.Patterns
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import edu.cit.ursulo.bytezone.databinding.ActivityRegisterBinding
import edu.cit.ursulo.bytezone.RegisterRequest
import edu.cit.ursulo.bytezone.RetrofitClient
import edu.cit.ursulo.bytezone.ErrorUtils
import kotlinx.coroutines.launch

class RegisterActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRegisterBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnRegister.setOnClickListener {
            registerUser()
        }

        binding.tvGoToLogin.setOnClickListener {
            finish()
        }
    }

    private fun registerUser() {
        val fullName = binding.etFullName.text.toString().trim()
        val email = binding.etEmail.text.toString().trim()
        val password = binding.etPassword.text.toString().trim()
        val confirmPassword = binding.etConfirmPassword.text.toString().trim()

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
                val response = RetrofitClient.api.register(
                    RegisterRequest(
                        fullName = fullName,
                        email = email,
                        password = password
                    )
                )

                if (response.isSuccessful && response.body() != null) {
                    Toast.makeText(
                        this@RegisterActivity,
                        "Registration successful",
                        Toast.LENGTH_LONG
                    ).show()
                    finish()
                } else {
                    Toast.makeText(
                        this@RegisterActivity,
                        ErrorUtils.parseError(response),
                        Toast.LENGTH_LONG
                    ).show()
                }
            } catch (e: Exception) {
                Toast.makeText(
                    this@RegisterActivity,
                    "Connection error: ${e.message}",
                    Toast.LENGTH_LONG
                ).show()
            } finally {
                binding.btnRegister.isEnabled = true
                binding.btnRegister.text = "Create Account"
            }
        }
    }
}