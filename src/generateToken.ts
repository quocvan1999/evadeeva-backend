import { google } from 'googleapis';
import * as fs from 'fs';
import * as readline from 'readline';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Đọc file credentials.json
const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));

// Destructure từ "web" thay vì "installed"
const { client_id, client_secret, redirect_uris } = credentials.web;

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0], // Redirect URI (thường là http://localhost:8080)
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Hàm lấy mã truy cập
const getAccessToken = () => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this URL:', authUrl);

  rl.question('Enter the code from that page here: ', (code) => {
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);

      oAuth2Client.setCredentials(token);
      fs.writeFileSync('token.json', JSON.stringify(token));
      console.log('Token stored to token.json');
      rl.close();
    });
  });
};

// Gọi hàm lấy mã truy cập
getAccessToken();
