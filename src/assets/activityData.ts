export type GalleryImage = {
  url: string
  caption: string
  date: string
}

export type Tweet = {
  text: string
  date: string
  link?: string
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

export const tweets: Tweet[] = [
  {
    text: '“Superstorm Sandy showed us that at any moment, we could be shut down. And if we\’re shut down, we\’re screwed.” Steve Valeira discussed the stakes of stopping construction of the Hudson Tunnel Project at our Board Meeting last week. Watch his statement here: https://t.co/AztXbL0bdA',
    date: '2026-01-29',
    link: 'https://x.com/GatewayProgNews/status/2019462094551491010'
  },
  {
    text: 'Construction continues on the Hudson Yards Concrete Casing with significant progress on Section 3. The tunnel box is taking shape beneath Manhattan streets.',
    date: '2026-01-29',
    link: 'https://www.gatewayprogram.org'
  },
  {
    text: 'TBM components have arrived at the Tonnelle Avenue launch site. Assembly of the massive tunnel boring machines will begin in the coming weeks.',
    date: '2026-01-28'
  },
  {
    text: 'Despite challenging winter conditions, ground stabilization work under the frozen Hudson River continues on schedule. This critical work prepares the river bed for tunnel boring.',
    date: '2026-01-25'
  },
  {
    text: 'The Gateway Program represents the most urgent infrastructure project in America. With 200,000 daily riders depending on these tunnels, we cannot afford delays.',
    date: '2026-01-22'
  },
  {
    text: 'Concrete pour completed for the portal launch box at the Palisades site. This structure will serve as the entry point for the TBMs to begin drilling.',
    date: '2026-01-20'
  },
  {
    text: 'New aerial footage shows the scale of work happening across all five active construction sites. Check out the latest photos in our gallery.',
    date: '2026-01-18',
    link: 'https://www.gatewayprogram.org/photo-gallery.html'
  },
  {
    text: 'The TBM main drive unit has been loaded for delivery to New Jersey. This 400-ton piece of equipment is the heart of the tunnel boring machine.',
    date: '2026-01-15'
  },
  {
    text: 'Slurry wall installation continues at the Hudson County access shaft. These walls will support the vertical shaft where TBMs will be extracted and replaced.',
    date: '2026-01-12'
  },
  {
    text: 'Construction crews are working around the clock to keep the Gateway Program on track. Over 3,000 workers are currently employed across all project sites.',
    date: '2026-01-08'
  },
  {
    text: 'Year-end progress report: Major milestones achieved in 2025 including completion of TBM manufacturing and advancement of all five construction packages.',
    date: '2026-01-02',
    link: 'https://www.gatewayprogram.org'
  }
]

export const pressReleases: PressRelease[] = [
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
  {
    title: 'Gateway Development Commission, Amtrak, and Related Companies Joint Statement on Incident at HYCC-3 Construction Site',
    date: '2025-10-23',
    link: 'https://www.gatewayprogram.org'
  }
]
