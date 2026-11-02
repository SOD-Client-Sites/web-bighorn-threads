// Supplier catalog photos, the same SAGE images the catalog pages show. Each was checked by eye: no third-party logos or swatch dots.
const pic = (sn: number, p: number) => `https://www.promoplace.com/ws/ws.dll/QPic?SN=${sn}&P=${p}&RS=300`

export const productPhotos = {
 workShirt: { src: pic(68414, 945769040), alt: 'Red Kap work shirt' },
 workShirtBlack: { src: pic(68414, 106695816), alt: 'Red Kap black shirt' },
 polo: { src: pic(50042, 572084278), alt: 'Port Authority polo' },
 poloWhite: { src: pic(50042, 595513173), alt: 'Port Authority white polo' },
 vest: { src: pic(50042, 116377398), alt: 'CornerStone safety vest' },
 hivisTee: { src: pic(50042, 913213443), alt: 'CornerStone hi-vis tee' },
 hivisLong: { src: pic(50042, 373505618), alt: 'CornerStone hi-vis long sleeve' },
 hoodie: { src: pic(50042, 786780311), alt: 'Gildan hooded sweatshirt' },
 tee: { src: pic(50042, 722090562), alt: 'Gildan cotton T-shirt' },
 fr: { src: pic(52278, 549020207), alt: 'Bulwark FR shirt' },
 frKhaki: { src: pic(52278, 779020210), alt: 'Bulwark FR khaki shirt' },
 frCoverall: { src: pic(52278, 779020111), alt: 'Bulwark FR coverall' },
 softshell: { src: pic(69112, 913573912), alt: 'White Bear soft shell' },
 jacket: { src: pic(50042, 524481216), alt: 'Port Authority soft shell' },
 cap: { src: pic(62662, 366495958), alt: 'Richardson trucker cap' },
 capOlive: { src: pic(50042, 158920683), alt: 'Richardson five-panel cap' },
 beanie: { src: pic(62662, 522206281), alt: 'Sportsman beanie' },
 boonie: { src: pic(65212, 727679712), alt: 'OTTO CAP boonie hat' },
 hardHat: { src: pic(52649, 596831160), alt: 'ANSI full brim hard hat' },
 hardHatCap: { src: pic(52649, 166831159), alt: 'ANSI cap hard hat' },
 scrubs: { src: pic(68414, 142933282), alt: 'Cherokee scrub top' },
 labCoat: { src: pic(68414, 124495972), alt: 'Red Kap lab coat' },
 pants: { src: pic(69609, 169096685), alt: 'Carhartt work pants' },
 coverall: { src: pic(68414, 718227107), alt: 'Dickies basic coverall' },
 apron: { src: pic(68414, 946880022), alt: 'Uncommon chef apron' },
 backpack: { src: pic(50042, 516263345), alt: 'Port Authority backpack' },
 tumbler: { src: pic(53170, 508793820), alt: 'YETI Rambler mug' },
 dressShirt: { src: pic(52278, 517834570), alt: 'Port Authority shirt' },
 quarterZip: { src: pic(52969, 968353380), alt: 'Peter Millar quarter zip' },
 carharttTee: { src: pic(50042, 795932248), alt: 'Carhartt pocket tee' },
 carharttJacket: { src: pic(50042, 566328834), alt: 'Carhartt duck jacket' },
}

type PhotoKey = keyof typeof productPhotos
// Comparison, cost, guide and location pages sell an answer, not a product. No tiles there.
const noTiles = /-vs-|-vs\/|alternatives|best-places|cost-|-cost|worth-it|fastest|how-to|locations|service-areas|safety-compliance|setup-guide|company-stores|^\/industries\/$|^\/services\/$|^\/es\/|catalog/

const sets: [RegExp, PhotoKey[]][] = [
 [/company-uniforms/, ['polo', 'workShirt', 'scrubs', 'softshell']],
 [/company-shirts/, ['tee', 'polo', 'workShirt', 'dressShirt']],
 [/embroidered-hats/, ['cap', 'beanie', 'boonie', 'capOlive']],
 [/quarter-zips/, ['quarterZip', 'softshell', 'jacket', 'carharttJacket']],
 [/corporate-swag/, ['tumbler', 'backpack', 'quarterZip', 'cap']],
 [/carhartt/, ['carharttTee', 'carharttJacket', 'pants', 'hoodie']],
 [/red-kap/, ['workShirt', 'workShirtBlack', 'coverall', 'pants']],
 [/port-authority/, ['polo', 'poloWhite', 'jacket', 'dressShirt']],
 [/custom-polo/, ['polo', 'poloWhite', 'quarterZip', 'dressShirt']],
 [/bulwark|electric|nfpa|oil-gas|data-center/, ['fr', 'frKhaki', 'frCoverall', 'hardHat']],
 [/welder|steel/, ['frCoverall', 'fr', 'hardHat', 'pants']],
 [/kishigo|safety-vest|hi-vis|ansi|concrete|general-contractor/, ['vest', 'hivisTee', 'hivisLong', 'hardHat']],
 [/hard-hat/, ['hardHat', 'hardHatCap', 'vest', 'hivisTee']],
 [/roofing|landscap/, ['hivisLong', 'boonie', 'hivisTee', 'tee']],
 [/plumbing|hvac|work-shirt/, ['workShirt', 'workShirtBlack', 'polo', 'pants']],
 [/hats-/, ['cap', 'boonie', 'beanie', 'hardHatCap']],
 [/health|scrub/, ['scrubs', 'labCoat', 'polo', 'quarterZip']],
 [/casino|gaming|hospitality/, ['dressShirt', 'apron', 'polo', 'quarterZip']],
 [/corporate|onboarding/, ['polo', 'quarterZip', 'dressShirt', 'tumbler']],
 [/yeti/, ['tumbler']],
 [/lanyard/, []],
 [/promo|trade-show/, ['tumbler', 'backpack', 'tee', 'cap']],
 [/education|events|team|t-shirt|screen-print|dtf/, ['tee', 'hoodie', 'hivisTee', 'cap']],
 [/embroider|rush/, ['polo', 'cap', 'softshell', 'workShirt']],
 [/government/, ['polo', 'vest', 'softshell', 'cap']],
 [/uniforms/, ['polo', 'workShirt', 'scrubs', 'dressShirt']],
 [/construction/, ['workShirt', 'vest', 'hardHat', 'softshell']],
]
const defaults: PhotoKey[] = ['workShirt', 'vest', 'hoodie', 'cap']

export const photosForPath = (path: string) =>
 noTiles.test(path) ? [] : (sets.find(([re]) => re.test(path))?.[1] ?? defaults).map((k) => productPhotos[k])
