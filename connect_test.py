import requests
import json

def test_server_connection():
    base_url = "http://localhost:8000"

    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            data = response.json()
            print(f"check passed: {data}")
        else:
            print(f"{response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("Could not connect")
        return False
    except Exception as e:
        print(f"exception as: {e}")
        return False
    return True

if __name__ == "__main__":
    test_server_connection() 