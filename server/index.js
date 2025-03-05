const express = require('express');
const cors = require('cors');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const db = require('./db');

const app = express();
const port = 5500;

app.use(cors({ origin: '*' }));  // Cho phép tất cả nguồn gọi API
app.use(express.json());

app.use(employeeRoutes);
app.use(attendanceRoutes);

// Phục vụ file tĩnh từ thư mục "public"
app.use(express.static('public')); // Phục vụ trang web

// Trang chủ
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// 📌 Biến lưu trạng thái WiFi (giả lập ban đầu là false)
let wifiStatus = { connected: false, lastUpdate: null };

// 📌 API cập nhật trạng thái WiFi từ ESP32-S3
app.post('/wifi-status', async (req, res) => {
    const { connected } = req.body;
    wifiStatus.connected = connected;
    wifiStatus.lastUpdate = new Date();

    console.log(`WiFi Status Updated: ${connected ? 'Connected ✅' : 'Disconnected ❌'}`);

    await db.query('INSERT INTO wifi_logs (status, timestamp) VALUES (?, NOW())', [connected ? 1 : 0]);

    res.send({ message: 'WiFi status updated' });
});

// 📌 API kiểm tra trạng thái ESP32-S3 có online không
app.get('/esp32-status', (req, res) => {
    const now = new Date();
    const diff = (now - new Date(wifiStatus.lastUpdate)) / 1000;
    const isOnline = wifiStatus.connected && diff < 30;
    res.json({ online: isOnline });
});

// 📌 Nếu truy cập đường dẫn chính "/", gửi về file index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});