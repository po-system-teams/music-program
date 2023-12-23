import { playModeTypes } from '@/types/music';
import { shuffleArray } from '@/utils';
import { computed, defineComponent, getCurrentInstance, reactive, ref, watch } from 'vue';
import './index.scss';
export default defineComponent({
	name: 'MusicPlayer',
	props: {
		musicPlayList: {
			type: Array,
			default() {
				return [];
			},
		},
		playMode: {
			type: String,
			default: playModeTypes.SEQUENCE,
		},
		modelValue: {
			type: Object,
			default() {
				return {
					musicId: 0,
					musicName: '',
					musicArtistsName: '',
					musicArtistsUrl: '',
					musicAlbumImg: '',
					musicAlbumName: '',
					musicDuration: 0,
					musicCurrentTime: 0,
				};
			},
		},
		drawerLyric: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['clickAlbum', 'update:modelValue'],
	setup(props, { emit }) {
		const { proxy } = getCurrentInstance() as any;
		const musicIndex = reactive({
			index: -1, //正常播放列表位置
			random: -1, // 随机播放列表位置
		});
		const musicResource = computed({
			get() {
				return props.modelValue;
			},
			set() {
				emit('update:modelValue', musicResource);
			},
		});
		// 当前播放位置
		const currentPlayIndex = computed({
			get: () => (props.playMode === playModeTypes.RANDOM ? musicIndex.random : musicIndex.index),
			set: (val) => {
				if (props.playMode === playModeTypes.RANDOM) {
					musicIndex.random = val;
				} else {
					musicIndex.index = val;
				}
			},
		});
		const musicPlayListRandom = ref<Array<number>>([]); // 随机播放列表
		const playMode = ref(props.playMode);
		watch(
			() => props.modelValue.musicId,
			(newValue) => {
				if (newValue) {
					updateMusic(true);
					init();
				}
			}
		);
		watch(
			() => props.musicPlayList,
			(newValue) => {
				if (newValue) {
					// 新的播放列表传入，需要重新洗牌,生成随机播放的列表
					musicPlayListRandom.value = shuffleArray(newValue) as number[];
				}
			}
		);
		async function init() {
			// 初始化
			playStatus.value = false;
			const detail = await getMusicInfoDetail(musicResource.value.musicId);
			const resource = await getMusicResource(musicResource.value.musicId);
			if (resource.length) {
				musicResource.value.musicArtistsUrl = resource[0].url;
			}
			if (detail.songs.length) {
				musicResource.value.musicName = detail.songs[0].name;
				musicResource.value.musicArtistsName = detail.songs[0].ar.map((item: any) => item.name).join('/');
				musicResource.value.musicAlbumImg = detail.songs[0].al.picUrl;
				musicResource.value.musicAlbumName = detail.songs[0].al.name;
				musicResource.value.musicDuration = detail.songs[0].dt;
			}
			playMusic();
		}
		const musicAudio = ref<HTMLAudioElement | null>(null); // refs
		const playStatus = ref(false);
		// 更新当前播放音乐的
		function updateMusic(onlyUpdateIndex: boolean = false, updateType: string = 'next'): void {
			if (props.musicPlayList.length) {
				if (currentPlayIndex.value === -1 || onlyUpdateIndex) {
					// 获取当前播放的index
					currentPlayIndex.value = props.musicPlayList.findIndex((id) => id === musicResource.value.musicId);
				} else {
					// 判断播放模式
					switch (playMode.value) {
						case playModeTypes.SEQUENCE:
						case playModeTypes.RANDOM:
						default:
							// 顺序播放
							// 随机播放
							// 默认顺序播放
							if (currentPlayIndex.value === props.musicPlayList.length - 1) {
								currentPlayIndex.value = 0;
							} else {
								currentPlayIndex.value = updateType === 'next' ? currentPlayIndex.value + 1 : currentPlayIndex.value - 1;
							}
							break;
						case playModeTypes.CYCLE:
							// 循环播放
							musicAudio.value?.load();
							playStatus.value = false;
							playMusic();
							break;
					}
					musicResource.value.musicId =
						playMode.value === playModeTypes.RANDOM
							? musicPlayListRandom.value[currentPlayIndex.value]
							: (props.musicPlayList[currentPlayIndex.value] as number);
				}
			}
		}
		function getMusicInfoDetail(id: number) {
			// 获取音乐详情
			if (id) {
				return proxy.$axios.get('/song/detail?ids=' + id);
			}
		}
		function getMusicResource(id: number) {
			// 获取音乐资源，播放链接
			if (id) {
				return proxy.$axios.get('/song/url?id=' + id);
			}
		}
		// 是否可以播放
		function canPlayListener(e = false) {
			return Promise.resolve();
		}
		// 播放音乐
		async function playMusic() {
			await canPlayListener();
			// 播放音乐
			if (musicAudio.value) {
				if (!playStatus.value) {
					musicAudio.value.play().then(() => {
						playStatus.value = true;
					});
				} else {
					musicAudio.value.pause();
					playStatus.value = false;
				}
			}
		}
		// 下一首
		function nextMusic() {
			updateMusic();
		}
		// 上一首
		function prevMusic() {
			updateMusic(false, 'prev');
		}
		// 音乐播放进度
		function timeupdateListener() {
			if (musicAudio.value) {
				musicResource.value.musicCurrentTime = musicAudio.value.currentTime;
			}
		}
		// 音乐长度
		function durationChangeListener() {
			if (musicAudio.value) {
				musicResource.value.musicDuration = musicAudio.value.duration;
			}
		}
		// 拖动音乐进度条
		function changePlayTime(e: any) {
			if (musicAudio.value) {
				musicAudio.value.currentTime = e.target.value * 1;
			}
		}
		// 播放结束
		function endedListener() {
			updateMusic();
		}
		// 修改播放模式
		function changePlayMode() {
			switch (playMode.value) {
				case playModeTypes.SEQUENCE:
					playMode.value = playModeTypes.RANDOM;
					break;
				case playModeTypes.RANDOM:
					playMode.value = playModeTypes.CYCLE;
					break;
				case playModeTypes.CYCLE:
					playMode.value = playModeTypes.SEQUENCE;
			}
			updateMusic(true); // 修改完更新下index
		}
		function clickAlbumImg() {
			emit('clickAlbum');
		}
		return () => (
			<div class={{ music_player: true, music_player_drawer: props.drawerLyric }}>
				<div class="music_player_progress_bar">
					<input
						type="range"
						min={0}
						max={musicResource.value.musicDuration}
						step={1}
						value={musicResource.value.musicCurrentTime}
						onChange={changePlayTime}
						onInput={changePlayTime}
					/>
				</div>
				<div class="music_player_tools">
					{musicResource.value.musicArtistsUrl && (
						<audio
							ref={musicAudio}
							src={musicResource.value.musicArtistsUrl}
							onTimeupdate={timeupdateListener}
							onDurationchange={durationChangeListener}
							onEnded={endedListener}
							onCanplay={() => canPlayListener}
						></audio>
					)}
					<div class="music_player_left">
						<div class="music_player_img">
							<img src={`${musicResource.value.musicAlbumImg}?param=40y40`} onClick={clickAlbumImg} />
						</div>
						<div class="music_player_info">
							<div class="music_player_info_name">
								<span>{musicResource.value.musicName}</span>
							</div>
							<div>
								<span class="music_player_info_artist">{musicResource.value.musicArtistsName}</span>
							</div>
						</div>
					</div>
					<div class="music_player_controller">
						<div class="music_player_controller_btn">
							<div class="music_player_controller_btn_prev" onClick={prevMusic}>
								<span class="iconfont icon-shangyiqu"></span>
							</div>
							<div class="music_player_controller_btn_play" onClick={playMusic}>
								{playStatus.value ? <span class="iconfont icon-bofangzhong"></span> : <span class="iconfont icon-zanting"></span>}
							</div>
							<div class="music_player_controller_btn_next" onClick={nextMusic}>
								<span class="iconfont icon-xiayiqu"></span>
							</div>
							<div class="music_player_controller_btn_mode" onClick={changePlayMode}>
								{playMode.value === playModeTypes.SEQUENCE && <span class="iconfont icon-liebiaoxunhuan"></span>}
								{playMode.value === playModeTypes.RANDOM && <span class="iconfont icon-suijibofang"></span>}
								{playMode.value === playModeTypes.CYCLE && <span class="iconfont icon-danquxunhuan"></span>}
							</div>
						</div>
					</div>
					<div class="music_player_right"></div>
				</div>
			</div>
		);
	},
});
