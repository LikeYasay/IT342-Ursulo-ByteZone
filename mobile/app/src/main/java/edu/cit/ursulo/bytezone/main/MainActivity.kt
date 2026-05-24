package edu.cit.ursulo.bytezone.main

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import edu.cit.ursulo.bytezone.R
import edu.cit.ursulo.bytezone.auth.AuthApiService
import edu.cit.ursulo.bytezone.auth.LoginActivity
import edu.cit.ursulo.bytezone.auth.SessionManager
import edu.cit.ursulo.bytezone.booking.BookingFragment
import edu.cit.ursulo.bytezone.dashboard.DashboardFragment
import edu.cit.ursulo.bytezone.databinding.ActivityMainBinding
import edu.cit.ursulo.bytezone.notifications.NotificationsFragment
import edu.cit.ursulo.bytezone.orders.OrdersFragment
import edu.cit.ursulo.bytezone.payments.TransactionHistoryFragment
import edu.cit.ursulo.bytezone.profile.ProfileFragment
import edu.cit.ursulo.bytezone.shared.api.RetrofitClient
import edu.cit.ursulo.bytezone.shared.utils.UiUtils
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var sessionManager: SessionManager
    private lateinit var authApi: AuthApiService

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)
        authApi = RetrofitClient.create(this, AuthApiService::class.java)

        if (!sessionManager.isLoggedIn()) {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }

        setupBottomNavigation()
        openFragment(DashboardFragment())
        validateCurrentUser()
    }

    fun openTab(menuItemId: Int) {
        binding.bottomNavigation.selectedItemId = menuItemId
    }

    fun openNotifications() {
        openFragment(NotificationsFragment())
    }

    private fun setupBottomNavigation() {
        binding.bottomNavigation.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_home -> openFragment(DashboardFragment())
                R.id.nav_booking -> openFragment(BookingFragment())
                R.id.nav_orders -> openFragment(OrdersFragment())
                R.id.nav_transactions -> openFragment(TransactionHistoryFragment())
                R.id.nav_profile -> openFragment(ProfileFragment())
            }
            true
        }
    }

    private fun openFragment(fragment: Fragment) {
        supportFragmentManager.beginTransaction()
            .replace(R.id.fragmentContainer, fragment)
            .commit()
    }

    private fun validateCurrentUser() {
        lifecycleScope.launch {
            try {
                val response = authApi.me()
                val user = response.body()?.data

                if (!response.isSuccessful || user == null) {
                    UiUtils.longToast(this@MainActivity, "Session expired. Please log in again.")
                    UiUtils.logoutToLogin(this@MainActivity, sessionManager)
                    return@launch
                }

                if (user.role != "USER") {
                    UiUtils.longToast(
                        this@MainActivity,
                        "Mobile app is for user accounts only. Please use the web admin dashboard."
                    )
                    UiUtils.logoutToLogin(this@MainActivity, sessionManager)
                    return@launch
                }

                sessionManager.saveUser(
                    fullName = user.fullName,
                    email = user.email,
                    role = user.role,
                    userId = user.id,
                    profileImageUrl = user.profileImageUrl
                )
            } catch (e: Exception) {
                UiUtils.longToast(this@MainActivity, "Unable to verify session: ${e.message}")
            }
        }
    }
}
