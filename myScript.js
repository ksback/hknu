const csvUrl = 'https://raw.githubusercontent.com/ksback/hknu/refs/heads/main/hknu.csv'; // 실제 URL 입력

// CSV 파일을 불러오기
fetch(csvUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.text();
    })
    .then(data => {
// CSV 파싱 및 배열
        const rows = data.split('\n').map(row => row.split(',').map(cell => cell.trim()));
        const arrayData = rows;

        console.log(arrayData);

// 헤더와 년도 인덱스
        const headers = arrayData[0];
        const yearIndex = headers.indexOf('년도');
        const schoolNameAIndex = headers.indexOf('교명A');

// 연도 목록 생성
        const years = arrayData.slice(1).map(row => row[yearIndex]);

//타임라인 박스
        // content 너비 및 높이
        const contentDiv = document.getElementById('content');
        const contentWidth = contentDiv.clientWidth;
        const contentHeight = contentDiv.clientHeight;

        // yearBox 너비 계산
        const numberOfYears = years.length;
        const boxWidth = contentWidth / numberOfYears;


// 연도별 데이터 그룹화
        const yearDataMap = {};
        arrayData.slice(1).forEach(row => {
            const year = row[yearIndex];
            if (!yearDataMap[year]) {
                yearDataMap[year] = [];
            }
            yearDataMap[year].push(row);
        });

        // #content를 비우기
        contentDiv.innerHTML = '';
//팝업
        // 팝업 생성 (dataBox 밖으로 이동)
        const popup = document.createElement('div');
        popup.className = 'popup';
        popup.style.display = 'none'; // 초기에는 숨김
        document.body.appendChild(popup); // body에 추가

//박스 생성
        // 각 연도에 대해 yearBox 생성
        Object.keys(yearDataMap).forEach(year => {
            const yearDataBox = document.createElement('div');
            yearDataBox.id = year;
            yearDataBox.className = 'yearDataBox';
            yearDataBox.style.width = `${boxWidth}px`;
            contentDiv.appendChild(yearDataBox);

            const numberOfDataBoxes = headers.length - 3; // 데이터 항목 수
            const boxHeight = contentHeight / numberOfDataBoxes;



            // 각 데이터 항목에 대해 dataBox 생성
            yearDataMap[year].forEach(item => {
                for (let i = 0; i < headers.length; i++) { // 0부터 시작하여 모든 헤더를 포함
                    const dataBox = document.createElement('div');
                    dataBox.id = headers[i]; // 헤더를 ID로 사용
                    dataBox.className = 'dataBox';
                    dataBox.style.width = `${boxWidth}px`;
                    dataBox.style.height = `${boxHeight}px`;

                    const dataValue = item[i];

                    // 색상
                    const colorMap = {
                        '1교장': '#3DAAE1',
                        '2학교': '#F66B66',
                        '3인원': '#ED832F',
                        '4학과': '#00A79E',
                        '5시설': '#F4D353',
                        '6기타': '#0C3274'
                    };

                    // 데이터가 존재하는지 확인
                    if (dataValue && dataValue.trim() !== '' && dataValue.toLowerCase() !== 'null') {
                        const category = headers[i].slice(0, 3);
                        dataBox.style.backgroundColor = colorMap[category] || 'transparent';

                        // 마우스 호버 이벤트 추가
                        dataBox.addEventListener('mouseenter', () => {
                            popup.style.display = 'block'; // 팝업 표시

                            // 팝업 크기 설정: dataBox의 width * 10
                            const boxWidth = dataBox.offsetWidth * 10; // 데이터 박스의 너비의 10배
                            popup.style.width = `${boxWidth}px`; // 팝업 너비 설정


                    //팝업 위치 ~
                            // 팝업 위치 조정
                            const boxPos = dataBox.getBoundingClientRect(); // dataBox의 위치와 크기 가져오기
                            const popupHeight = popup.offsetHeight; // 팝업 높이
                            const popupWidth = popup.offsetWidth; // 팝업 너비

                            // 오른쪽 아래 꼭짓점을 기준으로 팝업 위치 조정
                            let popupTop = boxPos.bottom + window.scrollY; // dataBox 아래쪽
                            let popupLeft = boxPos.right + window.scrollX; // dataBox 오른쪽

                            // 화면 경계를 넘어가지 않도록 조정
                            const viewportWidth = window.innerWidth;
                            const viewportHeight = window.innerHeight;

                            // 오른쪽 끝에서 나갈 경우
                            if (popupLeft + popupWidth > viewportWidth) {
                                popupLeft = boxPos.left + window.scrollX - popupWidth; // dataBox의 왼쪽으로 위치 조정
                                popupTop = boxPos.bottom + window.scrollY; // 아래쪽으로 유지
                            }

                            // 아래쪽 끝에서 나갈 경우
                            if (popupTop + popupHeight > viewportHeight) {
                                popupTop = boxPos.top + window.scrollY - popupHeight; // dataBox 위쪽으로 위치 조정
                            }

                            // 팝업 위치 설정
                            popup.style.top = `${popupTop}px`;
                            popup.style.left = `${popupLeft}px`;
                            popup.textContent = dataValue; // 팝업 내용 설정

                            // 이미지 형식
                            const imgFormats = ['png','jpg','jpeg'];

                            // dataBox ID와 year 연결
                            const baseImgPath = `/img/${year}/${dataBox.id}`; // 기본 경로 설정

                            // A부터 G까지의 이미지를 추가
                            let imgLoaded = false;
                            imgFormats.forEach(format => {
                                const imgPath = `${baseImgPath}.${format}`; // 형식에 대한 전체 경로

                                const img = new Image();
                                img.src = imgPath;

                                img.onload = () => {
                                        // 비율 계산
                                    imgLoaded = true;
                                    const imgSize = img.height / img.width; // 이미지 비율
                                    img.style.width = `${boxWidth}px`; // 고정 가로값
                                    img.style.height = `${boxWidth * imgSize}px`; // 비율에 따라 세로값 
                                    popup.appendChild(img); // 이미지가 로드되면 팝업에 추가
                                };
                            });
                        });

                        dataBox.addEventListener('mouseleave', () => {
                            popup.style.display = 'none'; // 팝업 숨김
                        });
                    } else {
                        dataBox.style.backgroundColor = 'transparent';
                    }

                    yearDataBox.appendChild(dataBox); // dataBox 추가
                }
            });
        });
// 확대 모드 버튼 클릭 이벤트 추가
const zoomButton = document.getElementById('zoomButton');
let isZoomed = false; // 확대 모드 상태 추적

zoomButton.addEventListener('click', () => {
    const yearDataBoxes = document.querySelectorAll('.yearDataBox');

    if (!isZoomed) {
        // 확대 모드로 전환
        yearDataBoxes.forEach(box => {
            const currentDataBoxes = box.querySelectorAll('.dataBox'); // 해당 yearDataBox의 dataBox 가져오기
            const originalBoxWidth = boxWidth; // 원래 너비
            const increasedBoxWidth = originalBoxWidth * 22; // 22배로 증가

            currentDataBoxes.forEach(dataBox => {
                dataBox.dataset.originalWidth = originalBoxWidth; // 원래 너비 저장
                dataBox.style.width = `${increasedBoxWidth}px`; // 너비를 22배로 증가
            });

            // yearDataBox의 너비 조정
            box.style.width = `${increasedBoxWidth * currentDataBoxes.length}px`; // 자식 박스의 총 너비로 설정
        });

        // 가로 스크롤 가능하게 설정
        contentDiv.style.overflowX = 'auto'; // 가로 스크롤 활성화
        contentDiv.classList.add('zoomed'); // zoomed 클래스 추가
    } else {
        // 원래 모드로 복원
        yearDataBoxes.forEach(box => {
            const currentDataBoxes = box.querySelectorAll('.dataBox'); // 해당 yearDataBox의 dataBox 가져오기
            currentDataBoxes.forEach(dataBox => {
                dataBox.style.width = `${dataBox.dataset.originalWidth}px`; // 원래 너비로 복원
            });

            // yearDataBox의 너비 복원
            box.style.width = ''; // 원래 너비로 복원
        });

        // 가로 스크롤 비활성화
        contentDiv.style.overflowX = 'hidden'; // 가로 스크롤 숨김
        contentDiv.classList.remove('zoomed'); // zoomed 클래스 제거
    }

    isZoomed = !isZoomed; // 확대 모드 상태 토글
});

    });

