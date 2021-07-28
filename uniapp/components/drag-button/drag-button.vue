<template>
	<view>
		<view
			:id="'_drag_button'+getTime"
			class="drag"
			:style="'left: ' + left + 'px; top:' + top + 'px;'+`opacity: ${opacity};`"
			@touchstart="touchstart"
			@touchmove.stop.prevent="touchmove"
			@touchend="touchend"
			@click.stop.prevent="click"
			:class="{transition: isDock && !isMove }"
		>
			<slot></slot>
			<text>{{ text }}</text>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'drag-button',
		props: {
			isDock:{
				type: Boolean,
				default: false
			},
			existTabBar:{
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				getTime: new Date().getTime(),
				top:0,
				left:0,
				width: 0,
				height: 0,
				offsetWidth: 0,
				offsetHeight: 0,
				windowWidth: 0,
				windowHeight: 0,
				isMove: true,
				edge: 10,
				text: 'Add',
				opacity: 0
			}
		},
		mounted() {
			const sys = uni.getSystemInfoSync();
			
			this.windowWidth = sys.windowWidth;
			this.windowHeight = sys.windowHeight;
			
			// #ifdef APP-PLUS
				this.existTabBar && (this.windowHeight -= 50);
			// #endif
			if (sys.windowTop) {
				this.windowHeight += sys.windowTop;
			}
			
			const query = uni.createSelectorQuery().in(this);
			query.select('#_drag_button'+this.getTime).boundingClientRect(data => {
				this.width = data.width;
				this.height = data.height;
				this.offsetWidth = data.width / 2;
				this.offsetHeight = data.height / 2;
				this.opacity = 1
				this.left = this.windowWidth - this.width - this.edge;
				this.top = this.windowHeight - this.height - this.edge;
			}).exec();
		},
		methods: {
			click() {
				this.$emit('btnClick');
			},
			touchstart(e) {
				this.$emit('btnTouchstart');
			},
			touchmove(e) {
				// 单指触摸
				if (e.touches.length !== 1) {
					return false;
				}
				
				this.isMove = true;
				
				this.left = e.touches[0].clientX - this.offsetWidth;
				
				let clientY = e.touches[0].clientY - this.offsetHeight;
				// #ifdef H5
					clientY += this.height;
				// #endif
				let edgeBottom = this.windowHeight - this.height - this.edge;

				// 上下触及边界
				if (clientY < this.edge) {
					this.top = this.edge;
				} else if (clientY > edgeBottom) {
					this.top = edgeBottom;
				} else {
					this.top = clientY
				}
				
			},
			touchend(e) {
				if (this.isDock) {
					let edgeRigth = this.windowWidth - this.width - this.edge;
					
					if (this.left < this.windowWidth / 2 - this.offsetWidth) {
						this.left = this.edge;
					} else {
						this.left = edgeRigth;
					}
					
				}
				
				this.isMove = false;
				
				this.$emit('btnTouchend');
			},
		}}
</script>

<style lang="scss">
	.drag {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background: #185a88;
		box-shadow: 0 0 6rpx rgba(0, 0, 0, 0.4);
		color: #fff;
		width: 160rpx;
		height: 160rpx;
		border-radius: 50%;
		font-size: 28rpx;
		position: fixed;
		z-index: 99;
		
		text{
			margin-top: 10rpx;
		}
		&.transition {
			transition: left .3s ease,top .3s ease;
		}
	}
	
</style>
