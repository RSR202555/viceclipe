import cv2
import os
print("cv2 haarcascades path:", cv2.data.haarcascades)
cascade_file = os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml")
print("Exists:", os.path.exists(cascade_file))
