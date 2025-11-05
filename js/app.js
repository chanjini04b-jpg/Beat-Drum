// Beat Drum 메인 애플리케이션
class BeatDrumApp {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    // 애플리케이션 초기화
    async init() {
        try {
            // DOM이 로드될 때까지 대기
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setup());
            } else {
                this.setup();
            }
        } catch (error) {
            console.error('애플리케이션 초기화 오류:', error);
            this.showError('애플리케이션을 초기화하는 중 오류가 발생했습니다.');
        }
    }

    // 애플리케이션 설정
    setup() {
        this.showLoading();
        
        // 드럼 사운드가 로드될 때까지 대기
        const checkSounds = setInterval(() => {
            if (window.drumSounds && window.drumSounds.isReady()) {
                clearInterval(checkSounds);
                this.initializeSequencer();
                this.setupGlobalEvents();
                this.setDefaultPatternLength();
                this.loadDefaultPattern();
                this.hideLoading();
                this.isInitialized = true;
                console.log('Beat Drum 애플리케이션이 성공적으로 초기화되었습니다.');
            }
        }, 100);

        // 10초 후에도 로드되지 않으면 타임아웃
        setTimeout(() => {
            if (!this.isInitialized) {
                clearInterval(checkSounds);
                this.hideLoading();
                this.showError('드럼 사운드 로드에 실패했습니다. 페이지를 새로고침해 주세요.');
            }
        }, 10000);
    }

    // 시퀀서 초기화
    initializeSequencer() {
        if (window.drumSounds) {
            window.sequencer = new DrumSequencer(window.drumSounds);
            
            // 패턴 저장 시스템 초기화
            window.patternStorage = new PatternStorage();
            
            // 고급 BPM 컨트롤러 초기화
            window.bpmController = new AdvancedBPMController();
            
            // 초기화 완료 후 UI 업데이트
            setTimeout(() => {
                if (window.sequencer) {
                    window.sequencer.updatePatternDisplay();
                }
            }, 100);
        } else {
            throw new Error('DrumSounds가 초기화되지 않았습니다.');
        }
    }

    // 전역 이벤트 설정
    setupGlobalEvents() {
        // 키보드 단축키
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // 브라우저 창 포커스 이벤트 (오디오 컨텍스트 관리)
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        
        // 에러 핸들링
        window.addEventListener('error', (e) => this.handleGlobalError(e));
        
        // 터치 디바이스 최적화
        if (this.isTouchDevice()) {
            this.setupTouchOptimizations();
        }
    }

    // 키보드 단축키 처리
    handleKeyboardShortcuts(e) {
        if (!this.isInitialized || !window.sequencer) return;

        // 저장/불러오기 단축키 (Ctrl/Cmd 조합)
        if (e.ctrlKey || e.metaKey) {
            switch (e.code) {
                case 'KeyS':
                    e.preventDefault();
                    if (window.patternStorage) {
                        window.patternStorage.showSaveDialog();
                    }
                    return;
                case 'KeyO':
                    e.preventDefault();
                    if (window.patternStorage) {
                        window.patternStorage.showLoadDialog();
                    }
                    return;
                case 'KeyD':
                    e.preventDefault();
                    if (window.patternStorage) {
                        window.patternStorage.downloadPattern();
                    }
                    return;
            }
            return; // 다른 Ctrl/Cmd 조합은 처리하지 않음
        }

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                if (window.sequencer.isPlaying) {
                    window.sequencer.pause();
                } else {
                    window.sequencer.play();
                }
                break;
            case 'Escape':
                e.preventDefault();
                window.sequencer.stop();
                break;
            case 'KeyC':
                if (e.shiftKey) {
                    e.preventDefault();
                    window.sequencer.clearPattern();
                }
                break;
            case 'KeyR':
                if (e.shiftKey) {
                    e.preventDefault();
                    window.sequencer.generateRandomPattern();
                }
                break;
            // 패턴 길이 변경 (Ctrl/Cmd + 숫자)
            case 'Digit1':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.changePatternLength(1);
                }
                break;
            case 'Digit2':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.changePatternLength(2);
                }
                break;
            case 'Digit4':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.changePatternLength(4);
                }
                break;
            case 'Digit8':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.changePatternLength(8);
                }
                break;
        }

        // 일반 숫자 키로 트랙 사운드 재생 (Ctrl/Cmd 없이)
        if (!e.ctrlKey && !e.metaKey) {
            switch (e.code) {
            // 숫자 키로 트랙 사운드 재생 (1-9)
            case 'Digit1':
                e.preventDefault();
                window.drumSounds.playSound('kick');
                break;
            case 'Digit2':
                e.preventDefault();
                window.drumSounds.playSound('snare');
                break;
            case 'Digit3':
                e.preventDefault();
                window.drumSounds.playSound('hihat');
                break;
            case 'Digit4':
                e.preventDefault();
                window.drumSounds.playSound('tom');
                break;
            case 'Digit5':
                e.preventDefault();
                window.drumSounds.playSound('openhat');
                break;
            case 'Digit6':
                e.preventDefault();
                window.drumSounds.playSound('crash');
                break;
            case 'Digit7':
                e.preventDefault();
                window.drumSounds.playSound('ride');
                break;
            case 'Digit8':
                e.preventDefault();
                window.drumSounds.playSound('clap');
                break;
            case 'Digit9':
                e.preventDefault();
                window.drumSounds.playSound('cowbell');
                break;
            // 문자 키로 추가 사운드 재생
            case 'KeyQ':
                e.preventDefault();
                window.drumSounds.playSound('shaker');
                break;
            case 'KeyW':
                e.preventDefault();
                window.drumSounds.playSound('hitom');
                break;
            case 'KeyE':
                e.preventDefault();
                window.drumSounds.playSound('lotom');
                break;
            // F1-F5로 프리셋 빠른 접근
            case 'F1':
            case 'F2':
            case 'F3':
            case 'F4':
            case 'F5':
                e.preventDefault();
                if (window.patternStorage) {
                    const slot = parseInt(e.code.replace('F', ''));
                    if (e.shiftKey) {
                        window.patternStorage.saveToPreset(slot);
                    } else {
                        window.patternStorage.loadFromPreset(slot);
                    }
                }
                break;
            // BPM 조절 (화살표 키, +/- 키)
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'Plus':
            case 'Equal':
            case 'Minus':
                if (window.bpmController) {
                    window.bpmController.handleKeyboard(e);
                }
                break;
            }
        }
    }

    // 패턴 길이 변경 헬퍼 메서드
    changePatternLength(measures) {
        if (window.sequencer) {
            window.sequencer.changePatternLength(measures);
            
            // UI 버튼 상태 업데이트
            document.querySelectorAll('.length-button').forEach(btn => {
                btn.classList.remove('active');
            });
            const targetButton = document.querySelector(`.length-button[data-measures="${measures}"]`);
            if (targetButton) {
                targetButton.classList.add('active');
            }
        }
    }

    // 브라우저 탭 포커스 변경 처리
    handleVisibilityChange() {
        if (document.hidden && window.sequencer && window.sequencer.isPlaying) {
            // 탭이 백그라운드로 가면 일시정지 (브라우저 타이머 최적화로 인한 문제 방지)
            console.log('탭이 백그라운드로 이동하여 재생을 일시정지합니다.');
        }
    }

    // 전역 에러 처리
    handleGlobalError(e) {
        console.error('전역 에러:', e.error);
        
        // 오디오 관련 에러인 경우 특별 처리
        if (e.error && e.error.message && e.error.message.includes('audio')) {
            this.showError('오디오 재생 중 오류가 발생했습니다. 브라우저에서 오디오 권한을 확인해 주세요.');
        }
    }

    // 터치 디바이스 감지
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    // 터치 최적화 설정
    setupTouchOptimizations() {
        // 터치 디바이스에서 더 큰 터치 영역
        document.body.classList.add('touch-device');
        
        // 터치 시 300ms 지연 제거
        document.addEventListener('touchstart', () => {}, { passive: true });
        
        // 스크롤 방지 (시퀀서 영역에서)
        document.querySelector('.sequencer').addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }

    // 기본 패턴 길이 설정 (1마디 = 16스텝)
    setDefaultPatternLength() {
        const defaultButton = document.querySelector('.length-button[data-measures="1"]');
        if (defaultButton) {
            defaultButton.classList.add('active');
        }
    }

    // 기본 패턴 로드
    loadDefaultPattern() {
        if (!window.sequencer) return;

        // 기본 4/4 드럼 패턴 생성 (12트랙)
        const defaultPattern = {
            kick: [true, false, false, false, false, false, true, false, 
                   true, false, false, false, false, false, false, false],
            snare: [false, false, false, false, true, false, false, false, 
                    false, false, false, false, true, false, false, false],
            hihat: [true, false, true, false, true, false, true, false,
                    true, false, true, false, true, false, true, false],
            tom: [false, false, false, false, false, false, false, false,
                  false, false, false, true, false, false, false, false],
            openhat: [false, false, false, false, false, false, false, false,
                      false, false, false, false, false, false, false, true],
            crash: [true, false, false, false, false, false, false, false,
                    false, false, false, false, false, false, false, false],
            ride: [false, false, false, false, false, false, false, false,
                   false, false, false, false, false, false, false, false],
            clap: [false, false, false, false, false, false, false, false,
                   false, false, false, false, false, false, false, false],
            cowbell: [false, false, false, false, false, false, false, false,
                      false, false, false, false, false, false, true, false],
            shaker: [false, true, false, true, false, true, false, true,
                     false, true, false, true, false, true, false, true],
            hitom: [false, false, false, false, false, false, false, false,
                    false, false, false, false, false, false, false, false],
            lotom: [false, false, false, false, false, false, false, false,
                    false, false, false, false, false, false, false, false]
        };

        window.sequencer.importPattern({ 
            pattern: defaultPattern, 
            bpm: 120 
        });
    }

    // 로딩 표시
    showLoading() {
        const container = document.querySelector('.container');
        if (container) {
            container.classList.add('loading');
        }
    }

    // 로딩 숨기기
    hideLoading() {
        const container = document.querySelector('.container');
        if (container) {
            container.classList.remove('loading');
        }
    }

    // 에러 메시지 표시
    showError(message) {
        // 간단한 에러 알림 (향후 더 세련된 UI로 개선 가능)
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
            z-index: 10000;
            max-width: 300px;
            font-size: 14px;
        `;
        errorDiv.textContent = message;

        document.body.appendChild(errorDiv);

        // 5초 후 자동 제거
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);

        // 클릭 시 제거
        errorDiv.addEventListener('click', () => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        });
    }

    // 정보 메시지 표시
    showInfo(message) {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'info-message';
        infoDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
            z-index: 10000;
            max-width: 300px;
            font-size: 14px;
        `;
        infoDiv.textContent = message;

        document.body.appendChild(infoDiv);

        // 3초 후 자동 제거
        setTimeout(() => {
            if (infoDiv.parentNode) {
                infoDiv.parentNode.removeChild(infoDiv);
            }
        }, 3000);
    }

    // 애플리케이션 정보 표시
    showAppInfo() {
        console.log(`
🥁 Beat Drum v2.0 - 풀 드럼킷 에디션
실시간 드럼 비트 생성기 (12 트랙)

키보드 단축키:
재생 제어:
- Space: 재생/일시정지
- Escape: 정지
- Shift + C: 패턴 지우기  
- Shift + R: 랜덤 패턴 생성

저장/불러오기:
- Ctrl + S: 패턴 저장
- Ctrl + O: 패턴 불러오기
- Ctrl + D: 패턴 다운로드

프리셋 (F1-F5):
- F1~F5: 프리셋 로드
- Shift + F1~F5: 프리셋 저장

BPM 조절:
- ↑/↓: BPM ±1
- ←/→: BPM ±5
- +/-: BPM ±1
- Shift + ↑/↓: BPM ±10

드럼 사운드 재생:
- 1: Kick        - 2: Snare       - 3: Hi-hat     - 4: Tom
- 5: Open Hat    - 6: Crash       - 7: Ride       - 8: Clap
- 9: Cowbell     - Q: Shaker      - W: Hi Tom     - E: Lo Tom

개발자: GitHub Copilot
        `);
    }
}

// 애플리케이션 시작
document.addEventListener('DOMContentLoaded', () => {
    // 개발자 콘솔에 정보 표시
    console.log('%c🥁 Beat Drum', 'font-size: 24px; color: #ff6b6b; font-weight: bold;');
    console.log('%c실시간 드럼 비트 생성기가 로딩 중입니다...', 'color: #4ecdc4;');
    
    // 애플리케이션 인스턴스 생성
    window.beatDrumApp = new BeatDrumApp();
});

// 전역 함수들 (디버깅 및 확장용)
window.BeatDrumUtils = {
    // 현재 패턴을 JSON으로 내보내기
    exportPattern: () => {
        if (window.sequencer) {
            const pattern = window.sequencer.exportPattern();
            console.log('현재 패턴:', JSON.stringify(pattern, null, 2));
            return pattern;
        }
        return null;
    },

    // JSON 패턴 가져오기
    importPattern: (patternData) => {
        if (window.sequencer && patternData) {
            window.sequencer.importPattern(patternData);
            console.log('패턴이 로드되었습니다.');
        }
    },

    // 성능 정보 표시
    showPerformanceInfo: () => {
        if (window.drumSounds && window.drumSounds.audioContext) {
            console.log('오디오 컨텍스트 상태:', window.drumSounds.audioContext.state);
            console.log('샘플 레이트:', window.drumSounds.audioContext.sampleRate);
            console.log('현재 시간:', window.drumSounds.audioContext.currentTime);
        }
    }
};