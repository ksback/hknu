const csvUrl = 'https://raw.githubusercontent.com/ksback/hknu/main/hknu.csv'; // 실제 URL 입력

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

        // timeLine div 설정
        const timeLineDiv = document.getElementById('timeLine');
        timeLineDiv.style.width = `${contentWidth}px`;
        //->content width값 똑같이

        // timeLine에 박스 추가 및 년도 텍스트 추가
        years.forEach(year => {
            const timeLineBox = document.createElement('div');
            timeLineBox.className = 'timeLineBox';
            timeLineBox.style.width = `${boxWidth}px`;

            const timeLineText = document.createElement('div');
            timeLineText.className = 'timeLineText';
            timeLineText.textContent = year;
            timeLineText.style.transform = 'rotate(90deg)';
            timeLineText.style.whiteSpace = 'nowrap';

            timeLineBox.appendChild(timeLineText);
            timeLineDiv.appendChild(timeLineBox);
        });

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
                for (let i = 3; i < headers.length; i++) {
                    const dataBox = document.createElement('div');
                    dataBox.id = headers[i];
                    dataBox.className = 'dataBox';
                    dataBox.style.width = `${boxWidth}px`;
                    dataBox.style.height = `${boxHeight}px`;

                    const dataValue = item[i];

                    // 색상 매핑
                    const colorMap = {
                        '1교장': '#D51F21',
                        '2학교': '#ED832F',
                        '3인원': '#F1D02A',
                        '4학과': '#33BFB8',
                        '5시설': '#3DAAE1',
                        '6기타': '#2962C5'
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
                            const boxRect = dataBox.getBoundingClientRect(); // dataBox의 위치와 크기 가져오기
                            const popupHeight = popup.offsetHeight; // 팝업 높이
                            const popupWidth = popup.offsetWidth; // 팝업 너비

                            // 오른쪽 아래 꼭짓점을 기준으로 팝업 위치 조정
                            let popupTop = boxRect.bottom + window.scrollY; // dataBox 아래쪽
                            let popupLeft = boxRect.right + window.scrollX; // dataBox 오른쪽

                            // 화면 경계를 넘어가지 않도록 조정
                            const viewportWidth = window.innerWidth;
                            const viewportHeight = window.innerHeight;

                            // 오른쪽 끝에서 나갈 경우
                            if (popupLeft + popupWidth > viewportWidth) {
                                popupLeft = boxRect.left + window.scrollX - popupWidth; // dataBox의 왼쪽으로 위치 조정
                                popupTop = boxRect.bottom + window.scrollY; // 아래쪽으로 유지
                            }

                            // 아래쪽 끝에서 나갈 경우
                            if (popupTop + popupHeight > viewportHeight) {
                                popupTop = boxRect.top + window.scrollY - popupHeight; // dataBox 위쪽으로 위치 조정
                            }

                            // 팝업 위치 설정
                            popup.style.top = `${popupTop}px`;
                            popup.style.left = `${popupLeft}px`;
                            popup.textContent = dataValue; // 팝업 내용 설정
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
    })
