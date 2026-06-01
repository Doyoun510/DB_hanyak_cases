// 시드 데이터 - 순수 SQL INSERT (ON CONFLICT로 멱등성 보장)
const bcrypt = require('bcryptjs');
const pool = require('../src/db');

// 한국한의학연구원 OASIS 처방 분류 기반
const prescriptions = [
  // 보기제(補氣劑)
  { name: '사군자탕', category: '보기(補氣)', ingredients: '인삼, 백출, 복령, 감초', efficacy: '비위 기허의 기본방. 식욕부진·피로·연변(軟便)에 사용.', description: '『태평혜민화제국방』 출전. 보기제의 기본 처방.' },
  { name: '육군자탕', category: '보기(補氣)', ingredients: '인삼, 백출, 복령, 감초, 진피, 반하', efficacy: '비위 기허에 담습이 겸한 경우. 식욕부진·구토·설사에 활용.', description: '사군자탕 + 이진탕(진피·반하).' },
  { name: '보중익기탕', category: '보기(補氣)', ingredients: '황기, 인삼, 백출, 감초, 당귀, 진피, 시호, 승마', efficacy: '비위 기허로 인한 피로·식욕부진·내장하수·기허발열에 사용.', description: '이동원 『내외상변혹론』 출전.' },
  { name: '삼령백출산', category: '보기(補氣)', ingredients: '인삼, 백출, 복령, 감초, 산약, 백편두, 연자육, 의이인, 사인, 길경', efficacy: '비위 허약으로 인한 만성 설사·식욕부진·소화불량 개선.', description: '『태평혜민화제국방』 출전.' },
  { name: '생맥산', category: '보기(補氣)', ingredients: '인삼, 맥문동, 오미자', efficacy: '기음양허로 인한 자한·구갈·심계 완화. 여름철 보양제.', description: '『의학계원』 출전.' },
  // 보혈제(補血劑)
  { name: '사물탕', category: '보혈(補血)', ingredients: '숙지황, 당귀, 천궁, 백작약', efficacy: '혈허증의 기본방. 어지러움·심계·생리불순에 활용.', description: '『태평혜민화제국방』 출전. 보혈제의 기본 처방.' },
  { name: '당귀보혈탕', category: '보혈(補血)', ingredients: '황기, 당귀', efficacy: '기혈양허로 인한 피로·번열감·산후 회복에 활용.', description: '황기와 당귀의 비율 5:1.' },
  { name: '귀비탕', category: '보혈(補血)', ingredients: '인삼, 황기, 백출, 복신, 산조인, 용안육, 목향, 당귀, 원지, 감초', efficacy: '심비양허로 인한 불면·건망·심계·식욕부진 완화.', description: '『제생방』 출전.' },
  // 보양제(補陽劑)
  { name: '팔미지황환', category: '보양(補陽)', ingredients: '숙지황, 산약, 산수유, 택사, 목단피, 복령, 부자, 계지', efficacy: '신양허로 인한 요슬산연·하지냉증·야간뇨 완화.', description: '『금궤요략』 출전.' },
  { name: '우귀음', category: '보양(補陽)', ingredients: '숙지황, 산약, 산수유, 구기자, 두충, 토사자, 부자, 육계, 당귀, 감초', efficacy: '신양 부족으로 인한 정신피로·요슬냉통·양위에 사용.', description: '장개빈 『경악전서』 출전.' },
  // 보음제(補陰劑)
  { name: '육미지황환', category: '보음(補陰)', ingredients: '숙지황, 산약, 산수유, 택사, 목단피, 복령', efficacy: '신음허로 인한 요슬산연·이명·도한·구갈 완화.', description: '전을 『소아약증직결』 출전.' },
  { name: '지백지황환', category: '보음(補陰)', ingredients: '숙지황, 산약, 산수유, 택사, 목단피, 복령, 지모, 황백', efficacy: '음허화왕으로 인한 골증조열·도한·유정에 사용.', description: '육미지황환에 지모·황백을 가미.' },
  // 해표제(解表劑)
  { name: '마황탕', category: '해표(解表)', ingredients: '마황, 계지, 행인, 감초', efficacy: '풍한표실증. 오한·발열·무한·기천 완화.', description: '『상한론』 출전.' },
  { name: '계지탕', category: '해표(解表)', ingredients: '계지, 작약, 감초, 생강, 대추', efficacy: '풍한 표허증. 자한·오풍·발열에 사용.', description: '『상한론』 출전.' },
  { name: '갈근탕', category: '해표(解表)', ingredients: '갈근, 마황, 계지, 작약, 감초, 생강, 대추', efficacy: '풍한감모 초기, 항강(목·어깨 뻣뻣함) 완화.', description: '『상한론』 출전.' },
  { name: '소청룡탕', category: '해표(解表)', ingredients: '마황, 계지, 작약, 건강, 세신, 오미자, 반하, 감초', efficacy: '외감풍한·내정수음. 기침·천식·맑은 가래에 사용.', description: '『상한론』 출전. 알레르기성 비염에도 응용.' },
  { name: '구미강활탕', category: '해표(解表)', ingredients: '강활, 방풍, 창출, 세신, 천궁, 백지, 황금, 생지황, 감초', efficacy: '풍한습 표증. 두통·신통·발열에 사용.', description: '『차사난지』 출전.' },
  // 청열제(淸熱劑)
  { name: '백호탕', category: '청열(淸熱)', ingredients: '석고, 지모, 감초, 갱미', efficacy: '양명경 열성 증상, 고열·갈증·번조 완화.', description: '『상한론』 출전.' },
  { name: '황련해독탕', category: '청열(淸熱)', ingredients: '황련, 황금, 황백, 치자', efficacy: '삼초 실열·열독으로 인한 번조·구내염 완화.', description: '『외대비요』 출전.' },
  { name: '용담사간탕', category: '청열(淸熱)', ingredients: '용담초, 황금, 치자, 택사, 목통, 차전자, 당귀, 생지황, 시호, 감초', efficacy: '간담 실화로 인한 두통·이명·협통·황달 개선.', description: '『의방집해』 출전.' },
  { name: '도적산', category: '청열(淸熱)', ingredients: '생지황, 목통, 감초초, 죽엽', efficacy: '심경 열로 인한 구설생창·소변적삽 완화.', description: '전을 『소아약증직결』 출전.' },
  // 화해제(和解劑)
  { name: '소시호탕', category: '화해(和解)', ingredients: '시호, 황금, 인삼, 반하, 감초, 생강, 대추', efficacy: '소양병. 한열왕래·흉협고만·구고·식욕부진에 사용.', description: '『상한론』 출전.' },
  { name: '대시호탕', category: '화해(和解)', ingredients: '시호, 황금, 작약, 반하, 생강, 대황, 지실, 대추', efficacy: '소양양명 합병. 흉협고만·변비·구토 개선.', description: '『상한론』 출전.' },
  // 거습제(祛濕劑)
  { name: '평위산', category: '거습(祛濕)', ingredients: '창출, 후박, 진피, 감초, 생강, 대추', efficacy: '습체비위로 인한 복부창만·소화불량·설사 개선.', description: '『태평혜민화제국방』 출전.' },
  { name: '오령산', category: '거습(祛濕)', ingredients: '저령, 택사, 백출, 복령, 계지', efficacy: '수습내정. 부종·소변불리·구갈에 사용.', description: '『상한론』 출전.' },
  // 이기제(理氣劑)
  { name: '반하후박탕', category: '이기(理氣)', ingredients: '반하, 후박, 복령, 생강, 자소엽', efficacy: '기체담응으로 인한 매핵기(인후 이물감) 완화.', description: '『금궤요략』 출전.' },
  // 안신제(安神劑)
  { name: '천왕보심단', category: '안신(安神)', ingredients: '생지황, 인삼, 단삼, 현삼, 백복령, 오미자, 원지, 길경, 당귀, 천문동, 맥문동, 백자인, 산조인, 주사', efficacy: '음허혈소로 인한 불면·심계·건망·구설생창 완화.', description: '『섭생비부』 출전.' },
  // 거담제(祛痰劑)
  { name: '이진탕', category: '거담(祛痰)', ingredients: '반하, 진피, 복령, 감초, 생강, 오매', efficacy: '습담으로 인한 해수·구토·현훈에 사용.', description: '『태평혜민화제국방』 출전. 거담제의 기본방.' },
];

async function main() {
  console.log('🌱 Seeding...');

  const password = await bcrypt.hash('1234', 10);

  // 사용자 — UPSERT (PostgreSQL ON CONFLICT)
  await pool.query(
    `INSERT INTO users (email, password, name, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`,
    ['pharm@test.com', password, '김한약사', 'PHARMACIST']
  );
  await pool.query(
    `INSERT INTO users (email, password, name, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`,
    ['user@test.com', password, '홍길동', 'USER']
  );

  // 처방 — UPSERT (이미 있으면 약재/효능 등 최신 데이터로 갱신)
  for (const p of prescriptions) {
    await pool.query(
      `INSERT INTO prescriptions (name, category, ingredients, efficacy, description)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (name) DO UPDATE
         SET category    = EXCLUDED.category,
             ingredients = EXCLUDED.ingredients,
             efficacy    = EXCLUDED.efficacy,
             description = EXCLUDED.description`,
      [p.name, p.category, p.ingredients, p.efficacy, p.description]
    );
  }

  console.log('✅ Seed completed');
  console.log('   - 한약사 계정: pharm@test.com / 1234');
  console.log('   - 일반 계정: user@test.com / 1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
