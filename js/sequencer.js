// 16스텝 시퀀서 클래스
class DrumSequencer {
    constructor(drumSounds) {
        this.drumSounds = drumSounds;
        this.isPlaying = false;
        this.currentStep = 0;
        this.bpm = 120;
        this.stepInterval = null;
        this.stepDuration = this.calculateStepDuration();
        
        // 드럼 사운드 목록을 먼저 초기화
        this.drumSounds_list = ['kick', 'snare', 'hihat', 'tom', 'openhat', 'crash', 
                               'ride', 'clap', 'cowbell', 'shaker', 'hitom', 'lotom'];
        
        // 패턴 길이 설정 (기본: 1마디 = 16스텝)
        this.patternLength = 16; // 16, 32, 64, 128 스텝 지원
        this.measures = 1; // 1, 2, 4, 8 마디
        
        // 패턴 데이터 (12개 트랙 x 가변 스텝)
        this.pattern = {};
        this.initializePattern();

        this.initializeUI();
        this.setupEventListeners();
    }

    // 패턴 초기화
    initializePattern() {
        this.pattern = {};
        if (this.drumSounds_list && Array.isArray(this.drumSounds_list)) {
            this.drumSounds_list.forEach(sound => {
                this.pattern[sound] = new Array(this.patternLength).fill(false);
            });
        } else {
            console.error('drumSounds_list가 정의되지 않았습니다.');
        }
    }

    // UI 초기화
    initializeUI() {
        // DOM이 준비될 때까지 대기
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.doUIInitialization();
            });
        } else {
            this.doUIInitialization();
        }
    }

    // 실제 UI 초기화 수행
    doUIInitialization() {
        try {
            this.generateSequencerGrid();
            this.setupPatternLengthControls();
            this.updateBPMDisplay();
            this.updatePatternDisplay();
        } catch (error) {
            console.error('UI 초기화 중 오류 발생:', error);
            // 재시도
            setTimeout(() => {
                try {
                    this.doUIInitialization();
                } catch (retryError) {
                    console.error('UI 초기화 재시도 실패:', retryError);
                }
            }, 500);
        }
    }

    // 동적 시퀀서 그리드 생성
    generateSequencerGrid() {
        const sequencer = document.getElementById('sequencer');
        if (!sequencer) {
            console.error('시퀀서 컨테이너를 찾을 수 없습니다.');
            return;
        }
        
        // 기존 트랙들만 제거 (스텝 번호는 유지)
        const existingTracks = sequencer.querySelectorAll('.track');
        if (existingTracks) {
            existingTracks.forEach(track => track.remove());
        }

        // 스텝 번호 항상 재생성
        this.createStepNumbers();

        // 각 드럼 사운드별 트랙 생성
        if (this.drumSounds_list && Array.isArray(this.drumSounds_list)) {
            this.drumSounds_list.forEach(sound => {
                const track = this.createTrackElement(sound);
                sequencer.appendChild(track);
            });
        } else {
            console.error('drumSounds_list가 정의되지 않았거나 배열이 아닙니다.');
        }
    }

    // 스텝 번호 생성
    createStepNumbers() {
        const sequencer = document.getElementById('sequencer');
        
        // 기존 스텝 번호 영역 제거
        const existingStepNumbers = sequencer.querySelector('.step-numbers');
        if (existingStepNumbers) {
            existingStepNumbers.remove();
        }
        
        const stepNumbers = document.createElement('div');
        stepNumbers.className = 'step-numbers';
        
        const trackLabel = document.createElement('div');
        trackLabel.className = 'track-label';
        const stepsLabel = document.createElement('span');
        stepsLabel.className = 'steps-label';
        stepsLabel.textContent = 'STEPS';
        trackLabel.appendChild(stepsLabel);
        
        const steps = document.createElement('div');
        steps.className = 'steps';
        steps.id = 'stepNumbers';
        
        // 스텝 번호들 생성
        for (let i = 0; i < this.patternLength; i++) {
            const stepNumber = document.createElement('div');
            stepNumber.className = 'step-number';
            if ((i + 1) % 4 === 1) {
                stepNumber.classList.add('quarter'); // 강박 표시
            }
            stepNumber.textContent = i + 1;
            steps.appendChild(stepNumber);
        }
        
        stepNumbers.appendChild(trackLabel);
        stepNumbers.appendChild(steps);
        
        sequencer.insertBefore(stepNumbers, sequencer.firstChild);
    }

    // 개별 트랙 요소 생성
    createTrackElement(soundName) {
        const track = document.createElement('div');
        track.className = 'track';
        track.setAttribute('data-sound', soundName);

        // 트랙 라벨 생성
        const trackLabel = document.createElement('div');
        trackLabel.className = 'track-label';
        
        const trackNameSpan = document.createElement('span');
        trackNameSpan.className = 'track-name';
        trackNameSpan.textContent = this.getSoundDisplayName(soundName);
        
        const playButton = document.createElement('button');
        playButton.className = 'track-play-btn';
        playButton.setAttribute('data-sound', soundName);
        playButton.textContent = '🔊';
        
        trackLabel.appendChild(trackNameSpan);
        trackLabel.appendChild(playButton);

        // 스텝 컨테이너 생성
        const steps = document.createElement('div');
        steps.className = 'steps';

        // 각 스텝 생성
        for (let i = 0; i < this.patternLength; i++) {
            const step = document.createElement('div');
            step.className = 'step';
            step.setAttribute('data-step', i);
            steps.appendChild(step);
        }

        track.appendChild(trackLabel);
        track.appendChild(steps);

        return track;
    }

    // 사운드 표시 이름 반환
    getSoundDisplayName(soundName) {
        const displayNames = {
            'kick': 'Kick',
            'snare': 'Snare',
            'hihat': 'Hi-hat',
            'tom': 'Tom',
            'openhat': 'Open Hat',
            'crash': 'Crash',
            'ride': 'Ride',
            'clap': 'Clap',
            'cowbell': 'Cowbell',
            'shaker': 'Shaker',
            'hitom': 'Hi Tom',
            'lotom': 'Lo Tom'
        };
        return displayNames[soundName] || soundName;
    }

    // 스텝 지속시간 계산 (BPM 기반)
    calculateStepDuration() {
        // 4/4 박자에서 16분음표 하나의 지속시간 (밀리초)
        return (60 / this.bpm / 4) * 1000;
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 재생 제어 버튼
        document.getElementById('playBtn').addEventListener('click', () => this.play());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
        document.getElementById('stopBtn').addEventListener('click', () => this.stop());
        
        // 패턴 제어 버튼
        document.getElementById('clearBtn').addEventListener('click', () => this.clearPattern());
        document.getElementById('randomBtn').addEventListener('click', () => this.generateRandomPattern());

        // BPM 슬라이더 (고급 컨트롤러가 있으면 그것이 처리)
        const bpmSlider = document.getElementById('bpmSlider');
        if (bpmSlider) {
            bpmSlider.addEventListener('input', (e) => this.setBPM(parseInt(e.target.value)));
        }

        // 동적으로 생성된 요소들의 이벤트 리스너는 별도로 설정
        this.setupDynamicEventListeners();
    }

    // 동적 요소들의 이벤트 리스너 설정
    setupDynamicEventListeners() {
        // 스텝 클릭 이벤트 (이벤트 위임 사용)
        document.getElementById('sequencer').addEventListener('click', (e) => {
            if (e.target.classList.contains('step')) {
                this.toggleStep(e.target);
            } else if (e.target.classList.contains('track-play-btn')) {
                const soundName = e.target.getAttribute('data-sound');
                this.drumSounds.playSound(soundName);
            }
        });
    }

    // 패턴 길이 컨트롤 설정
    setupPatternLengthControls() {
        const lengthButtons = document.querySelectorAll('.length-button');
        if (!lengthButtons || lengthButtons.length === 0) {
            console.warn('패턴 길이 버튼을 찾을 수 없습니다.');
            return;
        }
        
        lengthButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const measures = parseInt(e.target.getAttribute('data-measures'));
                this.changePatternLength(measures);
                
                // 활성 버튼 표시 업데이트
                lengthButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    // 재생 시작
    play() {
        if (this.isPlaying) return;

        // 오디오 컨텍스트 활성화 (사용자 상호작용 필요)
        if (this.drumSounds.audioContext && this.drumSounds.audioContext.state === 'suspended') {
            this.drumSounds.audioContext.resume();
        }

        this.isPlaying = true;
        this.updateStatus('Playing');
        
        // UI 업데이트
        document.getElementById('playBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('stopBtn').disabled = false;

        this.startSequencer();
    }

    // 일시정지
    pause() {
        if (!this.isPlaying) return;

        this.isPlaying = false;
        this.updateStatus('Paused');
        
        if (this.stepInterval) {
            clearInterval(this.stepInterval);
            this.stepInterval = null;
        }

        // UI 업데이트
        document.getElementById('playBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
    }

    // 정지
    stop() {
        this.isPlaying = false;
        this.currentStep = 0;
        this.updateStatus('Ready');
        
        if (this.stepInterval) {
            clearInterval(this.stepInterval);
            this.stepInterval = null;
        }

        // UI 업데이트
        document.getElementById('playBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('stopBtn').disabled = true;
        
        this.updateCurrentStepDisplay();
        this.updateProgressBar();
    }

    // 시퀀서 시작
    startSequencer() {
        if (this.stepInterval) {
            clearInterval(this.stepInterval);
        }

        this.stepInterval = setInterval(() => {
            if (!this.isPlaying) return;

            this.playCurrentStep();
            this.currentStep = (this.currentStep + 1) % this.patternLength;
            this.updateCurrentStepDisplay();
            this.updateProgressBar();
        }, this.stepDuration);
    }

    // 현재 스텝 재생
    playCurrentStep() {
        // 각 트랙에서 현재 스텝이 활성화되어 있으면 사운드 재생
        Object.keys(this.pattern).forEach(soundName => {
            if (this.pattern[soundName][this.currentStep]) {
                this.drumSounds.playSound(soundName);
                
                // 시각적 피드백
                const stepElement = document.querySelector(
                    `.track[data-sound="${soundName}"] .step[data-step="${this.currentStep}"]`
                );
                if (stepElement) {
                    stepElement.classList.add('playing');
                    setTimeout(() => stepElement.classList.remove('playing'), 100);
                }
            }
        });
    }

    // 스텝 토글 (클릭 시)
    toggleStep(stepElement) {
        const track = stepElement.closest('.track');
        const soundName = track.getAttribute('data-sound');
        const stepIndex = parseInt(stepElement.getAttribute('data-step'));
        
        // 패턴 데이터 토글
        this.pattern[soundName][stepIndex] = !this.pattern[soundName][stepIndex];
        
        // UI 업데이트
        stepElement.classList.toggle('active', this.pattern[soundName][stepIndex]);
    }

    // BPM 설정
    setBPM(newBPM) {
        this.bpm = Math.max(60, Math.min(200, newBPM));
        this.stepDuration = this.calculateStepDuration();
        
        this.updateBPMDisplay();
        
        // 재생 중인 경우 새로운 템포로 재시작
        if (this.isPlaying) {
            this.startSequencer();
        }
    }

    // 패턴 지우기
    clearPattern() {
        Object.keys(this.pattern).forEach(soundName => {
            this.pattern[soundName].fill(false);
        });
        this.updatePatternDisplay();
    }

    // 랜덤 패턴 생성 (패턴 길이 대응)
    generateRandomPattern() {
        // 킥: 1, 5, 9, 13 (4/4 박자 기본) + 약간의 변화
        this.pattern.kick = new Array(this.patternLength).fill(false).map((_, i) => {
            if ((i + 1) % 4 === 1) return Math.random() < 0.9; // 강박
            if ((i + 1) % 8 === 5) return Math.random() < 0.6; // 3박
            return Math.random() < 0.1;
        });
        
        // 스네어: 5, 13 (2, 4박) + 랜덤
        this.pattern.snare = new Array(this.patternLength).fill(false).map((_, i) => {
            if ((i + 1) % 8 === 5) return Math.random() < 0.9; // 2, 4박
            return Math.random() < 0.15;
        });
        
        // 하이햇: 8분음표 패턴 기반
        this.pattern.hihat = new Array(this.patternLength).fill(false).map((_, i) => {
            if (i % 2 === 0) return Math.random() < 0.8; // 8분음표
            return Math.random() < 0.3;
        });
        
        // 오픈 하이햇: 가끔씩
        this.pattern.openhat = new Array(this.patternLength).fill(false).map(() => Math.random() < 0.1);
        
        // 크래시: 매우 가끔 (첫 박이나 중요한 지점)
        this.pattern.crash = new Array(this.patternLength).fill(false).map((_, i) => {
            if (i === 0) return Math.random() < 0.4; // 첫 박
            if ((i + 1) % 16 === 1) return Math.random() < 0.3; // 마디 시작
            return Math.random() < 0.05;
        });
        
        // 라이드: 8분음표 대안 (하이햇과 배타적)
        this.pattern.ride = new Array(this.patternLength).fill(false).map((_, i) => {
            if (Math.random() < 0.3) { // 30% 확률로 라이드 패턴 사용
                return i % 2 === 0 ? Math.random() < 0.7 : Math.random() < 0.2;
            }
            return false;
        });
        
        // 클랩: 스네어 대안으로 가끔
        this.pattern.clap = new Array(this.patternLength).fill(false).map((_, i) => {
            if ((i + 1) % 8 === 5) return Math.random() < 0.3; // 2, 4박 대안
            return Math.random() < 0.08;
        });
        
        // 카우벨: 액센트용
        this.pattern.cowbell = new Array(this.patternLength).fill(false).map(() => Math.random() < 0.12);
        
        // 셰이커: 16분음표 패턴
        this.pattern.shaker = new Array(this.patternLength).fill(false).map(() => Math.random() < 0.25);
        
        // 하이 탐: 필인용
        this.pattern.hitom = new Array(this.patternLength).fill(false).map(() => Math.random() < 0.08);
        
        // 로우 탐: 필인용 (기본 탐과 함께)
        this.pattern.lotom = new Array(this.patternLength).fill(false).map(() => Math.random() < 0.06);
        
        // 기본 탐: 가끔씩
        this.pattern.tom = new Array(this.patternLength).fill(false).map(() => Math.random() < 0.1);
        
        this.updatePatternDisplay();
    }

    // UI 업데이트 메서드들
    updateBPMDisplay() {
        document.getElementById('bpmValue').textContent = this.bpm;
        document.getElementById('currentBpm').textContent = this.bpm;
        document.getElementById('bpmSlider').value = this.bpm;
    }



    updatePatternDisplay() {
        Object.keys(this.pattern).forEach(soundName => {
            const steps = document.querySelectorAll(
                `.track[data-sound="${soundName}"] .step`
            );
            steps.forEach((step, index) => {
                step.classList.toggle('active', this.pattern[soundName][index]);
            });
        });
    }

    updateCurrentStepDisplay() {
        // 이전 현재 스텝 표시 제거
        document.querySelectorAll('.step.current').forEach(step => {
            step.classList.remove('current');
        });

        // 새로운 현재 스텝 표시
        if (this.isPlaying) {
            document.querySelectorAll(`.step[data-step="${this.currentStep}"]`).forEach(step => {
                step.classList.add('current');
            });
        }

        document.getElementById('currentStep').textContent = this.isPlaying ? this.currentStep + 1 : '-';
    }

    updateProgressBar() {
        const progress = ((this.currentStep + (this.isPlaying ? 1 : 0)) / this.patternLength) * 100;
        document.querySelector('.step-progress').style.width = `${progress}%`;
    }

    updateStatus(status) {
        document.getElementById('statusText').textContent = status;
    }

    // 패턴 길이 변경
    changePatternLength(measures) {
        const wasPlaying = this.isPlaying;
        
        // 재생 중이면 정지
        if (wasPlaying) {
            this.stop();
        }

        // 새로운 패턴 길이 설정
        this.measures = measures;
        this.patternLength = measures * 16; // 1마디 = 16스텝
        
        // 기존 패턴 데이터 백업
        const oldPattern = { ...this.pattern };
        
        // 새로운 패턴 초기화
        this.initializePattern();
        
        // 기존 데이터가 새로운 길이보다 짧으면 유지, 길면 잘라내기
        if (this.drumSounds_list && Array.isArray(this.drumSounds_list)) {
            this.drumSounds_list.forEach(sound => {
                if (oldPattern[sound]) {
                    for (let i = 0; i < Math.min(oldPattern[sound].length, this.patternLength); i++) {
                        this.pattern[sound][i] = oldPattern[sound][i];
                    }
                }
            });
        }

        // UI 재생성
        this.generateSequencerGrid();
        this.setupDynamicEventListeners();
        this.updateStepNumbers();
        this.updatePatternDisplay();
        
        // 현재 스텝 리셋
        this.currentStep = 0;
        this.updateCurrentStepDisplay();

        console.log(`패턴 길이 변경: ${measures}마디 (${this.patternLength}스텝)`);
    }

    // 스텝 번호 업데이트 (가변 길이 지원)
    updateStepNumbers() {
        const stepNumbersContainer = document.getElementById('stepNumbers');
        if (!stepNumbersContainer) return;
        
        // 기존 스텝 번호들 제거
        stepNumbersContainer.innerHTML = '';
        
        // 새로운 스텝 번호들 생성
        for (let i = 0; i < this.patternLength; i++) {
            const stepNumber = document.createElement('div');
            stepNumber.className = 'step-number';
            if ((i + 1) % 4 === 1) {
                stepNumber.classList.add('quarter'); // 강박 표시
            }
            stepNumber.textContent = i + 1;
            stepNumbersContainer.appendChild(stepNumber);
        }
    }

    // 패턴 데이터 내보내기/가져오기 (저장 기능용)
    exportPattern() {
        return {
            pattern: this.pattern,
            bpm: this.bpm,
            patternLength: this.patternLength,
            measures: this.measures
        };
    }

    importPattern(data) {
        // 패턴 길이가 저장되어 있으면 먼저 길이를 변경
        if (data.measures && data.measures !== this.measures) {
            this.changePatternLength(data.measures);
        }
        
        if (data.pattern) {
            this.pattern = data.pattern;
            this.updatePatternDisplay();
        }
        if (data.bpm) {
            this.setBPM(data.bpm);
        }

        // UI 패턴 길이 버튼 업데이트
        if (data.measures) {
            document.querySelectorAll('.length-button').forEach(btn => {
                btn.classList.remove('active');
            });
            const targetButton = document.querySelector(`.length-button[data-measures="${data.measures}"]`);
            if (targetButton) {
                targetButton.classList.add('active');
            }
        }
    }
}

// 전역 시퀀서 인스턴스
window.sequencer = null;