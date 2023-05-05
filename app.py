import base64
import os
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)
UPLOAD_FOLDER = '/home/ayaan/Data/workspace/jupyter/flask/GuardianPlate/images'

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route("/")
def home():
    return render_template('index.html')

@app.route('/upload-image', methods=['POST'])
def upload_image():
    data = request.get_json()
    image_data = data['image']
    image_name = 'captured_image.jpg'

    # 이미지 데이터를 디코딩하고 저장합니다.
    with open(os.path.join(UPLOAD_FOLDER, image_name), 'wb') as f:
        f.write(base64.b64decode(image_data.split(',')[1]))

    # 이미지가 성공적으로 저장되었음을 클라이언트에 알립니다.
    return jsonify({'message': '이미지가 성공적으로 저장되었습니다.'})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True, ssl_context=("/home/ayaan/Data/workspace/ssl/pem/cert.pem", "/home/ayaan/Data/workspace/ssl/pem/key.pem"))