const express = require('express');
const router = express.Router();
const db = require('../db');

// 📌 API lấy danh sách điểm danh (ĐÃ SỬA LỖI)
router.get('/attendance', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT employeeId, timestamp FROM attendance_logs ORDER BY timestamp ASC');
    res.send(rows);
  } catch (error) {
    console.error('Error fetching attendance logs:', error);
    res.status(500).send({ message: 'Error fetching attendance logs' });
  }
});

// 📌 API nhận dữ liệu điểm danh từ ESP32-S3 (TRÁNH TRÙNG LẶP)
router.post('/attendance', async (req, res) => {
  const { employeeId, timestamp } = req.body;

  if (!employeeId || !timestamp) {
    return res.status(400).send({ message: 'Thiếu employeeId hoặc timestamp' });
  }

  try {
    // Kiểm tra xem đã chấm công hôm nay chưa
    const [existing] = await db.query(
      'SELECT * FROM attendance_logs WHERE employeeId = ? AND DATE(timestamp) = CURDATE()',
      [employeeId]
    );

    if (existing.length > 0) {
      return res.status(409).send({ message: 'Nhân viên đã chấm công hôm nay!' });
    }

    // Chấm công
    await db.query('INSERT INTO attendance_logs (employeeId, timestamp) VALUES (?, ?)', [employeeId, timestamp]);

    // Trả về danh sách mới
    const [updatedLogs] = await db.query('SELECT * FROM attendance_logs');
    res.send(updatedLogs);

  } catch (error) {
    console.error('Lỗi khi chấm công:', error);
    res.status(500).send({ message: 'Lỗi khi chấm công' });
  }
});


// 📌 API để ESP32-S3 gửi tất cả dữ liệu chưa đồng bộ khi kết nối lại (ĐỒNG BỘ HÀNG LOẠT)
router.post('/attendance/batch', async (req, res) => {
  const { logs } = req.body;

  if (!logs || logs.length === 0) {
    return res.status(400).send({ message: 'Không có dữ liệu để đồng bộ' });
  }

  try {
    for (const log of logs) {
      const { employeeId, timestamp } = log;

      // Kiểm tra xem đã điểm danh hôm nay chưa
      const [existing] = await db.query(
        'SELECT * FROM attendance_logs WHERE employeeId = ? AND DATE(timestamp) = CURDATE()',
        [employeeId]
      );

      if (existing.length === 0) {
        await db.query('INSERT INTO attendance_logs (employeeId, timestamp) VALUES (?, ?)', [employeeId, timestamp]);
      }
    }

    res.send({ message: 'Dữ liệu điểm danh đã đồng bộ!' });
  } catch (error) {
    console.error('Lỗi khi đồng bộ dữ liệu:', error);
    res.status(500).send({ message: 'Lỗi khi đồng bộ dữ liệu' });
  }
});

module.exports = router;
