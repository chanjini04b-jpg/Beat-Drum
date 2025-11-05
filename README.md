# Beat-Drum 🥁

실시간 드럼 비트 생성기 - 웹 기반 드럼 머신

## 🚀 사용 방법

### 1. 로컬에서 실행

```bash
# 간단한 HTTP 서버 실행 (권장)
npx http-server
# 또는
python -m http.server 8000
```

### 2. 직접 파일 열기

- `index.html` 파일을 브라우저에서 직접 열 수 있습니다
- 단, 실제 사운드 파일 로드는 HTTP 서버 환경에서만 가능합니다

## 📁 폴더 구조

```
Beat-Drum/
├── index.html          # 메인 HTML 파일
├── css/
│   └── style.css      # 스타일시트
├── js/
│   ├── app.js         # 메인 애플리케이션
│   ├── drumSounds.js  # 드럼 사운드 관리
│   ├── sequencer.js   # 시퀀서 로직
│   ├── bpmController.js # BPM 컨트롤러
│   └── patternStorage.js # 패턴 저장/로드
├── assets/
│   └── sounds/        # 드럼 사운드 파일 (선택사항)
└── README.md
```

## ⚠️ 폴더 이동 시 주의사항

1. **전체 폴더를 함께 이동**: Beat-Drum 폴더 전체를 이동해야 합니다
2. **상대 경로 유지**: 모든 파일들의 상대적 위치를 유지해야 합니다
3. **HTTP 서버 권장**: 최상의 경험을 위해 HTTP 서버를 통해 실행하세요

## 🎵 사운드 파일 추가

`assets/sounds/` 폴더에 실제 드럼 사운드 파일을 추가하면 더 현실적인 사운드를 사용할 수 있습니다:

- `kick.wav` - 킥드럼
- `snare.wav` - 스네어드럼
- `hihat.wav` - 하이햇
- 등등...

파일이 없으면 자동으로 신스 사운드를 사용합니다.
