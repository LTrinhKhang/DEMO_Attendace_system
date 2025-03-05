function showPage(pageId) {
    // Ẩn tất cả các trang
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });

    // Hiển thị trang được chọn
    const page = document.getElementById(pageId);
    page.classList.remove('hidden');

    // Thêm hiệu ứng trượt nhẹ
    page.style.opacity = 0;
    setTimeout(() => page.style.opacity = 1, 200);
}

// ✅ Gán các hàm vào `window` để có thể gọi từ HTML
window.showPage = showPage;
