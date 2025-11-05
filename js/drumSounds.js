// 드럼 사운드 관리 클래스
class DrumSounds {
    constructor() {
        this.audioContext = null;
        this.sounds = {
            kick: null,
            snare: null,
            hihat: null,
            tom: null,
            openhat: null,
            crash: null,
            ride: null,
            clap: null,
            cowbell: null,
            shaker: null,
            hitom: null,
            lotom: null
        };
        this.isLoaded = false;
        this.usingRealSounds = false;
        // 실제 사운드 파일 로딩을 비활성화 (404 오류 방지)
        this.disableRealSounds = true; // 실제 파일이 있으면 false로 설정
        this.initializationPromise = this.initialize();
    }

    // 비동기 초기화
    async initialize() {
        try {
            this.initAudioContext();
            
            if (this.audioContext) {
                // 실제 오디오 파일 로드 시도
                await this.loadRealSounds();
                console.log('🎵 Beat Drum 사운드 시스템 초기화 완료');
            } else {
                console.warn('⚠️ Web Audio API를 사용할 수 없습니다');
            }
        } catch (error) {
            console.error('❌ 사운드 시스템 초기화 실패:', error);
            // 오류가 발생해도 더미 사운드라도 생성
            this.createDummySounds();
        }
    }

    // 오디오 컨텍스트 초기화
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.error('Web Audio API를 지원하지 않는 브라우저입니다:', error);
        }
    }

    // 더미 드럼 사운드 생성 (실제 파일이 없을 때 사용)
    createDummySounds() {
        if (!this.audioContext) return;

        // 킥 드럼 사운드 생성 (저주파) - 기존 사운드가 없을 때만
        if (!this.sounds.kick) {
            this.sounds.kick = this.createSynthSound({
                frequency: 60,
                duration: 0.5,
                type: 'sine',
                envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.2 }
            });
        }

        // 스네어 드럼 사운드 생성 (노이즈 + 고주파)
        if (!this.sounds.snare) {
            this.sounds.snare = this.createSynthSound({
                frequency: 200,
                duration: 0.2,
                type: 'square',
                noise: true,
                envelope: { attack: 0.01, decay: 0.1, sustain: 0.05, release: 0.1 }
            });
        }

        // 하이햇 사운드 생성 (고주파 노이즈)
        if (!this.sounds.hihat) {
            this.sounds.hihat = this.createSynthSound({
                frequency: 8000,
                duration: 0.1,
                type: 'square',
                noise: true,
                envelope: { attack: 0.01, decay: 0.05, sustain: 0.02, release: 0.05 }
            });
        }

        // 탐 사운드 생성 (중간 주파수)
        if (!this.sounds.tom) {
            this.sounds.tom = this.createSynthSound({
                frequency: 150,
                duration: 0.4,
                type: 'sine',
                envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.2 }
            });
        }

        // 오픈 하이햇 사운드 생성 (긴 지속음)
        if (!this.sounds.openhat) {
            this.sounds.openhat = this.createSynthSound({
                frequency: 10000,
                duration: 0.3,
                type: 'square',
                noise: true,
                envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.2 }
            });
        }

        // 크래시 심벌 사운드 생성 (고주파 + 긴 지속음)
        if (!this.sounds.crash) {
            this.sounds.crash = this.createSynthSound({
                frequency: 12000,
                duration: 1.2,
                type: 'square',
                noise: true,
                metallic: true,
                envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.9 }
            });
        }

        // 라이드 심벌 사운드 생성 (중고주파 + 메탈릭)
        if (!this.sounds.ride) {
            this.sounds.ride = this.createSynthSound({
                frequency: 6000,
                duration: 0.8,
                type: 'sawtooth',
                noise: true,
                metallic: true,
                envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.5 }
            });
        }

        // 클랩 사운드 생성 (다중 어택)
        if (!this.sounds.clap) {
            this.sounds.clap = this.createMultiAttackSound({
                frequency: 1000,
                duration: 0.15,
                attacks: 3,
                attackDelay: 0.01
            });
        }

        // 카우벨 사운드 생성 (메탈릭 톤)
        if (!this.sounds.cowbell) {
            this.sounds.cowbell = this.createSynthSound({
                frequency: 800,
                duration: 0.3,
                type: 'triangle',
                metallic: true,
                envelope: { attack: 0.01, decay: 0.15, sustain: 0.1, release: 0.15 }
            });
        }

        // 셰이커 사운드 생성 (짧은 노이즈 버스트)
        if (!this.sounds.shaker) {
            this.sounds.shaker = this.createSynthSound({
                frequency: 15000,
                duration: 0.08,
                type: 'square',
                noise: true,
                envelope: { attack: 0.01, decay: 0.03, sustain: 0.02, release: 0.04 }
            });
        }

        // 하이 탐 사운드 생성 (고음 탐)
        if (!this.sounds.hitom) {
            this.sounds.hitom = this.createSynthSound({
                frequency: 220,
                duration: 0.35,
                type: 'sine',
                envelope: { attack: 0.01, decay: 0.15, sustain: 0.1, release: 0.2 }
            });
        }

        // 로우 탐 사운드 생성 (저음 탐)
        if (!this.sounds.lotom) {
            this.sounds.lotom = this.createSynthSound({
                frequency: 100,
                duration: 0.5,
                type: 'sine',
                envelope: { attack: 0.01, decay: 0.25, sustain: 0.15, release: 0.25 }
            });
        }

        this.isLoaded = true;
    }

    // 신스 사운드 생성
    createSynthSound(config) {
        return () => {
            if (!this.audioContext) return;

            const now = this.audioContext.currentTime;
            const gainNode = this.audioContext.createGain();
            
            // 메탈릭 사운드를 위한 리버브 효과
            if (config.metallic) {
                const convolver = this.audioContext.createConvolver();
                const reverbBuffer = this.createReverbBuffer(0.5, 0.3);
                convolver.buffer = reverbBuffer;
                
                const dryGain = this.audioContext.createGain();
                const wetGain = this.audioContext.createGain();
                dryGain.gain.value = 0.7;
                wetGain.gain.value = 0.3;
                
                gainNode.connect(dryGain);
                gainNode.connect(convolver);
                convolver.connect(wetGain);
                
                dryGain.connect(this.audioContext.destination);
                wetGain.connect(this.audioContext.destination);
            } else {
                gainNode.connect(this.audioContext.destination);
            }

            if (config.noise) {
                // 노이즈 생성 (심벌, 하이햇용)
                const bufferSize = this.audioContext.sampleRate * config.duration;
                const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
                const output = buffer.getChannelData(0);

                for (let i = 0; i < bufferSize; i++) {
                    output[i] = Math.random() * 2 - 1;
                }

                const noise = this.audioContext.createBufferSource();
                noise.buffer = buffer;

                const filter = this.audioContext.createBiquadFilter();
                filter.type = config.metallic ? 'bandpass' : 'highpass';
                filter.frequency.setValueAtTime(config.frequency, now);
                filter.Q.value = config.metallic ? 10 : 1;

                noise.connect(filter);
                filter.connect(gainNode);
                noise.start(now);
                noise.stop(now + config.duration);
            } else {
                // 오실레이터 생성 (킥, 탐용)
                const oscillator = this.audioContext.createOscillator();
                oscillator.type = config.type;
                oscillator.frequency.setValueAtTime(config.frequency, now);
                
                if (config.metallic) {
                    // 메탈릭 사운드를 위한 주파수 모듈레이션
                    oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 0.8, now + config.duration * 0.1);
                    oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 1.2, now + config.duration * 0.3);
                    oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 0.9, now + config.duration);
                } else {
                    oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 0.1, now + config.duration);
                }

                oscillator.connect(gainNode);
                oscillator.start(now);
                oscillator.stop(now + config.duration);
            }

            // ADSR 엔벨로프 적용
            const { attack, decay, sustain, release } = config.envelope;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.8, now + attack);
            gainNode.gain.exponentialRampToValueAtTime(sustain, now + attack + decay);
            gainNode.gain.linearRampToValueAtTime(0, now + config.duration);
        };
    }

    // 다중 어택 사운드 생성 (클랩용)
    createMultiAttackSound(config) {
        return () => {
            if (!this.audioContext) return;

            for (let i = 0; i < config.attacks; i++) {
                setTimeout(() => {
                    const now = this.audioContext.currentTime;
                    const gainNode = this.audioContext.createGain();
                    gainNode.connect(this.audioContext.destination);

                    // 노이즈 생성
                    const bufferSize = this.audioContext.sampleRate * config.duration;
                    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
                    const output = buffer.getChannelData(0);

                    for (let j = 0; j < bufferSize; j++) {
                        output[j] = Math.random() * 2 - 1;
                    }

                    const noise = this.audioContext.createBufferSource();
                    noise.buffer = buffer;

                    const filter = this.audioContext.createBiquadFilter();
                    filter.type = 'bandpass';
                    filter.frequency.setValueAtTime(config.frequency, now);
                    filter.Q.value = 5;

                    noise.connect(filter);
                    filter.connect(gainNode);

                    // 각 어택마다 약간씩 다른 볼륨
                    const volume = 0.6 + (i * 0.1);
                    gainNode.gain.setValueAtTime(0, now);
                    gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + config.duration);

                    noise.start(now);
                    noise.stop(now + config.duration);
                }, i * config.attackDelay * 1000);
            }
        };
    }

    // 리버브 버퍼 생성
    createReverbBuffer(duration, decay) {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(2, length, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const n = length - i;
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
            }
        }

        return buffer;
    }

    // 사운드 폴더 경로를 동적으로 찾기
    async findSoundsPath() {
        const possiblePaths = [
            'assets/sounds/',      // 기본 경로
            './assets/sounds/',    // 명시적 상대 경로
            '../assets/sounds/',   // 상위 폴더
            '../../assets/sounds/', // 2단계 상위 폴더
            'sounds/',            // 사운드 폴더만
            './sounds/',          // 현재 위치의 사운드 폴더
        ];

        for (const path of possiblePaths) {
            try {
                // README.md 파일의 존재로 폴더 확인
                const response = await fetch(`${path}README.md`);
                if (response.ok) {
                    console.log(`📁 사운드 폴더 경로 발견: ${path}`);
                    return path;
                }
            } catch (error) {
                // 404나 네트워크 오류는 조용히 무시
                continue;
            }
        }
        
        console.log('📁 기본 사운드 경로 사용: assets/sounds/');
        return 'assets/sounds/';
    }

    // 사운드 폴더에 실제 파일이 있는지 확인
    async checkSoundFilesExist(soundsPath) {
        // 대표적인 사운드 파일 몇 개만 확인해서 실제 파일 존재 여부를 판단
        const testFiles = ['kick.wav', 'kick.mp3', 'snare.wav', 'snare.mp3'];
        
        for (const testFile of testFiles) {
            try {
                const response = await fetch(`${soundsPath}${testFile}`, { method: 'HEAD' });
                if (response.ok) {
                    console.log(`✅ 실제 사운드 파일 발견: ${testFile}`);
                    return true;
                }
            } catch (error) {
                // 404는 조용히 무시
                continue;
            }
        }
        return false;
    }

    // 실제 오디오 파일들을 로드 시도
    async loadRealSounds() {
        if (!this.audioContext) {
            console.warn('⚠️ AudioContext가 없어 신스 사운드만 사용합니다');
            this.createDummySounds();
            return;
        }

        // 실제 사운드 파일 로딩이 비활성화된 경우
        if (this.disableRealSounds) {
            console.log('🎹 실제 사운드 파일 로딩이 비활성화되어 신스 사운드를 사용합니다');
            this.createDummySounds();
            return;
        }

        // 동적으로 사운드 폴더 경로 찾기
        const soundsPath = await this.findSoundsPath();

        // 실제 사운드 파일이 있는지 먼저 확인
        const hasRealSounds = await this.checkSoundFilesExist(soundsPath);

        if (!hasRealSounds) {
            console.log('🎹 실제 사운드 파일이 없어 신스 사운드를 사용합니다');
            this.createDummySounds();
            return;
        }

        // 실제 파일이 있는 경우에만 로드 시도
        const soundFiles = {
            kick: ['kick.wav', 'kick.mp3', 'kick.ogg'],
            snare: ['snare.wav', 'snare.mp3', 'snare.ogg'],
            hihat: ['hihat.wav', 'hihat.mp3', 'hihat.ogg'],
            tom: ['tom.wav', 'tom.mp3', 'tom.ogg'],
            openhat: ['openhat.wav', 'openhat.mp3', 'openhat.ogg'],
            crash: ['crash.wav', 'crash.mp3', 'crash.ogg'],
            ride: ['ride.wav', 'ride.mp3', 'ride.ogg'],
            clap: ['clap.wav', 'clap.mp3', 'clap.ogg'],
            cowbell: ['cowbell.wav', 'cowbell.mp3', 'cowbell.ogg'],
            shaker: ['shaker.wav', 'shaker.mp3', 'shaker.ogg'],
            hitom: ['hitom.wav', 'hitom.mp3', 'hitom.ogg'],
            lotom: ['lotom.wav', 'lotom.mp3', 'lotom.ogg']
        };

        let loadedCount = 0;
        const totalSounds = Object.keys(soundFiles).length;

        try {
            console.log('🎵 실제 사운드 파일 로드 시작...');

            // 모든 사운드 로드를 병렬로 시도
            const loadPromises = Object.entries(soundFiles).map(async ([soundName, fileNames]) => {
                for (const fileName of fileNames) {
                    try {
                        const success = await this.loadSoundFile(soundName, `${soundsPath}${fileName}`);
                        if (success) {
                            loadedCount++;
                            return { soundName, fileName, success: true };
                        }
                    } catch (error) {
                        continue;
                    }
                }
                return { soundName, success: false };
            });

            const results = await Promise.all(loadPromises);
            
            // 결과 로깅
            results.forEach(result => {
                if (result.success) {
                    console.log(`✅ ${result.soundName} 사운드 로드 성공: ${result.fileName}`);
                }
            });

            if (loadedCount > 0) {
                this.usingRealSounds = true;
                console.log(`🎵 ${loadedCount}/${totalSounds}개의 실제 드럼 사운드 로드됨`);
            }

            // 로드되지 않은 사운드들을 위해 신스 사운드 생성
            this.createDummySounds();

        } catch (error) {
            console.warn('⚠️ 사운드 파일 로드 중 오류 발생, 신스 사운드를 사용합니다:', error.message);
            this.createDummySounds();
        }
    }

    // 현재 환경이 로컬 파일인지 확인
    isLocalFile() {
        return window.location.protocol === 'file:';
    }

    // 실제 오디오 파일 로드 (HEAD 요청으로 먼저 확인)
    async loadSoundFile(soundName, url) {
        if (!this.audioContext) return false;

        try {
            // 먼저 HEAD 요청으로 파일 존재 확인 (404 오류 방지)
            const headResponse = await fetch(url, { method: 'HEAD' });
            if (!headResponse.ok) {
                return false;
            }

            // 파일이 존재하면 실제 데이터 로드
            const response = await fetch(url);
            if (!response.ok) {
                return false;
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            this.sounds[soundName] = () => {
                const source = this.audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(this.audioContext.destination);
                source.start();
            };

            return true;
        } catch (error) {
            // CORS 오류 감지 및 안내
            if (error.name === 'TypeError' && this.isLocalFile()) {
                console.log('ℹ️ 로컬 파일에서 실행 중 - 서버를 통해 실행하면 실제 사운드 파일을 로드할 수 있습니다');
            }
            // 네트워크 오류나 파일 없음은 조용히 무시
            return false;
        }
    }

    // 사운드 재생
    playSound(soundName) {
        if (!this.audioContext) {
            console.warn(`⚠️ AudioContext가 없어 사운드를 재생할 수 없습니다: ${soundName}`);
            return;
        }

        if (!this.sounds[soundName]) {
            console.warn(`⚠️ 사운드를 찾을 수 없습니다: ${soundName}`);
            return;
        }

        try {
            // 오디오 컨텍스트가 suspended 상태인 경우 재개
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    this.sounds[soundName]();
                }).catch(error => {
                    console.error(`AudioContext 재개 실패 (${soundName}):`, error);
                });
            } else {
                this.sounds[soundName]();
            }
        } catch (error) {
            console.error(`❌ 사운드 재생 오류 (${soundName}):`, error);
        }
    }

    // 모든 사운드가 로드되었는지 확인 (비동기 초기화 고려)
    async isReady() {
        try {
            if (this.initializationPromise) {
                await this.initializationPromise;
            }
            return this.isLoaded && this.audioContext && this.audioContext.state !== 'closed';
        } catch (error) {
            console.error('사운드 시스템 준비 상태 확인 오류:', error);
            return false;
        }
    }

    // 동기 버전의 준비 상태 확인 (하위 호환성)
    isReadySync() {
        return this.isLoaded && this.audioContext && this.audioContext.state !== 'closed';
    }

    // 실제 사운드 파일 로딩 활성화/비활성화
    setRealSoundsEnabled(enabled) {
        this.disableRealSounds = !enabled;
        if (enabled && !this.usingRealSounds) {
            console.log('🎵 실제 사운드 파일 로딩이 활성화되었습니다. 페이지를 새로고침하여 적용하세요.');
        }
    }

    // 볼륨 조절 (향후 구현)
    setVolume(soundName, volume) {
        // 향후 구현 예정
        console.log(`${soundName} 볼륨을 ${volume}으로 설정`);
    }
}

// 전역 드럼 사운드 인스턴스 (안전하게 생성)
try {
    window.drumSounds = new DrumSounds();
    console.log('🎵 DrumSounds 인스턴스 생성됨');
} catch (error) {
    console.error('❌ DrumSounds 인스턴스 생성 실패:', error);
}