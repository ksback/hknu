const fs = require("fs");

// CSV 파일 경로
const csvFilePath = "./hknu.csv";

// CSV 파일 읽기
fs.readFile(csvFilePath, "utf-8", (err, data) => {
    if (err) {
        console.error("파일을 읽을 수 없습니다.");
        return;
    }

    // 각 행을 개행 문자로 분할하여 배열로 변환
    const rows = data.split("\n");

    // 헤더 행을 가져옴
    const headers = rows[0].split(",");

    // 각 행을 데이터로 변환하여 배열에 저장
    const dataArray = [];
    for (let i = 1; i < rows.length; i++) {
        const rowData = rows[i].split(",");
        const dataObject = {};
        for (let j = 0; j < headers.length; j++) {
            dataObject[headers[j]] = rowData[j];
        }
        dataArray.push(dataObject);
    }

    console.log(dataArray);
});