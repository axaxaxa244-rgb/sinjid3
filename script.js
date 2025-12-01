// 간단한 신지드 - 전사의 그림자 스타일 데모
// 화면(Element) 참조
const screenTitle = document.getElementById("screen-title");
const screenTown = document.getElementById("screen-town");
const screenBattle = document.getElementById("screen-battle");

const btnStart = document.getElementById("btnStart");
const btnFight = document.getElementById("btnFight");
const btnRest = document.getElementById("btnRest");
const btnDungeonStart = document.getElementById("btnDungeonStart");
const dungeonChapterLabelEl = document.getElementById("dungeonChapterLabel");
const dungeonChapterNameEl = document.getElementById("dungeonChapterName");
const dungeonChapterDescEl = document.getElementById("dungeonChapterDesc");

const statLevelEl = document.getElementById("stat-level");
const statExpEl = document.getElementById("stat-exp");
const statHpEl = document.getElementById("stat-hp");
const statMpEl = document.getElementById("stat-mp");
const statStrEl = document.getElementById("stat-str");
const statAgiEl = document.getElementById("stat-agi");
const statIntEl = document.getElementById("stat-int");

// 마을 스탯 게이지
const expBarEl = document.getElementById("expBar");
const hpBarEl = document.getElementById("hpBar");
const mpBarEl = document.getElementById("mpBar");
const statPointsValueEl = document.getElementById("stat-points-value");
const btnStatHp = document.getElementById("btnStatHp");
const btnStatMp = document.getElementById("btnStatMp");
const btnStatStr = document.getElementById("btnStatStr");
const btnStatAgi = document.getElementById("btnStatAgi");
const btnStatInt = document.getElementById("btnStatInt");

const equipWeaponEl = document.getElementById("equip-weapon");
const equipArmorEl = document.getElementById("equip-armor");

const logEl = document.getElementById("log");

// 전투 관련 요소
const enemyNameEl = document.getElementById("enemyName");
const playerHpBarEl = document.getElementById("playerHpBar");
const playerMpBarEl = document.getElementById("playerMpBar");
const playerHpTextEl = document.getElementById("playerHpText");
const playerMpTextEl = document.getElementById("playerMpText");
const enemyHpBarEl = document.getElementById("enemyHpBar");
const enemyHpTextEl = document.getElementById("enemyHpText");
const playerShieldBarEl = document.getElementById("playerShieldBar");
const playerShieldTextEl = document.getElementById("playerShieldText");
const playerSpriteEl = document.getElementById("playerSprite");
const enemySpriteEl = document.getElementById("enemySprite");

const battleLogEl = document.getElementById("battleLog");

const btnCmdAttack = document.getElementById("btnCmdAttack");
const btnCmdSkill = document.getElementById("btnCmdSkill");
const btnCmdGuard = document.getElementById("btnCmdGuard");
const btnCmdRun = document.getElementById("btnCmdRun");
const btnBackToTown = document.getElementById("btnBackToTown");

// 장비/인벤토리 슬롯 요소
const equipSlotElements = {
  weapon: document.querySelector('.equip-slot[data-slot-type="weapon"]'),
  helmet: document.querySelector('.equip-slot[data-slot-type="helmet"]'),
  armor: document.querySelector('.equip-slot[data-slot-type="armor"]'),
  shield: document.querySelector('.equip-slot[data-slot-type="shield"]'),
};
const inventorySlotElements = Array.from(document.querySelectorAll(".inventory-slot"));

// 캐릭터 정의
const sinjid = {
  id: "sinjid",
  name: "신지드",
  title: "그림자의 닌자",
  description: "암살단의 그림자에서 태어난 전사",
  spriteIdle: "assets/sinjid-idle.png",
  spriteAttack: "assets/sinjid-attack.png", // 나중에 추가 가능
};

// 플레이어 및 전투 상태
const player = {
  name: "신지드",
  character: sinjid, // 캐릭터 정보 참조
  level: 1,
  exp: 0,
  expToNext: 10,
  maxHp: 30,
  hp: 30,
  maxMp: 10,
  mp: 10,
  str: 5,
  agi: 3,
  int: 2,
  isGuarding: false,
  statPoints: 0,
  equipment: {
    weapon: null,
    helmet: null,
    armor: null,
    shield: null,
  },
  inventory: [], // 나중에 초기 아이템으로 채움
  shield: 0, // 현재 쉴드 양
};

// 아이템 데이터
const ITEM_DEFS = [
  {
    id: "training-sword",
    name: "훈련용 검",
    slotType: "weapon",
    strBonus: 2,
  },
  {
    id: "leather-helmet",
    name: "가죽 투구",
    slotType: "helmet",
    hpBonus: 5,
  },
  {
    id: "leather-armor",
    name: "가죽 갑옷",
    slotType: "armor",
    hpBonus: 10,
  },
  {
    id: "wooden-shield",
    name: "나무 방패",
    slotType: "shield",
    hpBonus: 6,
    shieldBonus: 20,
  },
  {
    id: "apprentice-ring",
    name: "수련생의 반지",
    slotType: "helmet", // 임시로 투구 칸에 장착 가능
    mpBonus: 5,
    intBonus: 1,
  },
];

function getItemById(id) {
  return ITEM_DEFS.find((it) => it.id === id) || null;
}

// 장비 보너스/최종 스탯 계산
function getEquipmentBonusTotals() {
  let hpBonus = 0;
  let mpBonus = 0;
  let strBonus = 0;
  let agiBonus = 0;
  let intBonus = 0;
   let shieldBonus = 0;

  Object.values(player.equipment).forEach((id) => {
    if (!id) return;
    const item = getItemById(id);
    if (!item) return;
    if (item.hpBonus) hpBonus += item.hpBonus;
    if (item.mpBonus) mpBonus += item.mpBonus;
    if (item.strBonus) strBonus += item.strBonus;
    if (item.agiBonus) agiBonus += item.agiBonus;
    if (item.intBonus) intBonus += item.intBonus;
    if (item.shieldBonus) shieldBonus += item.shieldBonus;
  });

  return { hpBonus, mpBonus, strBonus, agiBonus, intBonus, shieldBonus };
}

function getEffectiveStats() {
  const bonus = getEquipmentBonusTotals();
  return {
    maxHp: player.maxHp + bonus.hpBonus,
    maxMp: player.maxMp + bonus.mpBonus,
    str: player.str + bonus.strBonus,
    agi: player.agi + bonus.agiBonus,
    int: player.int + bonus.intBonus,
    maxShield: bonus.shieldBonus,
  };
}

let currentEnemy = null;
let battleEnded = false;
let currentBattleType = "training"; // "training" | "humanGate"
let currentDungeonChapterIndex = 0; // 현재 전투 중인 휴먼 게이트 챕터 (0 ~ 19)
let highestClearedDungeonChapterIndex = 0; // 다음에 도전할 수 있는 챕터 인덱스 (0 ~ 20, 20이면 모두 클리어)

const HUMAN_GATE_MAX_CHAPTER = 20;

// 휴먼 게이트 던전 데이터 (20챕터, 챕터당 적 1명)
const humanGateChapters = Array.from({ length: HUMAN_GATE_MAX_CHAPTER }, (_, i) => {
  const chapter = i + 1;
  const names = [
    "인간 병사",
    "실험체 A",
    "실험체 B",
    "광기의 검사",
    "오염된 승려",
    "무장 보초",
    "광신도",
    "어둠의 정찰병",
    "강화 인간",
    "게이트 수호자",
    "붉은 기사",
    "검은 마법사",
    "집행자",
    "철갑 병기",
    "실험체 Ω",
    "침묵의 암살자",
    "심연의 관찰자",
    "게이트 관리자",
    "정점의 인간",
    "휴먼 게이트의 주인",
  ];

  const name = names[i] || `게이트의 적 ${chapter}`;

  // 챕터가 높을수록 체력/공격력/경험치가 점점 상승
  const maxHp = 26 + chapter * 7;
  const atk = 5 + Math.floor(chapter * 2.2);
  const expReward = 10 + chapter * 4;

  return {
    chapter,
    name,
    maxHp,
    atk,
    expReward,
    desc: `휴먼 게이트 ${chapter}챕터. ${name} 이(가) 길을 막고 있습니다.`,
  };
});

// 간단한 적 데이터 (훈련용 허수아비)
function createTrainingDummy(level = 1) {
  const baseHp = 18 + level * 2;
  return {
    name: "훈련용 허수아비",
    maxHp: baseHp,
    hp: baseHp,
    atk: 3 + level,
  };
}

// 화면 전환
function showScreen(name) {
  screenTitle.classList.remove("active");
  screenTown.classList.remove("active");
  screenBattle.classList.remove("active");

  if (name === "title") screenTitle.classList.add("active");
  else if (name === "town") screenTown.classList.add("active");
  else if (name === "battle") screenBattle.classList.add("active");
}

// 일반 로그
function appendLog(message, type = "system") {
  const line = document.createElement("div");
  line.className = "log-line " + type;
  line.textContent = message;
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}

// 전투 로그
function appendBattleLog(message, type = "system") {
  const line = document.createElement("div");
  line.className = "log-line " + type;
  line.textContent = message;
  battleLogEl.appendChild(line);
  battleLogEl.scrollTop = battleLogEl.scrollHeight;
}

// 스탯 UI 갱신
function updateStatsUI() {
  const eff = getEffectiveStats();

  // 최대치가 바뀌었을 수 있으므로 현재 HP/MP를 클램프
  if (player.hp > eff.maxHp) player.hp = eff.maxHp;
  if (player.mp > eff.maxMp) player.mp = eff.maxMp;

  statLevelEl.textContent = player.level;
  statExpEl.textContent = `${player.exp} / ${player.expToNext}`;
  statHpEl.textContent = `${player.hp} / ${eff.maxHp}`;
  statMpEl.textContent = `${player.mp} / ${eff.maxMp}`;
  statStrEl.textContent = eff.str;
  statAgiEl.textContent = eff.agi;
  statIntEl.textContent = eff.int;

  // 게이지 업데이트
  if (expBarEl && player.expToNext > 0) {
    const expRate = Math.min(1, Math.max(0, player.exp / player.expToNext));
    expBarEl.style.width = `${expRate * 100}%`;
  }

  if (hpBarEl && player.maxHp > 0) {
    const hpRate = Math.min(1, Math.max(0, player.hp / eff.maxHp));
    hpBarEl.style.width = `${hpRate * 100}%`;
  }

  if (mpBarEl && player.maxMp > 0) {
    const mpRate = Math.min(1, Math.max(0, player.mp / eff.maxMp));
    mpBarEl.style.width = `${mpRate * 100}%`;
  }

  // 스탯 포인트 표시 및 버튼 활성/비활성
  if (statPointsValueEl) {
    statPointsValueEl.textContent = player.statPoints;
  }
  const hasPoints = player.statPoints > 0;
  [btnStatHp, btnStatMp, btnStatStr, btnStatAgi, btnStatInt].forEach((btn) => {
    if (!btn) return;
    btn.disabled = !hasPoints;
  });
}

// 전투 HP/MP 바 갱신
function updateBattleBars() {
  const eff = getEffectiveStats();
  playerHpTextEl.textContent = `${player.hp} / ${eff.maxHp}`;
  playerMpTextEl.textContent = `${player.mp} / ${eff.maxMp}`;
  enemyHpTextEl.textContent = `${currentEnemy.hp} / ${currentEnemy.maxHp}`;

  const pHpRate = Math.max(0, player.hp) / eff.maxHp;
  const pMpRate = Math.max(0, player.mp) / eff.maxMp;
  const eHpRate = Math.max(0, currentEnemy.hp) / currentEnemy.maxHp;

  playerHpBarEl.style.width = `${pHpRate * 100}%`;
  playerMpBarEl.style.width = `${pMpRate * 100}%`;
  enemyHpBarEl.style.width = `${eHpRate * 100}%`;

  // 쉴드 바
  if (playerShieldBarEl && playerShieldTextEl) {
    const maxShield = eff.maxShield || 0;
    const curShield = Math.max(0, Math.min(player.shield, maxShield));
    playerShieldTextEl.textContent = `${curShield} / ${maxShield}`;
    const sRate = maxShield > 0 ? curShield / maxShield : 0;
    playerShieldBarEl.style.width = `${sRate * 100}%`;
  }
}

// 레벨업 처리
function tryLevelUp() {
  while (player.exp >= player.expToNext) {
    player.exp -= player.expToNext;
    player.level += 1;
    player.expToNext = Math.floor(player.expToNext * 1.5);

    // 레벨업마다 스탯 포인트 2개 지급
    player.statPoints += 2;

    // 레벨업 시 현재 HP/MP/쉴드를 최대치까지 회복 (장비 보너스 포함)
    const eff = getEffectiveStats();
    player.hp = eff.maxHp;
    player.mp = eff.maxMp;
    player.shield = eff.maxShield;

    appendLog(
      `레벨 업! 현재 레벨: ${player.level} (새로운 스탯 포인트 2개 획득, 총 ${player.statPoints}개)`,
      "system"
    );
  }
  updateStatsUI();
}

// 스탯 증가 처리
function applyStatIncrease(type) {
  if (player.statPoints <= 0) {
    return;
  }

  if (type === "hp") {
    const delta = Math.max(1, Math.round(player.maxHp * 0.1));
    player.maxHp += delta;
    player.hp += delta;
  } else if (type === "mp") {
    const delta = Math.max(1, Math.round(player.maxMp * 0.1));
    player.maxMp += delta;
    player.mp += delta;
  } else if (type === "str") {
    player.str += 1;
  } else if (type === "agi") {
    player.agi += 1;
  } else if (type === "int") {
    player.int += 1;
  }

  player.statPoints -= 1;
  appendLog(`스탯이 상승했습니다. (${type.toUpperCase()} 강화, 남은 포인트: ${player.statPoints})`, "system");
  updateStatsUI();
}

// 휴식
function restInTown() {
  const eff = getEffectiveStats();
  player.hp = eff.maxHp;
  player.mp = eff.maxMp;
  player.shield = eff.maxShield;
  appendLog("마을에서 휴식을 취했습니다. HP, MP, 쉴드가 전부 회복되었습니다.", "heal");
  updateStatsUI();
}

// 전투 시작
function startBattle(type = "training", dungeonChapterIndex = 0) {
  currentBattleType = type;

  if (type === "humanGate") {
    const chapterData = humanGateChapters[dungeonChapterIndex];
    currentEnemy = {
      name: chapterData.name,
      maxHp: chapterData.maxHp,
      hp: chapterData.maxHp,
      atk: chapterData.atk,
    };
    appendBattleLog(
      `휴먼 게이트 ${chapterData.chapter}챕터에 진입했습니다. ${chapterData.name} 이(가) 나타납니다!`,
      "system"
    );
  } else {
    currentEnemy = createTrainingDummy(player.level);
  }

  battleEnded = false;
  player.isGuarding = false;

  // 전투 시작 시 장비 효과를 반영해 HP/MP 바를 재계산
  updateStatsUI();

  // 전투 스프라이트 초기화
  initBattleSprites();

  enemyNameEl.textContent = currentEnemy.name;

  // 버튼 상태 초기화
  btnCmdAttack.disabled = false;
  btnCmdSkill.disabled = false;
  btnCmdGuard.disabled = false;
  btnCmdRun.disabled = false;
  btnBackToTown.disabled = true;

  // 전투 로그 초기화
  battleLogEl.innerHTML = "";
  if (type === "training") {
    appendBattleLog(`${currentEnemy.name} 이(가) 나타났다!`, "system");
  }

  updateBattleBars();
  showScreen("battle");
}

// 데미지 계산 도우미
function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calcPlayerAttackDamage() {
  const eff = getEffectiveStats();
  const base = eff.str * 2 + 4;
  const variance = randomRange(-2, 2);
  return Math.max(1, base + variance);
}

function calcPlayerSkillDamage() {
  const eff = getEffectiveStats();
  const base = eff.str * 3 + 6;
  const variance = randomRange(-3, 3);
  return Math.max(3, base + variance);
}

function calcEnemyDamage() {
  const base = currentEnemy.atk * 2;
  const variance = randomRange(-2, 2);
  let dmg = base + variance;
  if (player.isGuarding) {
    dmg = Math.floor(dmg * 0.5);
  }
  return Math.max(1, dmg);
}

function endBattle(victory) {
  battleEnded = true;
  btnCmdAttack.disabled = true;
  btnCmdSkill.disabled = true;
  btnCmdGuard.disabled = true;
  btnCmdRun.disabled = true;
  btnBackToTown.disabled = false;

  if (victory) {
    let gainedExp = 0;
    if (currentBattleType === "humanGate") {
      const chapterData = humanGateChapters[currentDungeonChapterIndex];
      gainedExp = chapterData.expReward;
      appendBattleLog(
        `휴먼 게이트 ${chapterData.chapter}챕터를 돌파했습니다! 경험치 ${gainedExp} 을(를) 획득했습니다.`,
        "system"
      );

      // 이 전투가 현재 최고 진행 챕터였다면, 다음 챕터로 진행 가능하게 설정
      if (currentDungeonChapterIndex === highestClearedDungeonChapterIndex &&
        highestClearedDungeonChapterIndex < HUMAN_GATE_MAX_CHAPTER) {
        highestClearedDungeonChapterIndex += 1;
      }
    } else {
      gainedExp = 5 + player.level * 3;
      appendBattleLog(`전투에서 승리했습니다! 경험치 ${gainedExp} 을(를) 획득했습니다.`, "system");
    }

    player.exp += gainedExp;
    tryLevelUp();
    updateDungeonUI();

    // 전투 승리 시 장비 드롭 시도
    giveRandomItemDrop();
  } else {
    appendBattleLog("신지드는 의식을 잃고 말았습니다...", "dmg");
  }
}

// 전투 보상: 장비 드롭
function giveRandomItemDrop() {
  // 인벤토리에서 빈 칸 찾기
  const emptyIndex = player.inventory.findIndex((id) => !id);
  if (emptyIndex === -1) {
    appendLog("인벤토리가 가득 차서 장비를 획득하지 못했습니다.", "system");
    return;
  }

  const item = ITEM_DEFS[Math.floor(Math.random() * ITEM_DEFS.length)];
  player.inventory[emptyIndex] = item.id;
  appendLog(`${item.name} 을(를) 획득했습니다!`, "system");
  renderInventoryUI();
}

// 턴 진행(적 행동 포함)
function enemyTurn() {
  if (currentEnemy.hp <= 0 || player.hp <= 0) return;

  const dmg = calcEnemyDamage();

  // 적 공격 / 플레이어 피격 모션
  playSpriteAnim(enemySpriteEl, "enemy-attack");
  playSpriteAnim(playerSpriteEl, "player-hit");

  let remaining = dmg;
  // 쉴드부터 소모
  if (player.shield > 0) {
    const usedShield = Math.min(player.shield, remaining);
    player.shield -= usedShield;
    remaining -= usedShield;
  }
  if (remaining > 0) {
    player.hp -= remaining;
  }

  appendBattleLog(`${currentEnemy.name} 의 공격! ${dmg} 피해를 입었습니다.`, "dmg");

  if (player.hp <= 0) {
    player.hp = 0;
    updateBattleBars();
    endBattle(false);
  } else {
    updateBattleBars();
  }
}

// 장비/인벤토리 UI 렌더링
function renderEquipmentUI() {
  // 텍스트 장비 정보 (기존 상단 표시 유지)
  const weaponItem = player.equipment.weapon ? getItemById(player.equipment.weapon) : null;
  const armorItem = player.equipment.armor ? getItemById(player.equipment.armor) : null;
  if (equipWeaponEl) {
    equipWeaponEl.textContent = weaponItem ? weaponItem.name : "없음";
  }
  if (equipArmorEl) {
    equipArmorEl.textContent = armorItem ? armorItem.name : "없음";
  }

  // 슬롯 내용
  Object.entries(equipSlotElements).forEach(([slotType, el]) => {
    if (!el) return;
    const content = el.querySelector(".slot-content");
    const labelEl = el.querySelector(".slot-label");
    const itemId = player.equipment[slotType];
    if (!content) return;

    if (itemId) {
      const item = getItemById(itemId);
      content.classList.remove("empty");
      content.innerHTML = item
        ? `<div class="item-icon item-${item.id}"></div>`
        : `<div class="item-icon"></div>`;
      el.title = item
        ? `${item.name}\n${item.slotType} 장비`
        : "";
      el.draggable = true;
      if (labelEl) {
        labelEl.style.display = "none";
      }
    } else {
      content.classList.add("empty");
      content.innerHTML = "빈 칸";
      el.title = "";
      el.draggable = false;
      if (labelEl) {
        labelEl.style.display = "block";
      }
    }
  });
}

function renderInventoryUI() {
  inventorySlotElements.forEach((el) => {
    const idx = Number(el.dataset.inventoryIndex);
    const itemId = player.inventory[idx];
    const content = el.querySelector(".slot-content");
    if (!content) return;

    if (itemId) {
      const item = getItemById(itemId);
      content.classList.remove("empty");
      content.innerHTML = item
        ? `<div class="item-icon item-${item.id}"></div>`
        : `<div class="item-icon"></div>`;
      el.title = item ? item.name : "";
      el.draggable = true;
    } else {
      content.textContent = "빈 칸";
      content.classList.add("empty");
      content.innerHTML = "빈 칸";
      el.title = "";
      el.draggable = false;
    }
  });
}

// 드래그 앤 드롭 상태
let dragSource = null; // { type: 'equip'|'inventory', slotType?, index?, itemId }

function clearDragOverClasses() {
  Object.values(equipSlotElements).forEach((el) => el && el.classList.remove("drag-over"));
  inventorySlotElements.forEach((el) => el.classList.remove("drag-over"));
}

function handleSlotDragStart(e) {
  const el = e.currentTarget;
  const equipType = el.dataset.slotType;
  const invIndex = el.dataset.inventoryIndex;

  if (equipType) {
    const itemId = player.equipment[equipType];
    if (!itemId) {
      e.preventDefault();
      return;
    }
    dragSource = { type: "equip", slotType: equipType, itemId };
  } else if (invIndex !== undefined) {
    const index = Number(invIndex);
    const itemId = player.inventory[index];
    if (!itemId) {
      e.preventDefault();
      return;
    }
    dragSource = { type: "inventory", index, itemId };
  }

  if (!dragSource) return;
  e.dataTransfer.effectAllowed = "move";
  // 실제 데이터는 전역 dragSource에 저장하므로 최소 데이터만 설정
  e.dataTransfer.setData("text/plain", dragSource.itemId);
}

function handleSlotDragOver(e) {
  if (!dragSource) return;
  e.preventDefault();
  const el = e.currentTarget;
  el.classList.add("drag-over");
  e.dataTransfer.dropEffect = "move";
}

function handleSlotDragLeave(e) {
  e.currentTarget.classList.remove("drag-over");
}

function moveItemBetweenSlots(targetEl) {
  if (!dragSource) return;

  const targetEquipType = targetEl.dataset.slotType;
  const targetInvIndex = targetEl.dataset.inventoryIndex;

  // 소스 아이템 확인
  let sourceItemId = dragSource.itemId;
  if (!sourceItemId) return;

  // 대상: 장비칸
  if (targetEquipType) {
    const item = getItemById(sourceItemId);
    if (!item || item.slotType !== targetEquipType) {
      // 슬롯 타입이 맞지 않으면 무시
      return;
    }

    const targetCurrent = player.equipment[targetEquipType];

    if (dragSource.type === "equip") {
      // 장비 ↔ 장비 스왑
      const sourceType = dragSource.slotType;
      const sourceCurrent = player.equipment[sourceType];
      player.equipment[sourceType] = targetCurrent;
      player.equipment[targetEquipType] = sourceCurrent;
    } else if (dragSource.type === "inventory") {
      // 인벤토리 → 장비 (스왑)
      const sourceIndex = dragSource.index;
      player.inventory[sourceIndex] = targetCurrent || null;
      player.equipment[targetEquipType] = sourceItemId;
    }

    renderEquipmentUI();
    renderInventoryUI();
    updateStatsUI();
    if (item) {
      appendLog(`${item.name} 을(를) 장착/교체했습니다.`, "system");
    }
    return;
  }

  // 대상: 인벤토리 칸
  if (targetInvIndex !== undefined) {
    const targetIndex = Number(targetInvIndex);
    const targetCurrent = player.inventory[targetIndex];

    if (dragSource.type === "inventory") {
      // 인벤토리 ↔ 인벤토리 스왑
      const sourceIndex = dragSource.index;
      const tmp = player.inventory[sourceIndex];
      player.inventory[sourceIndex] = targetCurrent || null;
      player.inventory[targetIndex] = tmp || null;
    } else if (dragSource.type === "equip") {
      // 장비 → 인벤토리 (스왑)
      const sourceType = dragSource.slotType;
      const sourceCurrent = player.equipment[sourceType];
      player.equipment[sourceType] = targetCurrent || null;
      player.inventory[targetIndex] = sourceCurrent || null;
    }

    renderEquipmentUI();
    renderInventoryUI();
    updateStatsUI();
    const movedItem = getItemById(sourceItemId);
    if (movedItem) {
      appendLog(`${movedItem.name} 을(를) 이동했습니다.`, "system");
    }
  }
}

function handleSlotDrop(e) {
  e.preventDefault();
  const el = e.currentTarget;
  el.classList.remove("drag-over");
  moveItemBetweenSlots(el);
  dragSource = null;
}

function setupDragAndDrop() {
  Object.values(equipSlotElements).forEach((el) => {
    if (!el) return;
    el.addEventListener("dragstart", handleSlotDragStart);
    el.addEventListener("dragover", handleSlotDragOver);
    el.addEventListener("dragleave", handleSlotDragLeave);
    el.addEventListener("drop", handleSlotDrop);
  });

  inventorySlotElements.forEach((el) => {
    el.addEventListener("dragstart", handleSlotDragStart);
    el.addEventListener("dragover", handleSlotDragOver);
    el.addEventListener("dragleave", handleSlotDragLeave);
    el.addEventListener("drop", handleSlotDrop);
  });

  // 드래그가 취소되었을 때 클래스 정리
  window.addEventListener("dragend", clearDragOverClasses);
}

// 플레이어 행동 - 공격
function handleAttack() {
  if (battleEnded) return;
  player.isGuarding = false;

  // 플레이어 공격 모션 / 적 피격 모션
  playSpriteAnim(playerSpriteEl, "player-attack");
  playSpriteAnim(enemySpriteEl, "enemy-hit");

  const dmg = calcPlayerAttackDamage();
  currentEnemy.hp -= dmg;
  appendBattleLog(`신지드의 공격! ${dmg} 피해를 주었습니다.`, "dmg");

  if (currentEnemy.hp <= 0) {
    currentEnemy.hp = 0;
    updateBattleBars();
    endBattle(true);
  } else {
    updateBattleBars();
    setTimeout(enemyTurn, 400);
  }
}

// 플레이어 행동 - 스킬(강격)
function handleSkill() {
  if (battleEnded) return;
  const skillCost = 3;
  if (player.mp < skillCost) {
    appendBattleLog("MP가 부족합니다!", "system");
    return;
  }
  player.isGuarding = false;
  player.mp -= skillCost;

  // 스킬 공격 모션
  playSpriteAnim(playerSpriteEl, "player-attack");
  playSpriteAnim(enemySpriteEl, "enemy-hit");

  const dmg = calcPlayerSkillDamage();
  currentEnemy.hp -= dmg;
  appendBattleLog(`신지드의 강격! ${dmg} 피해를 주었습니다. (MP ${skillCost} 소모)`, "dmg");

  updateBattleBars();

  if (currentEnemy.hp <= 0) {
    currentEnemy.hp = 0;
    updateBattleBars();
    endBattle(true);
  } else {
    setTimeout(enemyTurn, 400);
  }
}

// 플레이어 행동 - 방어
function handleGuard() {
  if (battleEnded) return;
  player.isGuarding = true;
  appendBattleLog("신지드는 몸을 낮추고 방어 태세를 취했다.", "system");
  setTimeout(enemyTurn, 400);
}

// 플레이어 행동 - 도망
function handleRun() {
  if (battleEnded) return;
  const success = Math.random() < 0.4;
  if (success) {
    appendBattleLog("신지드는 간신히 전투에서 도망쳤다!", "system");
    endBattle(false);
  } else {
    appendBattleLog("도망에 실패했다!", "system");
    setTimeout(enemyTurn, 400);
  }
}

// 휴먼 게이트 UI 갱신
function updateDungeonUI() {
  if (highestClearedDungeonChapterIndex >= HUMAN_GATE_MAX_CHAPTER) {
    // 모든 챕터 클리어
    dungeonChapterLabelEl.textContent = `모든 챕터 클리어`;
    dungeonChapterNameEl.textContent = "휴먼 게이트 완료";
    dungeonChapterDescEl.textContent = "휴먼 게이트의 20챕터까지 모두 돌파했습니다. 더 이상 도전할 수 있는 챕터가 없습니다.";
    if (btnDungeonStart) btnDungeonStart.disabled = true;
  } else {
    const data = humanGateChapters[highestClearedDungeonChapterIndex];
    dungeonChapterLabelEl.textContent = `챕터 ${data.chapter} / ${HUMAN_GATE_MAX_CHAPTER}`;
    dungeonChapterNameEl.textContent = data.name;
    dungeonChapterDescEl.textContent = data.desc;
    if (btnDungeonStart) btnDungeonStart.disabled = false;
  }
}

// 전투 스프라이트 초기화
function initBattleSprites() {
  if (playerSpriteEl && player.character) {
    // 신지드 캐릭터 스프라이트 설정
    playerSpriteEl.style.backgroundImage = `url("${player.character.spriteIdle}")`;
    playerSpriteEl.className = "actor-sprite player-idle";
  }
  // 적 스프라이트는 기본 설정 유지 (나중에 확장 가능)
  if (enemySpriteEl) {
    enemySpriteEl.className = "actor-sprite enemy-idle";
  }
}

// 공통 애니메이션 헬퍼 함수
function playSpriteAnim(el, className) {
  if (!el) return;
  el.classList.remove(className);
  // 리플로우로 애니메이션 재시작
  // eslint-disable-next-line no-unused-expressions
  el.offsetWidth;
  el.classList.add(className);
}

// 초기 설정
function init() {
  // 시작 장비/인벤토리 구성
  player.equipment.weapon = "training-sword";
  player.equipment.armor = "leather-armor";
  player.inventory = [
    "wooden-shield",
    "leather-helmet",
    "apprentice-ring",
    null,
    null,
    null,
    null,
    null,
  ];

  renderEquipmentUI();
  renderInventoryUI();
  updateStatsUI();
  appendLog("수련마을에 도착했습니다. 훈련장으로 가서 전투를 해 보세요.", "system");
  appendLog("새로 열린 던전 '휴먼 게이트'에 도전해 보세요. (20챕터)", "system");
  updateDungeonUI();

  // 이벤트 바인딩
  btnStart.addEventListener("click", () => {
    showScreen("town");
  });

  btnFight.addEventListener("click", () => {
    startBattle("training");
  });

  btnRest.addEventListener("click", () => {
    restInTown();
  });

  btnDungeonStart.addEventListener("click", () => {
    // 이미 모든 챕터를 클리어했다면 더 이상 도전 불가
    if (highestClearedDungeonChapterIndex >= HUMAN_GATE_MAX_CHAPTER) {
      appendLog("휴먼 게이트의 모든 챕터를 이미 돌파했습니다.", "system");
      updateDungeonUI();
      return;
    }

    // 다음으로 도전 가능한 챕터로만 입장 (1챕터부터 순차 진행, 클리어한 챕터는 재도전 불가)
    currentDungeonChapterIndex = highestClearedDungeonChapterIndex;
    startBattle("humanGate", currentDungeonChapterIndex);
  });

  // 스탯 증가 버튼
  if (btnStatHp) btnStatHp.addEventListener("click", () => applyStatIncrease("hp"));
  if (btnStatMp) btnStatMp.addEventListener("click", () => applyStatIncrease("mp"));
  if (btnStatStr) btnStatStr.addEventListener("click", () => applyStatIncrease("str"));
  if (btnStatAgi) btnStatAgi.addEventListener("click", () => applyStatIncrease("agi"));
  if (btnStatInt) btnStatInt.addEventListener("click", () => applyStatIncrease("int"));

  btnCmdAttack.addEventListener("click", handleAttack);
  btnCmdSkill.addEventListener("click", handleSkill);
  btnCmdGuard.addEventListener("click", handleGuard);
  btnCmdRun.addEventListener("click", handleRun);

  btnBackToTown.addEventListener("click", () => {
    showScreen("town");
  });

  // 키보드 간단 조작: 전투 중 Z/X/C/V
  window.addEventListener("keydown", (e) => {
    if (!screenBattle.classList.contains("active")) return;
    const key = e.key.toLowerCase();
    if (key === "z") handleAttack();
    else if (key === "x") handleSkill();
    else if (key === "c") handleGuard();
    else if (key === "v") handleRun();
  });

  setupDragAndDrop();
}

init();


