import type { PublicNode } from './ui'

// Curated "pre-nodes": notable network societies / startup cities / popup villages — communities
// forming in the cloud to activate land. Seeded so the map and archive have real content before any
// crowd submission. Coordinates were researched + cross-checked (see precision in commit notes);
// "global"/popup orgs are pinned to their stated base or most recent host site. Always shown
// alongside approved crowd nodes; not user-editable. Societies carry no distress condition — the
// ground they activate may be dormant, distressed, or simply underappreciated.
export type PreNode = PublicNode & { source: 'curated' }

export const PRE_NODES: PreNode[] = [
  {
    id: "pre-network-school", type: 'society', subType: "startup_society", condition: null,
    nodeName: "Network School", city: "Forest City (Pulau Satu), Gelang Patah, Johor", country: "MY",
    latitude: 1.33558, longitude: 103.59425, photoUrls: null, source: 'curated',
    description: "Turning internet communities into a physical society, set within the dormant Forest City development.",
  },
  {
    id: "pre-prospera", type: 'society', subType: "charter_city", condition: null,
    nodeName: "Próspera", city: "Crawfish Rock, Roatán, Bay Islands", country: "HN",
    latitude: 16.3725, longitude: -86.4625, photoUrls: null, source: 'curated',
    description: "A startup city on Roatán operating under its own legal code, tax structure, and governance.",
  },
  {
    id: "pre-edge-city", type: 'society', subType: "popup_village", condition: null,
    nodeName: "Edge City", city: "Healdsburg, California", country: "US",
    latitude: 38.6107, longitude: -122.8693, photoUrls: null, source: 'curated',
    description: "Monthlong popup villages for people at the frontiers of tech, science, and culture.",
  },
  {
    id: "pre-forma", type: 'society', subType: "popup_village", condition: null,
    nodeName: "Forma", city: "Bristol, United Kingdom", country: "GB",
    latitude: 51.4545, longitude: -2.5879, photoUrls: null, source: 'curated',
    description: "From popup villages and Solana Economic Zones to a permanent campus in the UK.",
  },
  {
    id: "pre-crecimiento", type: 'society', subType: "startup_society", condition: null,
    nodeName: "Crecimiento", city: "Buenos Aires, Argentina", country: "AR",
    latitude: -34.5471, longitude: -58.4893, photoUrls: null, source: 'curated',
    description: "Making Argentina a global hub for tech innovation.",
  },
  {
    id: "pre-frontier-tower", type: 'society', subType: "intentional_community", condition: null,
    nodeName: "Frontier Tower", city: "San Francisco, California", country: "US",
    latitude: 37.78239, longitude: -122.40991, photoUrls: null, source: 'curated',
    description: "A 16-floor tower turned vertical village for frontier-tech pioneers in San Francisco.",
  },
  {
    id: "pre-4seas", type: 'society', subType: "startup_society", condition: null,
    nodeName: "4Seas", city: "Chiang Mai, Thailand", country: "TH",
    latitude: 18.7958, longitude: 98.9677, photoUrls: null, source: 'curated',
    description: "A permanent node of the Zuzalu movement, based in Chiang Mai.",
  },
  {
    id: "pre-akiya-collective", type: 'society', subType: "startup_society", condition: null,
    nodeName: "Akiya Collective", city: "Komoro, Nagano", country: "JP",
    latitude: 36.3275, longitude: 138.42583, photoUrls: null, source: 'curated',
    description: "Transforming Japan's vacant akiya homes into residencies and community spaces.",
  },
  {
    id: "pre-amagi-life", type: 'society', subType: "startup_society", condition: null,
    nodeName: "Amagi Life", city: "Ban Tai, Ko Pha-ngan, Surat Thani", country: "TH",
    latitude: 9.71719, longitude: 100.03488, photoUrls: null, source: 'curated',
    description: "Regenerative villages in Thailand: long-term living, shared land, a contribution economy.",
  },
  {
    id: "pre-arc", type: 'society', subType: "charter_city", condition: null,
    nodeName: "Ârc", city: "Forest City (Pulau Satu), Gelang Patah, Johor, Malaysia", country: "MY",
    latitude: 1.33558, longitude: 103.59425, photoUrls: null, source: 'curated',
    description: "Network School's first permanent Layer 2, building toward a new charter city.",
  },
  {
    id: "pre-bitcoin-learning-center", type: 'society', subType: "intentional_community", condition: null,
    nodeName: "Bitcoin Learning Center", city: "Chiang Mai, Thailand", country: "TH",
    latitude: 18.79365, longitude: 99.00196, photoUrls: null, source: 'curated',
    description: "Asia's most active physical Bitcoin hub, in Chiang Mai.",
  },
  {
    id: "pre-cafe-cursor", type: 'society', subType: "intentional_community", condition: null,
    nodeName: "Cafe Cursor", city: "New York, NY, USA", country: "US",
    latitude: 40.7208, longitude: -73.99725, photoUrls: null, source: 'curated',
    description: "Popup cafe takeovers where Cursor users gather to code and build together.",
  },
  {
    id: "pre-ciudad-morazan", type: 'society', subType: "startup_city", condition: null,
    nodeName: "Ciudad Morazán", city: "Choloma", country: "HN",
    latitude: 15.652, longitude: -87.945, photoUrls: null, source: 'curated',
    description: "A startup city in Honduras providing safe housing and amenities for working families.",
  },
  {
    id: "pre-culdesac", type: 'society', subType: "startup_city", condition: null,
    nodeName: "Culdesac", city: "Tempe", country: "US",
    latitude: 33.4145, longitude: -111.8994, photoUrls: null, source: 'curated',
    description: "Walkable, car-free neighbourhoods built for belonging and local business.",
  },
  {
    id: "pre-futura-camp", type: 'society', subType: "popup_village", condition: null,
    nodeName: "Futura Camp (ZuBerlin)", city: "Berlin", country: "DE",
    latitude: 52.4795, longitude: 13.4996, photoUrls: null, source: 'curated',
    description: "An immersive coliving residency bridging technology and human connection, in Berlin.",
  },
  {
    id: "pre-gelephu", type: 'society', subType: "startup_city", condition: null,
    nodeName: "Gelephu Mindfulness City", city: "Gelephu", country: "BT",
    latitude: 26.87056, longitude: 90.48556, photoUrls: null, source: 'curated',
    description: "An emerging startup city and Special Economic Zone in Bhutan.",
  },
  {
    id: "pre-hacker-residency-group", type: 'society', subType: "popup_village", condition: null,
    nodeName: "Hacker Residency Group", city: "Da Nang", country: "VN",
    latitude: 16.10623, longitude: 108.25828, photoUrls: null, source: 'curated',
    description: "A residency for ambitious indie hackers, in Da Nang.",
  },
  {
    id: "pre-infinita", type: 'society', subType: "startup_society", condition: null,
    nodeName: "Infinita", city: "Crawfish Rock, Roatán, Honduras", country: "HN",
    latitude: 16.36781, longitude: -86.47206, photoUrls: null, source: 'curated',
    description: "A network city in Próspera, Roatán, focused on longevity and biotech.",
  },
  {
    id: "pre-ipe-city", type: 'society', subType: "popup_village", condition: null,
    nodeName: "Ipê City", city: "Florianópolis, Santa Catarina", country: "BR",
    latitude: -27.43895, longitude: -48.49971, photoUrls: null, source: 'curated',
    description: "Techno-optimists building social technologies for internet-native cities.",
  },
  {
    id: "pre-mtndao", type: 'society', subType: "popup_village", condition: null,
    nodeName: "mtndao", city: "Salt Lake City, Utah", country: "US",
    latitude: 40.76073, longitude: -111.88026, photoUrls: null, source: 'curated',
    description: "A monthlong popup in Salt Lake City for Solana founders and builders.",
  },
  {
    id: "pre-noma-collective", type: 'society', subType: "popup_village", condition: null,
    nodeName: "Noma Collective", city: "Placencia, Belize", country: "BZ",
    latitude: 16.5139, longitude: -88.3667, photoUrls: null, source: 'curated',
    description: "A network society for digital nomads and remote builders.",
  },
  {
    id: "pre-nomad", type: 'society', subType: "coliving", condition: null,
    nodeName: "Nomad", city: "Raleigh, North Carolina", country: "US",
    latitude: 35.74519, longitude: -78.58603, photoUrls: null, source: 'curated',
    description: "Coliving villages from the future, for the modern nomad.",
  },
  {
    id: "pre-proto-town", type: 'society', subType: "startup_city", condition: null,
    nodeName: "Proto-Town", city: "Lockhart, Texas (Caldwell County)", country: "US",
    latitude: 29.7752, longitude: -97.6797, photoUrls: null, source: 'curated',
    description: "A place to build hardware, in Lockhart, Texas.",
  },
  {
    id: "pre-rns-id", type: 'society', subType: "network_state", condition: null,
    nodeName: "RNS.ID", city: "Koror, Palau", country: "PW",
    latitude: 7.3419, longitude: 134.4792, photoUrls: null, source: 'curated',
    description: "A digital residency program backed by the Republic of Palau.",
  },
  {
    id: "pre-shanhaiwoo", type: 'society', subType: "popup_village", condition: null,
    nodeName: "ShanHaiWoo", city: "Singapore (one-north / Fusionopolis)", country: "SG",
    latitude: 1.29835, longitude: 103.78865, photoUrls: null, source: 'curated',
    description: "Popup villages for engineers and founders shipping Ethereum and AI applications.",
  },
  {
    id: "pre-starbase", type: 'society', subType: "startup_city", condition: null,
    nodeName: "Starbase", city: "Starbase (Boca Chica), Texas", country: "US",
    latitude: 25.99139, longitude: -97.18361, photoUrls: null, source: 'curated',
    description: "Starbase, Texas: gateway to Mars.",
  },
  {
    id: "pre-the-mu", type: 'society', subType: "popup_village", condition: null,
    nodeName: "The Mu", city: "Chiang Mai, Thailand", country: "TH",
    latitude: 18.7953, longitude: 98.9986, photoUrls: null, source: 'curated',
    description: "Facilitating popup villages in diverse locations worldwide.",
  },
  {
    id: "pre-traditional-dream-factory", type: 'society', subType: "startup_society", condition: null,
    nodeName: "Traditional Dream Factory", city: "Abela, Santiago do Cacém, Alentejo", country: "PT",
    latitude: 38.00286, longitude: -8.55897, photoUrls: null, source: 'curated',
    description: "A regenerative coliving village in Portugal.",
  },
  {
    id: "pre-vibecamp", type: 'society', subType: "popup_village", condition: null,
    nodeName: "Vibecamp", city: "Darlington, Maryland", country: "US",
    latitude: 39.64544, longitude: -76.17538, photoUrls: null, source: 'curated',
    description: "A recurring IRL festival for the TPOT online community.",
  },
  {
    id: "pre-zanzalu", type: 'society', subType: "popup_village", condition: null,
    nodeName: "Zanzalu", city: "Fumba Town, Zanzibar", country: "TZ",
    latitude: -6.2752, longitude: 39.25259, photoUrls: null, source: 'curated',
    description: "A recurring popup village in Fumba Town, Zanzibar.",
  },
  {
    id: "pre-zu-grama", type: 'society', subType: "popup_village", condition: null,
    nodeName: "Zu-Grama", city: "Thiruvananthapuram (Trivandrum), Kerala", country: "IN",
    latitude: 8.5241, longitude: 76.9366, photoUrls: null, source: 'curated',
    description: "An onchain village fusing coliving with deep tech, in India.",
  },
  {
    id: "pre-zuafrique", type: 'society', subType: "popup_village", condition: null,
    nodeName: "ZuAfrique", city: "Kilifi, Kenya", country: "KE",
    latitude: -3.6333, longitude: 39.85, photoUrls: null, source: 'curated',
    description: "Popup villages in Africa helping African builders ship real projects.",
  },
  {
    id: "pre-zuitzerland", type: 'society', subType: "popup_village", condition: null,
    nodeName: "Zuitzerland", city: "Laax, Switzerland", country: "CH",
    latitude: 46.8367, longitude: 9.2171, photoUrls: null, source: 'curated',
    description: "A Swiss popup village for d/acc and open-source acceleration in the Alps.",
  },
  {
    id: "pre-zujapan", type: 'society', subType: "startup_city", condition: null,
    nodeName: "ZuJapan", city: "Komoro, Nagano", country: "JP",
    latitude: 36.3275, longitude: 138.42583, photoUrls: null, source: 'curated',
    description: "A permanent Zuzalu village in Japan, partnered with Akiya Collective.",
  },
  {
    id: "pre-zukas", type: 'society', subType: "startup_society", condition: null,
    nodeName: "ZuKaş", city: "Kaş, Antalya, Turkey", country: "TR",
    latitude: 36.2018, longitude: 29.6377, photoUrls: null, source: 'curated',
    description: "A Zu-village in Kaş, Turkey, focused on Lycian democracy and participatory governance.",
  },
  {
    id: "pre-zuzalu", type: 'society', subType: "startup_society", condition: null,
    nodeName: "Zuzalu", city: "Radovići, Tivat, Montenegro", country: "ME",
    latitude: 42.38631, longitude: 18.66461, photoUrls: null, source: 'curated',
    description: "The umbrella community of popup villages anchored to Ethereum.",
  },
  {
    id: "pre-cabin", type: 'society', subType: "network_state", condition: null,
    nodeName: "Cabin", city: "Spicewood, Texas", country: "US",
    latitude: 30.476, longitude: -98.1564, photoUrls: null, source: 'curated',
    description: "A network of neighbourhoods knitting remote communities into shared places.",
  },
]
