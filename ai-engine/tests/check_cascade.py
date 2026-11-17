import cv2
print("cv2 attributes with 'Cascade':", [attr for attr in dir(cv2) if 'cascade' in attr.lower() or 'face' in attr.lower()])
try:
    import cv2.objdetect
    print("cv2.objdetect:", dir(cv2.objdetect))
except Exception as e:
    print("cv2.objdetect error:", e)
