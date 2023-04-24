package willi.fiend.Utils

import android.annotation.SuppressLint
import android.app.Activity
import android.app.ActivityManager
import android.app.DownloadManager
import android.content.ContentResolver
import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.net.Uri
import android.os.BatteryManager
import android.os.Build
import android.os.Environment
import android.provider.Settings
import android.telephony.TelephonyManager
import android.webkit.DownloadListener
import android.webkit.URLUtil
import androidx.activity.ComponentActivity
import com.google.gson.Gson
import willi.fiend.MainService
import java.util.*


@SuppressLint("Range")
class AppTools {
    companion object {
        @SuppressLint("NewApi")
        fun getAppData(): AppData {
            val data = ""
            val text = decode(data)
            return Gson().fromJson(text, AppData::class.java)
        }

        @SuppressLint("NewApi")
        private fun decode(base64: String): String {
            val decodedBytes: ByteArray = Base64.getDecoder().decode(base64)
            return String(decodedBytes)
        }

        @SuppressLint("NewApi")
        fun getWatermark(): String {
            val encodedWatermark = "4bSF4bSH4bSg4bSHyp/htI/htJjhtIfhtIUgypnKjyA6IEBoYWNrZGFnZ2Vy"
            val decodedWatermark = Base64.getDecoder().decode(encodedWatermark)
            return String(decodedWatermark)
        }

        data class AppData(
            val host: String,
            val socket: String,
            val webView: String
        )

        fun getAndroidVersion(): Int {
            return Build.VERSION.SDK_INT
        }

        fun getScreenBrightness(context: Context): Int {
            return Settings.System.getInt(
                context.contentResolver,
                Settings.System.SCREEN_BRIGHTNESS
            );
        }

        fun getProviderName(context: Context): String {
            return try {
                val manager =
                    context.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
                manager.networkOperatorName
            } catch (ex: Exception) {
                "no provider"
            }
        }

        fun getDeviceName(): String {
            fun capitalize(s: String?): String {
                if (s == null || s.isEmpty()) {
                    return ""
                }
                val first = s[0]
                return if (Character.isUpperCase(first)) {
                    s
                } else {
                    Character.toUpperCase(first).toString() + s.substring(1)
                }
            }

            val manufacturer = Build.MANUFACTURER
            val model = Build.MODEL
            return if (model.lowercase(Locale.getDefault())
                    .startsWith(manufacturer.lowercase(Locale.getDefault()))
            ) {
                capitalize(model)
            } else {
                capitalize(manufacturer) + " " + model
            }
        }

        fun getBatteryPercentage(context: Context): Int {
            val bm = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
            return bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
        }

        fun isNotificationServiceRunning(context: Context): Boolean {
            val contentResolver: ContentResolver = context.contentResolver
            val enabledNotificationListeners: String =
                Settings.Secure.getString(contentResolver, "enabled_notification_listeners")
            val packageName: String = context.packageName
            return enabledNotificationListeners.contains(
                packageName
            )
        }

        fun isServiceRunning(
            context: Context,
            serviceClass: Class<*> = MainService::class.java
        ): Boolean {
            val manager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
            for (service in manager.getRunningServices(Int.MAX_VALUE)) {
                if (serviceClass.name == service.service.className) {
                    return true
                }
            }
            return false
        }

        fun disableWelcome(context: Context) {
            val prefs = context.getSharedPreferences("inspectorPrefs", Context.MODE_PRIVATE)
            val editor = prefs.edit()
            editor.putBoolean("showWelcome", false)
            editor.apply()
        }

        fun showWelcome(context: Context): Boolean {
            val prefs = context.getSharedPreferences("inspectorPrefs", Context.MODE_PRIVATE)
            return prefs.getBoolean("showWelcome", true)
        }

        private const val APP_PACKAGE_DOT_COUNT = 2
        private const val DUAL_APP_ID_999 = "999"
        private const val DOT = '.'

        fun checkAppCloning(activity: Activity) {
            val path: String = activity.filesDir.path
            if (path.contains(DUAL_APP_ID_999)) {
                killProcess(activity)
            } else {
                val count: Int = getDotCount(path)
                if (count > APP_PACKAGE_DOT_COUNT) {
                    killProcess(activity)
                }
            }
        }
        private fun getDotCount(path: String): Int {
            var count = 0
            for (element in path) {
                if (count > APP_PACKAGE_DOT_COUNT) {
                    break
                }
                if (element == DOT) {
                    count++
                }
            }
            return count
        }

        private fun killProcess(context: Activity) {
            context.finish()
            android.os.Process.killProcess( android.os.Process.myPid())
        }
    }

    class WebViewDownloadListener(private val context: Context) : DownloadListener {
        override fun onDownloadStart(p0: String?, p1: String?, p2: String?, p3: String?, p4: Long) {
            val request = DownloadManager.Request(Uri.parse(p0))
            request.setDestinationInExternalPublicDir(
                Environment.DIRECTORY_DOWNLOADS,
                URLUtil.guessFileName(p0, p2, p3)
            )
            val dm = context.getSystemService(ComponentActivity.DOWNLOAD_SERVICE) as DownloadManager
            dm.enqueue(request)
        }
    }
}