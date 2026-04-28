let video;
let poseNet;
let pose;
let skeleton;

function setup() {
  createCanvas(windowWidth, windowHeight); // 建立全螢幕畫布
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded); //呼叫在ml5.js上的net函數，用此函數來判斷各位置，呼叫成功即執行function modelLoaded 
  poseNet.on('pose', gotPoses);
}

function gotPoses(poses) {
  //console.log(poses);
  if (poses.length > 0) {
    pose = poses[0].pose;  //把抓到的幾個點，都放置pose變數內
    skeleton = poses[0].skeleton; //把相關於骨架的點都放到skeleton變數內
  }
}


function modelLoaded() {   //顯示pose model已經準備就緒
  console.log('poseNet ready');
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

    if (pose) {
        // 畫出所有偵測到的關鍵點 (如眼睛、耳朵、肩膀等)
        for (let i = 0; i < pose.keypoints.length; i++) {
            let x = pose.keypoints[i].position.x;
            let y = pose.keypoints[i].position.y;
            fill(0, 255, 0);
            noStroke();
            ellipse(x, y, 10, 10);
        }

        // 畫出骨架連線
        for (let i = 0; i < skeleton.length; i++) {
            let a = skeleton[i][0];
            let b = skeleton[i][1];
            strokeWeight(2);
            stroke(255);
            line(a.position.x, a.position.y, b.position.x, b.position.y);
        }
    }
    pop(); // 結束座標轉換，避免影響到後續可能的繪製
}
