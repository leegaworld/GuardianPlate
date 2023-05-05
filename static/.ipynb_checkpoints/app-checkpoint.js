const cameraPreview = document.getElementById('camera-preview');
const captureButton = document.getElementById('capture-button');
const ctx = cameraPreview.getContext('2d');

console.log("\n\n captureButton: " + captureButton);

let video;
let interestArea;

// 카메라 스트림을 video 요소에 연결
async function setupCamera() {
    try {
        const constraints = {
            video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video = document.createElement('video');
        video.srcObject = stream;
        video.playsInline = true; // iOS에서 카메라가 정지하지 않도록 설정
        video.autoplay = true;
        video.muted = true;

        video.addEventListener('loadedmetadata', () => {
            cameraPreview.width = window.innerWidth;
            cameraPreview.height = window.innerHeight;
            interestArea = {
                x: cameraPreview.width * 0.25,
                y: cameraPreview.height * 0.25,
                width: cameraPreview.width * 0.5,
                height: cameraPreview.height * 0.5
            };
            video.play(); // 비디오 재생
            drawCanvas();
        });
    } catch (error) {
        console.error('카메라 접근에 실패했습니다:', error);
    }
}

// 비디오 프레임을 canvas에 그리기
function drawCanvas() {
    ctx.drawImage(video, 0, 0, cameraPreview.width, cameraPreview.height);
    drawInterestArea();
    drawButton();
    requestAnimationFrame(drawCanvas);
}

// 관심 영역 그리기
function drawInterestArea() {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.strokeRect(interestArea.x, interestArea.y, interestArea.width, interestArea.height);
}

// 캡처 버튼 그리기
function drawButton() {
    const buttonWidth = 100;
    const buttonHeight = 40;
    const x = cameraPreview.width - buttonWidth - 10;
    const y = cameraPreview.height - buttonHeight - 10;

    ctx.fillStyle = 'rgba(0, 123, 255, 0.7)';
    ctx.fillRect(x, y, buttonWidth, buttonHeight);

    ctx.fillStyle = 'white';
    ctx.font = '18px sans-serif';
    ctx.fillText('캡처', x + 30, y + 27);
}

// 캡처 버튼 클릭 이벤트 처리
cameraPreview.addEventListener('click', (event) => {
    const x = event.pageX - cameraPreview.offsetLeft;
    const y = event.pageY - cameraPreview.offsetTop;
    const buttonX = cameraPreview.width - 100 - 10;
    const buttonY = cameraPreview.height - 40 - 10;

    if (x >= buttonX && x <= buttonX + 100 && y >= buttonY && y <= buttonY + 40) {        
        // 캡처 버튼을 누르면 여기에서 캡처 처리를 할 수 있습니다.
        const croppedImage = captureInterestArea();
        sendImageToServer(croppedImage);
    }
});

// 관심 영역 캡처
function captureInterestArea() {
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');
    croppedCanvas.width = interestArea.width;
    croppedCanvas.height = interestArea.height;
    croppedCtx.drawImage(cameraPreview, interestArea.x, interestArea.y, interestArea.width, interestArea.height, 0, 0, interestArea.width, interestArea.height);
    return croppedCanvas.toDataURL('image/jpeg', 0.8);
}

// 서버로 이미지 정보 전송
function sendImageToServer(imageData) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
    };

    fetch('https://leegaworld.iptime.org:5000/upload-image', requestOptions)
        .then(response => response.json())
        .then(data => console.log('서버에서 반환된 데이터:', data))
        .catch(error => console.error('서버에 이미지를 보내는 중 오류가 발생했습니다:', error));
}


// 카메라 초기화
setupCamera();