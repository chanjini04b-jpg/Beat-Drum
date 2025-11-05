// 고급 BPM 컨트롤 관리 클래스
class AdvancedBPMController {
    constructor() {
        this.currentBPM = 120;
        this.minBPM = 60;
        this.maxBPM = 200;
        this.isDragging = false;
        this.beatAnimationId = null;
        
        this.setupElements();
        this.setupEventListeners();
        this.updateDisplay();
        this.startBeatVisualization();
    }

    // DOM 요소 설정
    setupElements() {
        this.bpmValue = document.getElementById('bpmValue');
        this.bpmGenre = document.getElementById('bpmGenre');
        this.bpmKnob = document.getElementById('bpmKnob');
        this.knobIndicator = this.bpmKnob.querySelector('.knob-indicator');
        this.beatIndicator = document.getElementById('beatIndicator');
        this.beatPulse = this.beatIndicator.querySelector('.beat-pulse');
        this.bpmUpBtn = document.getElementById('bpmUp');
        this.bpmDownBtn = document.getElementById('bpmDown');
        this.hiddenSlider = document.getElementById('bpmSlider');
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 노브 드래그 이벤트
        this.bpmKnob.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.handleDrag(e));
        document.addEventListener('mouseup', () => this.endDrag());
        
        // 터치 이벤트 (모바일)
        this.bpmKnob.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]));
        document.addEventListener('touchmove', (e) => this.handleDrag(e.touches[0]));
        document.addEventListener('touchend', () => this.endDrag());
        
        // +/- 버튼 이벤트
        this.bpmUpBtn.addEventListener('click', () => this.adjustBPM(1));
        this.bpmDownBtn.addEventListener('click', () => this.adjustBPM(-1));
        
        // 버튼 long press (길게 누르기)
        let longPressTimer;
        const startLongPress = (direction) => {
            this.adjustBPM(direction);
            longPressTimer = setInterval(() => this.adjustBPM(direction), 100);
        };
        
        this.bpmUpBtn.addEventListener('mousedown', () => startLongPress(1));
        this.bpmDownBtn.addEventListener('mousedown', () => startLongPress(-1));
        this.bpmUpBtn.addEventListener('touchstart', () => startLongPress(1));
        this.bpmDownBtn.addEventListener('touchstart', () => startLongPress(-1));
        
        const stopLongPress = () => {
            if (longPressTimer) {
                clearInterval(longPressTimer);
                longPressTimer = null;
            }
        };
        
        document.addEventListener('mouseup', stopLongPress);
        document.addEventListener('touchend', stopLongPress);
        
        // 숨겨진 슬라이더와 동기화
        this.hiddenSlider.addEventListener('input', (e) => {
            this.setBPM(parseInt(e.target.value));
        });
        
        // 노브 클릭으로 BPM 직접 입력
        this.bpmValue.addEventListener('click', () => this.showBPMInput());
    }

    // 드래그 시작
    startDrag(event) {
        this.isDragging = true;
        this.startY = event.clientY || event.pageY;
        this.startBPM = this.currentBPM;
        this.bpmKnob.style.cursor = 'grabbing';
        document.body.style.cursor = 'grabbing';
        
        // 드래그 중 선택 방지
        document.body.style.userSelect = 'none';
        event.preventDefault();
    }

    // 드래그 처리
    handleDrag(event) {
        if (!this.isDragging) return;
        
        const currentY = event.clientY || event.pageY;
        const deltaY = this.startY - currentY; // 위로 드래그하면 증가
        const sensitivity = 0.5; // 드래그 민감도
        
        const newBPM = Math.round(this.startBPM + (deltaY * sensitivity));
        this.setBPM(newBPM);
        
        event.preventDefault();
    }

    // 드래그 종료
    endDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.bpmKnob.style.cursor = 'pointer';
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
    }

    // BPM 조절 (버튼용)
    adjustBPM(direction) {
        const step = 1;
        this.setBPM(this.currentBPM + (direction * step));
    }

    // BPM 설정
    setBPM(newBPM) {
        // 범위 제한
        newBPM = Math.max(this.minBPM, Math.min(this.maxBPM, newBPM));
        
        if (newBPM === this.currentBPM) return;
        
        this.currentBPM = newBPM;
        this.updateDisplay();
        this.updateKnobRotation();
        this.updateBeatVisualization();
        
        // 시퀀서에 BPM 변경 알림
        if (window.sequencer) {
            window.sequencer.setBPM(this.currentBPM);
        }
        
        // 숨겨진 슬라이더 동기화
        this.hiddenSlider.value = this.currentBPM;
    }

    // 디스플레이 업데이트
    updateDisplay() {
        this.bpmValue.textContent = this.currentBPM;
        
        // 장르/스타일 표시
        const genre = this.getBPMGenre(this.currentBPM);
        this.bpmGenre.textContent = genre;
        
        // BPM 범위별 색상 클래스 적용
        const colorClass = this.getBPMColorClass(this.currentBPM);
        document.querySelector('.tempo-control').className = `tempo-control ${colorClass}`;
        
        // BPM 값에 애니메이션 효과
        this.bpmValue.style.transform = 'scale(1.1)';
        setTimeout(() => {
            this.bpmValue.style.transform = 'scale(1)';
        }, 150);
    }

    // 노브 회전 업데이트
    updateKnobRotation() {
        const range = this.maxBPM - this.minBPM;
        const progress = (this.currentBPM - this.minBPM) / range;
        const rotation = (progress * 270) - 135; // -135도 ~ +135도 (270도 범위)
        
        this.knobIndicator.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
        
        // 노브 색상도 변경
        const hue = 180 + (progress * 60); // 180도(청록)에서 240도(보라)까지
        this.bpmKnob.style.borderColor = `hsl(${hue}, 70%, 60%)`;
    }

    // BPM에 따른 장르 반환
    getBPMGenre(bpm) {
        if (bpm < 70) return 'Ballad/Slow';
        if (bpm < 90) return 'Hip-Hop/R&B';
        if (bpm < 110) return 'Funk/Reggae';
        if (bpm < 130) return 'Pop/Rock';
        if (bpm < 150) return 'Dance/House';
        if (bpm < 170) return 'Techno/Trance';
        if (bpm < 190) return 'Drum & Bass';
        return 'Hardcore/Gabber';
    }

    // BPM 범위별 색상 클래스 반환
    getBPMColorClass(bpm) {
        if (bpm < 90) return 'bpm-slow';
        if (bpm < 120) return 'bpm-moderate';
        if (bpm < 160) return 'bpm-fast';
        return 'bpm-very-fast';
    }

    // 비트 시각화 시작
    startBeatVisualization() {
        this.updateBeatVisualization();
    }

    // 비트 시각화 업데이트
    updateBeatVisualization() {
        if (this.beatAnimationId) {
            cancelAnimationFrame(this.beatAnimationId);
        }
        
        // BPM에 따른 애니메이션 속도 계산
        const beatDuration = (60 / this.currentBPM) * 1000; // 밀리초
        
        // CSS 애니메이션 업데이트
        this.beatPulse.style.animationDuration = `${beatDuration}ms`;
        
        // BPM에 따른 색상 변화
        const colors = this.getBeatColors(this.currentBPM);
        this.beatPulse.style.background = `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`;
    }

    // BPM에 따른 비트 색상 반환
    getBeatColors(bpm) {
        if (bpm < 90) return { primary: '#87ceeb', secondary: '#4682b4' };
        if (bpm < 120) return { primary: '#4ecdc4', secondary: '#44a08d' };
        if (bpm < 160) return { primary: '#ffd93d', secondary: '#f4c430' };
        return { primary: '#ff6b6b', secondary: '#ee5a52' };
    }

    // BPM 직접 입력 다이얼로그
    showBPMInput() {
        const newBPM = prompt(`BPM을 입력하세요 (${this.minBPM}-${this.maxBPM}):`, this.currentBPM);
        
        if (newBPM !== null) {
            const parsedBPM = parseInt(newBPM);
            if (!isNaN(parsedBPM)) {
                this.setBPM(parsedBPM);
            } else {
                alert('올바른 숫자를 입력하세요.');
            }
        }
    }

    // 키보드로 BPM 조절
    handleKeyboard(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'Plus':
            case 'Equal': // + 키
                event.preventDefault();
                this.adjustBPM(event.shiftKey ? 10 : 1);
                break;
            case 'ArrowDown':
            case 'Minus':
                event.preventDefault();
                this.adjustBPM(event.shiftKey ? -10 : -1);
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.adjustBPM(-5);
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.adjustBPM(5);
                break;
        }
    }

    // 현재 BPM 반환
    getBPM() {
        return this.currentBPM;
    }

    // 프리셋 BPM 설정
    setPresetBPM(presetName) {
        const presets = {
            'slow': 80,
            'moderate': 120,
            'fast': 140,
            'veryfast': 180
        };
        
        if (presets[presetName]) {
            this.setBPM(presets[presetName]);
            
            if (window.beatDrumApp) {
                window.beatDrumApp.showInfo(`BPM이 ${presets[presetName]}으로 설정되었습니다.`);
            }
        }
    }
}

// 전역 BPM 컨트롤러 인스턴스
window.bpmController = null;