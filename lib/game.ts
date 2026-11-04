export type Rarity = 'ruby'|'diamond'|'gold'|'silver'|'bronze'|'wood'
export type Card = {id:string; name:string; title:string; rarity:Rarity; image:string}
export const RARITIES: {key:Rarity; label:string; color:string; chance:number; count:number}[] = [{key:'ruby',label:'Ruby',color:'#ef4444',chance:.5,count:1},{key:'diamond',label:'Diamond',color:'#67e8f9',chance:2,count:4},{key:'gold',label:'Gold',color:'#fbbf24',chance:7.5,count:6},{key:'silver',label:'Silver',color:'#cbd5e1',chance:15,count:6},{key:'bronze',label:'Bronze',color:'#c08457',chance:25,count:8},{key:'wood',label:'Wood',color:'#a16207',chance:50,count:12}]
const defs: Record<Rarity, Array<[string,string,string]>> = {
 ruby: [
  ["ruby-1","1",""],
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
  ["silver-1","1",""],
  ["silver-2","2",""],
  ["silver-3","3",""],
  ["silver-4","4",""],
  ["silver-5","5",""],
  ["silver-6","6",""],
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
  ["wood-1","1",""],
  ["wood-2","2",""],
  ["wood-3","3",""],
  ["wood-4","4",""],
  ["wood-5","5",""],
  ["wood-6","6",""],
  ["wood-7","7",""],
  ["wood-8","8",""],
  ["wood-9","9",""],
  ["wood-10","10",""],
  ["wood-11","11",""],
  ["wood-12","12",""],
 ],
}
export const CARDS: Card[] = RARITIES.flatMap(r=>defs[r.key].map(([id,name,title])=>({id,name,title,rarity:r.key,image:`/cards/${r.key}/${id.split('-')[1]}.svg`})))
const originalImages: Partial<Record<string,string>> = {
 "gold-1": "/cards/gold/Адмирал Гримджоу_Капитан Коробля Синяя Роза.jpg",
 "gold-2": "/cards/gold/Межпланарный торговец Паяц_Шепчущий огонек.jpg",
 "gold-3": "/cards/gold/Оваций и Ульрих_Дети красного дракона.jpg",
 "gold-4": "/cards/gold/Правила и Последствия_Богини Судьбы.jpg",
 "gold-5": "/cards/gold/Самсон Горевестник_Первый в тени.jpg",
 "gold-6": "/cards/gold/Хозяин Огня Лореан_Владыка кузниц.jpg",
 "diamond-1": "/cards/diamond/Абортиз Магиволшебник_Великий межпланарный путешественник.jpg",
 "diamond-2": "/cards/diamond/Каллигула Черная Длань_Хранительница ключей бездны.jpg",
 "diamond-3": "/cards/diamond/Кровавый Аватар Ашура_Первая из Сотни.jpg",
 "diamond-4": "/cards/diamond/Троян Хлыст Божий_Король Королей.jpg",
 "bronze-1": "/cards/bronze/Агарес_Рыжий Принц.jpg",
 "bronze-2": "/cards/bronze/Антонио Дэ Ла Круа_Великий Неудачник.jpg",
 "bronze-3": "/cards/bronze/Доктор Лимзи_Всегда платит по счетам.jpg",
 "bronze-4": "/cards/bronze/Император человечества_Маска величия.jpg",
 "bronze-5": "/cards/bronze/Понти Почтальон_Хороший мальчик.jpg",
 "bronze-6": "/cards/bronze/Смертоносный дятел.jpg",
 "bronze-7": "/cards/bronze/Страж Мира Духов_Великая Жрица.jpg",
 "bronze-8": "/cards/bronze/Флавий Красный_Величайший Грех.jpg",
}
CARDS.forEach(c=>{if(originalImages[c.id]) c.image=originalImages[c.id]!})
export type State = {counts:Record<string,number>; history:string[]; totalOpens:number; boosters:number; pityGold:number; pityDiamond:number; rubyMisses:number; currency:number}
export const initialState=():State=>({counts:{},history:[],totalOpens:0,boosters:0,pityGold:0,pityDiamond:0,rubyMisses:0,currency:0})
function pickRarity(s:State):Rarity { const roll=Math.random()*100; let probs=RARITIES.map(x=>x.chance); const soft=Math.min(10, Math.floor(s.rubyMisses/40)*.5); probs[0]+=soft; probs[1]-=soft*.4; probs[2]-=soft*.3; probs[3]-=soft*.2; let n=0; for(let i=0;i<probs.length;i++){n+=probs[i]; if(roll<n)return RARITIES[i].key} return 'wood' }
export function draw(s:State):{state:State;card:Card;guaranteed:boolean}{ let rarity=pickRarity(s), guaranteed=false; if(s.pityDiamond>=49){rarity=Math.random()<.2?'ruby':'diamond'; guaranteed=true}else if(s.pityGold>=19 && ['wood','bronze','silver'].includes(rarity)){rarity=(['gold','diamond','ruby'] as Rarity[])[Math.floor(Math.random()*3)]; guaranteed=true} const pool=CARDS.filter(c=>c.rarity===rarity); const card=pool[Math.floor(Math.random()*pool.length)]; const ns={...s,counts:{...s.counts},history:[card.id,...s.history].slice(0,30),totalOpens:s.totalOpens+1,pityGold:['ruby','diamond','gold'].includes(rarity)?0:s.pityGold+1,pityDiamond:['ruby','diamond'].includes(rarity)?0:s.pityDiamond+1,rubyMisses:rarity==='ruby'?0:s.rubyMisses+1}; ns.counts[card.id]=(ns.counts[card.id]||0)+1; return {state:ns,card,guaranteed} }
export function rarityLabel(r:Rarity){return RARITIES.find(x=>x.key===r)?.label||r}
