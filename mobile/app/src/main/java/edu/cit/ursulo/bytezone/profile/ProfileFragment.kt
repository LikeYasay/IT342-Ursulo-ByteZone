package edu.cit.ursulo.bytezone.profile

import android.net.Uri
import android.os.Bundle
import android.text.InputType
import android.util.Patterns
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.MimeTypeMap
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import edu.cit.ursulo.bytezone.R
import edu.cit.ursulo.bytezone.auth.ProfileUpdateRequest
import edu.cit.ursulo.bytezone.auth.SessionManager
import edu.cit.ursulo.bytezone.databinding.FragmentProfileBinding
import edu.cit.ursulo.bytezone.shared.api.RetrofitClient
import edu.cit.ursulo.bytezone.shared.api.UserDto
import edu.cit.ursulo.bytezone.shared.utils.ErrorUtils
import edu.cit.ursulo.bytezone.shared.utils.ImageLoader
import edu.cit.ursulo.bytezone.shared.utils.UiUtils
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File
import java.io.FileOutputStream

class ProfileFragment : Fragment() {

    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!

    private lateinit var api: ProfileApiService
    private lateinit var sessionManager: SessionManager
    private var currentUser: UserDto? = null
    private var passwordVisible = false

    private val pickImageLauncher = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri != null) uploadProfileImage(uri)
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        api = RetrofitClient.create(requireContext(), ProfileApiService::class.java)
        sessionManager = SessionManager(requireContext())

        binding.btnSaveProfile.setOnClickListener { saveProfile() }
        binding.btnLogout.setOnClickListener {
            UiUtils.logoutToLogin(requireActivity(), sessionManager)
        }
        binding.btnPickProfileImage.setOnClickListener {
            pickImageLauncher.launch("image/*")
        }
        binding.btnRemoveProfileImage.setOnClickListener {
            removeProfileImage()
        }
        binding.btnTogglePassword.setOnClickListener {
            togglePasswordVisibility()
        }

        loadProfile()
    }

    override fun onDestroyView() {
        _binding = null
        super.onDestroyView()
    }

    private fun loadProfile() {
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val response = api.me()
                val user = response.body()?.data
                if (response.isSuccessful && user != null) {
                    currentUser = user
                    bindUser(user)
                } else {
                    UiUtils.longToast(requireActivity(), UiUtils.errorFrom(response))
                }
            } catch (e: Exception) {
                UiUtils.longToast(requireActivity(), ErrorUtils.CONNECTION_ERROR_MESSAGE)
            }
        }
    }

    private fun bindUser(user: UserDto) {
        binding.etFullName.setText(user.fullName.orEmpty())
        binding.etEmail.setText(user.email.orEmpty())
        binding.etPassword.setText("")
        val name = user.fullName.orEmpty().ifBlank { "User" }
        binding.tvProfileInitial.text = name.first().uppercaseChar().toString()
        sessionManager.saveUser(user.fullName, user.email, user.role, user.id, user.profileImageUrl)

        if (!user.profileImageUrl.isNullOrBlank()) {
            binding.ivProfileImage.visibility = View.VISIBLE
            binding.tvProfileInitial.visibility = View.GONE
            binding.btnRemoveProfileImage.visibility = View.VISIBLE
            viewLifecycleOwner.lifecycleScope.launch {
                ImageLoader.load(binding.ivProfileImage, user.profileImageUrl)
            }
        } else {
            binding.ivProfileImage.setImageDrawable(null)
            binding.ivProfileImage.visibility = View.GONE
            binding.tvProfileInitial.visibility = View.VISIBLE
            binding.btnRemoveProfileImage.visibility = View.GONE
        }
    }

    private fun saveProfile() {
        val fullName = binding.etFullName.text.toString().trim()
        val email = binding.etEmail.text.toString().trim()
        val password = binding.etPassword.text.toString()

        if (fullName.isBlank()) {
            binding.etFullName.error = "Full name is required"
            return
        }
        if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            binding.etEmail.error = "Invalid email"
            return
        }
        if (password.isNotBlank() && password.length < 8) {
            binding.etPassword.error = "Password must be at least 8 characters"
            return
        }

        binding.btnSaveProfile.isEnabled = false
        binding.btnSaveProfile.text = "Saving..."

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val response = api.updateProfile(
                    ProfileUpdateRequest(
                        fullName = fullName,
                        email = email,
                        password = password.ifBlank { null }
                    )
                )
                val user = response.body()?.data
                if (response.isSuccessful && user != null) {
                    currentUser = user
                    bindUser(user)
                    UiUtils.toast(requireActivity(), "Profile updated")
                } else {
                    UiUtils.longToast(requireActivity(), UiUtils.errorFrom(response))
                }
            } catch (e: Exception) {
                UiUtils.longToast(requireActivity(), ErrorUtils.CONNECTION_ERROR_MESSAGE)
            } finally {
                binding.btnSaveProfile.isEnabled = true
                binding.btnSaveProfile.text = "Update Profile"
            }
        }
    }

    private fun uploadProfileImage(uri: Uri) {
        binding.btnPickProfileImage.isEnabled = false
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                binding.ivProfileImage.setImageURI(uri)
                binding.ivProfileImage.visibility = View.VISIBLE
                binding.tvProfileInitial.visibility = View.GONE

                val file = copyUriToCache(uri)
                val mimeType = requireContext().contentResolver.getType(uri) ?: "image/*"
                val requestBody = file.asRequestBody(mimeType.toMediaTypeOrNull())
                val part = MultipartBody.Part.createFormData("file", file.name, requestBody)
                val response = api.uploadProfileImage(part)
                val user = response.body()?.data

                if (response.isSuccessful && user != null) {
                    currentUser = user
                    bindUser(user)
                    UiUtils.toast(requireActivity(), "Profile picture updated")
                } else {
                    UiUtils.longToast(requireActivity(), UiUtils.errorFrom(response))
                    bindUser(currentUser ?: return@launch)
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), ErrorUtils.CONNECTION_ERROR_MESSAGE, Toast.LENGTH_LONG).show()
                currentUser?.let { bindUser(it) }
            } finally {
                binding.btnPickProfileImage.isEnabled = true
            }
        }
    }

    private fun removeProfileImage() {
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val response = api.updateProfile(ProfileUpdateRequest(removeProfileImage = true))
                val user = response.body()?.data
                if (response.isSuccessful && user != null) {
                    currentUser = user
                    bindUser(user)
                    UiUtils.toast(requireActivity(), "Profile picture removed")
                } else {
                    UiUtils.longToast(requireActivity(), UiUtils.errorFrom(response))
                }
            } catch (e: Exception) {
                UiUtils.longToast(requireActivity(), ErrorUtils.CONNECTION_ERROR_MESSAGE)
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

    private fun copyUriToCache(uri: Uri): File {
        val extension = MimeTypeMap.getSingleton()
            .getExtensionFromMimeType(requireContext().contentResolver.getType(uri))
            ?: "jpg"
        val file = File(requireContext().cacheDir, "profile-upload-${System.currentTimeMillis()}.$extension")
        requireContext().contentResolver.openInputStream(uri).use { input ->
            FileOutputStream(file).use { output ->
                input?.copyTo(output)
            }
        }
        return file
    }
}
