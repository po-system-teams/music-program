import { doubleClick, msToMinutes } from '@/utils';
import { defineComponent } from 'vue';
import './index.scss';

export default defineComponent({
	name: 'MusicItemBlock',
	props: {
		list: {
			type: Array,
			default: () => [],
		},
	},
	setup(props, context) {
		function playMusic(musicId: number) {
			doubleClick(() => {
				context.emit('playMusic', musicId);
			});
		}
		return () => (
			<div class="music_program_item_block">
				{props.list.map((item: any) => {
					return (
						// 歌曲名称
						<div key={item.id} class="music_program_item desabled-copy" onClick={playMusic.bind(this, item.id)}>
							<div class="music_program_item_name ellipsis">
								<span>{item.name}</span>
							</div>
							<div class="music_program_item_artist ellipsis">
								{/* 歌手名称 */}
								<span>{item.artistsName}</span>
							</div>
							{/* 专辑名称 */}
							<div class="music_program_item_album ellipsis">
								<span>{item.album.name}</span>
							</div>
							<div class="music_program_item_duration ellipsis">
								<span>{msToMinutes(item.duration)}</span>
							</div>
						</div>
					);
				})}
			</div>
		);
	},
});
