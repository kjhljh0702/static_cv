# MyHub — 이정훈 웹 CV

MyHub는 채용 담당자와 협업 파트너를 위한 단일 페이지 웹 CV입니다. 프레임워크나 빌드 도구 없이 HTML, CSS, Vanilla JavaScript로 동작하며, 모든 이력서 콘텐츠는 하나의 data.json에서 한글과 영어로 관리합니다. 선택형 3D 가상 포트폴리오는 저장소에 포함된 Three.js로 구동됩니다.

## 주요 기능

- 스크롤 애니메이션 기반 CV (anime.js v4, 로컬 vendor, 빌드 도구 없음)
- 한글/영어 전체 전환 및 마지막 선택 언어 저장 (`<html lang>`과 3D 월드까지 동기화)
- 헤더의 `3D` 버튼으로 싱글플레이어 3D 가상 포트폴리오 전환
- WASD·마우스로 모던 하우스형 연구 공간을 탐색하고 전시대에서 CV 섹션 열기
- Shift 달리기, Space 점프, 걷기 헤드밥, 모바일 전진 버튼 더블탭 달리기와 우측 점프 버튼
- 전시대별 스포트라이트가 접근할수록 밝아지고, 공기 중 먼지와 부드러운 그림자로 공간감 부여
- 뒤쪽 벽에 KCC 2026 우수발표논문상 상장을 액자로 전시
- 프로젝트 카드·상장 이미지 확대 보기(라이트박스)
- 860px 이하에서는 햄버거 메뉴와 단일 열 레이아웃
- `prefers-reduced-motion`을 존중해 모든 섹션을 정적으로 렌더링

> 참고: 새 CV는 다크 전용입니다. 이전 버전의 라이트 모드, 인쇄 스타일, 좌우 패널
> 독립 스크롤은 새 디자인에 포함되지 않았습니다. 원본은
> `_backup_original_2026-09-03/`에 보관되어 있습니다.

## 파일 구조

    .
    ├── index.html       # CV + 3D 월드를 함께 담는 단일 셸 (data-view로 전환)
    ├── assets/
    │   ├── css/style.css  # 스크롤 CV 디자인 시스템 (마지막에 로드되어 우선 적용)
    │   └── js/
    │       ├── main.js    # 스크롤 연출, 리빌, 라이트박스, 3D 전환
    │       └── render.js  # data.json -> DOM, 한/영 전환
    ├── style.css        # 3D 월드 UI 스타일 (기존 파일, 계속 사용)
    ├── metaverse.js     # Three.js 모던 연구 공간, 이동, 전시대 상호작용
    ├── script.js        # (미사용) 이전 정적 CV 렌더러 — 참고용으로만 남겨둠
    ├── data.json        # 한글/영어 CV 데이터
    ├── res/             # 프로필·프로젝트 이미지, KCC 2026 상장
    ├── vendor/
    │   ├── anime.esm.min.js    # anime.js v4.5.0 ES 모듈
    │   ├── three.module.min.js # 로컬 Three.js r184 ES 모듈
    │   ├── three.core.min.js   # Three.js 핵심 런타임 모듈
    │   └── LICENSE             # Three.js MIT 라이선스
    ├── _backup_original_2026-09-03/  # 교체 전 원본 스냅샷
    ├── .nojekyll        # GitHub Pages의 Jekyll 처리를 비활성화
    └── .gitignore

## 로컬 실행

data.json은 fetch()로 읽기 때문에 index.html을 파일로 직접 열지 말고 프로젝트 루트에서 로컬 서버를 실행해야 합니다.

    python3 -m http.server 8000

브라우저에서 http://localhost:8000/ 을 엽니다.

## data.json 편집 규칙

사용자에게 보이는 한글/영어 텍스트는 아래처럼 관리합니다.

    {
      "ko": "한글 텍스트",
      "en": "English text"
    }

기간, 이메일, 전화번호, URL, 이미지 경로, 평점처럼 언어와 무관한 값은 문자열 하나만 둡니다. 새 항목을 추가할 때 기존 항목과 같은 구조를 유지하면 script.js를 수정하지 않아도 자동으로 렌더링됩니다.

### 섹션별 필드 요약

| 섹션 | data.json 경로 | 주요 필드 |
| --- | --- | --- |
| 프로필 | profile | photo, name, displayName, headline, roles, details, contacts, affiliation, socials |
| 소개 | profile | introTitle, about, focusAreas |
| 학력 | education[] | start, end, degree, school, department, grade, description |
| 경력 | experience[] | start, end, organization, title, location, description |
| 프로젝트 | projects[] | category, start, end, organization, title, role, summary, highlights, skills, image, imageFit |
| 논문·지식재산 | publications[] | year, type, venue, title, authors |
| 수상 | awards[] | year, title, organization, description |
| 스킬 | skills[] | category, items |

### 값 작성 참고

- 현재 진행 중인 항목의 end는 present로 작성하면 언어에 따라 현재 또는 Present로 표시됩니다.
- 프로젝트 imageFit은 포스터/도식이면 contain, 일반 사진이면 cover를 권장합니다.
- 섹션 배열을 빈 배열([])로 만들면 해당 섹션과 내비게이션 링크가 함께 숨겨집니다.
- profile.about처럼 단일 텍스트가 비어 있어도 해당 섹션이 숨겨집니다.
- 새 프로젝트 이미지는 res 폴더에 넣고 data.json의 image에 상대 경로를 작성합니다.

## 콘텐츠 확인이 필요한 항목

LinkedIn 내보내기 텍스트와 사용자 제공 정보에서 확인된 학력, 소속, 경력, 연구 주제 및 연락처를 반영했습니다. 아래 값은 최초 시안 완성을 위한 예시이므로 공개 배포 전에 반드시 본인 정보로 확인하거나 교체하세요.

- 상세 주소
- 수상 내역
- 특허 아이디어의 공개 범위와 표기

## 디자인 관리

- 단일 액센트 컬러는 style.css의 --accent 값(#2563eb) 한 곳에서 관리합니다.
- Noto Sans KR을 첫 번째 글꼴로 지정하며 외부 폰트 요청은 하지 않습니다. 운영체제에 해당 글꼴이 없으면 한글 시스템 글꼴로 대체됩니다.
- Three.js r184는 vendor 폴더에서 로컬로 로드하므로 CDN이나 런타임 네트워크 요청이 없습니다. 라이선스는 vendor/LICENSE에서 확인할 수 있습니다.
- 제공된 SVG 와이어프레임의 헤더·프로필 패널·콘텐츠 패널 구조를 유지하되, 긴 연구 이력과 프로젝트 이미지를 읽기 쉽게 2열 데스크톱/1열 모바일 구조로 정리했습니다.

## 3D 가상 포트폴리오

- 상단 큐브 아이콘으로 기본 CV와 싱글플레이어 3D 모던 연구 공간을 전환합니다.
- 선택값은 myhub-view-mode 키로 localStorage에 저장됩니다.
- 탐험 시작을 누른 뒤 WASD 또는 방향키로 이동하고 마우스로 시점을 조절합니다.
- Shift를 누르면 달리고, Space로 점프합니다. 모바일에서는 전진 화살표를 더블탭해 달리기 모드를 켜고 우측 점프 버튼으로 점프합니다.
- 전시대에 접근해 E를 누르면 해당 CV 섹션이 열리며, R은 시작 위치로 돌아갑니다.
- 터치 환경에서는 화면 드래그, 하단 이동 버튼, 전진 버튼 더블탭 달리기 모드, 우측 점프·열기 버튼을 사용합니다.
- 모던 하우스 구조, 로봇 모형, 전시대 위치와 이동 로직은 metaverse.js에서 수정합니다.
- HUD, 터치 조작, 전시대 대화상자는 style.css의 world- 접두어 선택자에서 수정합니다.
- 모션 감소 설정에서는 장식 오브젝트의 유휴 애니메이션만 최소화하고 탐색 기능은 유지합니다.
- WebGL을 사용할 수 없는 브라우저에서는 3D 토글을 자동으로 숨기고 기본 CV 보기를 유지합니다.

## GitHub Pages 배포

1. 이 폴더를 GitHub 저장소의 기본 브랜치(main)에 커밋하고 푸시합니다.
2. 저장소 Settings → Pages로 이동합니다.
3. Source에서 Deploy from a branch를 선택합니다.
4. Branch는 main, 폴더는 /(root)를 선택하고 저장합니다.
5. 배포된 주소에서 data.json과 res 이미지가 정상 로드되는지 확인합니다.

별도 빌드 단계가 없으며 모든 경로가 상대 경로라 프로젝트 페이지와 사용자 페이지 모두에서 동작합니다.

## 배포 전 체크리스트

- 한글/영어에서 모든 제목과 본문 확인
- 새로고침 후 마지막 언어, 테마, 기본/3D 보기 유지 확인
- 3D 모던 연구 공간에서 WASD·마우스 이동, Shift 달리기, Space 점프, 모바일 전진 더블탭 달리기 모드·우측 점프, 시작 위치 초기화, 7개 전시대 열기 확인
- 768px 초과에서 프로필과 본문의 독립 스크롤 확인
- 768px 이하에서 햄버거 메뉴, 1열 레이아웃, 통합 페이지 스크롤 확인
- 프로젝트 6개 이미지 확대 확인
- 인쇄 미리보기에서 밝은 배경과 페이지 나눔 확인
- 예시 개인정보를 실제 공개용 정보로 교체

## 2026-09-03 변경 사항

정적 CV 페이지를 스크롤 애니메이션 버전으로 교체하고, 3D 월드를 함께 손봤습니다.
교체 전 원본은 `_backup_original_2026-09-03/`에 그대로 있습니다
(git 커밋 `8bc4e5f` 시점).

### 구조

`index.html`은 이전처럼 CV와 3D 월드를 모두 담은 단일 셸이고, `<html data-view>`로
전환합니다. 달라진 점은 클래식 뷰의 내용이 `script.js`가 아니라
`assets/js/*`가 렌더링한다는 것입니다. CV 영역은 `#cv-shell`로 감싸 두어
3D 뷰에서 통째로 숨겨집니다.

3D 월드는 `window.MyHubMetaverse` API(`setEnabled` / `setTheme` /
`setLanguage` / `openSection`)로 제어하며, CV의 언어 전환이 `<html lang>`과
월드 카피를 함께 갱신합니다.

### 전시대 콘텐츠

`metaverse.js`는 전시대를 열 때 CV 섹션 DOM을 복제합니다. 새 CV는 스크롤
애니메이션이라 아직 재생되지 않은 요소에 인라인 `opacity:0`, `transform`,
`clip-path`가 남아 있어서 복제하면 빈 패널이 됩니다. `sanitizeClone()`에서
이 인라인 애니메이션 상태를 제거하도록 했습니다.

또 전시대는 `#publications`, `#awards`처럼 섹션 id로 내용을 찾습니다. 새 CV는
연구/수상을 한 섹션에 두고 있었으므로 두 개의 섹션으로 분리했습니다.

### 3D 시각 개선

- 전시대마다 스포트라이트를 두고 거리에 따라 밝기를 올림 (접근하면 빛이 고임)
- `PCFSoftShadowMap` + 2048 섀도우맵으로 그림자 경계를 부드럽게
- 반대편 채움광 추가로 음영부가 완전히 검게 죽지 않도록 조정
- 천장을 들어 올리는 약한 웜 라이트 (바닥을 태우던 저광원 대체)
- 공기 중 먼지 170입자, 눈높이 위에서 천천히 표류
- 걷기 헤드밥 + 좌우 스웨이, 점프 중과 `prefers-reduced-motion`에서는 비활성
- 뒤쪽 벽에 상장 액자와 전용 픽처 라이트

### 데이터 정정

`data.json`의 수상 항목이 사실과 달라 실제 상장 기준으로 교체했습니다.

- 우수발표논문상 · 제26-791호
- 2026 한국컴퓨터종합학술대회 (KCC 2026), '프로그래밍언어' 분야
- 한국정보과학회, 2026년 7월 31일

같은 논문의 `publications` 항목도 연구실 포스터에서 KCC 2026으로 정정하고
수상 배지를 붙였습니다. 상장 이미지는 `res/award-kcc-2026.jpeg`입니다.
