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
        this.initAudioContext();
        this.createDummySounds(); // 실제 오디오 파일이 없는 경우 더미 사운드 생성
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

        // 킥 드럼 사운드 생성 (저주파)
        this.sounds.kick = this.createSynthSound({
            frequency: 60,
            duration: 0.5,
            type: 'sine',
            envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.2 }
        });

        // 스네어 드럼 사운드 생성 (노이즈 + 고주파)
        this.sounds.snare = this.createSynthSound({
            frequency: 200,
            duration: 0.2,
            type: 'square',
            noise: true,
            envelope: { attack: 0.01, decay: 0.1, sustain: 0.05, release: 0.1 }
        });

        // 하이햇 사운드 생성 (고주파 노이즈)
        this.sounds.hihat = this.createSynthSound({
            frequency: 8000,
            duration: 0.1,
            type: 'square',
            noise: true,
            envelope: { attack: 0.01, decay: 0.05, sustain: 0.02, release: 0.05 }
        });

        // 탐 사운드 생성 (중간 주파수)
        this.sounds.tom = this.createSynthSound({
            frequency: 150,
            duration: 0.4,
            type: 'sine',
            envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.2 }
        });

        // 오픈 하이햇 사운드 생성 (긴 지속음)
        this.sounds.openhat = this.createSynthSound({
            frequency: 10000,
            duration: 0.3,
            type: 'square',
            noise: true,
            envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.2 }
        });

        // 크래시 심벌 사운드 생성 (고주파 + 긴 지속음)
        this.sounds.crash = this.createSynthSound({
            frequency: 12000,
            duration: 1.2,
            type: 'square',
            noise: true,
            metallic: true,
            envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.9 }
        });

        // 라이드 심벌 사운드 생성 (중고주파 + 메탈릭)
        this.sounds.ride = this.createSynthSound({
            frequency: 6000,
            duration: 0.8,
            type: 'sawtooth',
            noise: true,
            metallic: true,
            envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.5 }
        });

        // 클랩 사운드 생성 (다중 어택)
        this.sounds.clap = this.createMultiAttackSound({
            frequency: 1000,
            duration: 0.15,
            attacks: 3,
            attackDelay: 0.01
        });

        // 카우벨 사운드 생성 (메탈릭 톤)
        this.sounds.cowbell = this.createSynthSound({
            frequency: 800,
            duration: 0.3,
            type: 'triangle',
            metallic: true,
            envelope: { attack: 0.01, decay: 0.15, sustain: 0.1, release: 0.15 }
        });

        // 셰이커 사운드 생성 (짧은 노이즈 버스트)
        this.sounds.shaker = this.createSynthSound({
            frequency: 15000,
            duration: 0.08,
            type: 'square',
            noise: true,
            envelope: { attack: 0.01, decay: 0.03, sustain: 0.02, release: 0.04 }
        });

        // 하이 탐 사운드 생성 (고음 탐)
        this.sounds.hitom = this.createSynthSound({
            frequency: 220,
            duration: 0.35,
            type: 'sine',
            envelope: { attack: 0.01, decay: 0.15, sustain: 0.1, release: 0.2 }
        });

        // 로우 탐 사운드 생성 (저음 탐)
        this.sounds.lotom = this.createSynthSound({
            frequency: 100,
            duration: 0.5,
            type: 'sine',
            envelope: { attack: 0.01, decay: 0.25, sustain: 0.15, release: 0.25 }
        });

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

    // 실제 오디오 파일 로드 (향후 사용)
    async loadSoundFile(soundName, url) {
        try {
            const response = await fetch(url);
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
            console.error(`${soundName} 사운드 로드 실패:`, error);
            return false;
        }
    }

    // 사운드 재생
    playSound(soundName) {
        if (!this.audioContext || !this.sounds[soundName]) {
            console.warn(`사운드를 찾을 수 없습니다: ${soundName}`);
            return;
        }

        // 오디오 컨텍스트가 suspended 상태인 경우 재개
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        try {
            this.sounds[soundName]();
        } catch (error) {
            console.error(`사운드 재생 오류 (${soundName}):`, error);
        }
    }

    // 모든 사운드가 로드되었는지 확인
    isReady() {
        return this.isLoaded && this.audioContext && this.audioContext.state !== 'closed';
    }

    // 볼륨 조절 (향후 구현)
    setVolume(soundName, volume) {
        // 향후 구현 예정
        console.log(`${soundName} 볼륨을 ${volume}으로 설정`);
    }
}

// 전역 드럼 사운드 인스턴스
window.drumSounds = new DrumSounds();