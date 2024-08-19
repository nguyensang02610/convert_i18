import re


def load_constants(file_path):
    constants = {}
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Tìm tất cả các cặp key-value trong file constants
    pattern = re.compile(r'(\w+)\s*:\s*"([^"]+)"')
    matches = pattern.findall(content)

    for key, value in matches:
        constants[value] = key

    return constants


def replace_text_with_i18(file_path, constants):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    for value, key in constants.items():
        # Kiểm tra và thay thế theo các trường hợp có dấu nháy hoặc không
        if f'"{value}"' in content:
            # Thay thế nếu có nháy kép ở hai đầu
            content = re.sub(f'"{re.escape(value)}"', f'i18("{key}")', content)
        elif f"'{value}'" in content:
            # Thay thế nếu có nháy đơn ở hai đầu
            content = re.sub(f"'{re.escape(value)}'", f'i18("{key}")', content)
        else:
            # Thay thế nếu không có nháy ở hai đầu
            # Xử lý trường hợp chuỗi không có dấu nháy và cũng kiểm tra nếu có dấu ':' ở cuối
            if value.endswith(':'):
                value_to_match = value[:-1]  # Bỏ dấu ':'
                content = re.sub(
                    f'\\b{re.escape(value_to_match)}\\b', f'i18("{key}"):', content)
            else:
                content = re.sub(
                    f'\\b{re.escape(value)}\\b', f'i18("{key}")', content)

            # Xử lý trường hợp văn bản nằm trong thẻ HTML mà không có dấu nháy
            # Bao quanh khối i18 bằng dấu {} nếu văn bản nằm trong các thẻ HTML
            content = re.sub(
                rf'>(\s*{re.escape(value)}\s*)<',
                rf'>{{i18("{key}")}}<',
                content
            )

    return content


def main():
    constants_file = 'constants_20240817_162506.js'
    input_file = 'code.txt'
    output_file = 'output.js'

    constants = load_constants(constants_file)
    updated_content = replace_text_with_i18(input_file, constants)

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(updated_content)

    print(f"Đã thay thế và lưu kết quả vào {output_file}")


if __name__ == "__main__":
    main()
