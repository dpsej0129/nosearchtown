/* ============================================================
   GAME_DATA — 4장 「댓글 장인」
   폴더폰 메일: box 'p-in' 받은 메일 / 'p-out' 보낸 메일 / 'p-draft' 임시 보관
   ============================================================ */
module.exports = {
  id: 'c4', num: '제4장', title: '댓글 장인',
  intro: '폴더폰에 남은 숫자들. 탄막 속의 눈동자.\n그리고 200만 명이 지켜보는 폭로 채널.\n\n17년이 지나도, 사람의 말버릇은 잘 바뀌지 않는다.',
  unlocks: ['phone'],
  start: { flags: ['sns2026'], mails: ['m4_1'], timeline: ['t4_teaser'], toast: ['중얼중얼', '「2026 현재」 탭이 열렸습니다', 'good'] },

  mails: [
    { id: 'm4_1', fromName: '유메링', from: 'hinago_0815@meari-mail.jp', subject: '언니의 폴더폰',
      headers: ['Reply-To: s.torii0613@meari-mail.jp', 'X-Mailer: 메아리 메일 모바일', '첨부: yume_phone_2009.bak'],
      body: '2009년 폴더폰의 메일 백업이야. 첨부 파일을 열어.\n비밀번호는 언니가 제일 좋아하던 날.\n\n그리고 지금의 중얼중얼도 열어 둘게.\n11월 30일에 무슨 일이 있을지, 거기서 보게 될 거야.\n\n17년이 지나도, 사람의 말버릇은 잘 안 바뀌거든.\n\n— 유메링',
      attach: [{ type: 'app', app: 'phone', name: 'yume_phone_2009.bak (폴더폰 메일함으로 열기)' }] },
    { id: 'm4_2', fromName: '유메링', from: 'hinago_0815@meari-mail.jp', subject: '나예요',
      headers: ['Reply-To: s.torii0613@meari-mail.jp', 'X-Mailer: 메아리 메일 모바일'],
      body: '맞아요. 나예요. 도리이 사키.\n\n속여서 미안해요. 언니의 옛 열쇠를 빌렸어요. 언니가 허락했어요.\n\n아버지는 끝까지 아무 말도 하지 않았어요.\n아버지를 「살인범」으로 만든 정리 글을 쓴 당신에게, 아버지 대신 말하고 싶었어요.\n\n이제 기록부를 정리해 주세요. 여덟 사람 모두.\n그다음은, 당신이 정해요.\n\n11월 30일까지 시간이 별로 없어요.\n\n— 도리이 사키' },

    // ---- 폴더폰 (2009 백업) : 받은 메일
    { id: 'pm_hina1', box: 'p-in', fromName: '(알 수 없음)', from: 'x774x@freemail.example', toName: '유메', date: '2009/06/28 23:51', subject: '(제목 없음)',
      body: '44 444 66 2' },
    { id: 'pm_hina2', box: 'p-in', fromName: '(알 수 없음)', from: 'x774x@freemail.example', toName: '유메', date: '2009/07/21 00:00', subject: '(제목 없음)',
      body: '44 2 7 7 999 0 22 444 777 8 44 3 2 999\n\n44 444 66 2' },
    { id: 'pm_hina3', box: 'p-in', fromName: '(알 수 없음)', from: 'x774x@freemail.example', toName: '유메', date: '2009/08/02 01:13', subject: '(제목 없음)',
      body: '444 0 7777 33 33 0 999 666 88\n\n44 444 66 2' },
    { id: 'pm_hina4', box: 'p-in', fromName: '(알 수 없음)', from: 'x774x@freemail.example', toName: '유메', date: '2009/08/15 22:13', subject: '(제목 없음)',
      body: '444 0 7777 2 9 0 999 666 88\n\n44 444 66 2',
      fx: { timeline: ['t4_saw'] } },
    { id: 'pm_uncle1', box: 'p-in', fromName: '마코토 삼촌', from: 'torii-minshuku@hida-mail.example', toName: '유메', date: '2009/08/10 21:02', subject: '15일 일정',
      body: '유메야. 15일 일정을 정리해 둔다.\n\n방송 끝나면 공민관 앞에서 기다려라. 회선은 내가 미리 켜 두마. 상자 램프가 초록이면 된다.\n10시 전에 역에 도착해야 22:12 막차를 탈 수 있다.\n기후에서 갈아타면, 그 뒤는 네가 정한 대로 해라. 거기서부터는 삼촌도 모르는 게 낫다.\n\n사키에게는 「언니가 잠깐 멀리 간다」고만 말해 두었다.\n그 아이는 비밀을 잘 지킨다.\n\n— 삼촌',
      fx: { timeline: ['t4_plan'] } },
    { id: 'pm_uncle2', box: 'p-in', fromName: '마코토 삼촌', from: 'torii-minshuku@hida-mail.example', toName: '유메', date: '2009/08/15 20:52', subject: '(제목 없음)',
      body: '공민관 앞. 불 끄고 기다린다.' },
    { id: 'pm_mom', box: 'p-in', fromName: '엄마', from: 'misako.a@nagoya-mail.example', toName: '유메', date: '2009/08/14 08:15', subject: '삼촌한테 안부',
      body: '삼촌한테 안부 전해 줘. 사키한테도.\n엄마는 네가 정한 거면 믿어. 몸조심하고.\n경찰 상담 창구 번호는 수첩에 적어 뒀지?' },
    { id: 'pm_friend', box: 'p-in', fromName: '미호', from: 'miho_09@kei-mail.example', toName: '유메', date: '2009/08/13 22:40', subject: '오봉 방송!',
      body: '오봉 방송 기대할게! 폐촌이라니 무섭다ㅋㅋ 끝나면 연락해!' },
    { id: 'pm_meari', box: 'p-in', fromName: '메아리 메일', from: 'info@meari-mail.jp', toName: '유메', date: '2009/08/01 13:00', subject: '보조 주소가 만들어졌습니다',
      body: '메아리 메일을 이용해 주셔서 감사합니다.\n\n보조 주소 hinago_0815@meari-mail.jp 가 만들어졌습니다.\n비밀번호는 다른 사람에게 알려 주지 마세요.' },
    { id: 'pm_mm', box: 'p-in', fromName: '밀밀동화', from: 'noreply@mmdouga.jp', toName: '유메', date: '2009/08/13 12:00', subject: '오봉 특집 생방송 예약 완료',
      body: '8월 15일 20:00 생방송 예약이 완료되었습니다.\n커뮤니티 co20721 회원에게 알림이 갑니다.' },
    { id: 'pm_spam', box: 'p-in', fromName: '당첨 안내', from: 'lucky@prize.example', toName: '유메', date: '2009/07/30 03:03', subject: '축하합니다! 당첨되셨습니다',
      body: '축하합니다!! 아래 주소에 접속해 상품을 받으세요… (스팸)' },
    // ---- 보낸 메일
    { id: 'pm_out1', box: 'p-out', fromName: '유메 → 엄마', from: '', toName: '엄마', date: '2009/06/29 00:10', subject: '또 왔어',
      body: '또 숫자 메일 왔어. 44 444 66 2. 강좌에서 가르쳐 준 방법으로 읽으면 이름 같아. 무서워.' },
    { id: 'pm_out2', box: 'p-out', fromName: '유메 → 삼촌', from: '', toName: '마코토 삼촌', date: '2009/08/10 21:30', subject: 'Re: 15일 일정',
      body: '알았어. 22:12 꼭 탈게. 고마워 삼촌.\n삼촌이 나쁜 사람 취급받으면 어떡해?' },
    { id: 'pm_out3', box: 'p-out', fromName: '유메 → 사키', from: '', toName: '사키 (민박 컴퓨터)', date: '2009/08/15 19:30', subject: '사키야',
      body: '사키야. 언니 오늘 밤에 잠깐 멀리 가.\n비밀 지켜 줄 수 있지? 언니 잊지 마.' },
    { id: 'pm_out4', box: 'p-out', fromName: '유메 → 삼촌', from: '', toName: '마코토 삼촌', date: '2009/08/15 22:20', subject: '탔어',
      body: '탔어. 고마워 삼촌.\n역 앞에서 그 사람 본 것 같아. 창가에. 그래도 탔어.\n사키한테 잘 자라고 전해 줘.' },
    // ---- 임시 보관함
    { id: 'pm_draft1', box: 'p-draft', fromName: '(작성 중)', from: '', toName: '(받는 사람 없음)', date: '2009/08/01 02:00', subject: '경찰 상담 메모',
      body: '경찰 상담 때 말할 것\n- 숫자 메일: 강좌 방법으로 읽으면 끝에 항상 같은 이름\n- 밀밀 댓글 #774 = 닉네임 hina. 눈 모양 (o_o)\n- 말투 「~라는 거지」\n- 집 앞까지 옴 (7/28)' },
    { id: 'pm_draft2', box: 'p-draft', fromName: '(작성 중)', from: '', toName: '(받는 사람 없음)', date: '2009/08/15 23:58', subject: '언젠가',
      body: '언젠가 이 폰을, 그리고 hinago_0815의 비밀번호를 사키에게 줄 거야.\n내가 왜 「죽어야」 했는지, 언젠가 그 아이가 말할 수 있게.\n삼촌이 아무 말도 하지 않는 대신에.',
      fx: { timeline: ['t4_draft'] } }
  ],

  timeline: [
    { id: 't4_saw', t: '2009-08-15 22:13', title: '유메의 폴더폰에 숫자 메일 「444 0 7777 2 9 0 999 666 88」', detail: '역에 도착해 전파가 잡히자 들어온 메일' },
    { id: 't4_plan', t: '2009-08-10', title: '「마코토 삼촌」의 메일 — 15일 일정 (공민관 → 22:12 막차)' },
    { id: 't4_draft', t: '2009-08-15 23:58', title: '유메의 임시 보관 메일 「이 폰과 hinago_0815의 비밀번호를 사키에게」' },
    { id: 't4_phone', t: '2026-11-22', title: '유메의 2009년 폴더폰 백업을 열었다' },
    { id: 't4_teaser', t: '2026-11-05', title: '폭로왕 히나타 「11월 30일, 유메링의 지금 이름을 공개한다」' },
    { id: 't4_dm', t: '2026-11-01', title: '폭로왕 히나타, 「찾았다」는 DM 캡처를 올렸다가 삭제' },
    { id: 't4_saki26', t: '2026-11-03', title: '도리이 사키 「오래된 열쇠를 하나 받았다」' }
  ],

  accounts: [
    { era: '2026', id: 'bakuro_hinata', name: '폭로왕 히나타', color: '#d6336c', av: '폭', verified: true,
      bio: '구독자 200만. 숨은 진실을 끝까지 특정한다는 거지. 👀\n영상 채널 「폭로왕 히나타」 · 제보는 DM', joined: '2009/03/14', loc: '도쿄',
      following: ['yuki_nonomura', 'saki_torii', 'haruka_kitamura'], followers: ['hinata_fan01', 'hinata_fan02', 'anti_bakuro', 'news_hayai'], fwerCount: 2013551, fwingCount: 3,
      fx: {} },
    { era: '2026', id: 'saki_torii', name: '사키', color: '#f2a93b', av: '사',
      bio: '기후. 꽃과 고양이.\n아버지 이름을 함부로 부르지 마세요.', joined: '2018/06/13', loc: '기후',
      following: ['yuki_nonomura', 'haruka_kitamura', 'tatsuo_garden'], followers: ['yuki_nonomura', 'haruka_kitamura', 'bakuro_hinata', 'tatsuo_garden'], fwerCount: 41,
      fx: { cards: ['saki'] } },
    { era: '2026', id: 'yuki_nonomura', name: '유키', color: '#7fb77e', av: '유',
      bio: '꽃집에서 일합니다. 7월 21일생.\n오래전 이름은 두고 왔어요.', joined: '2016/07/21',
      following: ['saki_torii'], followers: ['saki_torii', 'bakuro_hinata'], fwerCount: 2 },
    { era: '2026', id: 'haruka_kitamura', name: '기타무라 하루카', color: '#6b4fa0', av: '하',
      bio: '옛날엔 「도시전설 하루카」. 지금은 정정하는 사람.\n블로그 「늦은 정정」', joined: '2019/08/15',
      following: ['saki_torii', 'bakuro_hinata'], followers: ['saki_torii', 'tatsuo_garden'], fwerCount: 830,
      fx: { cards: ['haruka'] } },
    { era: '2026', id: 'tatsuo_garden', name: '다쓰오의 텃밭', color: '#6d8b3a', av: '다',
      bio: '다카야마. 38년 경찰 일을 마치고 텃밭을 합니다. 사과나무 두 그루.', joined: '2025/04/01',
      following: ['saki_torii'], followers: ['saki_torii', 'haruka_kitamura'], fwerCount: 19,
      fx: { cards: ['okabe'] } },
    { era: '2026', id: 'hinata_fan01', name: '히나타 신도', color: '#999', av: '신', bio: '폭로왕 영상 전부 봄', joined: '2021/02/02', following: ['bakuro_hinata'], followers: [] },
    { era: '2026', id: 'hinata_fan02', name: '진실 수집가', color: '#999', av: '진', bio: '언론은 말 안 해 주는 거', joined: '2022/09/09', following: ['bakuro_hinata'], followers: [] },
    { era: '2026', id: 'anti_bakuro', name: '폭로 그만', color: '#555', av: '그', bio: '사람 인생은 콘텐츠가 아니다', joined: '2024/01/01', following: ['bakuro_hinata'], followers: [] },
    { era: '2026', id: 'news_hayai', name: '빠른 뉴스 봇', color: '#1d6fa5', av: '뉴', bio: '화제의 소식을 빠르게', joined: '2015/05/05', following: [], followers: [] },
    { era: '2026', id: 'yume_memorial', name: '유메링을 기억하는 모임', color: '#ff9ec7', av: '기', bio: '2009년 오봉을 잊지 않습니다', joined: '2019/08/15', following: [], followers: [] }
  ],

  posts: [
    // ---- 폭로왕 히나타
    { era: '2026', by: 'bakuro_hinata', d: '2026-10-01 20:00', t: '새 시리즈 예고. 17년 전 오봉, 폐촌 생방송 중에 비명과 함께 사라진 생방송 주. 시신도 진범도 아직 나오지 않았다는 거지. 👀 #폭로왕_신작 #유메링', rt: 8800, fav: 41000,
      rp: [['hinata_fan01', '2026-10-01 20:01', '드디어!!'], ['anti_bakuro', '2026-10-01 20:30', '그 사건 무고한 사람 죽게 만든 거 아님?'], ['hinata_fan02', '2026-10-01 20:40', '>>죽게 만든 건 아니지 병사라던데'], ['yume_memorial', '2026-10-01 21:00', '제발 조용히 두세요']] },
    { era: '2026', by: 'bakuro_hinata', d: '2026-10-08 20:00', t: '1화 공개. 2009년의 특정반은 틀리지 않았다. 다만 끝까지 가지 않았을 뿐이라는 거지. 👀 #폭로왕_신작', rt: 5300, fav: 30200,
      rp: [['hinata_fan01', '2026-10-08 20:15', '소름 돋았다'], ['anti_bakuro', '2026-10-08 20:20', '또 민박 주인 얘기냐. 그분 이미 돌아가셨다고'], ['news_hayai', '2026-10-08 21:00', '「폭로왕 히나타」 신작, 17년 전 미제 생방송 살인 사건 재조명 #폭로왕_신작']] },
    { era: '2026', by: 'bakuro_hinata', d: '2026-10-20 19:00', t: '작업실 공개. 17년째 쓰는 노트북. 이 스티커가 내 부적이라는 거지. 👀', scene: 'sc_laptop2026', cap: '작업실 책상 위의 낡은 노트북 (스티커를 확대해 보세요)', rt: 1200, fav: 18800,
      rp: [['hinata_fan02', '2026-10-20 19:05', '17년째ㅋㅋ 물건 아끼는 남자'], ['hinata_fan01', '2026-10-20 19:30', '스티커 숫자 뭐예요?'], ['bakuro_hinata', '2026-10-20 19:41', '비밀이라는 거지. 👀']] },
    { era: '2026', by: 'bakuro_hinata', d: '2026-10-29 20:00', t: '2화 예고. 「진범」의 딸이 지금 어디서 뭘 하는지, 다음 화에서 알려 주겠다는 거지. 👀 #폭로왕_신작', rt: 4100, fav: 22000,
      rp: [['saki_torii', '2026-10-29 20:12', '아버지 이름을 다시 꺼내지 마세요.'], ['hinata_fan01', '2026-10-29 20:15', '본인 등판?'], ['anti_bakuro', '2026-10-29 20:20', '이건 진짜 선 넘었다'], ['haruka_kitamura', '2026-10-29 21:00', '그만하세요.']] },
    { era: '2026', by: 'bakuro_hinata', d: '2026-11-05 20:00', t: '그리고 하나 더. 17년 전 「살해된」 유메링은 살아 있다. 11월 30일, 그녀의 「지금 이름」을 공개한다는 거지. 👀 #폭로왕_신작 #유메링', rt: 12000, fav: 64000,
      rp: [['hinata_fan02', '2026-11-05 20:01', '대박'], ['haruka_kitamura', '2026-11-05 20:30', '히나타 씨, 그만하세요. 2009년의 ◆Hina가 누구였는지 나는 알고 있어요.'], ['hinata_fan01', '2026-11-05 20:33', '◆Hina가 뭔데ㅋㅋ'],
        ['anti_bakuro', '2026-11-05 20:40', '11월 1일에 올렸다가 지운 DM 캡처 뭐였음? 아카이브 떠 둠 mumble.jp/bakuro_hinata/status/20261101'], ['yume_memorial', '2026-11-05 21:00', '살아 있다면, 그 사람이 숨은 이유를 생각해 주세요']] },
    { era: '2026', by: 'bakuro_hinata', d: '2026-11-12 20:00', t: '17년 전 오봉, 나는 다카야마에 있었다. 역 앞 창가에서 본 그날 밤 공기를 아직 기억한다는 거지. 👀 #폭로왕_신작', rt: 3000, fav: 19000,
      rp: [['hinata_fan01', '2026-11-12 20:02', '현장에 계셨다니!!'], ['anti_bakuro', '2026-11-12 20:10', '…그게 자랑할 일이냐'], ['haruka_kitamura', '2026-11-12 22:00', '창가. 그 말, 기억해 둘게요.']] },
    { era: '2026', by: 'bakuro_hinata', d: '2026-11-20 20:00', t: '열흘 남았다는 거지. 👀 #폭로왕_신작', rt: 2200, fav: 15000, rp: [['hinata_fan02', '2026-11-20 20:01', '카운트다운']] },
    // ---- 사키
    { era: '2026', by: 'saki_torii', d: '2026-10-30 22:00', t: '아버지는 2015년에 돌아가셨습니다. 끝까지 아무 말도 하지 않으셨어요. 그러니 이번엔 내가 말할 차례예요.', fav: 300, rp: [['haruka_kitamura', '2026-10-30 22:30', '곁에 있을게요.'], ['yuki_nonomura', '2026-10-30 23:00', '사키야.']] },
    { era: '2026', by: 'saki_torii', d: '2026-11-03 21:00', t: '오래된 열쇠를 하나 받았다. 언니의 옛 계정. 이 열쇠로 한 사람에게 편지를 쓰기로 했다.', fav: 41, fx: { timeline: ['t4_saki26'] } },
    { era: '2026', by: 'saki_torii', d: '2026-11-20 10:00', t: '다카야마에 다녀왔다. 아버지를 기억하는 분을 만났다. #첫눈', fav: 30, rp: [['tatsuo_garden', '2026-11-20 18:00', '와 줘서 고마웠습니다.']] },
    { era: '2026', by: 'saki_torii', d: '2026-11-22 03:14', t: '보냈다.', fav: 3 },
    // ---- 유키
    { era: '2026', by: 'yuki_nonomura', d: '2026-07-21 19:00', t: '생일. 사촌 동생이 꽃 대신 히다 사과사이다를 보내왔다. 웃었다.', scene: 'sc_cider2026', cap: '꽃집 작업대 위의 사과사이다 한 병', fav: 2 },
    { era: '2026', by: 'yuki_nonomura', d: '2026-11-02 23:30', t: '그 사람의 눈 모양 이모지만 봐도 숨이 막힌다.', fav: 1 },
    { era: '2026', by: 'yuki_nonomura', d: '2026-11-04 22:00', t: '사촌 동생이 내 옛 열쇠를 들고 무언가를 하려 한다. 말리지 않기로 했다. 그 아이 아버지에게 나는 빚이 있으니까.', fav: 1 },
    // ---- 하루카
    { era: '2026', by: 'haruka_kitamura', d: '2026-11-06 21:00', t: '블로그에 새 글을 썼습니다. 「17년째 여름」. #유메링', fav: 120 },
    { era: '2026', by: 'haruka_kitamura', d: '2026-11-10 23:00', t: '말투는 잘 바뀌지 않는다. 「~라는 거지.」 2009년 나에게 쪽지를 보낸 사람도 그렇게 말했다.', fav: 410, rp: [['hinata_fan01', '2026-11-10 23:20', '히나타 님 저격?ㅋㅋ'], ['anti_bakuro', '2026-11-10 23:40', '이거 진짜면 큰일인데']] },
    // ---- 다쓰오(오카베)
    { era: '2026', by: 'tatsuo_garden', d: '2026-11-08 07:00', t: '옛 사건을 영상으로 파는 젊은이를 봤다. 말할 수 없는 것을 지켜 온 사람들이 있다는 걸 그는 모른다.', fav: 22 },
    { era: '2026', by: 'tatsuo_garden', d: '2026-11-20 18:00', t: '젊은 아가씨가 찾아왔다. 아버지를 닮은 눈이었다. 2009년 오봉 밤, 나는 역 앞에서 등불 행렬을 지키고 있었다. 그때 역 쪽을 한 번만 더 봤더라면. #첫눈', fav: 40 },
    // ---- 기타
    { era: '2026', by: 'news_hayai', d: '2026-11-06 09:00', t: '폭로 채널의 「유메링 생존설·현재 이름 공개」 예고에 우려 목소리 #유메링 #폭로왕_신작' },
    { era: '2026', by: 'yume_memorial', d: '2026-08-15 20:00', t: '17년째 오봉. 우리는 찾지 않습니다. 다만 기억합니다. #유메링' },
    { era: '2026', by: 'anti_bakuro', d: '2026-11-21 12:00', t: '특정반 문화 17년 동안 하나도 안 변했다 #특정반' },
    { era: '2026', by: 'hinata_fan01', d: '2026-11-21 13:00', t: '정의의 특정반 부활 #특정반 #폭로왕_신작' },
    { era: '2026', by: 'news_hayai', d: '2026-11-22 08:00', t: '다카야마 첫눈 관측 #첫눈' }
  ],

  searchPages: [
    { id: 'p4_wiki_bakuro', k: ['폭로왕히나타', '폭로왕', '히나타', 'bakuro_hinata', 'bakurohinata'], type: 'wiki', title: '폭로왕 히나타', url: 'openpedia.jp/wiki/폭로왕_히나타',
      snippet: '구독자 200만 명의 폭로 영상 채널. 2018년 시작.',
      body: '<table class="infobox"><tr><td colspan="2"><b>폭로왕 히나타</b></td></tr><tr><td>분야</td><td>폭로 · 미해결 사건 「재특정」</td></tr><tr><td>구독자</td><td>약 200만 명 (2026년)</td></tr><tr><td>활동</td><td>2018년 ~</td></tr><tr><td>중얼중얼</td><td>@bakuro_hinata</td></tr></table>' +
        '<p><b>폭로왕 히나타</b>는 2018년부터 활동한 폭로 영상 채널이다. 유명인의 사생활 폭로와 미해결 사건의 「재특정」으로 인기를 얻었다.</p>' +
        '<h2>특징</h2><p>문장을 「~라는 거지.」로 끝맺는 말버릇과 눈 모양 이모지(👀)가 트레이드마크다. 「인터넷 특정반 출신」을 자처한다.</p>' +
        '<h2>논란</h2><p>명예훼손으로 세 차례 소송을 당했다. 본명은 공개하지 않았으나 2025년 소송 보도에서 <b>히나타 쇼고</b>로 알려졌다. → [[page:p4_news_lawsuit|관련 기사]]</p>' +
        '<h2>2026년</h2><p>10월부터 「17년 전 히나고 생방송 살인 사건」 시리즈를 공개하고 있다. 11월에는 「피해자는 살아 있다」고 주장하며 11월 30일 그 사람의 「현재 이름」을 공개하겠다고 예고해 비판을 받고 있다.</p>' },
    { id: 'p4_news_lawsuit', k: ['히나타쇼고', '명예훼손', '폭로유튜버'], type: 'news', site: '전국 일보',
      title: '폭로 영상 채널 운영자 히나타 쇼고 씨, 명예훼손 소송 3건 피소', url: 'zenkoku-nippo.jp/2025/0612', date: '2025년 6월 12일',
      snippet: '구독자 200만 명의 폭로 채널 「폭로왕 히나타」 운영자 히나타 쇼고 씨(38)가…',
      body: '<p>구독자 200만 명의 폭로 영상 채널 「폭로왕 히나타」를 운영하는 <b>히나타 쇼고</b> 씨(38)가 명예훼손으로 세 건의 소송을 당했다.</p><p>히나타 씨는 도쿄 출신으로, 대학 시절 영상 동아리에서 활동했으며 2000년대 후반부터 익명 게시판의 「특정반」에서 활동했다고 스스로 밝혀 왔다.</p><p>원고 측 변호사는 「그는 사람을 찾아내는 일을 정의라고 부르지만, 찾아진 사람의 삶은 끝난다」고 말했다.</p>' },
    { id: 'p4_club', k: ['hnt_shogo', 'hntshogo', '영상연구회', '쇼고'], type: 'tool', site: '○○대학 영상연구회 (옛 홈페이지)',
      title: '2008년도 부원 소개 — ○○대학 영상연구회', url: 'eiken-oo-univ.jp/2008/members', date: '2008/05/01',
      snippet: '2학년 히나타 쇼고 — 좋아하는 것: 생방송, 사람 찾기',
      body: '<ul><li>4학년 ○○ — 부장. 다큐멘터리 담당</li><li>3학년 ○○ — 편집 담당</li>' +
        '<li><b>2학년 히나타 쇼고</b> — 중얼중얼 @hnt_shogo · 좋아하는 것: 생방송 보기, 숨은 사람 찾기(o_o) · 한마디: 「찾으면 끝까지 간다는 거지.」</li>' +
        '<li>1학년 ○○ — 촬영 담당</li></ul><p class="small muted">이 페이지는 더 이상 갱신되지 않습니다.</p>' },
    { id: 'p4_multitap', k: ['멀티탭', '문자입력', '멀티탭입력', '폴더폰입력', '휴대폰문자입력'], type: 'wiki', title: '휴대전화 문자 입력 (멀티탭 방식)', url: 'openpedia.jp/wiki/멀티탭',
      snippet: '숫자 키를 여러 번 눌러 글자를 고르는 입력 방식.',
      body: '<p><b>멀티탭 방식</b>은 휴대전화의 숫자 키를 여러 번 눌러 글자를 고르는 입력 방식이다.</p>' +
        '<table><tr><th>키</th><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td></tr><tr><th>글자</th><td>ABC</td><td>DEF</td><td>GHI</td><td>JKL</td><td>MNO</td><td>PQRS</td><td>TUV</td><td>WXYZ</td></tr></table>' +
        '<p>같은 키를 누른 횟수가 그 키의 몇 번째 글자인지를 뜻한다. 예) 2=A, 22=B, 222=C, 7777=S. 많은 기종에서 <b>0은 띄어쓰기</b>였다.</p><p>폴더폰 세대 사이에서는 숫자만 나열해 비밀 메시지를 주고받는 놀이도 있었다.</p>' },
    { id: 'p4_wiki_stalker', k: ['스토커', '스토킹', '스토킹처벌법'], type: 'wiki', title: '스토킹', url: 'openpedia.jp/wiki/스토킹',
      snippet: '특정 상대를 쫓아다니거나 감시하며 불안을 주는 행위.',
      body: '<p><b>스토킹</b>은 특정 상대에게 집착해 쫓아다니거나, 감시하거나, 원치 않는 연락을 되풀이하는 행위다. 인터넷 방송인을 상대로 한 스토킹은 2000년대 후반부터 문제가 되었다.</p><h2>피해자 보호</h2><p>피해자가 거처를 옮기는 경우, 경찰에 <b>[[page:p4_tool_hidden|소재 비공개]]</b>를 요청할 수 있다. 이때 경찰은 가족이나 지인에게도 피해자의 소재를 알리지 않는다.</p>' },
    { id: 'p4_tool_hidden', k: ['소재비공개', '소재비공개요청', '피해자보호'], type: 'tool', site: '경찰 민원 안내',
      title: '스토킹·가정폭력 피해자의 소재 비공개 안내', url: 'police-annai.jp/hitokakushi', snippet: '본인이 요청하면 경찰은 누구에게도 소재를 알리지 않습니다.',
      body: '<p>스토킹이나 가정폭력의 피해를 입은 성인이 스스로 거처를 옮긴 경우, 본인이 요청하면 경찰은 <b>가족과 지인을 포함해 누구에게도</b> 그 사람의 소재를 알리지 않습니다.</p><p>행방불명이나 사건으로 수사 중이던 사안이라도, 본인의 생존과 안전이 확인되면 수색은 종료되며 그 이유는 공개되지 않을 수 있습니다. 본인이 원하면, 사건이 「미제」로 남더라도 <b>살아 있다는 사실조차</b> 알리지 않습니다.</p><p class="small muted">가해자가 행방불명 신고를 이용해 피해자를 찾아내는 일을 막기 위한 제도입니다.</p>' },
    { id: 'p4_haruka_2026', k: ['17년째여름', '늦은정정4'], type: 'blog', site: '늦은 정정', siteSub: '2009년의 나에게 — 기타무라 하루카',
      title: '17년째 여름 — 늦은 정정 4', url: 'late-teisei.noteblog.jp/entry/2026/11/06', date: '2026/11/06',
      snippet: '요즘 한 폭로 채널의 영상을 볼 때마다 등골이 서늘하다.',
      fx: { cards: ['haruka'] },
      body: '<p>요즘 한 폭로 채널의 영상을 볼 때마다 등골이 서늘하다. 「~라는 거지.」 문장이 끝날 때마다 나오는 그 말투. 2009년에 그 말투를 쓰던 사람을 나는 한 명 안다.</p>' +
        '<p>2009년 8월 18일 밤, 그 사람에게서 나나채널 개인 쪽지를 받았다. 「실황 스레 쪽에서도 민박 주인 이야기를 띄워 줘.」 나는 그 쪽지를 지우지 않았다. 지울 수가 없었다. 나나채널 쪽지 보관함에 지금도 남아 있다.</p>' +
        '<blockquote>7ch.net/msg/0818hina</blockquote>' +
        '<p>그 쪽지에는 내가 17년 동안 아무에게도 말하지 않은 단어가 하나 있다. 「조카」. 그 사람은 처음부터 알고 있었다. 민박 주인이 누구의 삼촌인지.</p>' +
        '<p>11월 30일이 오기 전에, 누군가 이 일을 끝내 주기를. 이번에는 바르게.</p>' },
    { id: 'p4_arch_msg', k: ['7ch.net/msg/0818hina', '7ch.net/msg/0818hina/', 'msg/0818hina'], archive: true, hidden: true, type: 'tool', site: '나나채널 쪽지 보관함',
      title: '개인 쪽지 — ◆Hina → 도시전설 하루카 (2009/08/18 23:05)', url: '7ch.net/msg/0818hina', saved: '2009-08-18 23:10',
      snippet: '◆Hina가 하루카에게 보낸 개인 쪽지.',
      fx: { cards: ['hinata'] },
      body: '<blockquote><b>보낸 사람</b> ◆Hina · <b>받는 사람</b> 도시전설 하루카 · 2009/08/18 23:05<br><br>' +
        '하루카 씨, 부탁 하나.<br>실황 스레 쪽에서도 민박 주인 이야기를 좀 띄워 줘. 하루카 씨가 말하면 다들 믿으니까.<br><br>' +
        '그 사람이 <b>조카</b>를 어디로 보냈는지 알아야 하거든. 다들 몰아붙이면 언젠가 입을 열 거라는 거지.<br>그게 제일 빠르다는 거지. (o_o)</blockquote>' },
    { id: 'p4_arch_dm', k: ['mumble.jp/bakuro_hinata/status/20261101', 'mumble.jp/bakuro_hinata/20261101'], archive: true, hidden: true, type: 'tool', site: '중얼중얼 보관본',
      title: '폭로왕 히나타 (@bakuro_hinata) · 2026/11/01 21:02 — 삭제된 게시물', url: 'mumble.jp/bakuro_hinata/status/20261101', saved: '2026-11-01 21:04',
      snippet: '2분 만에 지워진 게시물. DM 캡처 한 장.',
      fx: { timeline: ['t4_dm'] },
      body: '<blockquote><b>폭로왕 히나타</b> @bakuro_hinata · 2026/11/01 21:02<br><br>17년 걸렸다는 거지. 👀</blockquote>[[photo:sc_dm|첨부 이미지 — 보낸 메시지 화면 캡처 (확대해 보세요)]]<p class="small muted">※ 이 게시물은 2분 뒤 삭제되었습니다.</p>' },
    { id: 'p4_arch_user774', k: ['mmdouga.jp/user/774', 'user/774'], archive: true, hidden: true, type: 'tool', site: '밀밀동화',
      title: '회원 페이지 #774 — hina (2009/08/30 보관본)', url: 'mmdouga.jp/user/774', saved: '2009-08-30 04:00',
      snippet: '탈퇴 전의 #774 회원 페이지.',
      fx: { cards: ['hinata'] },
      body: '<table><tr><th>회원 번호</th><td>#774</td></tr><tr><th>닉네임</th><td>hina</td></tr><tr><th>가입</th><td>2008/11/03</td></tr><tr><th>연동 계정</th><td>중얼중얼 <b>@hnt_shogo</b></td></tr><tr><th>자기소개</th><td>유메링 방송은 하나도 놓치지 않는다는 거지(o_o)</td></tr><tr><th>최근 활동</th><td>2009/08/15 유메링 생방송 댓글 9개</td></tr></table>' },
    { id: 'p4_saki_2026', k: [], type: 'blog', site: '사키의 작은 정원', siteSub: '꽃과 고양이와 기록', title: '그 사람이 다시 나타났다', url: 'saki-garden.noteblog.jp/entry/2026/10/30', date: '2026/10/30',
      snippet: '아버지 이름을 검색하면 아무것도 나오지 않는다.',
      fx: { cards: ['saki'] },
      body: '<p>아버지 이름을 검색하면 아무것도 나오지 않는다. 내가 지워 달라고 했으니까. 검색 결과에 남아 있던 건 전부 「살인자」라는 말뿐이었다. 아무것도 나오지 않는 편이 나았다.</p>' +
        '<p>그런데 그 사람이 다시 아버지를 불러냈다. 200만 명 앞에서. 「진범의 딸」이라고.</p>' +
        '<p>세상은 17년 동안 언니가 죽었다고 믿었다. 언니는 지금 다른 이름으로 산다. 그 사람은 그 이름을 200만 명 앞에서 부르겠다고 한다. 그 이름은 내가 지킬 것이다.</p>' +
        '<p>아버지는 끝까지 아무 말도 하지 않았다. 그러니 이번엔 내가 한다. 나는 한 사람에게 편지를 쓰기로 했다. 아버지를 「특정」했던 사람에게. 그 사람이 시작했으니, 그 사람이 끝내야 한다.</p>' },
    { id: 'p4_d_youtuber', k: ['유튜버', '동영상채널', '영상채널'], type: 'matome', site: '채널 순위 정리', title: '2026년 가을 인기 영상 채널 순위 TOP 20', url: 'channel-rank.jp/2026autumn', date: '2026/11/01',
      snippet: '게임, 요리, 폭로… 2026년 가을 구독자 증가 순위.', body: '<p>1. 고양이 집사 일기<br>2. 10분 요리<br>…<br>12. <b>폭로왕 히나타</b> — 17년 전 미제 살인 사건 시리즈로 급상승<br>…<br>20. 산골 캠핑</p>' },
    { id: 'p4_d_folder', k: ['폴더폰', '피처폰'], type: 'blog', site: '그 시절 폴더폰 갤러리', siteSub: '추억의 휴대폰', title: '2009년 인기 폴더폰 모음', url: 'garake-gallery.jp/2009', date: '2020/02/02',
      snippet: '반짝이 스티커, 줄 달린 폴더폰.', body: '<p>2009년엔 폴더폰에 반짝이 스티커를 붙이고 줄을 주렁주렁 다는 게 유행이었다. 엄지손가락으로 숫자 키를 미친 듯이 누르던 시절. 메일에 숫자만 보내는 놀이도 있었다.</p>' },
    { id: 'p4_d_774', k: ['774', '774번국도'], type: 'blog', site: '드라이브 코스', siteSub: '국도 따라 달리기', title: '774번 국도 단풍 드라이브', url: 'drive-course.jp/r774', date: '2023/11/03',
      snippet: '산을 넘는 774번 국도. 단풍철 추천 코스.', body: '<p>산을 넘는 774번 국도. 단풍철에 꼭 달려 보세요. 휴게소의 사과 소프트아이스크림이 명물입니다.</p>' },
    { id: 'p4_d_nonomura', k: ['노노무라'], type: 'blog', site: '성씨 이야기', siteSub: '이름의 뿌리를 찾아서', title: '「노노무라」라는 성씨', url: 'myoji-story.jp/nonomura',
      snippet: '들판의 마을에서 유래한 성씨.', body: '<p>노노무라는 들판이 이어진 마을에서 유래했다고 합니다. 드문 성씨입니다.</p><p class="small muted">※ 특정 개인에 대한 문의에는 답하지 않습니다.</p>' },
    { id: 'p4_d_flower', k: ['꽃집', '꽃배달'], type: 'tool', site: '꽃집 찾기', title: '가까운 꽃집 찾기', url: 'hanaya-search.jp', snippet: '지역을 입력하면 가까운 꽃집을 찾아 드립니다.',
      body: '<p>지역을 입력하면 가까운 꽃집을 보여 드립니다.</p><p class="small muted">※ 개인의 근무처를 찾는 용도로 쓰지 마세요.</p>' },
    { id: 'p4_d_bakuro', k: ['폭로', '폭로전문'], type: 'news', site: '주간 진실', title: '폭로 전문지 「주간 진실」 휴간', url: 'shukan-shinjitsu.jp/kyukan', date: '2024/03/01',
      snippet: '40년 역사의 폭로 전문지가 휴간한다.', body: '<p>40년 역사의 폭로 전문지가 휴간한다. 편집장은 「이제 폭로는 영상 채널의 일이 되었다」고 말했다.</p>' },
    { id: 'p4_d_snow', k: ['첫눈', '다카야마첫눈'], type: 'news', site: '히다 일일신문 인터넷판', title: '다카야마에 첫눈… 평년보다 닷새 빨라', url: 'hidanichi.jp/news/2026/11/22/0001', date: '2026년 11월 22일',
      snippet: '다카야마시에서 22일 아침 첫눈이 관측되었다.', body: '<p>다카야마시에서 22일 아침 첫눈이 관측되었다. 평년보다 닷새 빠르다. 미즈하 댐 호수 주변의 산들도 하얗게 물들었다.</p>' },
    { id: 'p4_d_sticker', k: ['스티커', '노트북스티커'], type: 'blog', site: '책상 꾸미기', siteSub: '나만의 작업 공간', title: '노트북 스티커 꾸미기 아이디어', url: 'desk-deco.jp/sticker', date: '2025/06/10',
      snippet: '숫자 스티커, 동그란 눈 스티커…', body: '<p>노트북 스티커는 그 사람의 역사다. 오래 쓴 노트북일수록 스티커가 바래고, 주인을 닮아 간다.</p>' },
    { id: 'p4_wiki_eyes', k: ['o_o', '눈이모티콘', '눈모양이모지', '눈이모지'], type: 'wiki', title: '(o_o) — 눈 모양 이모티콘', url: 'openpedia.jp/wiki/눈_이모티콘',
      snippet: '눈을 동그랗게 뜬 얼굴. 2000년대 게시판에서 쓰였고, 지금은 눈 모양 이모지로 바뀌었다.',
      body: '<p><b>(o_o)</b>는 눈을 동그랗게 뜬 얼굴을 흉내 낸 이모티콘이다. 「지켜보고 있다」는 뜻으로 2000년대 게시판과 탄막 댓글에서 쓰였다.</p><p>스마트폰 시대에는 같은 뜻의 <b>눈 모양 이모지(👀)</b>로 대체되었다. 오래 인터넷을 한 사람일수록 옛 이모티콘 대신 같은 뜻의 이모지를 쓰는 경향이 있다.</p>' },
    { id: 'p4_d_style', k: ['말버릇', '라는거지', '문체분석'], type: 'blog', site: '말의 지문', siteSub: '문체로 사람을 읽는 법',
      title: '말버릇은 17년이 지나도 남는다 — 문체 분석 입문', url: 'kotoba-shimon.jp/entry/habit', date: '2024/02/02',
      snippet: '문장 끝맺음, 이모티콘, 맞춤법 실수. 익명 뒤에도 남는 말의 지문.',
      body: '<p>사람은 닉네임을 바꿔도 말버릇은 잘 바꾸지 못한다. 문장을 끝맺는 습관(예: 「~라는 거지.」), 즐겨 쓰는 이모티콘, 자주 틀리는 맞춤법이 그렇다.</p><p>다만 말버릇 하나만으로 사람을 단정하는 것은 위험하다. 말버릇, 시간, 장소, 사진 속 물건처럼 <b>서로 다른 종류의 증거</b>가 같은 사람을 가리킬 때에만 의미가 있다.</p>' },
    { id: 'p4_d_mailheader', k: ['메일헤더', '답장주소', 'replyto', '헤더'], type: 'wiki', title: '메일 헤더', url: 'openpedia.jp/wiki/메일_헤더',
      snippet: '메일 본문 앞에 붙는 정보. 보낸 사람, 받는 사람, 답장 주소(Reply-To) 등.',
      body: '<p><b>메일 헤더</b>는 메일 본문 앞에 붙는 정보다. 보통 메일 앱은 일부만 보여 준다.</p><ul><li><b>From</b> — 보낸 사람 주소</li><li><b>Reply-To</b> — 답장을 받을 주소. 보낸 사람 주소와 <b>다를 수 있다</b>. 다른 사람의 계정으로 보내면서 답장은 자기 주소로 받고 싶을 때 쓴다.</li><li><b>X-Mailer</b> — 메일을 보낸 프로그램</li></ul>' },
    { id: 'p4_d_subaddr', k: ['메아리메일', '보조주소'], type: 'tool', site: '메아리 메일 도움말',
      title: '보조 주소 만들기', url: 'meari-mail.jp/help/sub-address', snippet: '하나의 계정에 보조 주소를 만들 수 있습니다.',
      body: '<p>메아리 메일은 하나의 계정에 보조 주소를 만들 수 있습니다. 보조 주소는 <b>비밀번호를 아는 사람이라면 누구나</b> 로그인해 쓸 수 있으니 관리에 주의하세요.</p><p>보조 주소로 보낸 메일의 답장을 다른 주소로 받고 싶다면 「답장 주소(Reply-To)」를 설정하세요.</p>' },
    { id: 'p4_d_msgbox', k: ['쪽지보관함', '나나채널쪽지', '개인쪽지'], type: 'tool', site: '나나채널 도움말',
      title: '개인 쪽지 보관함 안내', url: '7ch.net/help/msg', snippet: '트립 사용자끼리 주고받은 개인 쪽지는 받은 사람이 지우기 전까지 보관됩니다.',
      body: '<p>트립 사용자끼리는 개인 쪽지를 주고받을 수 있습니다. 쪽지는 <b>받은 사람이 지우기 전까지</b> 보관함에 남으며, 2012년 이후에는 아카이브로 옮겨졌습니다.</p><p class="small muted">보관 주소는 쪽지마다 다르며, 받은 사람만 알 수 있습니다.</p>' },
    { id: 'p4_d_memorial', k: ['유메링을기억하는모임', '유메링팬'], type: 'blog', site: '유메링을 기억하는 모임', siteSub: '2009년 오봉을 잊지 않습니다', title: '모임 안내', url: 'yume-memorial.jp', date: '2019/08/15',
      snippet: '우리는 찾지 않습니다. 기억합니다.', body: '<p>2009년 오봉, 생방송의 비명과 함께 떠난 생방송 주 유메링을 기억하는 팬들의 모임입니다.</p><p>처음에 우리는 범인을 찾았습니다. 지금은 아무도 찾지 않습니다. 찾는 일이 그녀를 해칠 수도 있다는 것을, 우리는 늦게 배웠습니다.</p>' }
  ],

  checkpoint: {
    sentences: [
      { id: 'c4s1', parts: [
        '#774 = ', { type: 'text', a: ['◆Hina', 'Hina', '히나', '트립Hina', '◆히나'], ph: '트립 ◆○○○○', w: 8 },
        ' = ', { type: 'text', a: ['폭로왕히나타', '히나타쇼고', '폭로왕', '히나타', 'bakuro_hinata', '폭로왕히나타히나타쇼고', 'hnt_shogo'], ph: '2026년의 그', w: 10 },
        ''] },
      { id: 'c4s2', parts: [
        '메일을 보낸 사람은 ', { type: 'text', a: ['도리이사키', '사키', 'torii saki', '도리이 사키', 'saki', '사키torii', 'saki_torii'], ph: '이름', w: 8 },
        '이다.'] }
    ],
    onSolve: { mails: ['m4_2'] },
    next: 5
  },

  hints: [
    { q: '#774 = ◆( ? ) = ( ? )', h: [
      '말버릇, 눈 모양 표시, 닉네임, 그리고 사진 속 작은 것들을 비교해 보세요.',
      '밀밀동화에서 #774의 닉네임을 보세요. 폴더폰 메일 끝의 「44 444 66 2」를 유메 블로그의 「폴더폰 빨리 치기 강좌」 방법으로 읽어 보세요. 2009년 @hnt_shogo의 8월 15일 사진(유리창)과 2026년 @bakuro_hinata의 작업실 사진을 확대해 비교하세요.',
      '#774 = <b>◆Hina</b> = <b>폭로왕 히나타</b>(히나타 쇼고)입니다.'] },
    { q: '메일을 보낸 사람은?', h: [
      '보낸 사람은 「유메링」이라고 서명했지만, 유메 본인이라면 하지 않을 말이 섞여 있습니다.',
      '첫 메일의 「헤더 전체 보기」에서 답장 주소를 보고, 사키 블로그의 생일과 비교해 보세요. 폴더폰 임시 보관함과 2026년 @saki_torii, @yuki_nonomura의 글도 보세요.',
      '<b>도리이 사키</b>입니다. 유메에게 hinago_0815 계정의 비밀번호를 받았습니다.'] },
    { q: '(해독) 폴더폰의 숫자 메일', h: [
      '숫자 키에는 글자가 적혀 있습니다. 폴더폰 메일함의 「문자 입력 연습」에서 직접 눌러 볼 수 있습니다.',
      '같은 숫자를 누른 횟수 = 몇 번째 글자. 0은 띄어쓰기. 해독 방법은 유메 블로그의 「폴더폰 빨리 치기 강좌」(아카이브)나 「멀티탭」 검색으로 찾을 수 있습니다.',
      '44 444 66 2 = HINA · 444 0 7777 33 33 0 999 666 88 = I SEE YOU · 444 0 7777 2 9 0 999 666 88 = I SAW YOU · 탄막 12:02의 44 444 66 2 4 666 = HINAGO'] },
    { q: '(숨겨진 단서) 4장의 지워진 기록 3개', h: [
      '하루카의 2026년 블로그 글, 폭로왕 히나타 게시물의 답글, 밀밀동화 #774의 프로필을 보세요.',
      '나나채널 쪽지 보관함 주소, 지워진 게시물 주소, #774의 회원 페이지 주소를 웹 아카이브 「시간창고」에 넣어 보세요.',
      '7ch.net/msg/0818hina · mumble.jp/bakuro_hinata/status/20261101 · mmdouga.jp/user/774'] }
  ],
  suggest: [
    { show: '폭로왕히나타', page: 'p4_wiki_bakuro' }, { show: '멀티탭', page: 'p4_multitap' },
    { show: '히나타쇼고', page: 'p4_news_lawsuit' }, { show: 'hnt_shogo', page: 'p4_club' }, { show: '소재비공개', page: 'p4_tool_hidden' }
  ]
};
