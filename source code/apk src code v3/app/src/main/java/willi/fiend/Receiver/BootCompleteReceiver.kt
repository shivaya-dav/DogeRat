package willi.fiend.Receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat
import willi.fiend.MainService

class BootCompleteReceiver : BroadcastReceiver() {
    override fun onReceive(p0: Context, p1: Intent) {
        ContextCompat.startForegroundService(p0, Intent(p0, MainService::class.java))
    }
}