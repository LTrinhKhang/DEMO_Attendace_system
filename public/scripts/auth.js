function adminLogin() {
    const username = document.getElementById("adminUsername").value;
    const password = document.getElementById("adminPassword").value;
    const loginMessage = document.getElementById("loginMessage");

    // ✅ Danh sách tài khoản quản trị viên (Có thể thay bằng API backend sau này)
    const adminAccounts = [
        { username: "admin", password: "" },
        { username: "superadmin", password: "admin123" }
    ];

    const isValidAdmin = adminAccounts.some(admin => admin.username === username && admin.password === password);

    if (isValidAdmin) {
        localStorage.setItem("isLoggedIn", "true");
        loginMessage.innerText = "✅ Đăng nhập thành công! Đang chuyển hướng...";
        setTimeout(() => {
            window.location.href = "index.html"; // Chuyển hướng đến trang chính
        }, 1000);
    } else {
        loginMessage.innerText = "❌ Sai tài khoản hoặc mật khẩu!";
    }
}

// ✅ Kiểm tra trạng thái đăng nhập trên tất cả các trang
function checkAuth() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
        alert("❌ Bạn chưa đăng nhập! Vui lòng đăng nhập trước.");
        window.location.href = "login.html"; // Chuyển hướng về trang đăng nhập
    }
}

// ✅ Nếu trang chính `index.html` tải, kiểm tra đăng nhập
if (window.location.pathname.includes("index.html")) {
    checkAuth();
}

function adminLogout() {
    localStorage.removeItem("isLoggedIn"); // Xóa trạng thái đăng nhập
    alert("🚪 Bạn đã đăng xuất!");
    window.location.href = "login.html"; // Chuyển về trang đăng nhập
}


// ✅ Gán `adminLogin` vào `window` để gọi từ HTML
window.adminLogin = adminLogin;
window.checkAuth = checkAuth;
window.adminLogout = adminLogout;