<template>
	<view class="uni-calendar" @touchmove.stop.prevent="clean">
		<view v-if="!insert&&show" class="uni-calendar__mask" :class="{'uni-calendar--mask-show':aniMaskShow}" @click="clean"></view>
		<view v-if="insert || show" class="uni-calendar__content" :class="{'uni-calendar--fixed':!insert,'uni-calendar--ani-show':aniMaskShow}">
			<view class="uni-calendar__header">
				<view class="uni-calendar__header-btn-box" @click="pre">
					<view class="uni-calendar__header-btn uni-calendar--left"></view>
				</view>
				<text class="uni-calendar__header-text">{{ (nowDate.year||'') +' '+( engMonth[nowDate.month-1]||'')}}</text>
				<view class="uni-calendar__header-btn-box" @click="next">
					<view class="uni-calendar__header-btn uni-calendar--right"></view>
				</view>
				<text class="uni-calendar__backtoday" @click="backtoday">{{dateType === 'Daily' ? 'Today' : 'This Week'}}</text>
			</view>
			<view class="uni-calendar__box">
				<view v-if="showMonth" class="uni-calendar__box-bg">
					<text class="uni-calendar__box-bg-text">{{nowDate.month}}</text>
				</view>
				<view class="uni-calendar__weeks">
					<view class="uni-calendar__weeks-day">
						<text class="uni-calendar__weeks-day-text">Sun</text>
					</view>
					<view class="uni-calendar__weeks-day">
						<text class="uni-calendar__weeks-day-text">Mon</text>
					</view>
					<view class="uni-calendar__weeks-day">
						<text class="uni-calendar__weeks-day-text">Tue</text>
					</view>
					<view class="uni-calendar__weeks-day">
						<text class="uni-calendar__weeks-day-text">Wed</text>
					</view>
					<view class="uni-calendar__weeks-day">
						<text class="uni-calendar__weeks-day-text">Thu</text>
					</view>
					<view class="uni-calendar__weeks-day">
						<text class="uni-calendar__weeks-day-text">Fri</text>
					</view>
					<view class="uni-calendar__weeks-day">
						<text class="uni-calendar__weeks-day-text">Sat</text>
					</view>
				</view>
				<view class="uni-calendar__weeks" v-for="(item,weekIndex) in weeks" :key="weekIndex">
					<view class="uni-calendar__weeks-item" v-for="(weeks,weeksIndex) in item" :key="weeksIndex">
						<calendar-item :weeks="weeks" :selectedDate="selectedDate" :calendar="calendar" :selected="selected" @change="choiceDate"></calendar-item>
					</view>
				</view>
			</view>
			<view v-if="!insert" class="uni-calendar__header uni-calendar--fixed-top">
				<view class="uni-calendar__header-btn-box" @click="close">
					<text class="uni-calendar__header-text uni-calendar--fixed-width">取消</text>
				</view>
				<view class="uni-calendar__header-btn-box" @click="confirm">
					<text class="uni-calendar__header-text uni-calendar--fixed-width">确定</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import Calendar from './util.js';
	import calendarItem from './calendar-item.vue'
  import * as month from './month.js'
	/**
	 * Calendar 日历
	 * @property {String} startDate 日期选择范围-开始日期
	 * @property {String} endDate 日期选择范围-结束日期
	 * @property {String} limitFlag 时候限定日期
	 * @property {Array} selectedDate 已选日期
	 * @property {Boolean} showMonth 是否以月份为背景
	 * @property {Array} selected 限定日期格式[{date: '2019-06-27', info: '充足'}]
	 * @event {Function} change 日期改变
	 * @event {Function} monthSwitch 切换月份时触发
	 * 
	 */
	export default {
		components: {
			calendarItem
		},
		props: {
			selected: {
				type: Array,
				default () {
					return []
				}
			},
			startDate: {
				type: String,
				default: ''
			},
			endDate: {
				type: String,
				default: ''
			},
			limitFlag: {
				type: Boolean,
				default: false
			},
			insert: {
				type: Boolean,
				default: true
			},
			showMonth: {
				type: Boolean,
				default: true
			},
			selectDate: {
				type: Array,
				default () {
					return []
				}
			},
			dateType: {
				type: String,
				default: 'Daily'
			}
		},
		data() {
			return {
				show: false,
				weeks: [],
				calendar: {},
				nowDate: '',
				aniMaskShow: false,
				selectedDate: [],
				engMonth: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
			}
		},
		watch: {
			selected(newVal) {
				this.cale.setSelectInfo(this.nowDate.fullDate, newVal)
				this.weeks = this.cale.weeks
			},
			selectDate(newVal) {
				this.selectedDate = JSON.parse(JSON.stringify(newVal))
			}
		},
		created() {
			this.selectedDate = JSON.parse(JSON.stringify(this.selectDate))
			// 获取日历方法实例
			this.cale = new Calendar({
				limitFlag: this.limitFlag,
				date: this.date,
				selected: this.selected,
				startDate: this.startDate,
				endDate: this.endDate
			})
			this.init(this.cale.date.fullDate)
		},
		methods: {
			// 取消穿透
			clean() {},
			init(date) {
				this.weeks = this.cale.weeks
				this.nowDate = this.calendar = this.cale.getInfo(date)
			},
			open() {
				this.show = true
				this.$nextTick(() => {
					setTimeout(() => {
						this.aniMaskShow = true
					}, 50)
				})
			},
			close() {
				this.aniMaskShow = false
				this.$nextTick(() => {
					setTimeout(() => {
						this.show = false
					}, 300)
				})
			},
			confirm() {
				this.setEmit('confirm')
				this.close()
			},
			change() {
				if (!this.insert) return
				this.setEmit('change')
			},
			monthSwitch() {
				let {
					year,
					month
				} = this.nowDate
				this.$emit('monthSwitch', {
					year,
					month: Number(month)
				})
			},
			setEmit(name) {
				let {
					year,
					month,
					date,
					fullDate,
					extraInfo
				} = this.calendar
				this.$emit(name, {
					year,
					month,
					date,
					fulldate: fullDate,
					extraInfo: extraInfo || {},
					selectedDate: this.selectedDate
				})
			},
			choiceDate(weeks) {
				if (weeks.disable) 
					return
				this.calendar = weeks
				// 设置多选
				this.cale.setMultiple(this.calendar.fullDate)
				this.weeks = this.cale.weeks
				if (this.dateType === 'Daily') {
					this.selectedDate = [this.calendar.fullDate]
				} else if (this.dateType === 'Weekly') {
					this.selectedDate = month.getWeekDay(weeks.fullDate)
				}
				this.change()
			},
			backtoday() {
				this.cale.setDate(this.date)
				this.weeks = this.cale.weeks
				this.nowDate = this.calendar = this.cale.getInfo(this.date)
				if (this.dateType === 'Daily') {
					this.selectedDate = [this.nowDate.fullDate]
				} else if (this.dateType === 'Weekly') {
					this.selectedDate = month.getWeekDay()
				}
				this.change()
			},
			pre() {
				const preDate = this.cale.getDate(this.nowDate.fullDate, -1, 'month').fullDate
				this.setDate(preDate)
				this.monthSwitch()
				this.change()
			},
			next() {
				const nextDate = this.cale.getDate(this.nowDate.fullDate, +1, 'month').fullDate
				this.setDate(nextDate)
				this.monthSwitch()
				this.change()
			},
			setDate(date) {
				this.cale.setDate(date)
				this.weeks = this.cale.weeks
				this.nowDate = this.cale.getInfo(date)
			}
		}
	}
</script>

<style scoped>
	.uni-calendar {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
	}

	.uni-calendar__mask {
		position: fixed;
		bottom: 0;
		top: 0;
		left: 0;
		right: 0;
		background-color: rgba(0, 0, 0, 0.4);
		transition-property: opacity;
		transition-duration: 0.3s;
		opacity: 0;
		/* #ifndef APP-NVUE */
		z-index: 99;
		/* #endif */
	}

	.uni-calendar--mask-show {
		opacity: 1
	}

	.uni-calendar--fixed {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		transition-property: transform;
		transition-duration: 0.3s;
		transform: translateY(460px);
		/* #ifndef APP-NVUE */
		z-index: 99;
		/* #endif */
	}

	.uni-calendar--ani-show {
		transform: translateY(0);
	}

	.uni-calendar__content {
		background-color: #fff;
		padding: 0 20rpx;
	}

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
	}

	.uni-calendar--fixed-top {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		justify-content: space-between;
		border-top-color: #e5e5e5;
		border-top-style: solid;
		border-top-width: 1px;
	}

	.uni-calendar--fixed-width {
		width: 50px;
		/* padding: 0 15px;
 */
	}

	.uni-calendar__backtoday {
		position: absolute;
		right: 0;
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

	.uni-calendar__header-text {
		text-align: center;
		width: 160rpx;
		font-weight: bold;
		font-size: 30rpx;
		color: #003E6A;
	}

	.uni-calendar__header-btn-box {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		align-items: center;
		justify-content: center;
		width: 50px;
		height: 50px;
	}

	.uni-calendar__header-btn {
		width: 24rpx;
		height: 24rpx;
		border-left-color: #808080;
		border-left-style: solid;
		border-left-width: 4rpx;
		border-top-color: #808080;
		border-top-style: solid;
		border-top-width: 4rpx;
	}

	.uni-calendar--left {
		transform: rotate(-45deg);
	}

	.uni-calendar--right {
		transform: rotate(135deg);
	}


	.uni-calendar__weeks {
		position: relative;
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
	}

	.uni-calendar__weeks-item {
		flex: 1;
	}

	.uni-calendar__weeks-day {
		flex: 1;
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 45px;
		border-bottom-color: #F5F5F5;
		border-bottom-style: solid;
		border-bottom-width: 1px;
	}

	.uni-calendar__weeks-day-text {
		font-size: 28rpx;
		font-weight: bold;
	}

	.uni-calendar__box {
		position: relative;
	}

	.uni-calendar__box-bg {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		justify-content: center;
		align-items: center;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}

	.uni-calendar__box-bg-text {
		font-size: 200px;
		font-weight: bold;
		color: #999;
		opacity: 0.1;
		text-align: center;
		/* #ifndef APP-NVUE */
		line-height: 1;
		/* #endif */
	}
</style>