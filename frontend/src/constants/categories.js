// 한국한의학연구원 OASIS 처방 분류 체계 기반
export const CATEGORIES = [
  '보기(補氣)',
  '보혈(補血)',
  '보양(補陽)',
  '보음(補陰)',
  '해표(解表)',
  '청열(淸熱)',
  '화해(和解)',
  '거습(祛濕)',
  '이기(理氣)',
  '안신(安神)',
  '소도(消導)',
  '거담(祛痰)',
  '기타',
];

export const CATEGORIES_WITH_ALL = ['전체', ...CATEGORIES];

// "보기(補氣)" → "cat-보기"
export const categoryClass = (category) => {
  if (!category) return 'cat-기타';
  const key = category.split('(')[0];
  return `cat-chip cat-${key}`;
};
