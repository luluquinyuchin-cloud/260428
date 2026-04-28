let video;
let handpose;
let hand;

function setup() {
  createCanvas(windowWidth, windowHeight); // 建立全螢幕畫布
  video = createCapture(VIDEO);
  video.hide();
  handpose = ml5.handpose(video, modelLoaded); // 呼叫 handpose 模型
  handpose.on('predict', gotHands); // 當偵測到手時執行 gotHands
}

function gotHands(results) {
  if (results.length > 0) {
    hand = results[0]; // 取得偵測到的第一隻手
  } else {
    hand = null;
  }
}

function modelLoaded() {   //顯示pose model已經準備就緒
  console.log('Handpose model ready');
}

function draw() {
    background('#e7c6ff'); // 設定背景顏色

    // 計算顯示影像的目標寬高 (畫布的 50%)
    let targetW = width * 0.5;
    let targetH = height * 0.5;

    // 計算縮放比例與起始位置
    let scaleX = targetW / video.width;
    let scaleY = targetH / video.height;
    let offsetX = (width - targetW) / 2;
    let offsetY = (height - targetH) / 2;

    push(); // 開始座標轉換
    translate(offsetX, offsetY); // 移至中間
    scale(scaleX, scaleY); // 縮放座標系以符合目標大小

    image(video, 0, 0); // 顯示影像

    if (hand) {
        stroke(255); // 設定連線顏色為白色
        strokeWeight(2); // 設定線條粗細
        
        // 定義一個函式來串接指定範圍的關鍵點
        const drawConnect = (start, end) => {
            for (let i = start; i < end; i++) {
                line(hand.landmarks[i][0], hand.landmarks[i][1], hand.landmarks[i + 1][0], hand.landmarks[i + 1][1]);
            }
        };

        // 依照要求串接各手指關鍵點
        drawConnect(0, 4);   // 0 到 4 (大拇指)
        drawConnect(5, 8);   // 5 到 8 (食指)
        drawConnect(9, 12);  // 9 到 12 (中指)
        drawConnect(13, 16); // 13 到 16 (無名指)
        drawConnect(17, 20); // 17 到 20 (小指)

        // 畫出偵測到的 21 個手部關鍵點
        for (let i = 0; i < hand.landmarks.length; i++) {
            let landmark = hand.landmarks[i];
            let x = landmark[0]; // x 座標
            let y = landmark[1]; // y 座標
            fill(0, 255, 0);
            noStroke();
            ellipse(x, y, 10, 10);
        }
    }
    pop(); // 結束座標轉換，避免影響到後續可能的繪製
}
