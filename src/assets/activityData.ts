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

export const images: GalleryImage[] = [
  {
    url: 'https://www.gatewayprogram.org/wp-content/uploads/2026/01/IMG_3240.jpeg',
    caption: 'Openings for both tunnel tubes connecting the section of the Hudson Yards Concrete Casing currently under construction to the part of the concrete casing that is already finished.',
    date: '2026-01-29'
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
    date: '2026-01-28'
  },
  {
    url: 'https://www.gatewayprogram.org/wp-content/uploads/2026/01/PKG1A_20260122_NJ_GatewayPalisadesDuncanAve_TBMMainDrive_PANYNJ_GDC_MM-28.jpg',
    caption: 'The main drive unit for tunnel boring machine S-1431 is loaded onto a truck for delivery to the Tonnelle Avenue construction site.',
    date: '2026-01-22'
  },
  {
    url: 'https://www.gatewayprogram.org/wp-content/uploads/2026/01/Image-1-002.jpg',
    caption: 'Opening in the bulkhead at the west end of the HYCC-3 trench, connecting to the section of the concrete casing that is already built.',
    date: '2026-01-22'
  },
  {
    url: 'https://www.gatewayprogram.org/wp-content/uploads/2026/01/PKG1A_PH_20260112_NJ_GatewayPalisadesTonnelle_PANYNJ_GDC_DJI_MM-2.jpg',
    caption: 'Construction of the launch box at the tunnel portal in New Jersey.',
    date: '2026-01-12'
  },
  {
    url: 'https://www.gatewayprogram.org/wp-content/uploads/2026/01/PKG1A_PH_20260112_NJ_GatewayPalisadesHoboken_PANYNJ_GDC_MM-20.jpg',
    caption: 'With 32 panels complete, we’re more than halfway finished installing the slurry wall for the Hudson County Access Shaft.',
    date: '2026-01-12'
  },
  {
    url: 'https://www.gatewayprogram.org/wp-content/uploads/2026/01/PKG0_PH_20251230_NY_GatewayHYCC3Photo_PANYNJ_GDC_MM-14.jpg',
    caption: 'The HYCC-3 team poured more than 2,700 cubic yards of concrete in 24 hours to form a section of the tunnel box floor.',
    date: '2025-12-11'
  },
  {
    url: 'https://www.gatewayprogram.org/wp-content/uploads/2025/12/S-1432-PEP-109.jpg',
    caption: 'Manufacturing of the two tunnel boring machines that will be used for the Palisades Tunnel Project is complete.',
    date: '2025-12-11'
  }
]

export const blueskyPosts: BlueskyPost[] = [
  {
    text: "Hundreds of workers should be on site building the Hudson Tunnel Project this week. Instead, we had to put up these signs at our construction sites because we still cannot access the federal funding for the project. Funding must be restored now so we can get back to work!",
    date: '2026-02-12T05:43:00Z',
    link: 'https://bsky.app/profile/gatewayprogram.bsky.social/post/3meoderguic2t',
    imageUrl: 'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:skgfj7jggympcb2nxuiadj4i/bafkreic5rlydixaadrwpdcvn2ai4wjgujor4eytzh2ancagqwc5zp2bdky@jpeg',
  },
  {
    text: "Pausing construction of the Hudson Tunnel Project hurts hundreds of workers. More than 200 union workers rallied at GDC’s North Bergen construction site earlier this week to call for federal funding to be restored so they can get back to work.",
    date: '2026-02-11T11:31:00Z',
    link: 'https://bsky.app/profile/gatewayprogram.bsky.social/post/3memgf5yn6s2w',
    imageUrl: 'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:skgfj7jggympcb2nxuiadj4i/bafkreicfmkxbwatbnfzjhqg7jly5usorwkexdvu5e4lczl2ht5suvjue2i@jpeg',
  },
  {
    text: "When work pauses, paychecks stop. LIUNA General President Brent Booker explains to NJ Spotlight that withholding funding for the Hudson Tunnel Project means lost income, fewer dollars in local economies, and workers struggling to make ends meet.",
    date: '2026-02-11T06:22:00Z',
    link: 'https://bsky.app/profile/gatewayprogram.bsky.social/post/3melrt5pcmc2x',
    imageUrl: 'https://video.bsky.app/watch/did%3Aplc%3Askgfj7jggympcb2nxuiadj4i/bafkreicgvqnn4e6zho2fyqs5727tsmxnpcwuhgtgfaerclmrwqliq5hg7i/thumbnail.jpg',
  },
  {
    text: "'President Donald Trump, free this money up now, so I can get to work and make my neighborhood better.' Ironworker John Mooney spoke for the hundreds of workers building the Hudson Tunnel Project at our Board Meeting.",
    date: '2026-02-10T12:31:00Z',
    link: 'https://bsky.app/profile/gatewayprogram.bsky.social/post/3mejzdbqihc2m',
    imageUrl: 'https://video.bsky.app/watch/did%3Aplc%3Askgfj7jggympcb2nxuiadj4i/bafkreiaeksccdlkmsvjhbvpr6um7xch3u5iwou52hizp73sxokdzeepfqi/thumbnail.jpg',
  },
  {
    text: "We've already put more than $1 billion and countless hours into construction of the Hudson Tunnel Project. We have active construction sites across New York and New Jersey, and we're ready to start tunnel boring. Funding must be restored now so we can keep building.",
    date: '2026-02-06T23:30:16Z',
    link: 'https://bsky.app/profile/gatewayprogram.bsky.social/post/3mea2pznas22r',
    imageUrl: 'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:skgfj7jggympcb2nxuiadj4i/bafkreibstslenlwc6n6a43fsv2ubjhyhlmcuj546easewge3achc3zbuuq@jpeg'
  },
  {
    text: 'Stopping construction of the Hudson Tunnel Project will hurt our regional and national economy. An extended construction pause would put nearly 100,000 total jobs at risk.',
    date: '2026-02-06T21:39:43Z',
    link: 'https://bsky.app/profile/gatewayprogram.bsky.social/post/3me7ukdnu422r',
    imageUrl: 'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:skgfj7jggympcb2nxuiadj4i/bafkreic7kbl6u64eqbfjnnyfg2zplv4ymg46jtbqanvfvhcl6p3lq33fqq@jpeg'
  },
  {
    text: 'Construction of the Hudson Tunnel Project will be suspended today if disbursements of federal funding obligated to the project do not resume.',
    date: '2026-02-06T16:27:36Z',
    link: 'https://bsky.app/profile/gatewayprogram.bsky.social/post/3me7d4a6we22r',
    imageUrl: 'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:skgfj7jggympcb2nxuiadj4i/bafkreigqc6uahuznoeydu6rjsaym652vhqygvmr4a23mkzwiy4ascjj3xy@jpeg'
  },
  {
    text: "Nearly 1,000 workers will lose their jobs immediately when construction of the Hudson Tunnel Project pauses tomorrow, and an extended pause will put many more jobs at risk. Funding must be restored ASAP so these hardworking men and women can get back to work.",
    date: '2026-02-05T23:51:50Z',
    link: 'https://bsky.app/profile/gatewayprogram.bsky.social/post/3me5lhnpijs2r',
    imageUrl: 'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:skgfj7jggympcb2nxuiadj4i/bafkreih6sue3op6fj5unxeu6z4oy5t3heljo7th67azj4hn5rmcvet7fti@jpeg'
  },
  {
    text: "'Superstorm Sandy showed us that at any moment, we could be shut down. And if we're shut down, we're screwed.' Steve Valeira discussed the stakes of stopping construction of the Hudson Tunnel Project at our Board Meeting last week.",
    date: '2026-02-05T17:23:44Z',
    link: 'https://bsky.app/profile/gatewayprogram.bsky.social/post/3me4vroymqs2r'
  },
  {
    text: "'If we don't work, we don't get paid, and playing politics does not put food on the table for us.' Davon Lomax shared how stopping construction will impact the thousands of men and women building the Hudson Tunnel Project.",
    date: '2026-02-05T14:53:44Z',
    link: 'https://bsky.app/profile/gatewayprogram.bsky.social/post/3me4nfhqgts2r'
  },
  {
    text: "'We're already 10,000 yards plus of concrete into this job. Why waste it?' At our Board Meeting, Teamster Raymond Klein highlighted the progress already made by the hundreds of workers who will lose their jobs if funding for the Hudson Tunnel Project isn't restored.",
    date: '2026-02-05T00:39:23Z',
    link: 'https://bsky.app/profile/gatewayprogram.bsky.social/post/3me35nr2h322k'
  },
]

export const pressReleases: PressRelease[] = [
  {
    title: 'Gateway Development Commission Statement on Initial Disbursement of Federal Funds for the Hudson Tunnel Project',
    date: '2026-02-13T13:20:00Z',
    link: 'https://www.gatewayprogram.org/wp-content/uploads/2026/02/GDC-Statement-on-Initial-Disbursement-of-Federal-Funds.pdf',
  },
  {
    title: 'Gateway Development Commission Statement on Development in New York, New Jersey’s Hudson Tunnel Project Lawsuit',
    date: '2026-02-12T14:30:00Z',
    link: 'https://www.gatewayprogram.org/wp-content/uploads/2026/02/GDC-Statement-02.12.2026.pdf',
  },
  {
    title: 'Gateway Development Commission Statement on New York, New Jersey’s Hudson Tunnel Project Lawsuit Hearing',
    date: '2026-02-07T02:07:00Z',
    link: 'https://www.gatewayprogram.org/wp-content/uploads/2026/02/GDC-2026.02.06-GDC-Statement-on-NY-NJ-Lawsuit.pdf'
  },
  {
    title: 'Hudson Tunnel Project Construction To Be Suspended Due to Lack of Federal Funding',
    date: '2026-02-06',
    link: 'https://www.gatewayprogram.org/wp-content/uploads/2026/02/Construction-Pause-Press-Release-Feb-6-2026.pdf'
  },
  {
    title: 'Gateway Development Commission Files Breach of Contract Claim Against Federal Government',
    date: '2026-02-02',
    link: 'https://www.gatewayprogram.org/wp-content/uploads/2026/02/GDC-2026.02.02-Press-Release-for-Website.pdf'
  },
  {
    title: 'Gateway Development Commission Announces Construction of Hudson Tunnel Project Will Pause if Federal Funding Is Not Restored',
    date: '2026-01-27',
    link: 'https://www.gatewayprogram.org/wp-content/uploads/2026/01/01.27.2026-Board-Meeting-Press-Release-for-Website.pdf',
  },
  {
    title: 'Gateway Development Commission Completes Manufacturing of First Pair of Tunnel Boring Machines for Hudson Tunnel Project',
    date: '2025-12-15',
    link: 'https://www.gatewayprogram.org/wp-content/uploads/2025/12/GDC-December-Board-Meeting-Press-Release-for-website.pdf',
  },
]
