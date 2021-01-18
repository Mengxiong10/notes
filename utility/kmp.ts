// 回退 search
export function search(pat: string, txt: string) {
  const m = pat.length;
  const n = txt.length;
  let i = 0;
  let j = 0;

  for (; i < n && j < m; i++) {
    if (txt.charAt(i) === pat.charAt(j)) {
      j++;
    } else {
      i -= j;
      j = 0;
    }
  }
  if (j === m) {
    return i - m;
  }
  return n;
}
