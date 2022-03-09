/**
 * @function formatDate
 * @param {Date|String|Number} date
 * @param {String} format
 * @returns {String}
 */
export const formatDate = (date, format = "YYYY-MM-DD hh:mm:ss") => {
  if (typeof date === "string") {
    date = new Date(date);
  }
  if (typeof date === "number" && !isNaN(date)) {
    date = new Date(date);
  }
  const o = {
    "M+": date.getMonth() + 1,
    "D+": date.getDate(),
    "h+": date.getHours(),
    "m+": date.getMinutes(),
    "s+": date.getSeconds(),
    "q+": Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds(),
  };
  if (/(Y+)/.test(format)) {
    format = format.replace(
      RegExp.$1,
      (date.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  }
  for (const k in o) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
    }
  }
  return format;
};
