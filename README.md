# MyHub — 이정훈 웹 CV

MyHub는 채용 담당자와 협업 파트너를 위한 단일 페이지 웹 CV입니다. 프레임워크나 빌드 도구 없이 HTML, CSS, Vanilla JavaScript로 동작하며, 모든 이력서 콘텐츠는 하나의 data.json에서 한글과 영어로 관리합니다. 선택형 3D 가상 포트폴리오는 저장소에 포함된 Three.js로 구동됩니다.

## 주요 기능

- 한글/영어 전체 전환 및 마지막 선택 언어 저장
- 라이트 모드 기본, 다크 모드 전환 및 선택값 저장
- 기본 CV/싱글플레이어 3D 가상 포트폴리오 전환 및 선택값 저장
- WASD·마우스로 가상 연구실을 탐색하고 전시대에서 CV 섹션 열기
- 데스크톱에서 프로필 패널과 본문 패널을 각각 독립적으로 스크롤
- 768px 이하에서는 자연스러운 단일 페이지 스크롤과 1열 레이아웃
- 모바일 햄버거 내비게이션과 앵커 기반 스크롤
- 브라우저 인쇄 기능 및 다크 모드에서도 라이트 모드 기반 인쇄 스타일
- 프로젝트 이미지 확대 보기
- 비어 있는 배열이나 텍스트에 대응한 섹션 자동 숨김
- 최초 로드 때 data.json을 한 번만 요청하고, 언어 전환 때 캐시 데이터로 재렌더링

## 파일 구조

    .
    ├── index.html       # 고정 마크업, 헤더, 컨트롤, 렌더링 대상
    ├── style.css        # 라이트/다크/3D 연구실, 독립 스크롤, 반응형, 인쇄 스타일
    ├── script.js        # JSON 로드, 렌더러, 언어/테마/메뉴/갤러리 동작
    ├── metaverse.js     # Three.js 가상 연구실, 이동, 전시대 상호작용
    ├── data.json        # 한글/영어 CV 데이터
    ├── res/             # 프로필 및 프로젝트 이미지
    ├── vendor/
    │   ├── three.module.min.js # 로컬 Three.js r184 ES 모듈
    │   ├── three.core.min.js   # Three.js 핵심 런타임 모듈
    │   └── LICENSE             # Three.js MIT 라이선스
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

- 상단 큐브 아이콘으로 기본 CV와 싱글플레이어 3D 가상 연구실을 전환합니다.
- 선택값은 myhub-view-mode 키로 localStorage에 저장됩니다.
- 탐험 시작을 누른 뒤 WASD 또는 방향키로 이동하고 마우스로 시점을 조절합니다.
- 전시대에 접근해 E를 누르면 해당 CV 섹션이 열리며, R은 시작 위치로 돌아갑니다.
- 터치 환경에서는 화면 드래그와 하단 이동·열기 버튼을 사용합니다.
- 연구실 구조, 로봇 모형, 전시대 위치와 이동 로직은 metaverse.js에서 수정합니다.
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
- 3D 연구실에서 WASD·마우스 이동, 시작 위치 초기화, 7개 전시대 열기 확인
- 768px 초과에서 프로필과 본문의 독립 스크롤 확인
- 768px 이하에서 햄버거 메뉴, 1열 레이아웃, 통합 페이지 스크롤 확인
- 프로젝트 6개 이미지 확대 확인
- 인쇄 미리보기에서 밝은 배경과 페이지 나눔 확인
- 예시 개인정보를 실제 공개용 정보로 교체
