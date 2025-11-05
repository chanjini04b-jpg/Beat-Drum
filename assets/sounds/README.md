# Beat Drum 사운드 파일 안내

현재 Beat Drum은 Web Audio API를 사용해 실시간으로 생성되는 신스 사운드를 사용하고 있습니다.
더 현실적인 드럼 사운드를 원한다면, 이 폴더에 실제 드럼 샘플 파일을 추가할 수 있습니다.

## 필요한 파일들

다음 이름의 오디오 파일들을 이 폴더에 추가하면 자동으로 로드됩니다:

- `kick.wav` 또는 `kick.mp3` - 킥드럼/베이스드럼 사운드
- `snare.wav` 또는 `snare.mp3` - 스네어드럼 사운드
- `hihat.wav` 또는 `hihat.mp3` - 클로즈드 하이햇 사운드
- `tom.wav` 또는 `tom.mp3` - 탐 사운드

## 파일 요구사항

- **포맷**: WAV, MP3, OGG 등 웹 브라우저에서 지원하는 형식
- **길이**: 0.5초~2초 권장 (너무 길면 자동으로 잘림)
- **품질**: 44.1kHz, 16bit 이상 권장
- **크기**: 각 파일 500KB 이하 권장 (웹 로딩 속도 고려)

## 무료 드럼 샘플 리소스

다음 사이트에서 무료 드럼 샘플을 다운로드할 수 있습니다:

### 무료 라이센스 사이트

- **Freesound.org** - https://freesound.org (CC 라이센스)
- **Zapsplat** - https://zapsplat.com (무료 계정 필요)
- **BBC Sound Effects** - https://sound-effects.bbcrewind.co.uk

### 808/909 클래식 드럼머신 샘플

- **Reverb Machine** - https://reverb.com/software/samples-and-loops/reverb/3514-reverb-drum-machines-the-complete-collection
- **Sample Focus** - https://samplefocus.com/tags/808

### 어쿠스틱 드럼 샘플

- **Drums on Demand** - https://www.drumsondemand.com/free
- **Steven Slate Drums** - 무료 샘플팩 제공

## 주의사항

- 상업적 사용 시 라이센스를 반드시 확인하세요
- 저작권이 있는 샘플 사용 시 적절한 허가를 받으세요
- 파일명은 정확히 위의 명명 규칙을 따라야 합니다

## 현재 신스 사운드 정보

파일이 없을 경우 사용되는 기본 신스 사운드:

- **Kick**: 60Hz 사인파, ADSR 엔벨로프, 0.5초
- **Snare**: 200Hz 스퀘어파 + 고주파 노이즈, 0.2초
- **Hi-hat**: 8kHz 필터드 노이즈, 0.1초
- **Tom**: 150Hz 사인파, 피치 벤드, 0.4초

이 신스 사운드들도 충분히 실용적이며, 전자음악 스타일의 트랙에 적합합니다.
