import urllib.request
import os

url = "https://raw.githubusercontent.com/opencv/opencv/master/data/haarcascades/haarcascade_frontalface_default.xml"
dest1 = r"D:\VICE CLIPS\ai-engine\python\Lib\site-packages\cv2\data\haarcascade_frontalface_default.xml"
dest2 = r"D:\VICE CLIPS\ai-engine\app\processors\haarcascade_frontalface_default.xml"

os.makedirs(os.path.dirname(dest1), exist_ok=True)
os.makedirs(os.path.dirname(dest2), exist_ok=True)

print("Downloading Haar Cascade XML from official OpenCV repository...")
urllib.request.urlretrieve(url, dest1)
urllib.request.urlretrieve(url, dest2)
print("Saved to dest1:", os.path.exists(dest1), os.path.getsize(dest1))
print("Saved to dest2:", os.path.exists(dest2), os.path.getsize(dest2))
