# MyHub — 정적 CV 사이트 PRD

> PRD = Product Requirements Document (제품 요구사항 정의서)

| 항목 | 내용 |
|---|---|
| 문서 ID | `PRD-MYHUB-001` |
| 버전 | v1.1 |
| 작성일 | 2026-08-10 |
| 상태 | 구현 완료 |
| 작성자 | 이정훈 |
| 저장소 | [kjhljh0702/static_cv](https://github.com/kjhljh0702/static_cv) |

## 1. 개요

**배경.** 채용 담당자와 협업 파트너가 이정훈의 연구·개발 역량을 한·영으로 빠르게 확인할 공개 CV가 필요하다.

**목적.** 서버·빌드 과정 없는 단일 페이지 CV를 제공하고 `data.json`만으로 콘텐츠를 관리한다. 기본 CV와 탐색형 3D 가상 포트폴리오를 함께 지원한다.

**대상 사용자.** (1) 채용 담당자, (2) 연구·산학 협업 파트너, (3) CV 소유자·관리자.

## 2. 범위

**In Scope**

- 8개 CV 섹션의 한·영 표시와 JSON 기반 관리
- 반응형 앵커 이동, 독립 스크롤, 언어·테마 전환, 3D 연구실 탐색·전시대, 이미지 확대, 인쇄
- 로컬 정적 실행과 GitHub Pages 배포

**Out of Scope**

- 관리자 화면, 서버·DB·로그인, 지원서 제출, 분석, 자동 번역
- 3D 아바타·멀티플레이·VR/XR·사용자 생성 공간

## 3. 정보 구조 — 섹션 ID

| ID | 섹션 | 앵커/경로 | 데이터 소스 | 데이터 없을 때 |
|---|---|---|---|---|
| SEC-01 | 프로필 패널 | `#top`, `#profile-panel` | `profile` | 필수 영역 |
| SEC-02 | 소개 | `#about` | `profile.about`, `introTitle`, `focusAreas` | 섹션·내비게이션 숨김 |
| SEC-03 | 학력 | `#education` | `education[]` | 동일 |
| SEC-04 | 경력 | `#experience` | `experience[]` | 동일 |
| SEC-05 | 프로젝트 | `#projects` | `projects[]` | 동일 |
| SEC-06 | 논문·지식재산 | `#publications` | `publications[]` | 동일 |
| SEC-07 | 수상 | `#awards` | `awards[]` | 동일 |
| SEC-08 | 스킬 | `#skills` | `skills[]` | 동일 |

## 4. 데이터 스키마 (`data.json`)

노출 텍스트는 `{ "ko": "...", "en": "..." }`, 날짜·이메일·URL·경로는 단일 값으로 저장한다.

| 키 | 주요 필드 |
|---|---|
| `profile` | `photo`, `name`, `displayName`, `headline`, `roles`, `introTitle`, `about`, `focusAreas`, `details`, `contacts`, `affiliation`, `socials` |
| `education[]` | `start`, `end`, `degree`, `school`, `department`, `grade?`, `description` |
| `experience[]` | `start`, `end`, `organization`, `title`, `location`, `description` |
| `projects[]` | `category`, `start`, `end`, `organization`, `title`, `role`, `summary`, `highlights`, `skills`, `image`, `imageFit` |
| `publications[]` | `year`, `type`, `venue`, `title`, `authors` |
| `awards[]` | `year`, `title`, `organization`, `description` |
| `skills[]` | `category`, `items` |

`end: "present"`는 현재/Present로 표시한다. 선택 필드·빈 배열은 생략하고 `image`는 `res/` 상대경로를 쓴다.

## 5. 요구사항 명세

### 5.1 기술 요구사항 (TR)

| ID | 요구사항 | 상태 |
|---|---|---|
| TR-01 | 빌드 도구 없이 HTML·CSS·Vanilla JS를 파일별로 분리한다. | 완료 |
| TR-02 | Three.js r184는 저장소의 ES 모듈로만 로드하며 CDN을 쓰지 않는다. | 완료 |
| TR-03 | `fetch("data.json")` 상대경로, 768px 반응형 CSS, 라이트 인쇄 CSS를 사용한다. | 완료 |

### 5.2 데이터 요구사항 (DR)

| ID | 요구사항 | 상태 |
|---|---|---|
| DR-01 | CV와 한·영 텍스트를 하나의 `data.json`에서 관리한다. | 완료 |
| DR-02 | 텍스트는 `ko/en` 객체, 언어 독립 값은 단일 값으로 저장한다. | 완료 |
| DR-03 | JSON은 1회 요청·캐시하며 고정 렌더러가 빈 섹션과 내비게이션을 숨긴다. | 완료 |

### 5.3 UI/UX 요구사항 (UR)

| ID | 요구사항 | 상태 |
|---|---|---|
| UR-01 | 고정 헤더·프로필·콘텐츠 패널로 구성하며 푸터는 두지 않는다. | 완료 |
| UR-02 | 라이트 기본, 무채색 표면, 액센트 `#2563eb`, Noto Sans KR, 무그라데이션을 적용한다. | 완료 |
| UR-03 | 데스크톱은 두 패널 독립 스크롤, 모바일은 1열 통합 스크롤·좌측 햄버거를 쓴다. | 완료 |
| UR-04 | 인쇄·3D·테마·언어 버튼을 우측에 두고 SVG 아이콘과 접근 가능한 이름을 제공한다. | 완료 |
| UR-05 | 3D 연구실은 로봇 모형·전시대·HUD를 포함하고 모션 감소 및 터치 조작을 지원한다. | 완료 |

### 5.4 기능 요구사항 (FR)

| ID | 요구사항 | 상태 |
|---|---|---|
| FR-01 | 문서 제목은 `이름 CV`, 헤더는 한글·영문 이름으로 표시한다. | 완료 |
| FR-02 | 전체 한·영, 라이트/다크, 기본 CV/3D 연구실 전환값을 `localStorage`에 저장한다. | 완료 |
| FR-03 | WebGL 실패 시 3D 버튼을 숨기고 기본 CV를 유지한다. | 완료 |
| FR-04 | 3D 연구실에서 WASD·마우스 또는 터치로 이동하고 7개 전시대에서 CV 섹션을 연다. | 완료 |
| FR-05 | 섹션 앵커 이동·현재 섹션 표시와 모바일 메뉴를 제공한다. | 완료 |
| FR-06 | 전체 CV를 라이트 모드로 인쇄하고 프로젝트 이미지 확대·로드 오류 안내를 제공한다. | 완료 |

### 5.5 배포 요구사항 (DPR)

| ID | 요구사항 | 상태 |
|---|---|---|
| DPR-01 | GitHub Pages `main` 루트에서 빌드 없이 배포하며 상대경로와 `.nojekyll`을 쓴다. | 완료 |
| DPR-02 | 로컬 서버에서 렌더링·언어·테마·3D 이동·전시대·인쇄·반응형을 검증한다. | 완료 |
| DPR-03 | 편집·필드·배포 방법과 Three.js 라이선스를 저장소에 문서화한다. | 완료 |

## 6. 비기능 요구사항 (NFR)

| ID | 요구사항 |
|---|---|
| NFR-01 | **성능:** 데이터 1회 요청, 로컬 자산, 3D 픽셀비 ≤1.5, 비활성 시 렌더 중지. |
| NFR-02 | **접근성:** 시맨틱 영역, 키보드 조작, 대체 텍스트, ARIA 상태, 모션 감소 지원. |
| NFR-03 | **호환성:** 최신 데스크톱·모바일을 지원하고 WebGL 미지원 시 기본 CV로 대체. |
| NFR-04 | **유지보수·개인정보:** 데이터·표현·동작·3D를 분리하고 공개 CV 외 서버 전송·분석·쿠키를 사용하지 않음. |

## 7. 파일 구조

```text
myhub_01_static/
├── index.html
├── style.css
├── script.js
├── metaverse.js
├── data.json
├── res/                       # 프로필·프로젝트 이미지
├── vendor/                    # Three.js r184와 MIT 라이선스
├── docs/
│   └── myhub_prd_v1.md
├── README.md
├── .nojekyll
└── .gitignore
```

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|---|---|---|
| 2026-08-10 | v1.0 | 현재 구현 상태를 기준으로 최초 작성 |
| 2026-08-10 | v1.1 | 탐색형 3D 가상 연구실과 CV 전시대 요구사항 반영 |
