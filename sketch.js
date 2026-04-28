let video;
let handpose;
let hand;
let bubbles = []; // 儲存所有水泡的陣列

function setup() {
  createCanvas(windowWidth, windowHeight); // 建立全螢幕畫布
  video = createCapture(VIDEO);
  video.hide();
  handpose = ml5.handPose(video, modelLoaded); // 使用最新版 handPose (注意大寫 P)
  handpose.detectStart(video, gotHands); // 使用 v1.0 的 detectStart 進行持續偵測
  textFont('Microsoft JhengHei'); // 設定字體（選用）
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
    if (video.width === 0) return; // 確保影片已載入，避免計算縮放比例時出現 Infinity

    background('#e7c6ff'); // 設定背景顏色

    // 1. 在畫布置中上方加上文字
    fill(0); // 文字顏色為黑色
    noStroke();
    textSize(32);
    textAlign(CENTER, TOP);
    text("414730571 黃榆秦", width / 2, 20);

    // 計算顯示影像的目標寬高 (畫布的 50%)
    let targetW = width * 0.5;
    let targetH = height * 0.5;

    // 計算縮放比例與起始位置
    let scaleX = targetW / video.width;
    let scaleY = targetH / video.height;
    let offsetX = (width - targetW) / 2;
    let offsetY = (height - targetH) / 2;

    // 更新並繪製所有水泡 (在座標轉換外繪製，使其可以飄出影像範圍)
    for (let i = bubbles.length - 1; i >= 0; i--) {
        bubbles[i].update();
        bubbles[i].display();
        if (bubbles[i].isPopped()) {
            bubbles.splice(i, 1); // 移除已經破掉的水泡
        }
    }

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
                line(hand.keypoints[i].x, hand.keypoints[i].y, hand.keypoints[i + 1].x, hand.keypoints[i + 1].y);
            }
        };

        // 依照要求串接各手指關鍵點
        drawConnect(0, 4);   // 大拇指
        drawConnect(5, 8);   // 食指
        drawConnect(9, 12);  // 中指
        drawConnect(13, 16); // 無名指
        drawConnect(17, 20); // 小指

        // 畫出偵測到的手部關鍵點 (新版使用 keypoints)
        for (let i = 0; i < hand.keypoints.length; i++) {
            let landmark = hand.keypoints[i];
            let x = landmark.x; // x 座標
            let y = landmark.y; // y 座標
            fill(0, 255, 0);
            noStroke();
            ellipse(x, y, 10, 10);
        }
    }
    pop(); // 結束座標轉換，避免影響到後續可能的繪製

    // 每 5 幀產生一次新水泡，避免畫面太擁擠
    if (hand && frameCount % 5 === 0) {
        let tips = [4, 8, 12, 16, 20]; // 大拇指、食指、中指、無名指、小指的尖端
        tips.forEach(idx => {
            // 將影片座標轉換為畫布全域座標
            let globalX = offsetX + hand.keypoints[idx].x * scaleX;
            let globalY = offsetY + hand.keypoints[idx].y * scaleY;
            bubbles.push(new Bubble(globalX, globalY));
        });
    }
}

// 定義水泡類別
class Bubble {
    constructor(x, y) {
        this.x = x + random(-5, 5); // 增加一點隨機偏移感
        this.y = y;
        this.size = random(10, 25);
        this.speed = random(1, 3);
        this.alpha = 150; // 透明度
        this.maxRise = random(100, 300); // 往上飄多少距離會破掉
        this.startY = y;
    }

    update() {
        this.y -= this.speed; // 往上串升
        this.alpha -= 0.5; // 慢慢變淡
    }

    display() {
        stroke(255, this.alpha + 50);
        fill(255, this.alpha);
        ellipse(this.x, this.y, this.size);
    }

    isPopped() {
        // 如果透明度太低、飄過頭或出界，則判定為破掉
        return this.alpha <= 0 || (this.startY - this.y) > this.maxRise || this.y < -this.size;
    }
}
