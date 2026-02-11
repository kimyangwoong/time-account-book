# 🚀 시계부(Time Account Book) 빌드 및 배포 가이드

이 문서는 프로젝트의 안정적인 로컬 개발 환경 구축과 배포 과정을 기록한 가이드라인입니다.

---

## 🛠 1. 로컬 빌드 및 실행 방법

본 프로젝트는 순수 JavaScript(Vanilla JS)로 구성되어 별도의 번들링 빌드 과정은 없으나, **PWA 기능 및 Service Worker 확인을 위해 로컬 서버 실행이 필수적**입니다.

### 방법 A: VS Code Live Server (추천)
1. VS Code 확장 마켓플레이스에서 `Live Server` 설치.
2. 하단 상태 바의 `Go Live` 클릭 또는 `index.html` 우클릭 후 `Open with Live Server` 선택.
3. 브라우저에서 `http://127.0.0.1:5500`으로 자동 접속됩니다.

### 방법 B: Python Simple Server
터미널에서 아래 명령어를 실행하여 즉시 서버를 띄울 수 있습니다.
```powershell
python -m http.server 8000
```
접속 주소: `http://localhost:8000`

---

## ✅ 2. 현황 파악을 위한 로컬 빌드 체크리스트

배포 전, 로컬 환경에서 아래 5가지 항목을 반드시 체크해야 합니다.

1.  **[ ] PWA 설치 가능 여부**: 브라우저 주소창 우측에 '앱 설치' 아이콘(➕)이 뜨는지 확인.
2.  **[ ] Service Worker 상태**: Chrome 개발자 도구(F12) > Application > Service Workers에서 활성화(Running) 상태인지 확인.
3.  **[ ] 데이터 보존 테스트**: 할 일을 등록한 후 새로고침(F5) 시 `LocalStorage`를 통해 데이터가 유지되는지 확인.
4.  **[ ] 다크모드/레이아웃 모드 전환**: 테마 및 레이아웃 변경 시 끊김이나 스타일 깨짐이 없는지 확인.
5.  **[ ] 위젯 모드 작동**: 미니 버튼 클릭 시 부드럽게 위젯으로 전환되며, 시간이 실시간으로 동기화되는지 확인.

---

## 🚀 3. 배포 과정 (GitHub Pages)

현재 프로젝트는 GitHub와 연동되어 있습니다.

1.  **코드 변경사항 커밋**:
    ```powershell
    git add .
    git commit -m "상세 반영 내용 작성"
    ```
2.  **원격 저장소 푸시**:
    ```powershell
    git push origin main
    ```
3.  **실제 호스팅 설정**:
    - GitHub 저장소 > `Settings` > `Pages` 이동.
    - Build and deployment > Branch에서 `main` 브랜치 선택 후 `Save`.
    - 약 1~2분 뒤 생성된 `https://[username].github.io/time-account-book/` 주소로 접속 가능.

---

## ❗ 4. 실패 사례 및 예외 케이스 정리 (Troubleshooting)

### 케이스 1: PWA 설치 아이콘이 뜨지 않는 경우
*   **원인**: `manifest.json` 파일의 경로 오류 또는 필수 아이콘 미등록.
*   **해결**: `index.html` 상단의 `<link rel="manifest" href="manifest.json">` 경로를 재점검하고, `manifest.json` 내 `icons` 항목이 정확한지 확인하세요.

### 케이스 2: 수정 사항이 즉시 반영되지 않는 경우 (캐싱 문제)
*   **원인**: Service Worker가 이전 버전의 파일을 캐싱하고 있음.
*   **해결**: 브라우저 개발자 도구 > Application > Service Workers에서 `Update on reload` 체크를 활성화하거나, `Unregister` 후 다시 로드하세요.

### 케이스 3: Git Push 시 권한 오류 또는 충돌
*   **원인**: 원격 저장소와 로컬 저장소의 히스토리가 맞지 않음.
*   **해결**: `git pull origin main`으로 원격의 변경사항을 먼저 가져오거나, 인증 토큰(PAT) 만료 여부를 확인하세요.

---

> **기획자 메모**: 이 문서는 개발 과정에서 새로운 예외 케이스가 발견될 때마다 수시로 업데이트하여 프로젝트의 '지표'로 삼으시기 바랍니다.
