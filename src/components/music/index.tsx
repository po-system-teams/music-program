import type { musicResourceType } from '@/types/music';
import { defineComponent, getCurrentInstance, reactive, ref } from 'vue';
import music_header from '../layout/music_header';
import music_drawer_lyric from '../music_drawer_lyric';
import music_item_block from '../music_item_block';
import music_player from '../music_player';
import './index.scss';

export default defineComponent({
	windowWidth: 1000,
	windowHeight: 800,
	components: { music_item_block, music_player, music_header, music_drawer_lyric },
	customHeader: true, // 开启自定义头部
	setup() {
		const { proxy } = getCurrentInstance() as any;
		const songs = ref<Array<any>>([]);
		const currentPlayingMusic = ref<number>(0);
		const musicPlayList = ref<Array<number>>([]);
		const drawerLyric = ref<boolean>(false);
		const musicResource = reactive<musicResourceType>({
			musicId: 0,
			musicName: '',
			musicArtistsName: '',
			musicArtistsUrl: '',
			musicAlbumImg: '',
			musicDuration: 0,
			musicCurrentTime: 0,
		});
		function playMusic(id: number) {
			musicResource.musicId = id;
			console.log('播放歌曲', musicResource.musicId);
			// 过滤出当前播放列表的id，传给player组件循环播放
			musicPlayList.value = songs.value.map((item) => item.id);
		}
		// 搜索歌曲
		function searchMusic(value: string) {
			console.log('搜索歌曲', value);
			proxy.$axios.get(`/search?keywords=${value}`).then((res: any) => {
				res.songs = res.songs.map((item: any) => {
					let artistsName: string = '';
					if (item.artists.length) {
						item.artists.forEach((artisItem: any) => {
							artistsName += artisItem.name;
						});
					}
					item.artistsName = artistsName;
					return item;
				});
				songs.value = res.songs;
			});
		}
		// 打开歌词
		function openDrawerLyric() {
			drawerLyric.value = true;
		}
		return () => {
			return (
				<div class="music_program program_content">
					<div class="music_program_main">
						<music_header onSearch={searchMusic}></music_header>
						<div class="music_program_content">
							<music_item_block list={songs.value} onPlayMusic={playMusic}></music_item_block>
							<music_player
								currentPlayingMusic={currentPlayingMusic.value}
								v-model={musicResource}
								musicPlayList={musicPlayList.value}
								drawerLyric={drawerLyric.value}
								onClickAlbum={openDrawerLyric}
							></music_player>
						</div>
					</div>
					<music_drawer_lyric v-model={drawerLyric.value} v-model:musicResource={musicResource} />
				</div>
			);
		};
	},
});
