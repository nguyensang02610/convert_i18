import pandas as pd
import unidecode
import re
from datetime import datetime


def convert_to_constant(text):
    # Chuyển đổi tiếng Việt sang không dấu
    text = unidecode.unidecode(text)
    text = re.sub(r'\W+', '_', text)
    # Chuyển đổi thành chữ in hoa và thay thế khoảng trắng bằng dấu gạch dưới
    return re.sub(r'\s+', '_', text.upper())


def create_js_file(data):
    current_time = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"constants_{current_time}.js"

    with open(filename, 'w', encoding='utf-8') as f:
        f.write("/* eslint-disable import/no-anonymous-default-export */\n")
        f.write("export default {\n")
        for key, value in data.items():
            f.write(f"  {key}: \"{value}\",\n")
        f.write("}\n")

    print(f"File JavaScript đã được tạo: {filename}")


# Đọc file Excel
# Thay 'input.xlsx' bằng tên file Excel của bạn
df = pd.read_excel('thamDinh.xlsx')

# Chuyển đổi dữ liệu
data = {}
for _, row in df.iterrows():
    # Giả sử cột đầu tiên chứa chữ tiếng Việt có dấu
    vietnamese_text = row.iloc[0]
    constant = convert_to_constant(vietnamese_text)
    data[constant] = vietnamese_text

# Tạo file JavaScript
create_js_file(data)
