export type GalleryImage = {
  url: string
  caption: string
  date: string
}

export type BlueskyPost = {
  text: string
  date: string
  link: string
  imageUrl?: string
}

export type PressRelease = {
  title: string
  date: string
  link: string
}

export type ConstructionNotice = {
  title: string
  date: string
  link: string
}

export const images: GalleryImage[] = [
  {
    url: 'https://www.gatewayprogram.org/wp-content/uploads/2026/02/Gateway_RAE_2-9-2026-7134.jpg',
    caption: 'More than 200 union workers rallied at GDC\'s North Bergen Construction site to call for the project\'s federal funding to be restored.',
    date: '2026-02-01'
  },
  {
    url: 'https://www.gatewayprogram.org/wp-content/uploads/2026/02/Gateway_RAE_2-9-2026-57891.jpg',
    caption: 'Hundreds of workers are impacted by the construction pause that went into effect on February 6 due to lack of federal funding.',
    date: '2026-02-01'
  },
  {
    url: 'https://www.gatewayprogram.org/wp-content/uploads/2026/02/Gateway_RAE_2-9-2026-56741.jpg',
    caption: 'An extended construction pause will put tens of thousands of jobs at risk.',
    date: '2026-02-01'
  },
  {
    url: 'https://www.gatewayprogram.org/wp-content/uploads/2026/01/IMG_3240.jpeg',
    caption: 'Openings for both tunnel tubes connecting the section of the Hudson Yards Concrete Casing currently under construction to the part of the concrete casing that is already finished.',
    date: '2026-01-01'
  },
  {
    url: 'https://www.gatewayprogram.org/wp-content/uploads/2026/01/PKG1A_PH_20260129_NJ_GatewayPalisadesTonnelle_PANYNJ_GDC_DJI_MM-18.jpg',
    caption: 'Components of the first tunnel boring machine staged for assembly next to the portal launch box.',
    date: '2026-01-29'
  },
  {
    url: 'https://www.gatewayprogram.org/wp-content/uploads/2026/01/MPA_Delivery_Partners-311_-_11th_Ave-Camera-January_28_2026_10_20_34_AM.jpg',
    caption: 'Ground stabilization work in the frozen Hudson River. In the foreground: construction of the 12th Avenue Access Shaft.',
    date: '2026-01-28'
  },
  {
    url: 'https://www.gatewayprogram.org/wp-content/uploads/2026/01/gateway_1-29-2025-3567.jpg',
    caption: 'LiUNA Local 472 Laborers pour concrete for the portal launch box in North Bergen, NJ.',
    date: '2025-01-29'
  },
  {
    url: 'https://www.gatewayprogram.org/wp-content/uploads/2026/01/PKG1A_20260122_NJ_GatewayPalisadesDuncanAve_TBMMainDrive_PANYNJ_GDC_MM-28.jpg',
    caption: 'The main drive unit for tunnel boring machine S-1431 is loaded onto a truck for delivery to the Tonnelle Avenue construction site.',
    date: '2026-01-22'
  },
  {
    url: 'https://www.gatewayprogram.org/wp-content/uploads/2026/01/Image-1-002.jpg',
    caption: 'Opening in the bulkhead at the west end of the HYCC-3 trench, connecting to the section of the concrete casing that is already built.',
    date: '2026-01-01'
  },
  {
    url: 'https://www.gatewayprogram.org/wp-content/uploads/2026/01/PKG1A_PH_20260112_NJ_GatewayPalisadesTonnelle_PANYNJ_GDC_DJI_MM-2.jpg',
    caption: 'Construction of the launch box at the tunnel portal in New Jersey.',
    date: '2026-01-12'
  },
]

export const blueskyPosts: BlueskyPost[] = [
  {
    text: 'Rudy Duarte is one of the hundreds of union workers impacted by the Hudson Tunnel Project construction pause. His message is clear: fund this urgent project now so workers like him can get back to work building the modern, reliable infrastructure America needs.',
    date: '2026-02-17T19:40:17.843Z',
    link: 'https://bsky.app/profile/gatewayprogram.bsky.social/post/3mf3cyvutts2l',
    imageUrl: 'https://video.bsky.app/watch/did%3Aplc%3Askgfj7jggympcb2nxuiadj4i/bafkreigkudpa6dubayui3kysgyz6dfiruccu7r2t63mvskehuyuvcaxqd4/thumbnail.jpg',
  },
  {
    text: 'The Gateway Development Commission will hold an in-person public Board Meeting on Tuesday, February 24, 2026, at 10:00 am. Registration and public comment information can be found here: www.gatewayprogram.org/board-meetin...',
    date: '2026-02-17T14:52:48.592Z',
    link: 'https://bsky.app/profile/gatewayprogram.bsky.social/post/3mf2swtph6s2l',
  },
  {
    text: '"I had to let all my guys go. There\'s no checks coming in for them."\n\nGuido Rivieccio, one of the shop stewards working on the Manhattan Tunnel Project, describes the real-world impact that pausing funding for the Hudson Tunnel Project had on the workers on his team this week.',
    date: '2026-02-13T17:41:34.222Z',
    link: 'https://bsky.app/profile/gatewayprogram.bsky.social/post/3mer2iwg5qc2t',
    imageUrl: 'https://video.bsky.app/watch/did%3Aplc%3Askgfj7jggympcb2nxuiadj4i/bafkreid6hwpgt7mglth4aooxy3hywjc3kab6l4mw22wenojmrxpv6ozqci/thumbnail.jpg',
  },
  {
    text: 'Hundreds of workers should be on site building the Hudson Tunnel Project this week. Instead, we had to put up these signs at our construction sites because we still cannot access the federal funding for the project. Funding must be restored now so we can get back to work!',
    date: '2026-02-12T15:42:19.233Z',
    link: 'https://bsky.app/profile/gatewayprogram.bsky.social/post/3meoderguic2t',
    imageUrl: 'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:skgfj7jggympcb2nxuiadj4i/bafkreic5rlydixaadrwpdcvn2ai4wjgujor4eytzh2ancagqwc5zp2bdky@jpeg',
  },
  {
    text: 'Pausing construction of the Hudson Tunnel Project hurts hundreds of workers. More than 200 union workers rallied at GDC\'s North Bergen construction site earlier this week to call for federal funding to be restored so they can get back to work.',
    date: '2026-02-11T21:30:54.120Z',
    link: 'https://bsky.app/profile/gatewayprogram.bsky.social/post/3memgf5yn6s2w',
    imageUrl: 'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:skgfj7jggympcb2nxuiadj4i/bafkreicfmkxbwatbnfzjhqg7jly5usorwkexdvu5e4lczl2ht5suvjue2i@jpeg',
  },
  {
    text: 'When work pauses, paychecks stop. LIUNA General President Brent Booker explains to NJ Spotlight that withholding funding for the Hudson Tunnel Project means lost income, fewer dollars in local economies, and workers struggling to make ends meet.',
    date: '2026-02-11T15:22:55.037Z',
    link: 'https://bsky.app/profile/gatewayprogram.bsky.social/post/3melrt5pcmc2x',
    imageUrl: 'https://video.bsky.app/watch/did%3Aplc%3Askgfj7jggympcb2nxuiadj4i/bafkreicgvqnn4e6zho2fyqs5727tsmxnpcwuhgtgfaerclmrwqliq5hg7i/thumbnail.jpg',
  },
  {
    text: 'The pause in federal funding for the Hudson Tunnel Project threatens the livelihoods of hundreds of workers. Local 472 member Lamont Richardson told NY1 what\'s at stake for his union brothers and sisters.',
    date: '2026-02-10T22:31:52.857Z',
    link: 'https://bsky.app/profile/gatewayprogram.bsky.social/post/3mejzdbqihc2m',
    imageUrl: 'https://video.bsky.app/watch/did%3Aplc%3Askgfj7jggympcb2nxuiadj4i/bafkreiaeksccdlkmsvjhbvpr6um7xch3u5iwou52hizp73sxokdzeepfqi/thumbnail.jpg',
  },
  {
    text: 'We\'ve already put more than $1 billion and countless hours into construction of the Hudson Tunnel Project. We have active construction sites across New York and New Jersey, and we\'re ready to start tunnel boring. Funding must be restored now so we can keep building.',
    date: '2026-02-06T23:30:16.929Z',
    link: 'https://bsky.app/profile/gatewayprogram.bsky.social/post/3mea2pznas22r',
    imageUrl: 'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:skgfj7jggympcb2nxuiadj4i/bafkreibstslenlwc6n6a43fsv2ubjhyhlmcuj546easewge3achc3zbuuq@jpeg',
  },
  {
    text: 'Stopping construction of the Hudson Tunnel Project will hurt our regional and national economy. An extended construction pause would put nearly 100,000 total jobs at risk.',
    date: '2026-02-06T21:39:43.657Z',
    link: 'https://bsky.app/profile/gatewayprogram.bsky.social/post/3me7ukdnu422r',
    imageUrl: 'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:skgfj7jggympcb2nxuiadj4i/bafkreic7kbl6u64eqbfjnnyfg2zplv4ymg46jtbqanvfvhcl6p3lq33fqq@jpeg',
  },
  {
    text: 'Construction of the Hudson Tunnel Project will be suspended today if disbursements of federal funding obligated to the project do not resume. \n\nMore information about the impacts of pausing construction and our ongoing efforts to restore funding here: www.gatewayprogram.org/wp-content/u...',
    date: '2026-02-06T16:27:36.648Z',
    link: 'https://bsky.app/profile/gatewayprogram.bsky.social/post/3me7d4a6we22r',
    imageUrl: 'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:skgfj7jggympcb2nxuiadj4i/bafkreigqc6uahuznoeydu6rjsaym652vhqygvmr4a23mkzwiy4ascjj3xy@jpeg',
  },
]

export const pressReleases: PressRelease[] = [
  {
    title: 'Hudson Tunnel Project Construction To Be Suspended Due To Lack Of Federal Funding',
    date: '2026-02-06',
    link: 'https://www.gatewayprogram.org/wp-content/uploads/2026/02/Construction-Pause-Press-Release-Feb-6-2026.pdf'
  },
  {
    title: 'Gateway Development Commission Files Breach Of Contract Claim Against Federal Government',
    date: '2026-02-02',
    link: 'https://www.gatewayprogram.org/wp-content/uploads/2026/02/GDC-2026.02.02-Press-Release-for-Website.pdf'
  },
  {
    title: 'Gateway Development Commission Statement On New York, New Jersey\'s Hudson Tunnel Project Lawsuit Hearing',
    date: '2026-02-06',
    link: 'https://www.gatewayprogram.org/wp-content/uploads/2026/02/GDC-2026.02.06-GDC-Statement-on-NY-NJ-Lawsuit.pdf'
  },
  {
    title: 'Gateway Development Commission Statement On Development In New York, New Jersey\'s Hudson Tunnel Project Lawsuit',
    date: '2026-02-12',
    link: 'https://www.gatewayprogram.org/wp-content/uploads/2026/02/GDC-Statement-02.12.2026.pdf'
  },
  {
    title: 'Gateway Development Commission Statement on Disbursement of Federal Funds for Hudson Tunnel Project',
    date: '2026-02-18',
    link: 'https://www.gatewayprogram.org/wp-content/uploads/2026/02/GDC-Statement-on-Disbursement-of-Federal-Funds-2026.02.18.pdf'
  },
  {
    title: 'Gateway Development Commission Statement On Initial Disbursement Of Federal Funds For Hudson Tunnel Project',
    date: '2026-02-13',
    link: 'https://www.gatewayprogram.org/wp-content/uploads/2026/02/GDC-Statement-on-Initial-Disbursement-of-Federal-Funds.pdf'
  },
  {
    title: 'Gateway Development Commission Announces Construction of Hudson Tunnel Project Will Pause If Federal Funding Is Not Restored',
    date: '2026-01-27',
    link: 'https://www.gatewayprogram.org/wp-content/uploads/2026/01/01.27.2026-Board-Meeting-Press-Release-for-Website.pdf'
  },
  {
    title: 'GDC Completes Manufacturing Of First Pair Of Tunnel Boring Machines For Hudson Tunnel Project',
    date: '2025-12-15',
    link: 'https://www.gatewayprogram.org/wp-content/uploads/2025/12/GDC-December-Board-Meeting-Press-Release-for-website.pdf'
  },
  {
    title: 'Statement by Gateway Corporation Trustees on RPA Report',
    date: '2019-02-26',
    link: 'https://www.gatewayprogram.org/wp-content/uploads/2025/10/2019-02-26-Statement-on-RPA-Report.pdf'
  },
  {
    title: 'Statement By Gateway Corporation Trustees On Legislative Proposal By Senator Schumer',
    date: '2019-03-04',
    link: 'https://www.gatewayprogram.org/wp-content/uploads/2025/10/2019-03-04-GDC-Statement-Schumer-Legislation.pdf'
  },
]

export const constructionNotices: ConstructionNotice[] = [
  {
    title: 'Hudson Yards Concrete Casing-Section 3 Project Construction Notice - Concrete Pour',
    date: '2026-02-19',
    link: 'https://www.gatewayprogram.org/wp-content/uploads/2026/02/2026.2.19_Gateway-Development-Commission-Construction-Notice-Concrete-Pour.pdf'
  },
  {
    title: 'Construction Work Pause',
    date: '2026-02-06',
    link: 'https://www.gatewayprogram.org/wp-content/uploads/2026/02/2026.2.6_Gateway-Development-Commission-Construction-Notice-Pause-NJ.pdf'
  },
  {
    title: 'Construction Work Pause',
    date: '2026-02-06',
    link: 'https://www.gatewayprogram.org/wp-content/uploads/2026/02/2026.2.6_Gateway-Development-Commission-Construction-Notice-Pause-NY.pdf'
  },
  {
    title: 'Hudson Yards Concrete Casing - Section 3 Construction Notice',
    date: '2026-01-21',
    link: 'https://www.gatewayprogram.org/wp-content/uploads/2026/01/1.21.2026_Gateway-Development-Commission-Construction-Notice.pdf'
  },
  {
    title: 'Construction Notice - Tonnelle Avenue Bridge and Utility Relocation Project',
    date: '2025-01-21',
    link: 'https://www.gatewayprogram.org/wp-content/uploads/2026/01/Tonnelle-Construction-Notice_2025-01-21_Striping.pdf'
  },
  {
    title: 'Hudson Yards Concrete Casing - Section 3 Construction Notice',
    date: '2025-12-02',
    link: 'https://www.gatewayprogram.org/wp-content/uploads/2025/12/12.2.2025_Gateway-Development-Commission-Construction-Notice-Crane.pdf'
  },
  {
    title: '2025 Manhattan Tunnel Project Construction Notice - Jet Grouting',
    date: '2025-12-08',
    link: 'https://www.gatewayprogram.org/wp-content/uploads/2025/12/12.8.2025_Gateway-Development-Commission-Construction-Notice-Jet-Grouting.pdf'
  },
  {
    title: 'Hudson Yards Concrete Casing-Section 3 Project Construction Notice',
    date: '2025-11-12',
    link: 'https://www.gatewayprogram.org/wp-content/uploads/2025/11/11.12.2025_Gateway-Development-Commission-Construction-Notice-Rock-Chopping-Sundays.pdf'
  },
  {
    title: 'Updated Construction Notice',
    date: '2025-10-10',
    link: 'https://www.gatewayprogram.org/wp-content/uploads/2025/10/10.10.2025_Gateway-Development-Commission-Construction-Notice-29th-Closure.pdf'
  },
  {
    title: 'Temporary Fence Reconfiguration And Public Art Removal - Manhattan Tunnel Project',
    date: '2025-10-27',
    link: 'https://www.gatewayprogram.org/wp-content/uploads/2025/10/10.27.2025_Gateway-Development-Commission-Construction-Notice-HRP-Fence-Art.pdf'
  },
]
