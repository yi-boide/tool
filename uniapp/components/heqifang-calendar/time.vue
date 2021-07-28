<template>
	<view class="detail-time">
		<view class="detail-time-head" @click="show = true">
			<view class="uni-calendar__header-btn-box" @click.stop.prevent="pre(true)">
				<text class="uni-calendar__header-btn uni-calendar--left"></text>
			</view>
			<view class="head-time">
				<text class="head-time-month">{{selectedDate[0] | dateEng(type)}}</text>
				<text class="head-time-range" v-if="type==='Monthly' || type==='Weekly'">{{selectedDate[0] | dateEng('day')}} - {{selectedDate[selectedDate.length-1] | dateEng('day')}}</text>
			</view>
			<view class="uni-calendar__header-btn-box" @click.stop.prevent="pre(false)">
				<text class="uni-calendar__header-btn uni-calendar--right"></text>
			</view>
		</view>
		<u-popup v-model="show" mode="center" :z-index="99" border-radius="16">
			<view class="popup-box">
				<view class="popup-box-head">Switch Date</view>
				<view class="popup-box-content" v-if="type!=='Monthly'">
					<calendar :startDate="startDate" :endDate="endDate" :dateType="type" :limitFlag="false" :showMonth="false" :selectDate="selectedDate" @change="calendarChange">
					</calendar>
				</view>
				<view class="popup-box-content" v-else>
					<view class="uni-calendar__header">
						<view class="uni-calendar__header-btn-box" @click="preYear">
							<view class="uni-calendar__header-btn uni-calendar--left"></view>
						</view>
						<text class="uni-calendar__header-text">{{ monthDate[0] | dateEng('Weekly')}}</text>
						<view class="uni-calendar__header-btn-box" @click="nextYear">
							<view class="uni-calendar__header-btn uni-calendar--right"></view>
						</view>
						<text class="uni-calendar__backtoday" @click="backtoday">{{'This Month'}}</text>
					</view>
					<view class="select-year-list">
					  <view class="select-year-list-around">
					    <block v-for="(item, i) in engMonth" :key="i">
					      <view class="item" @click="clickMonth(i)">
					         <view class="item-month" :class="{'active': isShow(i)}">{{item}}</view>
					      </view>
					    </block>
					  </view>
					</view>
				</view>
				<view class="popup-box-btn">
					<view class="btn btn-cancel" @click="show = false;">Cancel</view>
					<view class="btn btn-confirm" @click="show = false;onConfirm()">Confirm</view>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
import calendar from './calendar.vue'
import * as month from './month.js'
export default {
	components: {
		calendar
	},
	props: {
		type: {
			type: String,
			default: 'Daily'
		},
		selectDate: {
			type: Array,
			default: () => {
				return []
			}
		}
	},
	data() {
		return {
			show: false,
			startDate : '1970-01-01', // limitFlag == true 有效
			selectedDate: [],
			calendarDate: [],
			engMonth: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
			monthDate: [],
			seleDate: []
		};
	},
	computed:{
		endDate() {
			return month.dateFormat('YYYY-mm-dd', new Date())
		},
		isShow() {
			return (i) => {
				const seleceYear = new Date(this.seleDate[0]).getFullYear()
				const seleceMonth = new Date(this.seleDate[0]).getMonth()
				const currentYear = new Date(this.monthDate[0]).getFullYear()
				return seleceYear === currentYear && seleceMonth === i
			}
		}
	},
	watch: {
		type(newVal) {
			this.selectedDate = JSON.parse(JSON.stringify(this.selectDate))
		},
		selectDate(newVal) {
			this.selectedDate = JSON.parse(JSON.stringify(newVal))
			if (this.type === 'Monthly') {
				this.seleDate = this.monthDate = JSON.parse(JSON.stringify(newVal))
			} else {
        this.calendarDate = JSON.parse(JSON.stringify(newVal))
      }
		}
	},
	created() {
		this.selectedDate = JSON.parse(JSON.stringify(this.selectDate))
		if (this.type === 'Monthly') {
			this.seleDate = this.monthDate = JSON.parse(JSON.stringify(this.selectDate))
		} else {
      this.calendarDate = JSON.parse(JSON.stringify(this.selectDate))
    }
	},
	methods: {
		onConfirm() {
			let date = []
			switch(this.type) {
				case 'Daily':
					date = this.calendarDate
					break;
				case 'Monthly':
					date = this.seleDate
					break;
				default:
					date = this.calendarDate
					break;
			}
			this.selectedDate = JSON.parse(JSON.stringify(date))
			this.$emit('confirm', date)
		},
		pre(bool) {
			let date = ''
			switch(this.type) {
				case 'Daily':
					if (bool) {
						date = [month.dateFormat('YYYY-mm-dd', new Date(new Date(this.selectedDate[0]).getTime() - 24*60*60*1000))]
					} else {
						if (new Date(this.selectedDate[0]).getTime() - new Date().getTime() < -24*60*60*1000) {
							date = [month.dateFormat('YYYY-mm-dd', new Date(new Date(this.selectedDate[0]).getTime() + 24*60*60*1000))]
						} else {
							getApp().toast('Only statistics before the current date can be viewed')
							return
						}
					}
					break;
				case 'Monthly':
					const year = new Date(this.selectedDate[0]).getFullYear()
					const month = new Date(this.selectedDate[0]).getMonth()
					if (bool) {
						date = this.seleDate = this.monthDate = JSON.parse(JSON.stringify(month.getMonthFirstEnd(new Date(year, month - 1, 1))))
					} else {
						if (year === new Date().getFullYear() && month >= new Date().getMonth()) {
							getApp().toast('Only statistics before the current date can be viewed')
							return
						}
						date = this.seleDate = this.monthDate = JSON.parse(JSON.stringify(month.getMonthFirstEnd(new Date(year, month + 1, 1))))
					}
					break;
				default:
					if (bool) {
						date = month.getPreviousWeekDay(this.selectedDate[0])
					} else {
						if (new Date(this.selectedDate[this.selectedDate.length-1]).getTime() - new Date().getTime() < -24*60*60*1000) {
							date = month.getNextWeekDay(this.selectedDate[0])
						} else {
							getApp().toast('Only statistics before the current date can be viewed')
							return
						}
					}
					break;
			}
			this.selectedDate = JSON.parse(JSON.stringify(date))
			this.$emit('confirm', date)
		},
		calendarChange({selectedDate}) {
			this.calendarDate = JSON.parse(JSON.stringify(selectedDate))
		},
		preYear() {
			const year = new Date(this.monthDate[0]).getFullYear() - 1
			const month = new Date(this.monthDate[0]).getMonth()
			this.monthDate = JSON.parse(JSON.stringify(month.getMonthFirstEnd(new Date(year, month, 1))))
		},
		nextYear() {
			const year = new Date(this.monthDate[0]).getFullYear() + 1
			const month = new Date(this.monthDate[0]).getMonth()
			if (year <= new Date().getFullYear()) {
				this.monthDate = JSON.parse(JSON.stringify(month.getMonthFirstEnd(new Date(year, month, 1))))
			} else {
				getApp().toast('You can only view the data before that year')
			}
		},
		backtoday() {
			this.seleDate = this.monthDate = JSON.parse(JSON.stringify(month.getMonthFirstEnd(new Date())))
		},
		clickMonth(month) {
			const year = new Date(this.monthDate[0]).getFullYear()
			if (year === new Date().getFullYear() && month > new Date().getMonth()) {
				getApp().toast('Only statistics before the current date can be viewed')
				return
			}
			this.seleDate = this.monthDate = JSON.parse(JSON.stringify(month.getMonthFirstEnd(new Date(year, month, 1))))
		}
	},
	filters: {
		dateEng(date, type) {
			date = new Date(date)
			const year = date.getFullYear().toString()
			const month = date.getMonth()
			let day = date.getDate().toString()
			day = day < 10 ? `0${day}` : day
			const engMonth = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
			let dateTime = ''
			switch(type) {
				case 'Daily':
					dateTime = `${year} ${engMonth[month]} ${day}`
					break;
				case 'Monthly':
					dateTime = `${year} ${engMonth[month]}`
					break;
				case 'Weekly':
					dateTime = `${year}`
					break;
				case 'day':
					dateTime = `${engMonth[month]} ${day}`
					break;
				default:
					dateTime = `${year} ${engMonth[month]} ${day}`
					break;
			}
			return dateTime;
		}
	}
};
</script>

<style lang="scss" scoped>
.uni-calendar__header-btn-box{
	width: 100rpx;
	height: 100rpx;
	display: flex;
	justify-content: center;
	align-items: center;
}
.uni-calendar__header-btn {
	width: 24rpx;
	height: 24rpx;
	border-left-color: #fff;
	border-left-style: solid;
	border-left-width: 4rpx;
	border-top-color: #fff;
	border-top-style: solid;
	border-top-width: 4rpx;
}

.uni-calendar--left {
	transform: rotate(-45deg);
}

.uni-calendar--right {
	transform: rotate(135deg);
}
.detail {
	&-time{
		z-index: 9;
	}
	&-time-head{
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 100rpx;
		width: 100%;
		color: #fff;
		.head-time{
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			font-weight: bold;
			&-month{
				font-size: 36rpx;
			}
			&-range{
				margin-top: 8rpx;
				height: 24rpx;
				font-size: 24rpx;
				font-weight: 400;
				line-height: 24rpx;
			}
		}
	}
}
.popup-box{
	width: 652rpx;
	&-head{
		font-weight: bold;
		font-size: 36rpx;
		text-align: center;
		height: 100rpx;
		line-height: 100rpx;
		border-bottom: 1px solid #EEEEEE;
	}
	&-content{
		height: 670rpx;
		.uni-calendar__header {
			position: relative;
			/* #ifndef APP-NVUE */
			display: flex;
			/* #endif */
			flex-direction: row;
			justify-content: center;
			align-items: center;
			height: 50px;
			border-bottom-color: #e5e5e5;
			border-bottom-style: solid;
			border-bottom-width: 1px;
			font-weight: bold;
			color: #185A88;
			.uni-calendar__header-btn{
				width: 24rpx;
				height: 24rpx;
				border-left-width: 4rpx;
				border-top-width: 4rpx;
				border-left-color: #808080;
				border-top-color: #808080;
			}
		}
		.uni-calendar__backtoday {
			position: absolute;
			right: 25rpx;
			top: 25rpx;
			font-size: 24rpx;
			font-weight: bold;
			padding: 0 10rpx;
			height: 54rpx;
			line-height: 54rpx;
			text-align: center;
			border-radius: 16rpx;
			color: #fff;
			background-color: #185A88;
		}
		
		.select-year-list{
			height: 450rpx;
			width: 100%;
		}

		.select-year-list-around{
			padding: 20rpx;
			width: 100%;
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: center;
		}

		.item-month{
			width: 108rpx;
			height: 54rpx;
			border-radius: 8rpx;
			text-align: center;
			line-height: 54rpx;
			margin: 40rpx;
			font-weight: bold;
			&.active{
				background: #185A88;
				border-radius: 8rpx;
				color: #fff;
			}
		}
	}
	&-btn{
		border-top: 2rpx solid #EEEEEE;
		display: flex;
		justify-content: space-around;
		.btn{
			width: 50%;
			height: 100rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			&.btn-confirm{
				color: #185A88;
				position: relative;
				&:after{
					content: '';
					position: absolute;
					left: 0;
					top: 0;
					height: 100%;
					width: 2rpx;
					background-color: #EEEEEE;
				}
			}
		}
	}
}
</style>
