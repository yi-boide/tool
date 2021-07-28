<template>
	<view>
		<view class="pad-top" :style="{height: height+'px'}"></view>
		<view class="custom" :style="style">
			<slot v-if="$slots['default']"></slot>
			<view v-else class="bar flex" :style="{height: height+'px'}">
				<view class="left flex">
					<slot v-if="$slots['left']" name="left"></slot>
					<text @tap="backPage" v-else-if="!$slots['left']&&isBlack" class="iconfont icon-fanhui fz-36"></text>
				</view>
				<view class="mid">
					<slot v-if="$slots['title']" name="title"></slot>
					<text v-else>{{title}}</text>
				</view>
				<view class="right" @click="rightClick">
					<slot v-if="$slots['right']" name="right"></slot>
					<text v-else>{{rightTitle}}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
/**
 * yj-header 头部自定义组件
 * @description 头部自定义组件
 * @property {Boolean} isBlack 是否展示返回按钮 默认: true
 * @property {String} color 字体颜色 默认: #000
 * @property {String} bgColor 背景颜色颜色 默认: #FFF
 * @property {String} title 头部标题 默认: ''
 * @property {String} bgImage 背景图片 默认: ''
 * @property {String} rightTitle 右侧按钮文字 默认: ''
 * @property {Boolean} borderBottom 底部下划线 默认: false
 * @property {[String,Number]} height 头部的高度 默认: 100 单位rpx
 * @event {Function} toCard 点击卡片后会带上卡片对象返回
 */
export default {
	name: 'sundeheng-custom',
	props: {
		isBlack: {
			type: Boolean,
			default: true
		},
		color: {
			type: String,
			default: '#000'
		},
		bgColor: {
			type: String,
			default: '#fff'
		},
		title: {
			type: String,
			default: ''
		},
		bgImage: {
			type: String,
			default: ''
		},
		rightTitle: {
			type: String,
			default: ''
		},
		borderBottom: {
			type: Boolean,
			default: false
		},
		height: {
			type: [String, Number],
			default: 50
		}
	},
	data() {
		return {
			StatusBar: 25,
			CustomBar: 65
		}
	},
	computed: {
		style() {
			var StatusBar = this.StatusBar
			var CustomBar = this.CustomBar
			var bgImage = this.bgImage
			var bgColor = this.bgColor
			var color = this.color
            var height = this.height
			var style = `height:${height}px;`
			if (this.bgImage) {
				style = `${style}background-image:url(${bgImage});`
			}
			if (this.bgColor) {
				style = `${style}background:${bgColor};`
			}

			if (this.color) {
				style = `${style}color:${color};`
			}
			if (this.borderBottom) {
				style = `${style}border-bottom:1px solid #F3F3F3`
			}
			return style
		}
	},
	methods: {
		backPage() {
			uni.navigateBack({
				delta: 1
			})
		},
		rightClick() {
			!!this.rightTitle&&this.$emit('rightClick')
		}
	}
}
</script>

<style scoped>
.flex {
	display: flex;
}
.pad-top {
	padding-top: var(--status-bar-height);
	box-sizing: initial;
}
.custom {
	padding-top: var(--status-bar-height);
	box-sizing: initial;
	width: 100%;
	position: fixed;
	top: 0;
	left: 0;
	z-index: 99;
}
.bar {
	align-items: center;
	justify-content: space-between;
	padding: 0 15px;
}
.right,
.left {
	flex: 1;
	font-size: 38upx;
}
.right {
	font-size: 30rpx;
	height: 46rpx;
	display: flex;
	align-items: flex-end;
	justify-content: flex-end;
}
.mid {
	display: flex;
	flex-basis: 200px;
	justify-content: center;
	font-size: 20px;
	font-weight: 700;
}

</style>
