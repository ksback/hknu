const csvUrl = 'https://raw.githubusercontent.com/ksback/hknu/refs/heads/main/hknu1014.csv'; // 실제 URL 입력

// 색상 설정
const colorMap = {
    PR: '#3DAAE1',
    SC: '#F66B66',
    ST: '#ED832F',
    MA: '#00A79E',
    FA: '#F4D353',
    ET: '#0C3274'
};

let arrayData; 
let headers;

const imageCache = {}; // 이미지 캐시 객체
const imagePaths = [
    'img/2007/PR1.jpg',
    'img/2007/PR2.jpg',
    // 모든 필요한 이미지 경로 추가
];

function preloadImages() {
    imagePaths.forEach((path) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            imageCache[path] = img; // 로드된 이미지를 캐시에 저장
        };
        img.onerror = () => {
            console.log(`Failed to load image: ${path}`); // 로드 실패 시 로그
        };
    });
}

// 페이지가 완전히 로드된 후 이미지 프리로드
window.onload = () => {
    preloadImages();
};

// 이미지가 필요한 경우 캐시에서 가져오기
function getImage(path) {
    return imageCache[path] || null; // 캐시에서 이미지 반환
}


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
        arrayData = rows.filter(row => row.length > 1); 
        headers = arrayData[0];

        console.log(arrayData);

        // 헤더와 인덱스 설정, 년도는 0, 교명은 1
        const yearIndex = headers.indexOf('년도');
        const schoolIndex = headers.indexOf('교명');

        // 연도 목록 생성
        const years = arrayData.slice(1).map(row => row[yearIndex]).filter(year => year); 

        // 카테고리 목록 생성 (중복 제거)
        const categorySet = new Set(headers.slice(2)); 

        // contentDiv 가져오기
        const contentDiv = document.getElementById('content');
        contentDiv.innerHTML = ''; // #content를 비우기

        // 각 연도에 대해 yearDataBox 생성
        years.forEach((year, index) => {
            const yearDataBox = document.createElement('div');
            yearDataBox.id = year; 
            yearDataBox.className = 'yearDataBox'; 
            yearDataBox.style.width = '22px'; // yearDataBox 너비를 20px로 설정
            contentDiv.appendChild(yearDataBox);

            // 첫 번째 dataBox 생성: 연도
            const yearBox = document.createElement('div');
            yearBox.className = 'dataBox yan'; 
            yearBox.id = year; 
            yearBox.textContent = year; 
            yearBox.style.width = '22px'; // yearBox 너비를 20px로 설정
            yearBox.style.color = 'white';
            yearBox.style.backgroundColor = '#717171';
            yearDataBox.appendChild(yearBox);

            // 두 번째 dataBox 생성: 교명
            const schoolName = arrayData[index + 1][schoolIndex]; 
            const schoolBox = document.createElement('div');
            schoolBox.className = 'dataBox yan'; 
            schoolBox.id = schoolName; 
            schoolBox.style.width = '22px'; // schoolBox 너비를 20px로 설정
            yearDataBox.appendChild(schoolBox); 

            // 카테고리별 데이터 박스 생성
            categorySet.forEach(category => {
                const dataBox = document.createElement('div');
                dataBox.className = 'dataBox'; 
                dataBox.id = `${category}`; 
                dataBox.style.width = '22px'; // dataBox 너비를 20px로 설정

                // 해당 행의 데이터 확인
                const dataValue = arrayData[index + 1][headers.indexOf(category)]; 
                if (dataValue && dataValue.toLowerCase() !== 'null') {
                    dataBox.style.backgroundColor = colorMap[category.slice(0, 2)] || 'transparent'; // 색상 설정

                    // 팝업 생성 및 이벤트 추가
                    dataBox.addEventListener('mouseover', () => {
                        createPopup(dataBox.id, dataBox, arrayData, headers);
                    });
                    dataBox.addEventListener('mouseout', () => {
                        const popup = document.querySelector('.popup');
                        if (popup) {
                            popup.remove(); // 팝업 제거
                        }
                    });
                }
                yearDataBox.appendChild(dataBox); // yearDataBox에 추가
            });

            // 각 dataBox의 높이를 20px로 설정
            const dataBoxes = yearDataBox.querySelectorAll('.dataBox');
            dataBoxes.forEach(box => {
                box.style.height = '20px'; // 높이를 20px로 설정
            });
        });

        // 반응형 처리 제거
    });

function createPopup(dataBoxId, dataBox, arrayData, headers) {
    // 네 번째 단계에서 팝업 생성하지 않기
    if (zoomLevel >= 4) {
        return; // 네 번째 단계일 경우 함수 종료
    }

    // 이전 팝업 제거
    const existingPopup = document.querySelector('.popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    const popup = document.createElement('div');
    popup.className = 'popup'; // CSS에서 설정한 클래스

    // 팝업을 DOM에 추가하여 높이를 계산할 수 있도록 함
    document.body.appendChild(popup);
    
    // dataBox 위치
    const rect = dataBox.getBoundingClientRect();
    const contentRect = document.getElementById('content').getBoundingClientRect(); // content의 위치와 크기

    
    // 기본 위치 설정 (dataBox의 오른쪽 아래 모서리와 팝업의 왼쪽 위 모서리가 맞닿게)
    popup.style.left = `${rect.right}px`; // 오른쪽 모서리
    popup.style.top = `${rect.bottom}px`;  // 아래쪽 모서리


    // 팝업이 추가된 후, 팝업의 실제 너비와 높이를 계산
    const popupWidth = popup.offsetWidth;
    const popupHeight = popup.offsetHeight;

    // 팝업이 오른쪽을 벗어나는 경우 (왼쪽 아래 모서리와 팝업의 오른쪽 위 모서리 맞닿게)
    if (rect.right + popupWidth > contentRect.right) {
        popup.style.left = `${rect.left - popupWidth - contentRect.left}px`; // 왼쪽으로 이동
        popup.style.top = `${rect.bottom}px`;  // 아래쪽 모서리
    }

    // 팝업이 아래쪽을 벗어나는 경우 (오른쪽 위 모서리와 팝업의 왼쪽 아래 모서리 맞닿게)
    //if (rect.bottom + popupHeight + 200 > contentRect.bottom) {
    //    popup.style.left = `${rect.right - contentRect.left}px`; // 오른쪽 모서리
    //    popup.style.top = `${rect.top - popupHeight*5}px`;  // 위쪽으로 이동
    //}

    // 팝업이 오른쪽과 아래쪽을 동시에 벗어나는 경우 (왼쪽 위 모서리와 팝업의 오른쪽 아래 모서리 맞닿게)
    if (rect.right + popupWidth > contentRect.right && rect.bottom + popupHeight > contentRect.bottom) {
        popup.style.left = `${rect.left - popupWidth - contentRect.left}px`; // 왼쪽으로 이동
        popup.style.top = `${rect.top - popupHeight - contentRect.top}px`;  // 위쪽으로 이동
    }

    // dataBox ID로 해당 열 인덱스 찾기
    let columnIndex = -1;
    for (let j = 2; j < arrayData[0].length; j++) { // 0행의 3열부터 끝까지
        if (arrayData[0][j] === dataBoxId) {
            columnIndex = j;
            break;
        }
    }

    // ID가 없을 경우
    if (columnIndex === -1) {
        popup.innerHTML = '<strong>No data available</strong>'; // 데이터 없을 때 표시
        return popup;
    }
    
    // yearDataBox의 ID를 가져와서 연도 찾기
    const year = dataBox.closest('.yearDataBox').id;
    
    // 팝업에 연도 데이터 추가
    let popupContent = '';
    for (let i = 1; i < arrayData.length; i++) { // 1행부터 시작 (헤더 제외)
        if (arrayData[i][0] === year) { // 0열에서 연도 확인
            const title = arrayData[i][columnIndex];   // 해당 열의 데이터 가져오기
            const date = arrayData[i][columnIndex + 1]; // 다음 열의 데이터 가져오기
            const content = arrayData[i][columnIndex + 2]; // 다음 열의 데이터 가져오기

            // 팝업 내용 추가
            popupContent += `
                <div class="popupTitle">${title}</div>
                <div class="popupDate">${date}</div>
                <div class="popupContent">${content}</div>
            `;

            // 이미지 경로
            const imagePath = `img/${year}/${dataBoxId}.jpg`;
            const imagePathJpeg = `img/${year}/${dataBoxId}.jpeg`;
            const imagePathPng = `img/${year}/${dataBoxId}.png`;

            // 이미지 추가
            const img = new Image();
            img.src = imagePath; // 기본 이미지 경로

            // 이미지가 로드되면 팝업 내용에 추가
            img.onload = () => {
                popupContent += `<img src="${img.src}" alt="${dataBoxId} 이미지">`;
                popup.innerHTML = popupContent; // 이미지가 추가된 후 팝업 내용 업데이트
            };            

            img.onerror = () => {
                img.src = imagePathJpeg; // jpeg 시도
                img.onload = () => {
                    popupContent += `<img src="${img.src}" alt="${dataBoxId} 이미지">`;
                    popup.innerHTML = popupContent; // 업데이트
                };

                img.onerror = () => {
                    img.src = imagePathPng; // png 시도
                    img.onload = () => {
                        popupContent += `<img src="${img.src}" alt="${dataBoxId} 이미지">`;
                        popup.innerHTML = popupContent; // 업데이트
                    };

                    img.onerror = () => {
                        // 모든 이미지가 없을 경우 아무것도 하지 않음
                        console.log(`No image found for ${dataBoxId}`);
                    };
                };
            };

            break; // 특정 연도에서 첫 번째 데이터만 가져오고 종료
        }
    }
    // 팝업 내용 설정
    popup.innerHTML = popupContent || '<strong>No data available</strong>'; // 데이터 없을 때 표시

    // 최종 팝업 추가
    document.body.appendChild(popup); // 팝업을 body에 추가
    return popup;
}


let zoomLevel = 1; // 기본 줌 레벨

document.addEventListener('wheel', (event) => {
    if (event.deltaY < 0 && zoomLevel < 4) {
        // 휠을 위로 -> 확대
        zoomLevel++;
        if (zoomLevel === 2) {
            zoomIn();
        } else if (zoomLevel === 3) {
            zoomThirdLevel(); // 3단계로 확대
        } else if (zoomLevel === 4) {
            zoomFourthLevel(); // 4단계로 확대
        }
        switchToZoomLevel(zoomLevel); // 단계 전환 처리
    } else if (event.deltaY > 0 && zoomLevel > 1) {
        // 휠을 아래로 -> 축소
        if (zoomLevel === 4) {
            undoZoomFourthLevel(); // 4단계에서 3단계로 축소
        } else if (zoomLevel === 3) {
            undoZoomThirdLevel(); // 3단계에서 2단계로 축소
        } else if (zoomLevel === 2) {
            zoomOut(); // 2단계에서 1단계로 축소
        }
        zoomLevel--;
        switchToZoomLevel(zoomLevel); // 단계 전환 처리
    }
});

function zoomIn() {
    const dataBoxes = document.querySelectorAll('.dataBox, .yearBox, .schoolBox, .yearDataBox');
    const contentDiv = document.getElementById('content');

    dataBoxes.forEach(box => {
        const id = box.id; // databox의 id
        const yearDataBox = box.closest('.yearDataBox');
        const yearIndex = yearDataBox ? Array.from(yearDataBox.parentNode.children).indexOf(yearDataBox) : null; // 연도 인덱스
        let text = '';

        if (yearIndex !== null && arrayData) {
            const escapedId = id.replace(/([()])/g, '\\$1'); // 괄호 이스케이프
            const dataValue = arrayData[yearIndex + 1][headers.indexOf(escapedId)]; // 연도와 id를 사용해 데이터 가져오기

            if (dataValue && dataValue.toLowerCase() !== 'null') {
                text = dataValue; // 데이터가 유효하면 텍스트로 설정
            } else {
                const popupTitle = document.querySelector(`#popup-${escapedId} .popuptitle`);
                if (popupTitle) {
                    text = popupTitle.textContent; // 팝업의 제목 가져오기
                }
            }

            // 텍스트가 존재할 때만 추가
            if (text) {
                const existingText = box.querySelector('.dataBoxText');
                if (!existingText) {
                    const textElement = document.createElement('span');
                    textElement.classList.add('dataBoxText');
                    textElement.textContent = text;
                    box.appendChild(textElement);
                }
            }
        }

        // 너비 변경
        box.style.transition = 'width 0.5s ease'; // 자연스러운 애니메이션
        box.style.width = `${box.offsetWidth * 8}px`; // 6배로 확대
    });

    contentDiv.classList.add('zoomed');

    // yan 클래스의 모든 요소 폰트 크기 변경
    const yanElements = document.querySelectorAll('.yan');
    yanElements.forEach(yan => {
        yan.style.fontSize = '12px'; // 폰트 크기를 12px로 설정
    });
}


function zoomOut() {
    const dataBoxes = document.querySelectorAll('.dataBox, .yearBox, .schoolBox, .yearDataBox');
    const contentDiv = document.getElementById('content');
    
    // 데이터 박스들의 width 값을 1단계로 축소
    dataBoxes.forEach(box => {
        box.style.transition = 'width 0.5s ease'; // 자연스러운 애니메이션
        box.style.width = `${box.offsetWidth / 8}px`; // 원래 크기로 축소

        // 추가된 텍스트 요소 삭제
        const textElement = box.querySelector('.dataBoxText');
        if (textElement) {
            textElement.remove(); // remove() 메서드 사용
        }
    });

    contentDiv.classList.remove('zoomed');

    // yan 클래스를 가진 모든 요소 선택
    const yanElements = document.querySelectorAll('.yan');
    yanElements.forEach(yan => {
        yan.style.fontSize = '8px'; // 폰트 크기를 8px로 설정
    });
}

function zoomThirdLevel() {
    const yearBoxes = document.querySelectorAll('.yearDataBox');
    yearBoxes.forEach((yearBox) => {
        const categories = ['PR', 'SC', 'ST', 'MA', 'FA', 'ET'];

        // 첫 번째 스크롤: yearDataBox와 schoolBox의 width를 2배로 늘리기
        yearBox.classList.add('transition');
        yearBox.style.width = `${yearBox.offsetWidth * 2}px`;

        const schoolBoxes = yearBox.querySelectorAll('.yan');
        schoolBoxes.forEach(schoolBox => {
            schoolBox.style.width = `${schoolBox.offsetWidth * 2}px`;
        });

        categories.forEach((category) => {
            // 카테고리별로 2~7번째 박스를 대상으로 함
            for (let i = 2; i <= 7; i++) { 
                const box = yearBox.querySelector(`#${category}${i}`);
                
                if (box) {
                    box.style.transition = 'width 0.5s ease';
                    box.style.width = `${box.offsetWidth * 2}px`;
                }
            }
            // 카테고리별 1번째 박스를 선택하여 고정 높이 설정
            const firstBox = yearBox.querySelector(`#${category}1`); // 카테고리별 첫 번째 박스 선택
            if (firstBox) {
                firstBox.style.transition = 'width 0.5s ease';
                firstBox.style.width = `${firstBox.offsetWidth * 2}px`; // width를 2배로 설정
            }    
        });
    });
}

function undoZoomThirdLevel() {
    const yearBoxes = document.querySelectorAll('.yearDataBox'); // 모든 년도 그룹을 선택

    yearBoxes.forEach((yearBox) => {
        const categories = ['PR', 'SC', 'ST', 'MA', 'FA', 'ET'];

        // yearDataBox, schoolBox, yearBox의 width를 원래 값으로 되돌리기
        yearBox.classList.add('transition'); // 클래스 추가
        yearBox.style.width = `${yearBox.offsetWidth / 2}px`; // yearDataBox의 width를 원래 값으로 설정

        const schoolBoxes = yearBox.querySelectorAll('.yan');

        schoolBoxes.forEach(schoolBox => {
            schoolBox.style.width = `${schoolBox.offsetWidth / 2}px`; // schoolBox의 width를 원래 값으로 설정
        });     


        categories.forEach((category) => {
            // 카테고리별로 2~7번째 박스를 대상으로 함
            for (let i = 2; i <= 7; i++) {
                const box = yearBox.querySelector(`#${category}${i}`);
                
                if (box) {
                    box.style.transition = 'width 0.5s ease';
                    box.style.width = `${box.offsetWidth / 2}px`;
                }
            }

            // 카테고리별 1번째 박스를 선택하여 높이 조정
            const firstBox = yearBox.querySelector(`#${category}1`); // 카테고리별 첫 번째 박스 선택
            if (firstBox) {
                firstBox.style.transition = 'width 0.5s ease';
                firstBox.style.width = `${firstBox.offsetWidth / 2}px`; // width를 원래 값으로 설정
            }
        });
    });
}

function zoomFourthLevel() {
    const yearBoxes = document.querySelectorAll('.yearDataBox');
    yearBoxes.forEach((yearBox) => {
        const categories = ['PR', 'SC', 'ST', 'MA', 'FA', 'ET'];

        categories.forEach((category) => {
            // 카테고리별로 2~7번째 박스의 높이 줄이기
            for (let i = 2; i <= 7; i++) { 
                const box = yearBox.querySelector(`#${category}${i}`);
                
                if (box) {
                    box.style.transition = 'height 0.5s ease'; // 자연스러운 애니메이션
                    box.style.height = '0px'; // 높이를 0으로 설정하여 서서히 사라지게 만듦
                    box.style.overflow = 'hidden'; // 높이를 줄일 때 텍스트가 넘치지 않도록 설정
                    box.style.border = '0px';
                }
            }
            // 카테고리별 1번째 박스를 선택하여 고정 높이 설정
            const firstBox = yearBox.querySelector(`#${category}1`); // 카테고리별 첫 번째 박스 선택
            if (firstBox) {
                firstBox.style.height = '20px'; // 고정된 높이로 설정 (원하는 높이로 수정 가능)
                firstBox.style.transition = 'height 0.5s ease';

                // 데이터 박스 텍스트의 폰트 사이즈 변경
                const dataBoxText = yearBox.querySelectorAll('.dataBoxText');
                dataBoxText.forEach(textElement => {
                    textElement.style.fontSize = '14px'; // 원하는 폰트 사이즈로 변경
                });

                // contentBox 생성
                const contentBox = document.createElement('div');
                contentBox.classList.add('contentBox');

                // contentTextBox 생성
                const contentTextBox = document.createElement('div');
                contentTextBox.classList.add('contentTextBox');

                // 날짜 텍스트 박스 생성
                const contentTextDate = document.createElement('div');
                contentTextDate.classList.add('contentTextDate');

                // 내용 텍스트 박스 생성
                const contentTextContent = document.createElement('div');
                contentTextContent.classList.add('contentTextContent');


                // contentImgBox 생성
                const contentImgBox = document.createElement('div');
                contentImgBox.classList.add('contentImgBox');


                
                // 데이터 박스의 id를 사용하여 배열 내 데이터를 검색
                const dataBoxId = `${category}1`;
                let columnIndex = headers.indexOf(dataBoxId); // 해당 카테고리의 열 인덱스 찾기

                if (columnIndex === -1) {
                    console.log(`Column index for ${dataBoxId} not found.`);
                    return; // 해당 ID가 없으면 처리 중단
                }

                for (let i = 1; i < arrayData.length; i++) { // 1행부터 시작 (헤더 제외)
                    if (arrayData[i][0] === yearBox.id) { // 연도 확인
                        const date = arrayData[i][columnIndex + 1]; // 다음 열의 데이터 (date)
                        const content = arrayData[i][columnIndex + 2]; // 다음 열의 데이터 (content)

                        // null 체크 및 텍스트 설정
                        if (date && content && content.toLowerCase() !== 'null') {
                            contentTextDate.textContent = date; 
                            contentTextContent.textContent = content; 
                        }
                        const dataBoxId = `${category}1`;
                        const imagePath = `img/${yearBox.id}/${dataBoxId}.jpg`;
                        const imagePathJpeg = `img/${yearBox.id}/${dataBoxId}.jpeg`;
                        const imagePathPng = `img/${yearBox.id}/${dataBoxId}.png`;
            
                        // 이미지 프리로드
                        preloadImages([imagePath, imagePathJpeg, imagePathPng]);
            
                        // 나중에 이미지 사용
                        const img = new Image();
                        img.src = imagePath; // 기본 이미지 경로
            

                        img.onload = () => {
                            contentImgBox.appendChild(img);
                        };

                        img.onerror = () => {
                            img.src = `img/${yearBox.id}/${dataBoxId}.jpeg`; // jpeg 시도
                            img.onload = () => {
                                contentImgBox.appendChild(img);
                            };
                        
                            img.onerror = () => {
                                img.src = `img/${yearBox.id}/${dataBoxId}.png`; // png 시도
                                img.onload = () => {
                                    contentImgBox.appendChild(img);
                                };
                            };
                        };

                        break; // 첫 번째 일치하는 데이터만 처리
                    }
                }

                // contentTextBox에 날짜와 내용 추가
                contentTextBox.appendChild(contentTextDate);
                contentTextBox.appendChild(contentTextContent);

                // contentBox에 textBox와 imgBox 추가
                contentBox.appendChild(contentTextBox);
                contentBox.appendChild(contentImgBox);

                // 새로운 박스들을 firstBox의 부모 요소에 추가
                const parent = firstBox.parentNode; // firstBox의 부모 요소 선택
                parent.insertBefore(contentBox, firstBox.nextSibling); // firstBox 다음에 contentBox 추가
            }
        });
    });
}

function undoZoomFourthLevel() {
    const yearBoxes = document.querySelectorAll('.yearDataBox');
    yearBoxes.forEach((yearBox) => {
        const categories = ['PR', 'SC', 'ST', 'MA', 'FA', 'ET'];

        categories.forEach((category) => {
            // 카테고리별로 2~7번째 박스의 높이를 되돌리기
            for (let i = 2; i <= 7; i++) {
                const box = yearBox.querySelector(`#${category}${i}`);
                
                if (box) {
                    box.style.transition = 'height 0.5s ease';
                    box.style.height = '20px'; // 원래 높이로 복구
                    box.style.overflow = 'visible';
                    box.style.border = '0.5px solid rgba(123, 123, 123, 0.1)';
                }
            }

            // 카테고리별로 모든 contentBox를 선택하여 제거
            const contentBoxes = yearBox.querySelectorAll('.contentBox'); // 모든 contentBox 선택
            
            contentBoxes.forEach((contentBox) => {
                contentBox.style.transition = 'height 0.5s ease';
                contentBox.style.height = '0px'; // 높이를 0으로 줄임

                // 높이를 줄이는 애니메이션이 끝난 후 제거
                contentBox.addEventListener('transitionend', () => {
                    contentBox.remove(); // 애니메이션이 끝난 후 contentBox 제거
                }, { once: true });
            });

            // 카테고리별 1번째 박스의 높이도 원래 높이로 복구
            const firstBox = yearBox.querySelector(`#${category}1`);
            if (firstBox) {
                firstBox.style.transition = 'height 0.5s ease';
                firstBox.style.height = '20px'; // 원래 높이로 복구
            }
        });
    });
}


let isMouseDown = false; // 마우스 클릭 여부 확인
let startX, scrollLeft; // 시작 위치와 스크롤 값 저장

function enableGrabScroll() {
    const content = document.getElementById('content');

    // 마우스 누르기
    content.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        content.classList.add('grabbing');
        startX = e.pageX - content.offsetLeft;
        scrollLeft = content.scrollLeft;
    });

    // 마우스 움직임
    content.addEventListener('mousemove', (e) => {
        if (!isMouseDown) return;
        e.preventDefault();
        const x = e.pageX - content.offsetLeft;
        const walk = (x - startX); // 마우스 이동량 계산
        content.scrollLeft = scrollLeft - walk; // 스크롤 이동
    });

    // 마우스 떼기
    content.addEventListener('mouseup', () => {
        isMouseDown = false;
        content.classList.remove('grabbing');
    });

    content.addEventListener('mouseleave', () => {
        isMouseDown = false;
        content.classList.remove('grabbing');
    });
}

// 초기 실행 시 그랩 스크롤 활성화
document.addEventListener('DOMContentLoaded', () => {
    enableGrabScroll();
});

// 단계 전환 함수
function switchToZoomLevel(zoomLevel) {
    const content = document.getElementById('content');
    
    if (zoomLevel === 1) {
        content.style.overflowX = 'hidden'; // 1단계: 스크롤 비활성화
        content.classList.remove('grab'); // 그랩 모드 해제
        isGrabMode = false;
    } else if (zoomLevel === 2) {
        content.style.overflowX = 'auto'; // 2단계: 스크롤 활성화
        content.classList.add('grab'); // 그랩 모드 활성화
        isGrabMode = true;
    }
}

