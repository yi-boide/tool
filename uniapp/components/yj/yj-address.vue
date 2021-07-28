<template>
	<view class="yj-address" :style="{'margin-right': marginRight+'rpx'}">
		<view v-if="type" class="" @tap="popupShow = !popupShow">
			<view class="card-item-text flex align-center justify-between">
				<view class="item-text flex align-start flex-direction">
						<view class="item-name fc-999 fz-28 pb-30">{{ labelTitle }}</view>
						<view class="item-value fz-30 fb" :class="{'fc-999': valueJudeg}">{{ valueToLabel }}</view>
				</view>
				<view class="iconfont icon-you fz-30"></view>
			</view>
		</view>
		<view v-else class="address-text bg-F3 flex flex-row-center" :class="[myValue ? 'mcor' : 'fc-999']"  @tap="popupShow = !popupShow">
			<text class="fb omit-one">{{ valueToLabel }}</text>
			<text class="iconfont icon-xiangxia1 fz-40 arrows pl-10"></text>
		</view>
		<!-- 弹窗 -->
		<u-popup :mode="mode" v-model="popupShow" :mask-close-able="maskCloseAble" :border-radius="borderRadius">
			<view class="popup-address">
				<view class="popup-address-title">
					<view class="icon" @tap="popupShow=!popupShow">
						<text class="iconfont icon-cuo fz-36 fc-999"></text>
					</view>
					<text>{{ title || placeholder }}</text>
				</view>
				<view class="popup-address-cont">
					<view class="flex">
						<view class="left">
							<scroll-view scroll-y class="mh">
								<block v-for="(item,index) in cityList" :key="index">
									<view class="item-province" :class="{'active': province === item.value}" @tap="tapProvince(item)">
										<text class="omit-one">{{item.label}}</text>
									</view>
								</block>
							</scroll-view>
						</view>
						<view class="right plr-32">
							<scroll-view scroll-y class="mh">
								<view class="flex flex-wrap">
									<block v-for="(item,index) in cityArr.children" :key="index">
										<view class="item-city" :class="{'active': item.value === myValue}" @tap="tapCity(item)">
											<text class="omit-one">{{item.label }}</text>
										</view>
									</block>
								</view>
							</scroll-view>
						</view>
					</view>
				</view>
				<view class="popup-address-btn">
					<u-button type="primary" :custom-style="{height: '88rpx'}" @click="confirm()">确定</u-button>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
import areaData from '@/common/area-data-min.js'
/**
 * yj-address 城市选择组件
 * @description 城市选择组件
 * @property {[String, Number]} value 双向绑定值 默认: ''
 * @property {Boolean} type 展示的类型 横条，按钮	 默认: false
 * @property {String} labelTitle label标题 默认: ''
 * @property {String} mode 弹窗方式 	top / left / right / bottom / center  默认: top
 * @property {String} placeholder 提示文字 默认: 请选择
 * @property {String} title 头部标题 默认: ''
 * @property {Array} list 额外城市选择的内容(热门城市，全国) 默认: []
 * @property {[String, Number]} marginRight 右margin 单位：rpx 默认: 0
 * @property {Boolean} maskCloseAble 点击遮罩是否可以关闭弹出层	 默认: true
 * @property {[String, Number]} borderRadius 圆角角度 单位：rpx	 默认: 0
 */
export default {
	props: {
		value: {
			type: [String, Number],
			default: ''
		},
		type: {
			type: Boolean,
			default: false
		},
		mode: {
			type: String,
			default: 'top'
		},
		labelTitle: {
			type: String,
			default: ''
		},
		title: {
			type: String,
			default: ''
		},
		list: {
			type: Array,
			default: () => {
				return []
			}
		},
		placeholder: {
			type: String,
			default: '请选择'
		},
		marginRight: {
			type: [String, Number],
			default: 0
		},
		maskCloseAble: {
			type: Boolean,
			default: true
		},
		borderRadius: {
			type: [String, Number],
			default: 0
		}
	},
	data() {
		return {
			popupShow: false,
			myValue: '',
			province: '',
			cityList: []
		}
	},
	created() {
		this.myValue = this.value
		this.province = this.cityList[0]?.value
		this.cityList = [...this.list]
	},
	watch: {
		value(newVal) {
			this.myValue = newVal
		},
		list(newVal) {
			this.cityList = [...newVal]
			this.province = this.cityList[0].value
		}
	},
	computed: {
		valueJudeg() {
			if (Array.isArray(this.myValue)) {
				return !this.myValue.length
			}
			return !this.myValue
		},
		cityArr() {
			const cityArr = this.cityList.filter(o => o.value === this.province)
			return cityArr[0] || this.cityList[0]
		},
		valueToLabel() {
			if (this.cityList.length) {
				const provinceList = this.cityList.filter(o => o.value === this.province)
				const [{children = ''}] = provinceList.length ? provinceList : [{}]
				if (!children) return this.placeholder;
				const cityList = children && children.filter(o => o.value === this.myValue)
				const [{label = ''}] = cityList.length ? cityList : [{}]
				return this.myValue ? label : this.placeholder
			}
			return this.placeholder
		}
	},
	methods: {
		tapProvince(item) {
			this.myValue = ''
			this.province=item.value
		},
		tapCity(item) {
			this.myValue = item.value
		},
		confirm() {
			this.$emit('input', this.myValue)
			this.popupShow = !this.popupShow
		}
	}
}
</script>

<style lang="scss" scoped>
.address-text {
	max-width: 230rpx;
    padding: 15rpx 20rpx;
    border-radius: 10rpx;
}
.card-item-text {
	padding-bottom: 40rpx;
	padding-top: 30rpx;
	border-bottom: 1rpx solid #F3F3F3;
}
.popup-address{
	padding-top: var(--status-bar-height);
	.popup-address-title{
		height: 50px;
		line-height: 50px;
		text-align: center;
		font-weight: bold;
		font-size: 36rpx;
		border-bottom: 1rpx solid #f3f3f3;
		position: relative;
		.icon{
			position: absolute;
			left: 0;
			height: 100%;
			padding: 0 32rpx;
		}
	}
	.mh{
		height: calc(100vh - var(--status-bar-height) - 50px - 108rpx);
	}
	.popup-address-cont{
		.left{
			width: 278rpx;
		}
		.right{
			width: 472rpx;
		}
	}
	.popup-address-btn{
		padding: 10rpx 32rpx;
		height: 108rpx;
	}
}
.item-province{
	height: 108rpx;
	line-height: 108rpx;
	background: #F3F3F3;
	font-size: 32rpx;
	padding-left: 32rpx;
	&.active{
		font-weight: bold;
		background-color: #ffffff;
	}
}
.item-city{
	margin-top: 16rpx;
	width: 194rpx;
	height: 98rpx;
	line-height: 98rpx;
	background: #F3F3F3;
	border-radius: 10rpx;
	text-align: center;
	transition: all .3s;
	padding: 0 8rpx;
	border: 2rpx solid #F3F3F3;
	&:not(:nth-child(2n)){
		margin-right: 20rpx;
	}
	&.active{
		background-color: #FFFFFF;
		border: 2rpx solid #1F6E4E;
		color: #1F6E4E;
		font-weight: bold;
	}
}
</style>
