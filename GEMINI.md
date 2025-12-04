# 프로젝트 개요

이 프로젝트는 `nextjs-notion-starter-kit`을 기반으로 Next.js로 구축된 블로그입니다. Notion을 CMS로 사용하여 콘텐츠를 관리하고 검색합니다.

## 프로젝트 구조

주요 디렉토리 및 그 역할은 다음과 같습니다:

*   **`pages/`**: Next.js 라우팅을 위한 페이지들을 포함합니다. 블로그 게시물, 홈페이지, 피드, 404 페이지 등이 포함됩니다. `api/` 하위 디렉토리에는 Notion 검색과 같은 기능을 위한 API 엔드포인트가 있습니다.
*   **`components/`**: 재사용 가능한 React UI 컴포넌트들의 모음입니다. `NotionPage.tsx` 및 `Footer.tsx`와 같은 컴포넌트들은 Notion 콘텐츠 렌더링 및 사이트 레이아웃을 담당하는 것으로 보입니다.
*   **`lib/`**: 프로젝트의 핵심 로직과 유틸리티 함수들을 포함합니다. Notion API 통합 (`notion-api.ts`, `notion.ts`), 사이트맵 생성 (`get-site-map.ts`), 이미지 및 페이지 URL 매핑 (`map-image-url.ts`, `map-page-url.ts`), 사이트 구성 (`site-config.ts`) 등이 이 디렉토리에서 처리됩니다.
*   **`public/`**: 파비콘 및 오류 이미지와 같은 정적 파일들을 저장합니다.
*   **`styles/`**: 전역 CSS, Notion 관련 스타일, 코드 하이라이팅을 위한 Prism 테마 CSS를 포함합니다.
*   **`site.config.ts`**: 전체 블로그 구성 (제목, 작성자, Notion 통합 토큰 등)을 정의하는 중요한 파일입니다.
*   **`next.config.js`**: Next.js 프레임워크의 빌드 및 런타임 설정을 구성합니다.
*   **`package.json`**: 프로젝트의 의존성 및 개발 스크립트를 관리합니다.
*   **`.github/workflows/`**: GitHub Actions를 사용하는 CI/CD 설정 파일 (`build.yml`)을 포함합니다.

전반적으로 이 프로젝트는 Notion에서 콘텐츠를 가져와 블로그로 렌더링하기 위해 Next.js를 사용하도록 구성되어 있으며, TypeScript로 개발되었습니다.

## 빌드 명령어
- 빌드 및 컴파일 명령어는 다음과 같습니다. `npm run build` 
- 모든 파일 수정이 끝난 후에는 항상 빌드를 진행하고 나타나는 오류를 해결하세요.