# Đọc file JS
file_path = 'constants_20240817_151033.js'
with open(file_path, 'r', encoding='utf-8') as file:
    lines = file.readlines()

# Lọc ra các dòng có key-value
kv_lines = [line.strip()
            for line in lines if ':' in line and 'export default' not in line]

# Sắp xếp các key-value theo độ dài của key
sorted_kv_lines = sorted(kv_lines, key=lambda line: len(
    line.split(':')[0].strip()), reverse=True)

# Tạo lại nội dung file với các dòng đã sắp xếp
output_lines = ["export default {\n"]
output_lines += ["  " + line + "\n" for line in sorted_kv_lines]
output_lines.append("};\n")

# Ghi kết quả vào file mới
output_file_path = 'sorted_js.js'
with open(output_file_path, 'w', encoding='utf-8') as output_file:
    output_file.writelines(output_lines)

print(f"Keys have been sorted by length and saved to {output_file_path}")
