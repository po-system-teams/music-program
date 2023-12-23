export const dragDirective = {
	mounted(el: HTMLElement) {
		const store = window.$wujie?.props?.appProgramStore;
		if (!store) return;
		const mouseDown = store.activeProgram.mouseDown; // 获取拖拽方法
		const mouseMove = store.activeProgram.mouseMove; // 获取拖拽方法
		const mouseUp = store.activeProgram.mouseUp; // 获取拖拽方法
		el.onmousedown = (e: MouseEvent) => {
			mouseDown(e);
		};
		el.onmousemove = (e: MouseEvent) => {
			mouseMove(e);
		};
		el.onmouseup = (e: MouseEvent) => {
			mouseUp(e);
		};
	},
};
