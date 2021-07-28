<template>
	<view class="yj-select" :style="{'margin-right': marginRight+'rpx'}">
		<view v-if="type" class="" @tap="popupShow = !popupShow">
			<view class="card-item-text flex align-center justify-between">
				<view class="item-text flex align-start flex-direction">
						<view class="item-name fc-999 fz-28 pb-30">{{ labelTitle }}</view>
						<view class="item-value fz-30 fb" :class="{'fc-999': valueJudeg}">{{ valueToLabel }}</view>
				</view>
				<view class="iconfont icon-you fz-30"></view>
			</view>
		</view>
		<view v-else class="select-text bg-F3 flex-row-center" :class="{'active': myValue!==''}" @tap="popupShow = !popupShow">
			<text class="fb omit-one">{{ valueToLabel }}</text>
			<text class="iconfont icon-xiangxia1 fz-40 arrows pl-10"></text>
		</view>
		<!-- 弹窗 -->
		<u-popup :mode="mode" v-model="popupShow" :mask-close-able="maskCloseAble" :border-radius="borderRadius">
			<view class="popup-select">
				<view class="popup-select-title">
					<view class="icon" @tap="popupShow=!popupShow">
						<text class="iconfont icon-cuo fz-36 fc-999"></text>
					</view>
					<text class="fb">{{ title || placeholder }}</text>
					<view v-if="checkbox" class="confirm fz-32" @click="confirm">
						<text>确定</text>
					</view>
				</view>
				<scroll-view scroll-y :class="{'mh': type}">
					<view class="popup-select-cont flex flex-wrap plr-32">
						<block v-for="(item,index) in list" :key="index">
							<view class="item-text" :class="{'active fb': valueActive(item.value)}" @tap="tapLabel(item)">
								<text class="omit-one">{{item.label}}</text>
							</view>
						</block>
					</view>
				</scroll-view>
			</view>
		</u-popup>
	</view>
</template>

<script>
/**
 * yj-select 单选弹窗选择组件
 * @description 单选弹窗选择组件
 * @property {[String, Number, Array]} value 双向绑定值 默认: ''
 * @property {String} mode 弹窗方式 	top / left / right / bottom / center  默认: top
 * @property {Boolean} type 展示的类型 横条，按钮	 默认: false
 * @property {Boolean} checkbox 是否多选	 默认: false
 * @property {String} placeholder 提示文字 默认: 请选择
 * @property {String} labelTitle label标题 默认: ''
 * @property {String} title 头部标题 默认: ''
 * @property {Array} list 可选择的内容列表，格式为 [{value: '唯一值', label: '文字描述'}] 默认: []
 * @property {[String, Number]} marginRight 右margin 单位：rpx 默认: 12
 * @property {Boolean} maskCloseAble 点击遮罩是否可以关闭弹出层	 默认: true
 * @property {[String, Number]} borderRadius 圆角角度 单位：rpx	 默认: 10
 */
export default {
	props: {
		value: {
			type: [String, Number, Array],
			default: ''
		},
		type: {
			type: Boolean,
			default: false
		},
		checkbox: {
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
			default: 12
		},
		maskCloseAble: {
			type: Boolean,
			default: true
		},
		borderRadius: {
			type: [String, Number],
			default: 10
		}
	},
	computed: {
		valueJudeg() {
			if (Array.isArray(this.myValue)) {
				return !this.myValue.length
			}
			return !this.myValue
		},
		valueToLabel() {
			if (this.list.length && !this.valueJudeg) {
				if (this.checkbox&&Array.isArray(this.myValue)) {
					const labelArr = this.list.filter(o => this.myValue.indexOf(o.value) !== -1)
					const labelValue = labelArr.map(o => o.label).join('-')
					return !this.myValue.length ? this.placeholder : labelValue
				}
				const [{label}] = this.list.filter(o => o.value === this.myValue)
				return this.myValue === '' ? this.placeholder : label
			}
			return this.placeholder
		},
		valueActive() {
			return (value) => {
				if (this.checkbox) {
					return this.checkboxValue.indexOf(value) !== -1
				}
				return this.myValue === value
			}
		}
	},
	watch: {
		value(newVal) {
			if (this.checkbox) {
				this.checkboxValue = JSON.parse(JSON.stringify(newVal))
			}
			this.myValue = newVal
		},
		myValue(newVal) {
			if (this.checkbox) {
				this.checkboxValue = JSON.parse(JSON.stringify(newVal))
			}
			this.$emit('input', newVal)
		}
	},
	data() {
		return {
			popupShow: false,
			myValue: this.value,
			checkboxValue: JSON.parse(JSON.stringify(this.value))
		}
	},
	methods: {
		tapLabel(item) {
			if (this.checkbox) {
				if (this.checkboxValue.indexOf(item.value) !== -1) {
					this.checkboxValue.splice(this.checkboxValue.indexOf(item.value), 1)
					return
				}
				if (this.checkboxValue.length>=3) {
					getApp().toast('最多只能选择三个')
					return
				}
				this.checkboxValue.push(item.value)
			} else {
				this.myValue = item.value
				this.popupShow = !this.popupShow
			}
		},
		confirm() {
			this.myValue = JSON.parse(JSON.stringify(this.checkboxValue))
			this.popupShow = !this.popupShow
		}
	}
}
</script>

<style lang="scss" scoped>
.mh{
	height: calc(100vh - var(--status-bar-height) - 50px);
}
.select-text {
	max-width: 230rpx;
	padding: 15rpx 20rpx;
	border-radius: 10rpx;
    color: #999999;
	&.active{
		color: #1F6E4E;
	}
}
.card-item-text {
	padding-bottom: 40rpx;
	padding-top: 30rpx;
	border-bottom: 1rpx solid #F3F3F3;
}
.popup-select{
	padding-top: var(--status-bar-height);
	.popup-select-title{
		height: 50px;
		line-height: 50px;
		text-align: center;
		font-size: 36rpx;
		border-bottom: 1rpx solid #f3f3f3;
		position: relative;
		.icon{
			position: absolute;
			left: 0;
			height: 100%;
			padding: 0 32rpx;
		}
		.confirm{
			position: absolute;
			top: 0;
			right: 0;
			height: 100%;
			padding: 0 32rpx;
		}
	}
	.popup-select-cont{
		padding-bottom: 32rpx;
		.item-text{
			margin-top: 32rpx;
			width: 208rpx;
			height: 98rpx;
			line-height: 98rpx;
			background: #F3F3F3;
			border-radius: 10rpx;
			text-align: center;
			border: 2rpx solid #F3F3F3;
			&:not(:nth-child(3n)){
				margin-right: 30rpx;
			}
			&.active{
				background-color: #FFFFFF;
				border: 2rpx solid #1F6E4E;
				color: #1F6E4E;
			}
		}
	}
}
</style>
