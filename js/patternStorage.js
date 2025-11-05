// 패턴 저장/불러오기 관리 클래스
class PatternStorage {
    constructor() {
        this.storagePrefix = 'beatdrum_';
        this.presetSlots = 5;
        this.currentPreset = null;
        this.setupEventListeners();
        this.updatePresetDisplay();
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 저장 버튼
        document.getElementById('saveBtn').addEventListener('click', () => this.showSaveDialog());
        
        // 불러오기 버튼
        document.getElementById('loadBtn').addEventListener('click', () => this.showLoadDialog());
        
        // 다운로드 버튼
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadPattern());
        
        // 파일 입력
        document.getElementById('fileInput').addEventListener('change', (e) => this.loadFromFile(e));
        
        // 프리셋 슬롯 버튼들
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handlePresetClick(e));
            btn.addEventListener('contextmenu', (e) => this.handlePresetRightClick(e));
        });
    }

    // 저장 다이얼로그 표시
    showSaveDialog() {
        const name = prompt('패턴 이름을 입력하세요:', `Beat Pattern ${new Date().toLocaleTimeString()}`);
        if (name && name.trim()) {
            this.saveToLocalStorage(name.trim());
        }
    }

    // 불러오기 다이얼로그 표시
    showLoadDialog() {
        const savedPatterns = this.getSavedPatterns();
        if (savedPatterns.length === 0) {
            alert('저장된 패턴이 없습니다.');
            return;
        }

        const patternList = savedPatterns.map((pattern, index) => 
            `${index + 1}. ${pattern.name} (${new Date(pattern.timestamp).toLocaleString()})`
        ).join('\n');

        const choice = prompt(
            `불러올 패턴을 선택하세요 (번호 입력):\n\n${patternList}\n\n또는 파일에서 불러오려면 '파일'을 입력하세요:`
        );

        if (choice === '파일' || choice === 'file') {
            document.getElementById('fileInput').click();
        } else if (choice && !isNaN(choice)) {
            const index = parseInt(choice) - 1;
            if (index >= 0 && index < savedPatterns.length) {
                this.loadPattern(savedPatterns[index]);
            } else {
                alert('잘못된 번호입니다.');
            }
        }
    }

    // 로컬스토리지에 패턴 저장
    saveToLocalStorage(name) {
        if (!window.sequencer) {
            alert('시퀀서가 초기화되지 않았습니다.');
            return;
        }

        const patternData = {
            name: name,
            ...window.sequencer.exportPattern(),
            timestamp: Date.now(),
            version: '2.0'
        };

        // 저장된 패턴 목록 가져오기
        const savedPatterns = this.getSavedPatterns();
        
        // 중복 이름 체크 및 덮어쓰기 확인
        const existingIndex = savedPatterns.findIndex(p => p.name === name);
        if (existingIndex !== -1) {
            if (!confirm(`'${name}' 패턴이 이미 존재합니다. 덮어쓰시겠습니까?`)) {
                return;
            }
            savedPatterns[existingIndex] = patternData;
        } else {
            savedPatterns.push(patternData);
        }

        // 최대 20개 패턴까지만 저장
        if (savedPatterns.length > 20) {
            savedPatterns.shift();
        }

        localStorage.setItem(this.storagePrefix + 'patterns', JSON.stringify(savedPatterns));
        
        if (window.beatDrumApp) {
            window.beatDrumApp.showInfo(`패턴 '${name}'이 저장되었습니다.`);
        }
    }

    // 저장된 패턴 목록 가져오기
    getSavedPatterns() {
        const saved = localStorage.getItem(this.storagePrefix + 'patterns');
        return saved ? JSON.parse(saved) : [];
    }

    // 패턴 불러오기
    loadPattern(patternData) {
        if (!window.sequencer) {
            alert('시퀀서가 초기화되지 않았습니다.');
            return;
        }

        try {
            window.sequencer.importPattern(patternData);
            if (window.beatDrumApp) {
                window.beatDrumApp.showInfo(`패턴 '${patternData.name}'을 불러왔습니다.`);
            }
        } catch (error) {
            console.error('패턴 로드 오류:', error);
            alert('패턴을 불러오는 중 오류가 발생했습니다.');
        }
    }

    // 패턴을 JSON 파일로 다운로드
    downloadPattern() {
        if (!window.sequencer) {
            alert('시퀀서가 초기화되지 않았습니다.');
            return;
        }

        const patternData = {
            name: `Beat Pattern ${new Date().toLocaleString()}`,
            ...window.sequencer.exportPattern(),
            timestamp: Date.now(),
            version: '2.0',
            app: 'Beat Drum'
        };

        const jsonString = JSON.stringify(patternData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `beat-pattern-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (window.beatDrumApp) {
            window.beatDrumApp.showInfo('패턴이 다운로드되었습니다.');
        }
    }

    // 파일에서 패턴 로드
    loadFromFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const patternData = JSON.parse(e.target.result);
                
                // 기본 유효성 검사
                if (!patternData.pattern || !patternData.bpm) {
                    throw new Error('Invalid pattern format');
                }

                this.loadPattern(patternData);
            } catch (error) {
                console.error('파일 로드 오류:', error);
                alert('올바르지 않은 패턴 파일입니다.');
            }
        };
        reader.readAsText(file);
        
        // 파일 입력 초기화
        event.target.value = '';
    }

    // 프리셋 슬롯 클릭 처리
    handlePresetClick(event) {
        event.preventDefault();
        const slot = parseInt(event.target.dataset.slot);
        
        if (event.shiftKey) {
            // Shift + 클릭: 현재 패턴을 슬롯에 저장
            this.saveToPreset(slot);
        } else {
            // 일반 클릭: 슬롯에서 패턴 로드
            this.loadFromPreset(slot);
        }
    }

    // 프리셋 슬롯 우클릭 처리 (삭제)
    handlePresetRightClick(event) {
        event.preventDefault();
        const slot = parseInt(event.target.dataset.slot);
        
        if (this.hasPreset(slot)) {
            if (confirm(`프리셋 ${slot}을 삭제하시겠습니까?`)) {
                this.deletePreset(slot);
            }
        }
    }

    // 프리셋에 저장
    saveToPreset(slot) {
        if (!window.sequencer) {
            alert('시퀀서가 초기화되지 않았습니다.');
            return;
        }

        const patternData = {
            name: `Preset ${slot}`,
            ...window.sequencer.exportPattern(),
            timestamp: Date.now(),
            version: '2.0'
        };

        localStorage.setItem(this.storagePrefix + `preset_${slot}`, JSON.stringify(patternData));
        this.updatePresetDisplay();
        
        if (window.beatDrumApp) {
            window.beatDrumApp.showInfo(`프리셋 ${slot}에 저장되었습니다.`);
        }
    }

    // 프리셋에서 로드
    loadFromPreset(slot) {
        const saved = localStorage.getItem(this.storagePrefix + `preset_${slot}`);
        if (!saved) {
            if (window.beatDrumApp) {
                window.beatDrumApp.showInfo(`프리셋 ${slot}이 비어있습니다. Shift+클릭으로 저장하세요.`);
            }
            return;
        }

        try {
            const patternData = JSON.parse(saved);
            this.loadPattern(patternData);
            this.currentPreset = slot;
            this.updatePresetDisplay();
        } catch (error) {
            console.error('프리셋 로드 오류:', error);
            alert('프리셋을 불러오는 중 오류가 발생했습니다.');
        }
    }

    // 프리셋 삭제
    deletePreset(slot) {
        localStorage.removeItem(this.storagePrefix + `preset_${slot}`);
        if (this.currentPreset === slot) {
            this.currentPreset = null;
        }
        this.updatePresetDisplay();
        
        if (window.beatDrumApp) {
            window.beatDrumApp.showInfo(`프리셋 ${slot}이 삭제되었습니다.`);
        }
    }

    // 프리셋이 존재하는지 확인
    hasPreset(slot) {
        return localStorage.getItem(this.storagePrefix + `preset_${slot}`) !== null;
    }

    // 프리셋 표시 업데이트
    updatePresetDisplay() {
        document.querySelectorAll('.preset-btn').forEach((btn, index) => {
            const slot = index + 1;
            const hasData = this.hasPreset(slot);
            
            btn.classList.toggle('saved', hasData);
            btn.title = hasData 
                ? `프리셋 ${slot} (저장됨)\n클릭: 로드\nShift+클릭: 저장\n우클릭: 삭제`
                : `프리셋 ${slot} (비어있음)\nShift+클릭: 저장`;
        });
    }

    // 저장된 패턴 삭제 (관리용)
    deleteSavedPattern(name) {
        const savedPatterns = this.getSavedPatterns();
        const filteredPatterns = savedPatterns.filter(p => p.name !== name);
        localStorage.setItem(this.storagePrefix + 'patterns', JSON.stringify(filteredPatterns));
    }

    // 모든 저장 데이터 지우기 (초기화)
    clearAllData() {
        if (confirm('모든 저장된 패턴과 프리셋을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            // 패턴 데이터 삭제
            localStorage.removeItem(this.storagePrefix + 'patterns');
            
            // 프리셋 데이터 삭제
            for (let i = 1; i <= this.presetSlots; i++) {
                localStorage.removeItem(this.storagePrefix + `preset_${i}`);
            }
            
            this.currentPreset = null;
            this.updatePresetDisplay();
            
            if (window.beatDrumApp) {
                window.beatDrumApp.showInfo('모든 저장 데이터가 삭제되었습니다.');
            }
        }
    }

    // 저장 용량 정보 표시
    getStorageInfo() {
        let totalSize = 0;
        const patterns = this.getSavedPatterns();
        totalSize += JSON.stringify(patterns).length;
        
        for (let i = 1; i <= this.presetSlots; i++) {
            const preset = localStorage.getItem(this.storagePrefix + `preset_${i}`);
            if (preset) {
                totalSize += preset.length;
            }
        }

        return {
            patternCount: patterns.length,
            presetCount: Array.from({length: this.presetSlots}, (_, i) => this.hasPreset(i + 1)).filter(Boolean).length,
            totalSize: totalSize,
            maxPatterns: 20,
            maxPresets: this.presetSlots
        };
    }
}

// 전역 저장 시스템 인스턴스
window.patternStorage = null;