import music_header from '@/components/layout/music_header';
import music_item_block from '@/components/music_item_block';
import music_player from '@/components/music_player';
import musicStore from '@/stores/music';
import type { musicResourceType } from '@/types/music';
import { defineComponent, getCurrentInstance, reactive, ref, watch } from 'vue';
import './index.scss';

export default defineComponent({
	components: { music_item_block, music_player, music_header },
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
		const store = musicStore();
		watch(
			() => store.searchValue,
			(newValue) => {
				searchMusic(newValue);
			}
		);
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
		return () => (
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
		);
	},
});
