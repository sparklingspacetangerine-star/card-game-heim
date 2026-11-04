export type Rarity = 'ruby'|'diamond'|'gold'|'silver'|'bronze'|'wood'
export type Card = {id:string; name:string; title:string; rarity:Rarity; image:string}
export const RARITIES: {key:Rarity; label:string; color:string; chance:number; count:number}[] = [{key:'ruby',label:'Ruby',color:'#ef4444',chance:.5,count:1},{key:'diamond',label:'Diamond',color:'#67e8f9',chance:2,count:4},{key:'gold',label:'Gold',color:'#fbbf24',chance:7.5,count:6},{key:'silver',label:'Silver',color:'#cbd5e1',chance:15,count:6},{key:'bronze',label:'Bronze',color:'#c08457',chance:25,count:8},{key:'wood',label:'Wood',color:'#a16207',chance:50,count:12}]
const defs: Record<Rarity, Array<[string,string,string]>> = {
 ruby: [
  ["ruby-1","Провожающая в последний путь",""],
 ],
 diamond: [
  ["diamond-1","Абортиз Магиволшебник","Великий межпланарный путешественник"],
  ["diamond-2","Каллигула Черная Длань","Хранительница ключей бездны"],
  ["diamond-3","Кровавый Аватар Ашура","Первая из Сотни"],
  ["diamond-4","Троян Хлыст Божий","Король Королей"],
 ],
 gold: [
  ["gold-1","Адмирал Гримджоу","Капитан Коробля Синяя Роза"],
  ["gold-2","Межпланарный торговец Паяц","Шепчущий огонек"],
  ["gold-3","Оваций и Ульрих","Дети красного дракона"],
  ["gold-4","Правила и Последствия","Богини Судьбы"],
  ["gold-5","Самсон Горевестник","Первый в тени"],
  ["gold-6","Хозяин Огня Лореан","Владыка кузниц"],
 ],
 silver: [
  ["silver-1","Доменик Дэ Кокку","Хозяин 457 высоты"],
  ["silver-2","Золотце","Дитя Случайности"],
  ["silver-3","Кайот Старк","Принцесса Морей"],
  ["silver-4","Офицер Бобби","Королевский ловчий"],
  ["silver-5","Пеплоносец","Нарушающий Клятвы"],
  ["silver-6","Ханна Монтирэй","Госпожа Праздник"],
 ],
 bronze: [
  ["bronze-1","Агарес","Рыжий Принц"],
  ["bronze-2","Антонио Дэ Ла Круа","Великий Неудачник"],
  ["bronze-3","Доктор Лимзи","Всегда платит по счетам"],
  ["bronze-4","Император человечества","Маска величия"],
  ["bronze-5","Понти Почтальон","Хороший мальчик"],
  ["bronze-6","Смертоносный дятел",""],
  ["bronze-7","Страж Мира Духов","Великая Жрица"],
  ["bronze-8","Флавий Красный","Величайший Грех"],
 ],
 wood: [
  ["wood-1","Белая Смерть","Нас всегда было двое"],
  ["wood-2","Бэй Зов Крови","Я стану старше и приду за тобой"],
  ["wood-3","Максимус Децимус Меридий","Командующий первым легионом"],
  ["wood-4","Обычная Знахарка","Моя смерть ничего не изменит"],
  ["wood-5","Орос","Жрец дракона Терракса"],
  ["wood-6","Претор","Против бесчисленных армий титанов мы выставим только тебя одного"],
  ["wood-7","Проект 011","Ты попался на крючочек"],
  ["wood-8","Рожденная в Хаосе","Дождь из кинжалов"],
  ["wood-9","Ротатоск","Хранитель великого древа"],
  ["wood-10","Страж покоев Грукка","Никто не пройдёт"],
  ["wood-11","Сэми Котяра","Ты знаешь у кого лучшие девушки"],
  ["wood-12","Утонувший Пьяница","Я могу бросить в любое время"],
 ],
}
export const CARDS: Card[] = RARITIES.flatMap(r=>defs[r.key].map(([id,name,title])=>({id,name,title,rarity:r.key,image:`/cards/${r.key}/${id.split('-')[1]}.svg`})))
const originalImages: Partial<Record<string,string>> = {
 "ruby-1": "/cards/ruby/Провожающая в последний путь.jpg",
 "diamond-1": "/cards/diamond/Абортиз Магиволшебник_Великий межпланарный путешественник.jpg",
 "diamond-2": "/cards/diamond/Каллигула Черная Длань_Хранительница ключей бездны.jpg",
 "diamond-3": "/cards/diamond/Кровавый Аватар Ашура_Первая из Сотни.jpg",
 "diamond-4": "/cards/diamond/Троян Хлыст Божий_Король Королей.jpg",
 "gold-1": "/cards/gold/Адмирал Гримджоу_Капитан Коробля Синяя Роза.jpg",
 "gold-2": "/cards/gold/Межпланарный торговец Паяц_Шепчущий огонек.jpg",
 "gold-3": "/cards/gold/Оваций и Ульрих_Дети красного дракона.jpg",
 "gold-4": "/cards/gold/Правила и Последствия_Богини Судьбы.jpg",
 "gold-5": "/cards/gold/Самсон Горевестник_Первый в тени.jpg",
 "gold-6": "/cards/gold/Хозяин Огня Лореан_Владыка кузниц.jpg",
 "silver-1": "/cards/silver/Доменик Дэ Кокку_Хозяин 457 высоты.jpg",
 "silver-2": "/cards/silver/Золотце_Дитя Случайности.jpg",
 "silver-3": "/cards/silver/Кайот Старк_Принцесса Морей.jpg",
 "silver-4": "/cards/silver/Офицер Бобби_Королевский ловчий.jpg",
 "silver-5": "/cards/silver/Пеплоносец_Нарушающий Клятвы.jpg",
 "silver-6": "/cards/silver/Ханна Монтирэй_Госпожа Праздник.jpg",
 "bronze-1": "/cards/bronze/Агарес_Рыжий Принц.jpg",
 "bronze-2": "/cards/bronze/Антонио Дэ Ла Круа_Великий Неудачник.jpg",
 "bronze-3": "/cards/bronze/Доктор Лимзи_Всегда платит по счетам.jpg",
 "bronze-4": "/cards/bronze/Император человечества_Маска величия.jpg",
 "bronze-5": "/cards/bronze/Понти Почтальон_Хороший мальчик.jpg",
 "bronze-6": "/cards/bronze/Смертоносный дятел.jpg",
 "bronze-7": "/cards/bronze/Страж Мира Духов_Великая Жрица.jpg",
 "bronze-8": "/cards/bronze/Флавий Красный_Величайший Грех.jpg",
 "wood-1": "/cards/wood/Белая Смерть_Нас всегда было двое.jpg",
 "wood-2": "/cards/wood/Бэй Зов Крови_Я стану старше и приду за тобой.jpg",
 "wood-3": "/cards/wood/Максимус Децимус Меридий_Командующий первым легионом.jpg",
 "wood-4": "/cards/wood/Обычная Знахарка_Моя смерть ничего не изменит.jpg",
 "wood-5": "/cards/wood/Орос_Жрец дракона Терракса.jpg",
 "wood-6": "/cards/wood/Претор_Против бесчисленных армий титанов мы выставим только тебя одного.jpg",
 "wood-7": "/cards/wood/Проект 011_Ты попался на крючочек.jpg",
 "wood-8": "/cards/wood/Рожденная в Хаосе_Дождь из кинжалов.jpg",
 "wood-9": "/cards/wood/Ротатоск_Хранитель великого древа.jpg",
 "wood-10": "/cards/wood/Страж покоев Грукка_Никто не пройдёт.jpg",
 "wood-11": "/cards/wood/Сэми Котяра_Ты знаешь у кого лучшие девушки.jpg",
 "wood-12": "/cards/wood/Утонувший Пьяница_Я могу бросить в любое время.jpg",
}
CARDS.forEach(c=>{if(originalImages[c.id]) c.image=originalImages[c.id]!})
export type State = {counts:Record<string,number>; history:string[]; totalOpens:number; boosters:number; pityGold:number; pityDiamond:number; rubyMisses:number; currency:number}
export const initialState=():State=>({counts:{},history:[],totalOpens:0,boosters:0,pityGold:0,pityDiamond:0,rubyMisses:0,currency:0})
function pickRarity(s:State):Rarity { const roll=Math.random()*100; let probs=RARITIES.map(x=>x.chance); const soft=Math.min(10, Math.floor(s.rubyMisses/40)*.5); probs[0]+=soft; probs[1]-=soft*.4; probs[2]-=soft*.3; probs[3]-=soft*.2; let n=0; for(let i=0;i<probs.length;i++){n+=probs[i]; if(roll<n)return RARITIES[i].key} return 'wood' }
export function draw(s:State):{state:State;card:Card;guaranteed:boolean}{ let rarity=pickRarity(s), guaranteed=false; if(s.pityDiamond>=49){rarity=Math.random()<.2?'ruby':'diamond'; guaranteed=true}else if(s.pityGold>=19 && ['wood','bronze','silver'].includes(rarity)){rarity=(['gold','diamond','ruby'] as Rarity[])[Math.floor(Math.random()*3)]; guaranteed=true} const pool=CARDS.filter(c=>c.rarity===rarity); const card=pool[Math.floor(Math.random()*pool.length)]; const ns={...s,counts:{...s.counts},history:[card.id,...s.history].slice(0,30),totalOpens:s.totalOpens+1,pityGold:['ruby','diamond','gold'].includes(rarity)?0:s.pityGold+1,pityDiamond:['ruby','diamond'].includes(rarity)?0:s.pityDiamond+1,rubyMisses:rarity==='ruby'?0:s.rubyMisses+1}; ns.counts[card.id]=(ns.counts[card.id]||0)+1; return {state:ns,card,guaranteed} }
export function rarityLabel(r:Rarity){return RARITIES.find(x=>x.key===r)?.label||r}
