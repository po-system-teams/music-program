import processes from '@/stores/processes';
import type { lyricTimeType, lyricType } from '@/types/music';
import { computed, defineComponent, getCurrentInstance, ref, watch, withModifiers } from 'vue';
import './index.scss';

export default defineComponent({
	props: {
		modelValue: {
			type: Boolean,
			default: false,
		},
		musicResource: {
			type: Object,
			default: () => {},
		},
	},
	emits: ['update:modelValue'],
	setup(props, { emit }) {
		const { proxy } = getCurrentInstance() as any;
		const store = processes();
		const mouseDown = store.activeProgram.mouseDown; // 获取拖拽方法
		const mouseMove = store.activeProgram.mouseMove; // 获取拖拽方法
		const mouseUp = store.activeProgram.mouseUp; // 获取拖拽方法
		const lyricList = ref<lyricType>([]);
		const lyricTimes = ref<lyricTimeType>([]);
		const lyric_content = ref<any>(null);
		watch(
			() => props.modelValue,
			() => {
				getLyric();
			}
		);
		const currentLyric = computed(() => {
			if (props.musicResource.musicCurrentTime !== undefined && lyricTimes.value.length > 0) {
				for (let i = 0; i < lyricTimes.value.length; i++) {
					const minTime = lyricTimes.value[i][0];
					const maxTime = lyricTimes.value[i][1];
					if (minTime < props.musicResource.musicCurrentTime && props.musicResource.musicCurrentTime < maxTime) {
						return i;
					}
				}
			}
			return 0;
		});
		watch(currentLyric, (newValue) => {
			if (lyric_content.value && newValue > 7) {
				lyric_content.value.scrollTop = (newValue - 6) * 38.39;
			}
		});
		async function getLyric() {
			if (props.musicResource.musicId) {
				// 获取歌词
				const res = await proxy.$axios.get(`/lyric?id=${props.musicResource.musicId}`);
				if (res.lrc && res.lrc.lyric) {
					const arr = res.lrc.lyric.split('\n');
					lyricList.value = disposeLyric(arr);
					lyricTimes.value = disposeTime(arr);
				}
			}
		}
		// 处理歌词
		function disposeLyric(list: Array<any>): lyricType {
			const pattern = /\]\s*(.*$)/;
			return list.map((lyricItem) => {
				if (lyricItem) {
					const text = lyricItem.match(pattern);
					return text[1];
				}
				return '';
			});
		}
		// 处理歌词时间返回格式
		function disposeTime(list: Array<any>): lyricTimeType {
			const reg = /\[(\d+)(\:(\d+))?\.(.+)\]/;
			const result: lyricTimeType = [];
			list.forEach((lyricItem) => {
				if (lyricItem) {
					const regRes = lyricItem.match(reg);
					const minute = regRes[1] * 60;
					const second = regRes[3] * 1;
					const millisecond = regRes[4] * 0.001;
					const time = minute + second + millisecond;
					result.push([time, 0]);
				}
			});
			return result.map((lyricItem, index, array) => {
				return [lyricItem[0], array[index + 1] ? array[index + 1][0] : 9999];
			});
		}
		// 关闭歌词
		function closeDrawer() {
			emit('update:modelValue', false);
		}
		return () => (
			<div class={{ music_program_drawer: true, show_drawer_lyric: props.modelValue }}>
				<div class="drawer_bg_img" style={{ backgroundImage: `url(${props.musicResource.musicAlbumImg}?param=800y800)` }}></div>
				<div
					class="drawer_lyric_header"
					data-move={true}
					onMousedown={withModifiers(mouseDown, ['left'])}
					onMousemove={mouseMove}
					onMouseup={mouseUp}
				>
					<div class="close_btn" onClick={closeDrawer}>
						<span class="iconfont icon-arrow-down"></span>
					</div>
				</div>
				{lyricList.value.length && (
					<div class="drawer_lyric_main">
						<div class="vinyl">
							<div class="vinyl_box">
								<img class="vinyl_bg" src={new URL('@/assets/music/artists.png', import.meta.url).href} alt="" />
								<img class="vinyl_album" src={`${props.musicResource.musicAlbumImg}?param=100y100`} alt="" />
							</div>
						</div>
						<div class="info">
							<div class="info_detail">
								<div class="detial_name">{props.musicResource.musicName}</div>
								<div class="detail_artists">
									<span>歌手：{props.musicResource.musicArtistsName}</span>
									<span>专辑：{props.musicResource.musicAlbumName}</span>
								</div>
							</div>
							<div class="lyric_content" ref={lyric_content}>
								{lyricList.value.map((text, index) => {
									return <div class={{ lyric_text: true, lyric_text_active: index === currentLyric.value }}>{text}</div>;
								})}
							</div>
						</div>
					</div>
				)}
			</div>
		);
	},
});
