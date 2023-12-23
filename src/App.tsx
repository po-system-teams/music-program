import music_header from '@/components/layout/music_header';
import { ElAside, ElContainer, ElHeader, ElMain } from 'element-plus';
import { defineComponent } from 'vue';
import { RouterView } from 'vue-router';

export default defineComponent({
	components: {
		ElContainer,
		ElHeader,
		ElMain,
		ElAside,
		music_header,
	},
	name: 'App',
	setup() {
		return () => (
			<el-container class="music_program program_content">
				<el-aside width="200px">
					<div class="music_program_side">
						<p>歌曲列表</p>
					</div>
				</el-aside>
				<el-container>
					<el-header>
						<music_header></music_header>
					</el-header>
					<el-main>
						<RouterView></RouterView>
					</el-main>
				</el-container>
			</el-container>
		);
	},
});
