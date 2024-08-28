import pandas as pd

# Đọc file Excel
df = pd.read_excel('thamDinh.xlsx')

# Giả sử chuỗi nằm trong cột có tên 'Text'
# Tính độ dài chuỗi
df['Length'] = df['STT'].apply(len)

# Sắp xếp theo độ dài chuỗi, từ dài nhất đến ngắn nhất
df_sorted = df.sort_values(by='Length', ascending=False)

# Xóa cột độ dài nếu không cần thiết
df_sorted = df_sorted.drop(columns=['Length'])

# Lưu vào file Excel mới
df_sorted.to_excel('sorted_output.xlsx', index=False)

print("Đã sắp xếp và lưu kết quả vào 'sorted_output.xlsx'")
