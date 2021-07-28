//获取month的数组，形如[202003,202004,202005],如果没有指定参考年月，以当前年月为准
//入参，第一个，前几个月；第二个，参考月份如202007，如果没有以当前年月为准
export function getPreMonths(monthNum, endYearMonth) {
    let now = new Date();
    let currentYear = new String(now.getFullYear());
    let currentMonth = addZero(now.getMonth() + 1);
 
    let end = ""; //结束年月为给定年月或者当前年月
    let endYear = "";
    let endMonth = "";
 
    if (endYearMonth) {
        end = endYearMonth;
        endYear = endYearMonth.slice(0, 4);
        endMonth = endYearMonth.slice(4, 6);
    } else {
        end = currentYear + currentMonth;
        endYear = currentYear;
        endMonth = currentMonth;
    }
 
    let result = [];
 
    for (let i = 0; i < monthNum; i++) {
        let re = "";
        let tempMonth = parseInt(endMonth) - i;
        if (tempMonth <= 0) {
            tempMonth = tempMonth + 12;
            endMonth = parseInt(endMonth) + 12;
            endYear--;
        }
 
        re = endYear + "" + addZero(tempMonth);
        result.unshift(re);
    }
    return result;
}
 
export function getNextMonths(monthNum, startYearMonth) {
    let now = new Date();
    let currentYear = new String(now.getFullYear());
    let currentMonth = addZero(now.getMonth() + 1);
 
    let start = ""; //开始年月为给定年月或者当前年月
    let startYear = "";
    let startMonth = "";
 
    if (startYearMonth) {
        start = startYearMonth;
        startYear = startYearMonth.slice(0, 4);
        startMonth = startYearMonth.slice(5, 7);
    } else {
        start = currentYear +'-'+ currentMonth;
        startYear = currentYear;
        startMonth = currentMonth;
    }
 
    let result = [];
 
    for (let i = 0; i < monthNum; i++) {
        let re = "";
        let tempMonth = parseInt(startMonth) + i;
        if (tempMonth > 12) {
            tempMonth = tempMonth - 12;
            startMonth = parseInt(startMonth) + 12;
            startYear++;
        }
 
        re = startYear + "-" + addZero(tempMonth);
        result.push(re);
    }
    return result;
}

export function dateFormat(fmt, date) {
	let ret;
	const opt = {
		'Y+': date.getFullYear().toString(), // 年
		'm+': (date.getMonth() + 1).toString(), // 月
		'd+': date.getDate().toString(), // 日
		'H+': date.getHours().toString(), // 时
		'M+': date.getMinutes().toString(), // 分
		'S+': date.getSeconds().toString() // 秒
	};
	for (let k in opt) {
		ret = new RegExp('(' + k + ')').exec(fmt);
		if (ret) {
			fmt = fmt.replace(ret[1], ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, '0'));
		}
	}
	return fmt;
}

// 获取某周的日期
export function getWeekDay(date) {
	let dateString = dateFormat('YYYY-mm-dd', date ? new Date(new Date(date).getTime() + 1*24*60*60*1000) : new Date(new Date().getTime() + 1*24*60*60*1000));
	let presentDate = new Date(dateString);
	let today = presentDate.getDay() !== 0 ? presentDate.getDay() : 7;
	return Array.from(new Array(7), (val, index) => {
		return dateFormat('YYYY-mm-dd', new Date(presentDate.getTime() - (today - index) * 24 * 60 * 60 * 1000));
	});
}

// 获取上周的日期
export function getPreviousWeekDay(date) {
	let dateString = dateFormat('YYYY-mm-dd', new Date(new Date(date).getTime() - 6*24*60*60*1000)); //7天前
	console.log(dateString)
	let presentDate = new Date(dateString);
	let today = presentDate.getDay() !== 0 ? presentDate.getDay() : 7;
	return Array.from(new Array(7), (val, index) => {
		return dateFormat('YYYY-mm-dd', new Date(presentDate.getTime() - (today - index) * 24 * 60 * 60 * 1000));
	});
}

// 获取下周的日期
export function getNextWeekDay(date) {
	let dateString = dateFormat('YYYY-mm-dd', new Date(new Date(date).getTime() + 8*24*60*60*1000)); //7天后
	let presentDate = new Date(dateString);
	let today = presentDate.getDay() !== 0 ? presentDate.getDay() : 7;
	return Array.from(new Array(7), (val, index) => {
		return dateFormat('YYYY-mm-dd', new Date(presentDate.getTime() - (today - index) * 24 * 60 * 60 * 1000));
	});
}

// 获取当前月的第一天，最后一天
export function getMonthFirstEnd(date) {
	var firstDate = new Date(date);
	firstDate.setDate(1); //第一天
	var endDate = new Date(firstDate);
	endDate.setMonth(firstDate.getMonth()+1);
	endDate.setDate(0);
	return [dateFormat('YYYY-mm-dd', firstDate), dateFormat('YYYY-mm-dd', endDate)]
}

function addZero(num) {
    return num < 10 ? "0" + num : num;
}