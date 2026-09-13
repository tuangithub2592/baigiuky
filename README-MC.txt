BẢN PANOEE BASE + MC

1. Đây là bản Base của Panoee, dùng offline_id để tải project từ Panoee.
2. MC được thêm trực tiếp vào trang Base, không dùng iframe ngoài.
3. MC tự đổi video khi scene active của Panoee đổi.
4. Mapping:
   - Khu Nhập Đạo -> khu-nhap-dao.mp4
   - Khu Thành Đạt -> thanh-dat.mp4
   - Khuê Văn Các -> khue-van-cac.mp4
   - Khu Đại Thành -> dai-thanh.mp4
   - Khu Thái Học -> thai-hoc.mp4
5. Các scene khác: giữ video hiện tại, không đổi.
6. Nếu đổi offline_id của project khác, sửa file static/static/data.js.
7. Để test local ổn định, nên chạy bằng Live Server trong VS Code thay vì mở file index.html trực tiếp.


Vị trí MC phiên bản này: góc dưới bên phải, cách mép phải 24px và nâng lên 105px để tránh thanh nút chức năng Panoee ở đáy phải.
