export async function fetchAttendanceLogs() {
  try {
      const response = await fetch('http://localhost:5500/attendance');
      if (!response.ok) throw new Error('Server error');

      const logs = await response.json();
      const attendanceList = document.getElementById('attendanceList');

      attendanceList.innerHTML = ''; // Xóa dữ liệu cũ

      logs.forEach(log => {
          const row = document.createElement('tr');
          row.innerHTML = `<td>${log.employeeId}</td><td>${log.timestamp}</td>`;
          attendanceList.appendChild(row);
      });

  } catch (error) {
      console.error('Error fetching attendance logs:', error);
      alert('Could not fetch attendance logs. Please check your connection.');
  }
}
window.fetchAttendanceLogs = fetchAttendanceLogs;
