async function calculateWorkDuration() {
    const selectedDate = document.getElementById("datePicker").value;
    if (!selectedDate) {
        alert("⚠️ Vui lòng chọn ngày!");
        return;
    }

    try {
        const response = await fetch('http://localhost:5500/attendance');
        if (!response.ok) throw new Error('Server error');

        const logs = await response.json();
        const filteredLogs = logs.filter(log => 
            new Date(log.timestamp).toISOString().split('T')[0] === selectedDate
        );

        const workDurations = {};
        filteredLogs.forEach(log => {
            const employeeId = log.employeeId;
            const time = new Date(log.timestamp).getTime();

            if (!workDurations[employeeId]) {
                workDurations[employeeId] = { in: null, out: null, total: 0 };
            }

            if (!workDurations[employeeId].in || time < workDurations[employeeId].in) {
                workDurations[employeeId].in = time; 
            }

            if (!workDurations[employeeId].out || time > workDurations[employeeId].out) {
                workDurations[employeeId].out = time; 
            }
        });

        const workDurationList = document.getElementById("workDurationList");
        workDurationList.innerHTML = ''; 

        Object.entries(workDurations).forEach(([employeeId, times]) => {
            if (times.in && times.out) {
                const duration = (times.out - times.in) / (1000 * 60 * 60);
                const row = document.createElement('tr');
                row.innerHTML = `<td>${employeeId}</td><td>${duration.toFixed(2)} giờ</td>`;
                workDurationList.appendChild(row);
            }
        });

    } catch (error) {
        console.error('Error calculating work duration:', error);
        alert('Không thể tính toán thời gian làm việc. Vui lòng kiểm tra kết nối.');
    }
}   

// ✅ Gán hàm vào `window` để có thể gọi từ HTML
window.calculateWorkDuration = calculateWorkDuration;
