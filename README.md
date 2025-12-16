# How to Host BettrScore Website

## Quick Start (Local)

1. **Open Terminal** in this folder (`website`).
2. **Run Python Server**:
   ```powershell
   python -m http.server 8000
   ```
   (Or if you have Node.js: `npx serve`)
3. **View Site**: Open [http://localhost:8000](http://localhost:8000) in your
   browser.

## Host for Free (Global Access via ngrok)

To share this site with others for free:

1. **Download ngrok**: [https://ngrok.com/download](https://ngrok.com/download)
2. **Start your local server** (Step 2 above) on port 8000.
3. **Open a NEW terminal** window.
4. **Run ngrok**:
   ```powershell
   ngrok http 8000
   ```
5. **Copy the Link**: ngrok will give you a URL like
   `https://a1b2-c3d4.ngrok-free.app`. Share this link!

> Note: The free version of ngrok generates a new URL every time you restart it.

## Alternative Free Hosting (No Install Required)

If `ngrok` is giving you trouble, try these alternatives:

### Option 1: Serveo (Easiest)

Uses SSH, which is built into Windows.

1. **Open Terminal**.
2. Run:
   ```powershell
   ssh -R 80:localhost:8000 serveo.net
   ```
3. It will print a URL like `https://rad-random-name.serveo.net`.

### Option 2: LocalTunnel (Requires Node.js)

If you have `npm` installed:

1. Run:
   ```powershell
   npx localtunnel --port 8000
   ```
2. It will give you a public URL.
