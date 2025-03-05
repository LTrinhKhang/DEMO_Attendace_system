let allEmployees = []; // Lưu toàn bộ danh sách nhân viên để tìm kiếm
const API_BASE = "http://localhost:5500"; // Node.js API

async function fetchEmployees() {
    try {
        const response = await fetch('http://localhost:5500/employees'); // Đúng cổng server
        if (!response.ok) throw new Error('Server error');

        const employees = await response.json();
        const employeeList = document.getElementById('employeeList');

        employeeList.innerHTML = ''; // Xóa danh sách cũ

        employees.forEach(employee => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${employee.employeeId}</td>
                <td>${employee.name}</td>
                <td>
                    <button onclick="deleteEmployee('${employee.employeeId}')">🗑 Xóa</button>
                </td>
            `;
            employeeList.appendChild(row);
        });

    } catch (error) {
        console.error('Error fetching employees:', error);
        alert('Could not fetch employee list. Please check your connection.');
    }
}


async function deleteEmployee(employeeId) {
  if (!confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) return;

  try {
      const response = await fetch(`http://localhost:5500/employees/${employeeId}`, {
          method: 'DELETE'
      });

      const result = await response.json();
      alert(result.message);
      fetchEmployees(); // Cập nhật danh sách sau khi xóa
  } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Could not delete employee. Please check your connection.');
  }
}

async function displayEmployees(employeeArray) {
    const employeeList = document.getElementById('employeeList');
    employeeList.innerHTML = ''; // Xóa danh sách cũ

    if (employeeArray.length === 0) {
        employeeList.innerHTML = '<tr><td colspan="3">Không tìm thấy nhân viên</td></tr>';
        return;
    }

    employeeArray.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.employeeId}</td>
            <td>${employee.name}</td>
            <td><button onclick="deleteEmployee('${employee.employeeId}')">🗑 Xóa</button></td>
        `;
        employeeList.appendChild(row);
    });
}



// 🔎 Hàm tìm kiếm nhân viên
async function searchEmployee() {
    const searchValue = document.getElementById('searchEmployee').value.toLowerCase();

    try {
        const response = await fetch(`${API_BASE}/employees/search?q=${searchValue}`);
        if (!response.ok) throw new Error('Lỗi khi tìm kiếm nhân viên');

        const employees = await response.json();
        displayEmployees(employees);
    } catch (error) {
        console.error('Error searching employees:', error);
    }
}


// Gán hàm vào `window` để có thể gọi từ HTML
window.fetchEmployees = fetchEmployees;
window.deleteEmployee = deleteEmployee;
window.searchEmployee = searchEmployee;
