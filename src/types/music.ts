// 播放模式
export enum playModeTypes {
	RANDOM = 'random', // 随机播放
	SEQUENCE = 'sequence', // 顺序播放
	CYCLE = 'cycle', // 单曲循环
}

export interface musicResourceType {
	musicId?: number; // 音乐id
	musicName?: string; // 音乐名称
	musicArtistsName?: string; // 歌手名称
	musicArtistsUrl?: string; // MP3地址
	musicAlbumImg?: string; // 专辑图片
	musicAlbumName?: string; // 专辑名称
	musicDuration?: number; // 音乐总长度
	musicCurrentTime?: number; // 当前播放时间
}

// 歌词
export interface lyricTimeType extends Array<Array<number>> {}
export interface lyricType extends Array<string> {
	[index: number]: string;
}
