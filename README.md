# Thiệp cưới Thanh Lập & Nguyễn Sa

Website thiệp cưới tĩnh, tối ưu cho điện thoại và máy tính. Không cần cài thư viện.

## Xem website

Chạy trong thư mục dự án:

```bash
python3 -m http.server 4173
```

Sau đó mở `http://localhost:4173`.

Dự án có hai mẫu thiệp:

- Mẫu xanh mint ban đầu: `http://localhost:4173/`
- Mẫu xanh lá cổ điển theo phong cách Miu Wedding: `http://localhost:4173/miu.html`

Để cá nhân hóa tên khách mời, thêm tham số `guest`:

```text
http://localhost:4173/?guest=Bạn%20Lập%20%2B%20Người%20thương
http://localhost:4173/miu.html?guest=Bạn%20Lập%20%2B%20Người%20thương
```

## Chỉnh nội dung

- Tên, ngày cưới, phụ huynh, địa điểm, bản đồ: sửa khối `WEDDING` ở đầu `app.js`.
- Hình ảnh: thay các tệp trong `assets/images/` và giữ nguyên tên tệp.
- Màu sắc, font chữ và bố cục: sửa các biến ở đầu `styles.css`.
- RSVP hiện được lưu trên trình duyệt của khách. Khi có nơi nhận dữ liệu thật (Google Sheet/Form, Formspree hoặc backend), thay phần xử lý `setupRsvp()` trong `app.js`.
- Nội dung và hiệu ứng riêng của mẫu thứ hai nằm trong `miu.html`, `miu.css` và `miu.js`.
