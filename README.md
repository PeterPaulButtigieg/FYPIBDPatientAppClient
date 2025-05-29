# IBD Patient App (Expo Mobile Client)

A React Native client built with **Expo SDK 52** for tracking IBD symptoms, meals, prescriptions and appointments. Use this guide to get the app running on your machine and device.

---

## Prerequisites

1. **Node.js** v14 or later  
2. **npm** (comes with Node) or **Yarn** 
3. **Any IDE** 
3. **Expo CLI**  
   ```bash
   npm install --global expo-cli
   ```
---

### ExpoGo (SDK 52)

1. On your android device, navigate to https://expo.dev/go and select version <strong>SDK 52</strong> and install.

---

### Running the App
1. Open the root directory of the client app and navigate to **api.ts** inside the **services** folder. Change the base url of the api on line 4 to your network ip as follows:

```bash
'http://<YOURIP:5276/api'
```

2. On the same device as the server, open a command prompt and navigate to the main directory of the client app and run:
```bash
npx expo start
```
Now back on your android device, ensure that you are connected to the same network as where the api server and expo instance are running. Launch ExpoGo and scan the QR code that just showed up in the terminal of your host.

3. Demo the app using these credentials when prompted:
- **username:** user@demo.com
- **password:** 123456Pass*
