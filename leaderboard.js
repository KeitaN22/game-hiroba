(function () {
  const SUPABASE_URL = 'https://syjsnsvqksfjgrmswjva.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_yY2ycoZk9msMOgAFlbmntA_RpvQyPwW';
  const TABLE = 'leaderboard';

  function headers() {
    return {
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
    };
  }

  async function getTop(gameId, limit, higherIsBetter) {
    const order = higherIsBetter ? 'score.desc' : 'score.asc';
    const url = `${SUPABASE_URL}/rest/v1/${TABLE}?game_id=eq.${encodeURIComponent(gameId)}&select=name,score&order=${order}&limit=${limit}`;
    try {
      const res = await fetch(url, { headers: headers() });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      return [];
    }
  }

  async function submitScore(gameId, name, score) {
    const url = `${SUPABASE_URL}/rest/v1/${TABLE}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ game_id: gameId, name: name.slice(0, 12), score }),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  let cssInjected = false;
  function injectCss() {
    if (cssInjected) return;
    cssInjected = true;
    const style = document.createElement('style');
    style.textContent = `
      .lb-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 9999;
        display: flex; align-items: center; justify-content: center; padding: 20px; }
      .lb-box { background: #fff; border-radius: 20px; padding: 26px 22px; max-width: 340px; width: 100%;
        text-align: center; color: #333; box-shadow: 0 10px 30px rgba(0,0,0,0.35); }
      .lb-box h3 { font-size: 1.4rem; margin: 4px 0 6px; }
      .lb-box .lb-sub { font-size: 1rem; color: #666; margin-bottom: 10px; }
      .lb-list { list-style: none; padding: 0; margin: 10px 0; text-align: left; }
      .lb-list li { display: flex; justify-content: space-between; gap: 10px; padding: 8px 12px;
        border-radius: 10px; margin-bottom: 6px; background: #f4f4f4; font-weight: bold; font-size: 1.05rem; }
      .lb-list li.lb-me { background: #FFE58A; }
      .lb-input { font-size: 1.2rem; padding: 10px; border-radius: 12px; border: 2px solid #ddd;
        width: 80%; text-align: center; margin: 8px 0; }
      .lb-btn { font-size: 1.05rem; font-weight: bold; padding: 10px 22px; border: none; border-radius: 999px;
        background: #4C7BF3; color: #fff; box-shadow: 0 4px 0 #2f56c9; cursor: pointer; margin: 8px 5px 0; }
      .lb-btn.lb-secondary { background: #ddd; color: #333; box-shadow: 0 4px 0 #aaa; }
      .lb-btn:active { transform: translateY(3px); box-shadow: 0 1px 0; }
    `;
    document.head.appendChild(style);
  }

  function medal(i) {
    return ['🥇', '🥈', '🥉'][i] || `${i + 1}位`;
  }

  function renderList(listEl, top3, meName) {
    listEl.innerHTML = '';
    if (top3.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'まだ きろくが ないよ';
      listEl.appendChild(li);
      return;
    }
    top3.forEach((row, i) => {
      const li = document.createElement('li');
      if (meName && row.name === meName) li.classList.add('lb-me');
      const nameSpan = document.createElement('span');
      nameSpan.textContent = `${medal(i)} ${row.name}`;
      const scoreSpan = document.createElement('span');
      scoreSpan.textContent = row.score;
      li.appendChild(nameSpan);
      li.appendChild(scoreSpan);
      listEl.appendChild(li);
    });
  }

  // ゲームの クリアごとに よぶ。3いに はいったら なまえを きいて とうろくする。
  function showRankFlow({ gameId, score, higherIsBetter, unit, title }) {
    injectCss();
    return new Promise(async (resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'lb-overlay';
      const box = document.createElement('div');
      box.className = 'lb-box';
      box.innerHTML = `<h3>${title || '🏆 ランキング'}</h3><p class="lb-sub">よみこみちゅう…</p>`;
      overlay.appendChild(box);
      document.body.appendChild(overlay);

      const before = await getTop(gameId, 3, higherIsBetter);
      const qualifies = before.length < 3 || (higherIsBetter
        ? score > before[before.length - 1].score
        : score < before[before.length - 1].score);

      function close() {
        overlay.remove();
        resolve();
      }

      function showList(top3, meName) {
        box.innerHTML = `<h3>${title || '🏆 ランキング'}</h3>`;
        const sub = document.createElement('p');
        sub.className = 'lb-sub';
        sub.textContent = `きみの きろく: ${score}${unit || ''}`;
        box.appendChild(sub);
        const list = document.createElement('ul');
        list.className = 'lb-list';
        box.appendChild(list);
        renderList(list, top3, meName);
        const closeBtn = document.createElement('button');
        closeBtn.className = 'lb-btn';
        closeBtn.textContent = 'とじる';
        closeBtn.addEventListener('click', close);
        box.appendChild(closeBtn);
      }

      if (!qualifies) {
        showList(before, null);
        return;
      }

      box.innerHTML = `<h3>🎉 ランキング いり！ 🎉</h3>`;
      const sub = document.createElement('p');
      sub.className = 'lb-sub';
      sub.textContent = `きろく: ${score}${unit || ''}　なまえを いれてね`;
      box.appendChild(sub);
      const input = document.createElement('input');
      input.className = 'lb-input';
      input.maxLength = 12;
      input.placeholder = 'なまえ';
      box.appendChild(input);
      box.appendChild(document.createElement('br'));
      const regBtn = document.createElement('button');
      regBtn.className = 'lb-btn';
      regBtn.textContent = 'とうろく';
      const skipBtn = document.createElement('button');
      skipBtn.className = 'lb-btn lb-secondary';
      skipBtn.textContent = 'スキップ';
      box.appendChild(regBtn);
      box.appendChild(skipBtn);

      skipBtn.addEventListener('click', () => showList(before, null));
      regBtn.addEventListener('click', async () => {
        const name = input.value.trim();
        if (!name) { input.focus(); return; }
        regBtn.disabled = true;
        await submitScore(gameId, name, score);
        const after = await getTop(gameId, 3, higherIsBetter);
        showList(after, name);
      });
      input.focus();
    });
  }

  window.Leaderboard = { getTop, submitScore, showRankFlow };
})();
