const { google } = require('googleapis');
require('dotenv').config();

// Authentication
const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

async function getBookings() {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Bookings!A:H', // Assuming columns: ID, Name, Email, Phone, CheckIn, CheckOut, Guests, Status
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return [];
        }

        // Convert rows to objects (skipping header)
        const bookings = rows.slice(1).map((row, index) => ({
            id: row[0],
            guest_name: row[1],
            email: row[2],
            phone: row[3],
            check_in_date: row[4],
            check_out_date: row[5],
            guests_count: parseInt(row[6]),
            status: row[7],
            total_amount: row[8]
        }));

        return bookings;
    } catch (error) {
        console.error('Error fetching bookings from Sheets:', error);
        return [];
    }
}

async function addBooking(booking) {
    try {
        const values = [
            [
                Date.now().toString(), // Simple ID
                booking.guest_name,
                booking.email,
                booking.phone,
                booking.check_in_date,
                booking.check_out_date,
                booking.guests_count,
                'confirmed', // Status
                booking.total_amount
            ],
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Bookings!A:I',
            valueInputOption: 'USER_ENTERED',
            resource: { values },
        });

        return { ...booking, status: 'confirmed' };
    } catch (error) {
        console.error('Error adding booking to Sheets:', error);
        throw error;
    }
}

module.exports = { getBookings, addBooking };
