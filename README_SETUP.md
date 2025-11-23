# Krish Homestay - Google Sheets Backend Setup

This project now uses **Google Sheets** as the database, **Google Calendar** for scheduling, and **Stripe** for payments.

## 1. Google Cloud Setup (Sheets & Calendar)

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project (e.g., "Krish Homestay").
3.  **Enable APIs**:
    *   Search for "Google Sheets API" and enable it.
    *   Search for "Google Calendar API" and enable it.
4.  **Create Service Account**:
    *   Go to "IAM & Admin" > "Service Accounts".
    *   Create a new Service Account.
    *   Go to the "Keys" tab and create a new JSON key.
    *   **Download this JSON file** and save it as `service-account.json` in the `server` folder.
    *   **IMPORTANT**: Copy the Service Account email address (e.g., `krish-homestay@...iam.gserviceaccount.com`).

## 2. Google Sheet Setup

1.  Create a new Google Sheet at [sheets.google.com](https://sheets.google.com).
2.  Name the sheet "Krish Homestay Bookings".
3.  Rename the first tab (at the bottom) to `Bookings`.
4.  Add the following headers in the first row:
    *   A1: `ID`
    *   B1: `Guest Name`
    *   C1: `Email`
    *   D1: `Phone`
    *   E1: `Check In`
    *   F1: `Check Out`
    *   G1: `Guests`
    *   H1: `Status`
    *   I1: `Total Amount`
5.  **Share the Sheet**: Click "Share" and paste the **Service Account email** you copied earlier. Give it "Editor" access.
6.  **Get Spreadsheet ID**: Look at the URL of your sheet. It looks like `https://docs.google.com/spreadsheets/d/LONG_ID_STRING/edit`. Copy that `LONG_ID_STRING`.

## 3. Google Calendar Setup

1.  Go to [calendar.google.com](https://calendar.google.com).
2.  Go to "Settings and sharing" for the calendar you want to use (e.g., your primary one).
3.  Under "Share with specific people", add the **Service Account email** and give it "Make changes to events" permission.

## 4. Stripe Setup

1.  Go to [dashboard.stripe.com](https://dashboard.stripe.com) and sign up/login.
2.  Get your **Publishable Key** and **Secret Key** from the "Developers" > "API keys" section.

## 5. Environment Configuration

1.  In the `server` folder, copy `.env.example` to `.env`.
2.  Fill in the details:
    ```env
    SPREADSHEET_ID=your_spreadsheet_id_from_step_2
    GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
    EMAIL_USER=krishhomestays@gmail.com
    EMAIL_PASS=your_app_password
    STRIPE_SECRET_KEY=your_stripe_secret_key
    PORT=5000
    ```
3.  In `client/src/components/BookingForm.jsx`, find `loadStripe('pk_test_...')` and replace the key with your **Stripe Publishable Key**.

## 6. Run the Project

1.  **Server**:
    ```bash
    cd server
    npm install
    npm start
    ```
2.  **Client**:
    ```bash
    cd client
    npm install
    npm run dev
    ```

## 7. Deployment

1.  **Backend**: Deploy the `server` folder to a Node.js host (e.g., Render, Railway, Heroku).
    *   Ensure you upload `service-account.json` or set its content as an environment variable (requires code adjustment to read from string).
2.  **Frontend**: Deploy the `client` folder to Vercel or Netlify.
    *   Update the API URL in the frontend code to point to your deployed backend URL instead of `localhost:5000`.
