const token = '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'; // 발급받은 토큰

fetch('https://api.github.com/user/repos', {
    method: 'GET',
    headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
    }
})
.then(response => response.json())
.then(data => {
    console.log(data); // 리포지토리 정보 출력
})
.catch(error => {
    console.error('Error:', error);
});


fetch('https://api.github.com/rate_limit', {
    method: 'GET',
    headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
    }
})
.then(response => response.json())
.then(data => {
    console.log(data); // Rate limit 정보 출력
})
.catch(error => {
    console.error('Error:', error);
});

const imageCache = {}; // 이미지 캐시 객체
const imagePaths = new Set(); // 중복 방지를 위한 Set

let startingYear = 2024; // 로드 시작 연도를 추적

// 연도 범위 및 이미지 경로 생성
for (let year = 1939; year <= 2024; year++) {
    const categories = ['PR', 'SC', 'ST', 'MA', 'FA', 'ET'];
    const extensions = ['png']; // 확장자 배열
    
    categories.forEach(category => {
        for (let i = 1; i <= 7; i++) {
            extensions.forEach(extension => {
                const imgPath = `img/${year}/${category}${i}.${extension}`; // 이미지 경로 생성
                imagePaths.add(imgPath); // Set에 추가하여 중복 방지
            });
        }
    });
}

console.log(`Total images to preload: ${imagePaths.size}`); // 총 이미지 수 출력

let loadedImages = 0;
let failedImages = 0;

// 이미지 미리 로드
function preloadImages() {
    const promises = Array.from(imagePaths).map(path => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = path;

            img.onload = () => {
                imageCache[path] = img; // 로드된 이미지를 캐시에 저장
                loadedImages++;
                updateGauge(); // 게이지 업데이트
                resolve(); // 로드 완료
            };

            img.onerror = () => {
                // 이미지가 없거나 오류가 발생한 경우
                failedImages++;
                updateGauge(); // 게이지 업데이트
                resolve(); // 계속 진행
            };
        });
    });

    return Promise.all(promises) // 모든 이미지 로드 완료를 기다림
        .then(() => {
            console.log(`Successfully loaded ${loadedImages} images.`);
            console.log(`Failed to load ${failedImages} images.`);
            console.log(`Started loading images from year: ${startingYear}`); // 시작 연도 출력
            document.getElementById('enterButton').style.backgroundColor = 'black'; // 버튼 배경색 변경
            document.getElementById('enterButton').style.cursor = 'pointer'; // 버튼 활성화 커서 변경
        });
}

function updateGauge() {
    const progressPercentage = (loadedImages + failedImages) / imagePaths.size * 100;
    document.getElementById('progress').style.width = `${progressPercentage}%`; // 진행률 업데이트
    if (progressPercentage >= 100) {
        document.getElementById('loader').style.display = 'none'; // 로딩 완료 후 인디케이터 숨김
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loader').style.display = 'flex'; // 로딩 인디케이터 표시
    preloadImages().then(() => {
        console.log('All images preloaded');
        document.getElementById('enterButton').style.display = 'flex'; // 버튼 표시
    });
});