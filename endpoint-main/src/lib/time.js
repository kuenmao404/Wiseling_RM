const sec2date = (seconds) => {
  let days = Math.floor(seconds / (3600 * 24));
  seconds -= days * 3600 * 24;
  let hrs = Math.floor(seconds / 3600);
  seconds -= hrs * 3600;
  let mnts = Math.floor(seconds / 60);
  seconds -= mnts * 60;

  return `${days? `${days}天`: ""}${(hrs || days)? `${hrs || 0}小時`: ""}${(mnts || days || hrs)? `${mnts || 0}分`: ""}${seconds}秒`
}

export { sec2date }