// import { dragDirective } from '@/utils/directives';
import musicStore from '@/stores/music';
import { dragDirective } from '@/utils/directives';
import { defineComponent, ref } from 'vue';
import './index.scss';

export default defineComponent({
	emits: ['search'],
	directives: {
		dragDirective,
	},
	setup(props, { emit }) {
		const searchValue = ref<string>('');
		// 回车按钮
		function searchKeyDown(e: KeyboardEvent) {
			if (e.keyCode === 13) {
				const store = musicStore();
				store.searchValue = searchValue.value;
			}
		}
		return () => (
			<div class="music_program_custom_header" data-move={true} v-dragDirective={true}>
				<div class="music_program_custom_header_left">
					<div class={{ music_search_box: true, hover_music_search_box: searchValue.value === '' }}>
						<span class="iconfont icon-sousuo"></span>
						<input class="music_search" v-model={searchValue.value} type="text" placeholder="搜索音乐" onKeydown={searchKeyDown}></input>
					</div>
				</div>
			</div>
		);
	},
});
