const express = require('express');
const router = express.Router();
const db = require('../db');

// 📌 API lấy danh sách nhân viên
router.get('/employees', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM employees');
    res.send(rows);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).send({ message: 'Error fetching employees' });
  }
});

// 📌 API tìm kiếm nhân viên nhanh (TĂNG HIỆU SUẤT)
// API tìm kiếm nhân viên theo tên hoặc ID
router.get('/employees/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).send({ message: 'Thiếu tham số tìm kiếm' });

  try {
    const [rows] = await db.query(
      'SELECT * FROM employees WHERE name LIKE ? OR employeeId LIKE ?',
      [`%${q}%`, `%${q}%`]
    );
    res.send(rows);
  } catch (error) {
    console.error('Lỗi khi tìm kiếm nhân viên:', error);
    res.status(500).send({ message: 'Lỗi khi tìm kiếm nhân viên' });
  }
});


// 📌 API đăng ký nhân viên mới (TRÁNH TRÙNG LẶP)
router.post('/register', async (req, res) => {
  const { name, employeeId } = req.body;

  if (!name || !employeeId.trim()) {
    return res.status(400).send({ message: 'Employee name and ID cannot be empty' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM employees WHERE employeeId = ?', [employeeId]);
    if (rows.length > 0) {
      return res.status(400).send({ message: 'Employee ID already exists' });
    }

    await db.query('INSERT INTO employees (name, employeeId) VALUES (?, ?)', [name.trim(), employeeId.trim()]);
    res.send({ message: 'Employee registered successfully!' });
  } catch (error) {
    console.error('Error registering employee:', error);
    res.status(500).send({ message: 'Error registering employee' });
  }
});

// 📌 API xóa nhân viên theo ID (XÓA DỮ LIỆU LIÊN QUAN)
router.delete('/employees/:employeeId', async (req, res) => {
  const { employeeId } = req.params;

  try {
    await db.query('DELETE FROM attendance_logs WHERE employeeId = ?', [employeeId]); // Xóa điểm danh trước
    const [result] = await db.query('DELETE FROM employees WHERE employeeId = ?', [employeeId]);

    if (result.affectedRows === 0) {
      return res.status(404).send({ message: 'Employee not found' });
    }

    res.send({ message: 'Employee and attendance records deleted successfully!' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).send({ message: 'Error deleting employee' });
  }
});

module.exports = router;
