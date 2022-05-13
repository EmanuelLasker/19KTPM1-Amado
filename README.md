# 19KTPM1 - Amado

## **Giới thiệu**
Ứng dụng web Amado là sản phẩm từ dự án khởi nghiệp của nhóm Alexa, phục vụ nhu cầu xây dựng nền tảng thương mại hóa các thiết bị nội thất. Khách hàng sẽ được cung cấp đầy đủ và đa dạng về chủng loại, mẫu mã, giá thành của nhiều loại sản phẩm, không chỉ đẳng cấp, sang trọng mà còn phù hợp với phong cách cá nhân và nhu cầu chi tiêu của từng người. Không những thế, Amado mang đến cho khách hàng trải nghiệm đầy đủ các tính năng thú vị của một ứng dụng web hiện đại và sự an tâm lựa chọn sản phẩm dựa trên sự uy tín và chuyên nghiệp trong phong cách làm việc của cửa hàng.

## **Thành viên**

|       Full name      |    Student ID  |
|----------------------|    :--------:  |
| Lê Quang Tấn Long    |    19127201    |
| Trần Thanh Tùng      |    19127311    |
| Trần Quốc Tuấn       |    19127650    |

## **Hướng dẫn cài đặt**
<ol>
    <li>Cài đặt và cấu hình aaPanel
        <ul>
            <li>Sử dụng VPS Ubuntu 18.04 và cài đặt bằng lệnh:</li>
            wget -O install.sh http://www.aapanel.com/script/install-ubuntu_6.0_en.sh && sudo bash install.sh
            <li>Sau khi aaPanel cài xong, chọn Method LNMP và cài Nginx,chọn Fast và nhấn Install.</li>
        </ul>
    </li>
    <li>Cài đặt Redis, MongoDB, NodeJS</li>
        <ul>
            <li>Chọn aaPanel panel> App Store> tìm redis, MongoDB, Node.js  và cài đặt.</li>
        </ul>
    <li>Thêm site
        <ul>
            <li>Upload source lên mục File Manager:</li>
            aaPanel panel > Website > Node Project > Add Node project.
            <li>Với trang Admin, ở Path điền đường dẫn tới thư mục Admin/Amado. Cài đặt Port cho Admin là 3001, thêm tên miền (VD: admin.amadomeubles.online)</li>
            <li>Với Người dùng, điền Path: User/Admin, đặt tên là User, Port là 3000 và thêm tên miền vào.</li>
            <li>Lưu ý tên miền đã được trỏ sẵn vào địa chỉ IP của VPS.</li>
        </ul>
    </li>
    <li>Cấu hình database
        <ul>
            <li>AppStore > MongoDB > Settings > Database > Tạo mới database và đặt tên là “ecommerce”.
            <li>Trên Mongodb Compass ở máy tính Windows, đăng nhập vào database ở VPS bằng địa chỉ IP và tài khoản root như trong hình.</li>
            <li>Sau khi truy cập vào database, tạo mới tất cả các bảng như trong hình và import dữ liệu từ thư mục database.</li>
        </ul>
    </li>
</ol>

## **Video**
https://drive.google.com/file/d/18cOgF4u-93Rn6-XWI7ziqAdKmUTrJSEC/view?usp=sharing


