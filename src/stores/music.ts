import { defineStore } from 'pinia';
import { ref } from 'vue';

const musicStore = defineStore('musicStore', () => {
	const searchValue = ref(''); // 搜索文案
	return { searchValue };
});

export default musicStore;
