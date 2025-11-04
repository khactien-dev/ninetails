import requests

payload = {
    "customer_id": "abc1",
    "topic": "edge_login_REQ",
    "data": {
        "edge_id": "Edge_Test_1",
        "password": "xip9il4s",
        "mac_address": "00:1A:2B:3C:4D:6E"
    }
}


BASE_URL = 'http://192.168.12.10:3000/api/base-metric/edge-management'
full_url = f'{BASE_URL}/auth'

try:
    res = requests.post(full_url, json=payload)

    print(f"Mã trạng thái phản hồi: {res.status_code}")
    
    if res.status_code == 200:
        print("Yêu cầu thành công!")
        print("Dữ liệu phản hồi:", res.json())
    else:
        print("Yêu cầu không thành công.")
        print("Nội dung phản hồi:", res.text)

except requests.exceptions.RequestException as e:
    print(f"Có lỗi xảy ra khi gửi yêu cầu: {e}")