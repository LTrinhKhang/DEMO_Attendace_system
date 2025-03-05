const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'KhangNo.2',
  database: 'attendance_system',
});

// Kiểm tra kết nối
pool.getConnection()
    .then(connection => {
        console.log('Kết nối MySQL thành công!');
        connection.release(); // Giải phóng kết nối
    })
    .catch(err => {
        console.error('Kết nối MySQL thất bại:', err);
    });

module.exports = pool;
